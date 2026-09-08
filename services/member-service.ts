import * as memberRepository from "@/repositories/member-repository"

export class DuplicateMemberEmailError extends Error {}
export class MemberNotFoundError extends Error {}

export interface CreateMemberInput {
  name: string
  email: string
  avatarUrl?: string
}

/**
 * Lists every member, for the assignee dropdowns.
 */
export async function listMembers() {
  return memberRepository.findAll()
}

/**
 * Creates a new member. Normalizes the email the same way signup does, so
 * lookups and the unique constraint stay case-insensitive, and rejects a
 * duplicate with a domain error the route can turn into a 409.
 */
export async function createMember(input: CreateMemberInput) {
  const email = input.email.trim().toLowerCase()

  const existing = await memberRepository.findByEmail(email)
  if (existing) throw new DuplicateMemberEmailError()

  return memberRepository.create({
    name: input.name.trim(),
    email,
    avatarUrl: input.avatarUrl?.trim() || undefined,
  })
}

/**
 * Updates a member's active status. Member has no owner (no userId), so
 * this only checks existence, unlike updateTodo's ownership check.
 */
export async function updateMemberActive(id: number, isActive: boolean) {
  const existing = await memberRepository.findById(id)
  if (!existing) throw new MemberNotFoundError()

  return memberRepository.update(id, { isActive })
}
