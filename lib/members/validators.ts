// Server-side request validation for the members API. Hand-rolled, matching
// the pattern in lib/todos/validators.ts (this repo has no zod) — request
// input is untyped/untrusted so shape is checked before use.
import { validateEmail } from "@/components/auth/validation"
import type { ValidationResult } from "@/lib/auth/validators"

/**
 * Validates a raw "create member" request body.
 */
export function validateCreateMemberInput(body: unknown): ValidationResult {
  if (typeof body !== "object" || body === null) {
    return { valid: false, message: "Invalid request body." }
  }

  const { name, email, avatarUrl } = body as Record<string, unknown>

  if (typeof name !== "string" || name.trim().length === 0) {
    return { valid: false, message: "Name is required." }
  }

  if (typeof email !== "string") {
    return { valid: false, message: "Email is required." }
  }
  const emailError = validateEmail(email)
  if (emailError) return { valid: false, message: emailError }

  if (avatarUrl !== undefined && typeof avatarUrl !== "string") {
    return { valid: false, message: "Avatar URL must be a string." }
  }

  return { valid: true }
}
