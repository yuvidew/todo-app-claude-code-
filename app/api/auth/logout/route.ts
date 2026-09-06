import { apiSuccess } from "@/lib/api-response"
import { deleteSession } from "@/lib/auth/session"

/**
 * POST /api/auth/logout — clears the caller's session cookie.
 */
export async function POST() {
  await deleteSession()
  return apiSuccess("Logged out successfully.", null, 200)
}
