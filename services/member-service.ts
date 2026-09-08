import * as memberRepository from "@/repositories/member-repository"

export class DuplicateMemberEmailError extends Error {}

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
