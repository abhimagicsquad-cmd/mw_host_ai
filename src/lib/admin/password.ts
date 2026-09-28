import "server-only"

import { randomBytes, scrypt, timingSafeEqual } from "node:crypto"
import { promisify } from "node:util"

const scryptAsync = promisify(scrypt) as (
  password: string,
  salt: Buffer,
  keylen: number,
  options: { N: number; r: number; p: number; maxmem: number }
) => Promise<Buffer>

const N = 16384
const R = 8
const P = 1
const KEY_LENGTH = 64
const MAX_MEM = 64 * 1024 * 1024

/** Format: scrypt$N$r$p$<salt base64>$<hash base64> — self-describing so parameters can be raised later. */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16)
  const hash = await scryptAsync(password, salt, KEY_LENGTH, { N, r: R, p: P, maxmem: MAX_MEM })
  return `scrypt$${N}$${R}$${P}$${salt.toString("base64")}$${hash.toString("base64")}`
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [scheme, n, r, p, saltB64, hashB64] = stored.split("$")
  if (scheme !== "scrypt" || !saltB64 || !hashB64) return false

  const expected = Buffer.from(hashB64, "base64")
  const actual = await scryptAsync(password, Buffer.from(saltB64, "base64"), expected.length, {
    N: Number(n),
    r: Number(r),
    p: Number(p),
    maxmem: MAX_MEM,
  })
  return actual.length === expected.length && timingSafeEqual(actual, expected)
}

/** Minimum policy for admin passwords: 10+ chars with upper, lower, digit and symbol. */
export function validatePasswordStrength(password: string): string | null {
  if (password.length < 10) return "Password must be at least 10 characters."
  if (!/[a-z]/.test(password) || !/[A-Z]/.test(password)) return "Password needs both upper- and lower-case letters."
  if (!/\d/.test(password)) return "Password needs at least one number."
  if (!/[^A-Za-z0-9]/.test(password)) return "Password needs at least one symbol."
  return null
}
