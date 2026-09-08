import { NextRequest } from "next/server"

import { apiSuccess, apiError } from "@/lib/api-response"
import { getApiUserId } from "@/lib/auth/dal"
import { validateCreateMemberInput } from "@/lib/members/validators"
import { listMembers, createMember, DuplicateMemberEmailError } from "@/services/member-service"

/**
 * GET /api/members — lists every member, for the assignee dropdowns.
 * Intentionally still returns inactive members - the /members table needs
 * them; only the assignee dropdowns filter to active-only, client-side.
 */
export async function GET() {
  const userId = await getApiUserId()
  if (!userId) return apiError("Unauthorized.", 401)

  const members = await listMembers()
  return apiSuccess("Members fetched.", members)
}

/**
 * POST /api/members — creates a new member.
 */
export async function POST(request: NextRequest) {
  const userId = await getApiUserId()
  if (!userId) return apiError("Unauthorized.", 401)

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return apiError("Invalid JSON body.", 400)
  }

  const validation = validateCreateMemberInput(body)
  if (!validation.valid) {
    return apiError(validation.message ?? "Invalid input.", 400)
  }

  const { name, email, avatarUrl } = body as { name: string; email: string; avatarUrl?: string }

  try {
    const member = await createMember({ name, email, avatarUrl })
    return apiSuccess("Member created.", member, 201)
  } catch (err) {
    if (err instanceof DuplicateMemberEmailError) {
      return apiError("A member with this email already exists.", 409)
    }
    console.error("[members:create] unexpected error:", err)
    return apiError("Something went wrong. Please try again.", 500)
  }
}
