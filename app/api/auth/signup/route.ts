import { NextRequest } from "next/server"

import { apiSuccess, apiError } from "@/lib/api-response"
import { validateSignupInput } from "@/lib/auth/validators"
import { signup, DuplicateEmailError } from "@/services/auth-service"

/**
 * POST /api/auth/signup — creates a new user account.
 * Returns 201 on success, 400 on invalid input, 409 on duplicate email,
 * and a generic 500 on unexpected errors (the real error is logged
 * server-side only and never exposed to the client).
 */
export async function POST(request: NextRequest) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return apiError("Invalid JSON body.", 400)
  }

  const validation = validateSignupInput(body)
  if (!validation.valid) {
    return apiError(validation.message ?? "Invalid input.", 400)
  }

  const { email, password } = body as { email: string; password: string }

  try {
    const user = await signup(email, password)
    return apiSuccess("Account created successfully.", { user }, 201)
  } catch (err) {
    if (err instanceof DuplicateEmailError) {
      return apiError("An account with this email already exists.", 409)
    }
    console.error("[signup] unexpected error:", err)
    return apiError("Something went wrong. Please try again.", 500)
  }
}
