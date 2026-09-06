// Server-side request validation for the auth API. Reuses the same pure
// rule functions the UI already enforces (components/auth/validation.ts)
// so client and server rules never silently diverge. That file has no
// "use client" directive or DOM dependency, so it's safe to import here —
// don't add browser-only code to it without re-checking this import.
import { validateEmail, validatePassword } from "@/components/auth/validation"

export interface ValidationResult {
  valid: boolean
  message?: string
}

/**
 * Validates a raw signup request body. Request input is untyped and
 * untrusted (unlike UI state), so shape is checked before applying rules.
 * If confirmPassword is present in the payload it must match, mirroring
 * the UI's own confirm-password check as defense in depth.
 */
export function validateSignupInput(body: unknown): ValidationResult {
  if (typeof body !== "object" || body === null) {
    return { valid: false, message: "Invalid request body." }
  }

  const { email, password, confirmPassword } = body as Record<string, unknown>
  if (typeof email !== "string" || typeof password !== "string") {
    return { valid: false, message: "Email and password are required." }
  }

  const emailError = validateEmail(email)
  if (emailError) return { valid: false, message: emailError }

  const passwordError = validatePassword(password)
  if (passwordError) return { valid: false, message: passwordError }

  if (confirmPassword !== undefined) {
    if (typeof confirmPassword !== "string" || confirmPassword !== password) {
      return { valid: false, message: "Passwords do not match." }
    }
  }

  return { valid: true }
}

/**
 * Validates a raw login request body. Deliberately only checks presence
 * and email format, not password strength — an existing account may
 * predate the current minimum-length rule.
 */
export function validateLoginInput(body: unknown): ValidationResult {
  if (typeof body !== "object" || body === null) {
    return { valid: false, message: "Invalid request body." }
  }

  const { email, password } = body as Record<string, unknown>
  if (typeof email !== "string" || typeof password !== "string") {
    return { valid: false, message: "Email and password are required." }
  }

  const emailError = validateEmail(email)
  if (emailError) return { valid: false, message: emailError }

  if (!password) return { valid: false, message: "Password is required." }

  return { valid: true }
}
