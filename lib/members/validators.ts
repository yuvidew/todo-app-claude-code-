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

/**
 * Validates a raw "update member" request body. This phase only ever
 * updates isActive, so unlike validateUpdateTodoInput this doesn't need
 * an "at least one field present" check - isActive is required.
 */
export function validateUpdateMemberInput(body: unknown): ValidationResult {
  if (typeof body !== "object" || body === null) {
    return { valid: false, message: "Invalid request body." }
  }

  const { isActive } = body as Record<string, unknown>

  if (typeof isActive !== "boolean") {
    return { valid: false, message: "isActive must be a boolean." }
  }

  return { valid: true }
}
