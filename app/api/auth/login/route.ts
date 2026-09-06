import { NextRequest } from "next/server"

import { apiSuccess, apiError } from "@/lib/api-response"
import { validateLoginInput } from "@/lib/auth/validators"
import { createSession } from "@/lib/auth/session"
import { login, InvalidCredentialsError } from "@/services/auth-service"

/**
 * POST /api/auth/login — authenticates a user by email and password.
 * Returns 200 on success, 400 on invalid input, and 401 for any
 * credential failure — unknown email and wrong password both produce
 * the identical message/status so the API never reveals which case
 * occurred (prevents user enumeration).
 */
export async function POST(request: NextRequest) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return apiError("Invalid JSON body.", 400)
  }

  const validation = validateLoginInput(body)
  if (!validation.valid) {
    return apiError(validation.message ?? "Invalid input.", 400)
  }

  const { email, password } = body as { email: string; password: string }

  try {
    const user = await login(email, password)
    await createSession(user.id)
    return apiSuccess("Login successful.", { user }, 200)
  } catch (err) {
    if (err instanceof InvalidCredentialsError) {
      return apiError("Invalid email or password.", 401)
    }
    console.error("[login] unexpected error:", err)
    return apiError("Something went wrong. Please try again.", 500)
  }
}
