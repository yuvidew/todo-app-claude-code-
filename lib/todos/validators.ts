// Server-side request validation for the todos API. Hand-rolled, matching
// the pattern in lib/auth/validators.ts (this repo has no zod) — request
// input is untyped/untrusted so shape is checked before use.
import type { ValidationResult } from "@/lib/auth/validators"

/**
 * Validates a raw "create todo" request body. `description` is a BlockNote
 * document (an array of blocks) — only its shape (an array) is checked
 * here, not its internal structure, since the editor is the source of truth
 * for well-formed blocks.
 */
export function validateCreateTodoInput(body: unknown): ValidationResult {
  if (typeof body !== "object" || body === null) {
    return { valid: false, message: "Invalid request body." }
  }

  const { title, description, assignee } = body as Record<string, unknown>

  if (typeof title !== "string" || title.trim().length === 0) {
    return { valid: false, message: "Title is required." }
  }

  if (!Array.isArray(description)) {
    return { valid: false, message: "Description must be a document." }
  }

  if (assignee !== undefined && typeof assignee !== "string") {
    return { valid: false, message: "Assignee must be a string." }
  }

  return { valid: true }
}

/**
 * Validates a raw "update todo" request body. Every field is optional (a
 * PATCH may just toggle `completed`, or just rename a task), but at least
 * one recognized field must be present, and any field that is present must
 * have the right shape.
 */
export function validateUpdateTodoInput(body: unknown): ValidationResult {
  if (typeof body !== "object" || body === null) {
    return { valid: false, message: "Invalid request body." }
  }

  const { title, description, assignee, completed } = body as Record<string, unknown>

  if (
    title === undefined &&
    description === undefined &&
    assignee === undefined &&
    completed === undefined
  ) {
    return { valid: false, message: "No fields to update." }
  }

  if (title !== undefined && (typeof title !== "string" || title.trim().length === 0)) {
    return { valid: false, message: "Title must be a non-empty string." }
  }

  if (description !== undefined && !Array.isArray(description)) {
    return { valid: false, message: "Description must be a document." }
  }

  if (assignee !== undefined && typeof assignee !== "string") {
    return { valid: false, message: "Assignee must be a string." }
  }

  if (completed !== undefined && typeof completed !== "boolean") {
    return { valid: false, message: "Completed must be a boolean." }
  }

  return { valid: true }
}
