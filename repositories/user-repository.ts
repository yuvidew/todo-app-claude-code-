import { prisma } from "@/lib/prisma"

export interface CreateUserInput {
  email: string
  passwordHash: string
}

export interface SafeUser {
  id: number
  email: string
}

/**
 * Finds a user by their normalized email address.
 * Used by both signup (duplicate check) and login (credential lookup).
 */
export async function findUserByEmail(email: string) {
  return prisma.user.findUnique({ where: { email } })
}

/**
 * Creates a new user row. The caller is responsible for hashing the
 * password before calling this — this repository never hashes or
 * validates, it only persists.
 */
export async function createUser(input: CreateUserInput): Promise<SafeUser> {
  return prisma.user.create({
    data: { email: input.email, passwordHash: input.passwordHash },
    select: { id: true, email: true },
  })
}
