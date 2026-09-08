// Server-side request validation for the user/profile API. Hand-rolled,
// matching the pattern in lib/todos/validators.ts (this repo has no zod) —
// request input is untyped/untrusted so shape is checked before use.
import type { ValidationResult } from "@/lib/auth/validators"

const MAX_NAME_LENGTH = 100

function isValidHttpUrl(value: string): boolean {
  try {
    const url = new URL(value)
    return url.protocol === "http:" || url.protocol === "https:"
  } catch {
    return false
  }
}

/**
 * Validates a raw "update profile" request body. Every field is optional
 * (a PATCH may just update the name, or just the avatar), but at least one
 * recognized field must be present, and any field that is present must
 * have the right shape. `email` is never read here or by the route that
 * calls this — it's read-only in this phase, so an `email` key in the
 * body is inert by construction rather than explicitly rejected.
 */
export function validateUpdateProfileInput(body: unknown): ValidationResult {
  if (typeof body !== "object" || body === null) {
    return { valid: false, message: "Invalid request body." }
  }

  const { name, avatarUrl } = body as Record<string, unknown>

  if (name === undefined && avatarUrl === undefined) {
    return { valid: false, message: "No fields to update." }
  }

  if (name !== undefined) {
    if (typeof name !== "string" || name.trim().length === 0) {
      return { valid: false, message: "Name must be a non-empty string." }
    }
    if (name.trim().length > MAX_NAME_LENGTH) {
      return { valid: false, message: `Name must be ${MAX_NAME_LENGTH} characters or fewer.` }
    }
  }

  if (avatarUrl !== undefined) {
    if (typeof avatarUrl !== "string") {
      return { valid: false, message: "Avatar URL must be a string." }
    }
    if (avatarUrl.trim().length > 0 && !isValidHttpUrl(avatarUrl.trim())) {
      return { valid: false, message: "Avatar URL must be a valid URL." }
    }
  }

  return { valid: true }
}
