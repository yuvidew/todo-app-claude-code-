import { prisma } from "@/lib/prisma"

export interface CreateMemberInput {
  name: string
  email: string
  avatarUrl?: string
}

export interface UpdateMemberInput {
  isActive?: boolean
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

/**
 * Finds a single member by id. Callers are responsible for checking the
 * result before treating it as valid - this repository only persists, it
 * never validates.
 */
export async function findById(id: number) {
  return prisma.member.findUnique({ where: { id } })
}

/**
 * Updates an existing member row. The caller is responsible for
 * validating input and verifying existence before calling this.
 */
export async function update(id: number, input: UpdateMemberInput) {
  return prisma.member.update({
    where: { id },
    data: {
      ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
    },
  })
}
