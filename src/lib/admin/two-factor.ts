import "server-only"

import { createCipheriv, createDecipheriv, createHash, createHmac, randomBytes, randomInt, timingSafeEqual } from "node:crypto"

import QRCode from "qrcode"

import type { AdminRole } from "@/lib/cms/types"

/**
 * Two-factor authentication primitives for the admin: TOTP (RFC 6238 — SHA-1, 6 digits,
 * 30-second steps, the defaults every authenticator app supports), encryption of the stored
 * secrets, and the keyed hashes of recovery codes and trusted-device tokens.
 *
 * Keys: ADMIN_2FA_ENCRYPTION_KEY, or — like the session key, so a deploy works without extra
 * setup — a key derived from SUPABASE_SERVICE_ROLE_KEY. Set ADMIN_2FA_ENCRYPTION_KEY in
 * production so a database leak alone never exposes the secrets. Changing the key makes the
 * stored secrets unreadable: every user then needs a 2FA reset by a super admin.
 */

/** Roles that cannot use the dashboard until 2FA is set up. Editors may opt in. */
export const TWO_FACTOR_REQUIRED_ROLES: AdminRole[] = ["super_admin", "admin"]
export const isTwoFactorRequired = (role: AdminRole) => TWO_FACTOR_REQUIRED_ROLES.includes(role)

export const ISSUER = "MagicWorks Host"
const PERIOD_SECONDS = 30
const DIGITS = 6
/** Codes from the previous and next step are accepted too (clock drift of up to ±30s). */
const DRIFT_STEPS = 1
export const RECOVERY_CODE_COUNT = 10
export const TRUSTED_DEVICE_DAYS = 30
/** How long a half-finished setup (a scanned-but-unconfirmed secret) stays valid. */
export const PENDING_SETUP_MINUTES = 15

// ---------------------------------------------------------------------------------------
// Keys
// ---------------------------------------------------------------------------------------

function masterSecret(): string {
  const secret = process.env.ADMIN_2FA_ENCRYPTION_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!secret) throw new Error("Two-factor encryption key is not configured (set ADMIN_2FA_ENCRYPTION_KEY).")
  return secret
}

/** A 32-byte key for one purpose, so the encryption key and the hashing keys are never the same. */
function subKey(purpose: string): Buffer {
  return createHash("sha256").update(`mwh-2fa:${purpose}:${masterSecret()}`).digest()
}

export function isTwoFactorConfigured() {
  return Boolean(process.env.ADMIN_2FA_ENCRYPTION_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY)
}

// ---------------------------------------------------------------------------------------
// Secret encryption (AES-256-GCM: confidentiality and tamper detection)
// ---------------------------------------------------------------------------------------

const b64u = (bytes: Buffer) => bytes.toString("base64url")

export function encryptSecret(plaintext: string): string {
  const iv = randomBytes(12)
  const cipher = createCipheriv("aes-256-gcm", subKey("totp-secret"), iv)
  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()])
  return `v1.${b64u(iv)}.${b64u(cipher.getAuthTag())}.${b64u(encrypted)}`
}

export function decryptSecret(stored: string): string | null {
  const [version, iv, tag, data] = stored.split(".")
  if (version !== "v1" || !iv || !tag || !data) return null
  try {
    const decipher = createDecipheriv("aes-256-gcm", subKey("totp-secret"), Buffer.from(iv, "base64url"))
    decipher.setAuthTag(Buffer.from(tag, "base64url"))
    return Buffer.concat([decipher.update(Buffer.from(data, "base64url")), decipher.final()]).toString("utf8")
  } catch {
    return null
  }
}

// ---------------------------------------------------------------------------------------
// TOTP
// ---------------------------------------------------------------------------------------

const BASE32 = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567"

function base32Encode(bytes: Buffer): string {
  let bits = 0
  let value = 0
  let out = ""
  for (const byte of bytes) {
    value = (value << 8) | byte
    bits += 8
    while (bits >= 5) {
      out += BASE32[(value >>> (bits - 5)) & 31]
      bits -= 5
    }
  }
  if (bits > 0) out += BASE32[(value << (5 - bits)) & 31]
  return out
}

function base32Decode(input: string): Buffer {
  const clean = input.toUpperCase().replace(/[\s=-]/g, "")
  let bits = 0
  let value = 0
  const out: number[] = []
  for (const char of clean) {
    const index = BASE32.indexOf(char)
    if (index < 0) throw new Error("Invalid base32 secret")
    value = (value << 5) | index
    bits += 5
    if (bits >= 8) {
      out.push((value >>> (bits - 8)) & 255)
      bits -= 8
    }
  }
  return Buffer.from(out)
}

/** A new 160-bit secret (RFC 4226's recommended length), base32 as authenticator apps expect. */
export function generateTotpSecret(): string {
  return base32Encode(randomBytes(20))
}

export const currentStep = (now = Date.now()) => Math.floor(now / 1000 / PERIOD_SECONDS)

function hotp(secret: Buffer, counter: number): string {
  const message = Buffer.alloc(8)
  message.writeBigUInt64BE(BigInt(counter))
  const digest = createHmac("sha1", secret).update(message).digest()
  const offset = digest[digest.length - 1] & 0x0f
  const binary = (digest.readUInt32BE(offset) & 0x7fffffff) % 10 ** DIGITS
  return binary.toString().padStart(DIGITS, "0")
}

/** The code for `step` — exported for tests and the verification below. */
export function totpCode(base32Secret: string, step = currentStep()): string {
  return hotp(base32Decode(base32Secret), step)
}

export const normalizeTotpInput = (input: string) => input.replace(/[\s-]/g, "")
export const looksLikeTotp = (input: string) => /^\d{6}$/.test(normalizeTotpInput(input))

/**
 * The time step a 6-digit code matches (within ±1 step), or null. Steps at or before
 * `lastUsedStep` are refused, so an intercepted code can't be replayed.
 */
export function verifyTotp(base32Secret: string, input: string, lastUsedStep: number | null = null, now = Date.now()): number | null {
  const code = normalizeTotpInput(input)
  if (!/^\d{6}$/.test(code)) return null
  const secret = base32Decode(base32Secret)
  const step = currentStep(now)
  let matched: number | null = null
  // Check every candidate (no early exit) so timing doesn't reveal which step matched.
  for (let candidate = step - DRIFT_STEPS; candidate <= step + DRIFT_STEPS; candidate++) {
    const expected = Buffer.from(hotp(secret, candidate))
    if (timingSafeEqual(expected, Buffer.from(code)) && (lastUsedStep === null || candidate > lastUsedStep)) matched = candidate
  }
  return matched
}

export function otpauthUri(username: string, base32Secret: string): string {
  const label = encodeURIComponent(`${ISSUER}:${username}`)
  const params = new URLSearchParams({ secret: base32Secret, issuer: ISSUER, algorithm: "SHA1", digits: String(DIGITS), period: String(PERIOD_SECONDS) })
  return `otpauth://totp/${label}?${params.toString()}`
}

/** The setup QR code as an inline SVG (no network request, nothing leaves the server). */
export async function qrCodeSvg(text: string): Promise<string> {
  return QRCode.toString(text, { type: "svg", errorCorrectionLevel: "M", margin: 1, color: { dark: "#0b1f33", light: "#ffffff" } })
}

/** The secret in groups of four, for typing into an app by hand. */
export const formatSecretForDisplay = (secret: string) => secret.replace(/(.{4})/g, "$1 ").trim()

// ---------------------------------------------------------------------------------------
// Recovery codes and trusted-device tokens (stored only as keyed hashes)
// ---------------------------------------------------------------------------------------

/** No 0/O, 1/I/L — easy to read back from paper. 31 symbols × 10 characters ≈ 49.5 bits. */
const RECOVERY_ALPHABET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ"

export function generateRecoveryCodes(count = RECOVERY_CODE_COUNT): string[] {
  return Array.from({ length: count }, () => {
    const chars = Array.from({ length: 10 }, () => RECOVERY_ALPHABET[randomInt(RECOVERY_ALPHABET.length)]).join("")
    return `${chars.slice(0, 5)}-${chars.slice(5)}`
  })
}

export const normalizeRecoveryCode = (input: string) => input.toUpperCase().replace(/[^A-Z0-9]/g, "")
export const looksLikeRecoveryCode = (input: string) => /^[A-Z0-9]{10}$/.test(normalizeRecoveryCode(input))

/**
 * HMAC-SHA256 with a server-side key. The codes are random (~50 bits), so a keyed fast hash
 * is enough: without the key a leaked hash can't be checked offline at all.
 */
export function hashRecoveryCode(input: string): string {
  return createHmac("sha256", subKey("recovery-code")).update(normalizeRecoveryCode(input)).digest("base64url")
}

export function generateDeviceToken(): string {
  return randomBytes(32).toString("base64url")
}

export function hashDeviceToken(token: string): string {
  return createHmac("sha256", subKey("trusted-device")).update(token).digest("base64url")
}

export function safeEqualStrings(a: string, b: string): boolean {
  const left = Buffer.from(a)
  const right = Buffer.from(b)
  return left.length === right.length && timingSafeEqual(left, right)
}

/**
 * Session claim binding a session to the user's current 2FA enrolment. Enabling, resetting,
 * disabling or replacing the secret changes it, which signs out every session from before.
 */
export function twoFactorFingerprint(enabledAt: string, encryptedSecret: string): string {
  return createHmac("sha256", subKey("session-binding")).update(`${enabledAt}|${encryptedSecret}`).digest("base64url").slice(0, 22)
}

/** "Chrome on Windows" from a User-Agent header, for the trusted-device list. */
export function describeDevice(userAgent: string | null): string {
  if (!userAgent) return "Unknown device"
  const browser = /Edg\//.test(userAgent)
    ? "Edge"
    : /OPR\//.test(userAgent)
      ? "Opera"
      : /Firefox\//.test(userAgent)
        ? "Firefox"
        : /Chrome\//.test(userAgent)
          ? "Chrome"
          : /Safari\//.test(userAgent)
            ? "Safari"
            : "Browser"
  const os = /iPhone|iPad/.test(userAgent)
    ? "iOS"
    : /Android/.test(userAgent)
      ? "Android"
      : /Windows/.test(userAgent)
        ? "Windows"
        : /Mac OS X/.test(userAgent)
          ? "macOS"
          : /Linux/.test(userAgent)
            ? "Linux"
            : "unknown OS"
  return `${browser} on ${os}`
}
