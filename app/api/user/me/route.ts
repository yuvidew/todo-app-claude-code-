import { NextRequest } from "next/server"

import { apiSuccess, apiError } from "@/lib/api-response"
import { getApiUserId } from "@/lib/auth/dal"
import { validateUpdateProfileInput } from "@/lib/users/validators"
import { getProfile, updateProfile, UserNotFoundError } from "@/services/user-service"

/**
 * GET /api/user/me — returns the signed-in user's profile. Always acts on
 * the caller's own session (getApiUserId()), never a route param.
 */
export async function GET() {
  const userId = await getApiUserId()
  if (!userId) return apiError("Unauthorized.", 401)

  try {
    const profile = await getProfile(userId)
    return apiSuccess("Profile fetched.", profile)
  } catch (err) {
    if (err instanceof UserNotFoundError) {
      return apiError("User not found.", 404)
    }
    console.error("[user/me:get] unexpected error:", err)
    return apiError("Something went wrong. Please try again.", 500)
  }
}

/**
 * PATCH /api/user/me — updates name/avatarUrl for the signed-in user.
 * Email is read-only in this phase: only name/avatarUrl are ever
 * destructured out of the body, so an `email` key is inert by
 * construction and never reaches the service/repository layer.
 */
export async function PATCH(request: NextRequest) {
  const userId = await getApiUserId()
  if (!userId) return apiError("Unauthorized.", 401)

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return apiError("Invalid JSON body.", 400)
  }

  const validation = validateUpdateProfileInput(body)
  if (!validation.valid) {
    return apiError(validation.message ?? "Invalid input.", 400)
  }

  const { name, avatarUrl } = body as { name?: string; avatarUrl?: string }

  try {
    const profile = await updateProfile(userId, { name, avatarUrl })
    return apiSuccess("Profile updated.", profile)
  } catch (err) {
    if (err instanceof UserNotFoundError) {
      return apiError("User not found.", 404)
    }
    console.error("[user/me:patch] unexpected error:", err)
    return apiError("Something went wrong. Please try again.", 500)
  }
}
