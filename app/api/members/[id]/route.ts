import { NextRequest } from "next/server"

import { apiSuccess, apiError } from "@/lib/api-response"
import { getApiUserId } from "@/lib/auth/dal"
import { validateUpdateMemberInput } from "@/lib/members/validators"
import { updateMemberActive, MemberNotFoundError } from "@/services/member-service"

interface RouteParams {
  params: Promise<{ id: string }>
}

/**
 * PATCH /api/members/:id — updates a member's active status. Member.id is
 * a numeric autoincrement id (unlike Todo's cuid string), so the route
 * param must be parsed and validated as an integer before use.
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const userId = await getApiUserId()
  if (!userId) return apiError("Unauthorized.", 401)

  const { id } = await params
  const memberId = Number(id)
  if (!Number.isInteger(memberId)) {
    return apiError("Invalid member id.", 400)
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return apiError("Invalid JSON body.", 400)
  }

  const validation = validateUpdateMemberInput(body)
  if (!validation.valid) {
    return apiError(validation.message ?? "Invalid input.", 400)
  }

  const { isActive } = body as { isActive: boolean }

  try {
    const member = await updateMemberActive(memberId, isActive)
    return apiSuccess("Member updated.", member)
  } catch (err) {
    if (err instanceof MemberNotFoundError) {
      return apiError("Member not found.", 404)
    }
    console.error("[members:update] unexpected error:", err)
    return apiError("Something went wrong. Please try again.", 500)
  }
}
