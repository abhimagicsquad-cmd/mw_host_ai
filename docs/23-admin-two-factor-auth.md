# Admin two-factor authentication (TOTP)

The dashboard now requires a 6-digit code from an authenticator app for **super admins and admins**; it is optional for editors. TOTP only (RFC 6238: SHA-1, 6 digits, 30 seconds), so it works with Google Authenticator, Microsoft Authenticator, Authy, 1Password, Bitwarden and any standard app. There is no SMS or email OTP.

## Rollout order (must follow)

1. **Run `supabase/migrations/0007_admin_two_factor.sql`** in the Supabase SQL editor. It is additive and safe to re-run.
2. **Set `ADMIN_2FA_ENCRYPTION_KEY`** in Vercel (Production), a long random string. Example: `openssl rand -base64 48`.
   - Without it, the key is derived from `SUPABASE_SERVICE_ROLE_KEY`. That still works, but a leak of that one key would then expose both the database and the secrets.
   - **Never change this key after users have enrolled.** Their stored secrets become unreadable, and a super admin would have to reset everyone's 2FA.
3. **Deploy.** From the next request on, every super admin and admin is held on **My Account → Security** until they set up 2FA. That includes people who are already signed in.

If the code is deployed before step 1, the system fails closed. Super admins and admins see "run migration 0007" on the Security page and can't reach the dashboard. Editors are unaffected.

## How it works

- **Sign-in.**
  - The password step no longer opens a session for users with 2FA. It sets a signed 5-minute "enter your code" cookie, which is never accepted as a session, and the login page asks for the code. A recovery code can be used instead.
  - **Remember this device for 30 days** skips the code step on that browser. The password is still required.
- **Enforcement.** This is server-side, in `requireAdmin` (every admin page) and `authorizeAction` (every server action), and checked against the database on each request.
  - Users who must set up 2FA can only open My Account → Security and sign out.
  - Draft preview is blocked for them too.
  - The navigation shrinks to the Security link, but that is cosmetic only.
- **Session binding.** Sessions carry a fingerprint of the user's 2FA enrolment. Turning 2FA on, regenerating the secret, a reset, or turning it off (editors) signs out all other sessions.
- **Setup.**
  - The secret is stored as *pending* until a code from it is verified. 2FA is not active before then.
  - A half-finished setup expires after 15 minutes.
  - On success, 10 recovery codes are shown once, with Copy and Download buttons.
- **Regenerate secret** (new phone): requires a current code. The new secret is verified before it replaces the old one, and trusted devices and other sessions are signed out.
- **Recovery codes.** Signing in with one lands on the Security page with a warning. Regenerating them requires an authenticator code; a recovery code is not accepted for that.
- **Turning 2FA off:** editors only, with password and code.
- **Super admin reset:** Users → user → "Reset two-factor authentication", behind a confirmation dialog.
  - It clears the secret, recovery codes and trusted devices, and signs that user out.
  - A super admin can't reset their own 2FA.
- **Bootstrap login.** The env break-glass login (which only works while no users exist) can't enrol and isn't held. It switches off once a user exists.

## Storage and security

| Data | Where | Protection |
| --- | --- | --- |
| TOTP secret | `users.totp_secret_encrypted` | AES-256-GCM (random IV, authenticated), key from `ADMIN_2FA_ENCRYPTION_KEY` |
| Secret being set up | `users.totp_pending_secret_encrypted` | Same encryption, expires after 15 minutes |
| Replay guard | `users.totp_last_used_step` | Each 30-second code works once; claimed with a conditional update, so two simultaneous requests can't both use it |
| Recovery codes | `admin_recovery_codes.code_hash` | HMAC-SHA256 with a server key (each code is about 50 bits). Marking a code used is one conditional update |
| Trusted devices | `admin_trusted_devices.token_hash` | 256-bit random token in an httpOnly, SameSite=Strict cookie; only its HMAC is stored. Expires in 30 days |

- **Brute force:**
  - **Per account:** 5 wrong codes in 15 minutes locks code entry for that account, from any IP. That covers sign-in, setup, regenerate and disable.
  - **Per IP:** 20 wrong codes in 15 minutes.
  - **How it's counted:** from `security.2fa_failed` rows, so it holds across serverless instances, plus an in-memory layer.
  - **Reaching it:** only someone who already has the password can attempt a code.
- **Clock drift:** codes from ±1 step (±30 seconds) are accepted.

## Activity log

All events use the `security.` prefix and have their own filter, **Two-factor & security**, on Activity Logs:

| Action | Event |
| --- | --- |
| `security.2fa_enabled` / `security.2fa_disabled` | 2FA turned on / off |
| `security.2fa_verified` / `security.2fa_failed` | Code accepted / incorrect code |
| `security.2fa_secret_regenerated` | Moved to a new secret |
| `security.recovery_code_used` / `security.recovery_codes_regenerated` | Recovery code used / new codes generated |
| `security.trusted_device_added` / `security.trusted_device_removed` | Device trusted / removed |
| `security.2fa_reset_admin` / `security.2fa_reset_super_admin` / `security.2fa_reset_editor` | Super admin reset, by the target's role |

Sign-ins (`auth.login`) record the method: password, +totp, +recovery code or +trusted device.

## If someone is locked out

- **Lost phone, but has recovery codes:** sign in with a recovery code, then use **Regenerate secret**.
- **Lost both:** another super admin resets their 2FA from Users.
- **Every super admin locked out:** clear the user's columns in the Supabase SQL editor:

  ```sql
  update users set totp_secret_encrypted = null, totp_enabled_at = null, totp_last_used_step = null where username = '…';
  ```
