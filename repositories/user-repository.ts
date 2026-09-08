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

export interface UpdateUserProfileInput {
  name?: string
  avatarUrl?: string
}

export interface UserProfileRecord {
  id: number
  email: string
  name: string | null
  avatarUrl: string | null
  createdAt: Date
}

// Explicit select shared by findById/update below — unlike
// findUserByEmail's full-row fetch (which needs passwordHash for login),
// the profile feature must never read or return the hash.
const profileSelect = {
  id: true,
  email: true,
  name: true,
  avatarUrl: true,
  createdAt: true,
} as const

/**
 * Finds a user's profile by id. Never selects passwordHash — this is the
 * shape GET /api/user/me returns, safe to hand straight to the client.
 */
export async function findById(id: number): Promise<UserProfileRecord | null> {
  return prisma.user.findUnique({ where: { id }, select: profileSelect })
}

/**
 * Updates a user's profile fields. The caller is responsible for
 * validating/trimming input before calling this.
 */
export async function update(id: number, input: UpdateUserProfileInput): Promise<UserProfileRecord> {
  return prisma.user.update({
    where: { id },
    data: {
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.avatarUrl !== undefined ? { avatarUrl: input.avatarUrl } : {}),
    },
    select: profileSelect,
  })
}
