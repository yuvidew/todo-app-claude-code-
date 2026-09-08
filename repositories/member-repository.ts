import { prisma } from "@/lib/prisma"

export interface CreateMemberInput {
  name: string
  email: string
  avatarUrl?: string
}

/**
 * Lists every member, alphabetically by name - used to populate the
 * assignee dropdowns.
 */
export async function findAll() {
  return prisma.member.findMany({ orderBy: { name: "asc" } })
}

/**
 * Finds a member by their normalized email address. Callers are
 * responsible for checking the result before treating it as a duplicate -
 * this repository only persists, it never validates.
 */
export async function findByEmail(email: string) {
  return prisma.member.findUnique({ where: { email } })
}

/**
 * Creates a new member row. The caller is responsible for
 * validating/normalizing input before calling this.
 */
export async function create(input: CreateMemberInput) {
  return prisma.member.create({
    data: { name: input.name, email: input.email, avatarUrl: input.avatarUrl },
  })
}
