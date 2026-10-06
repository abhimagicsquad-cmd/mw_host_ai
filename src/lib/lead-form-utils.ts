import { siteConfig } from "@/constants/site-config"

/** Shown with every lead-form failure, so a visitor always has a way to reach sales. */
export const LEAD_CONTACT_FALLBACK = `You can also call us on ${siteConfig.contact.phone} or email ${siteConfig.contact.email}.`

/**
 * Reduces a typed, pasted or autofilled phone number to the 10-digit national number the
 * forms accept. Browsers autofill `tel` as "+919876543210" and people paste "+91 98765 43210"
 * or "098765 43210"; cutting those to the first 10 digits would keep the country code and
 * drop the end of the number.
 */
export function toNationalPhone(value: string) {
  let digits = value.replace(/\D/g, "")
  if (digits.length > 10 && digits.startsWith("91")) digits = digits.slice(2)
  else if (digits.length > 10 && digits.startsWith("0")) digits = digits.slice(1)
  return digits.slice(0, 10)
}

/** onChange filter for the phone inputs (react-hook-form `register` option). */
export function filterPhoneInput(event: React.ChangeEvent<HTMLInputElement>) {
  event.target.value = toNationalPhone(event.target.value)
}

const AUTO_POPUP_SESSION_KEY = "mwh:lead-auto-popup-shown"

export function hasLeadAutoPopupBeenShown() {
  try {
    return window.sessionStorage.getItem(AUTO_POPUP_SESSION_KEY) === "1"
  } catch {
    // Storage blocked (e.g. strict privacy mode) — treat as shown rather than risk repeat popups.
    return true
  }
}

/** Also called after a successful lead submission, so the auto popup never asks again. */
export function markLeadAutoPopupShown() {
  try {
    window.sessionStorage.setItem(AUTO_POPUP_SESSION_KEY, "1")
  } catch {
    // Ignore — see hasLeadAutoPopupBeenShown().
  }
}
