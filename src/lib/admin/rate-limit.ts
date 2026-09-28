/**
 * Per-instance, in-memory login throttle (5 failures per 15 minutes per IP+username).
 * On serverless this resets per cold start, so it's a speed bump against brute force,
 * not a guarantee — the strong password hash and audit log are the real defenses.
 */
const WINDOW_MS = 15 * 60 * 1000
const MAX_FAILURES = 5

const failures = new Map<string, { count: number; firstAt: number }>()

export function isLoginThrottled(key: string): boolean {
  const entry = failures.get(key)
  if (!entry) return false
  if (Date.now() - entry.firstAt > WINDOW_MS) {
    failures.delete(key)
    return false
  }
  return entry.count >= MAX_FAILURES
}

export function recordLoginFailure(key: string) {
  const entry = failures.get(key)
  if (!entry || Date.now() - entry.firstAt > WINDOW_MS) {
    failures.set(key, { count: 1, firstAt: Date.now() })
  } else {
    entry.count += 1
  }
}

export function clearLoginFailures(key: string) {
  failures.delete(key)
}
