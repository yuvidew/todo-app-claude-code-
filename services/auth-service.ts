import { findUserByEmail, createUser, type SafeUser } from "@/repositories/user-repository"
import { hashPassword, verifyPassword } from "@/lib/auth/password"

export class DuplicateEmailError extends Error {}
export class InvalidCredentialsError extends Error {}

/**
 * Registers a new user account. Normalizes the email so lookups and the
 * unique constraint are case-insensitive, hashes the password before
 * persisting it, and never returns the hash to the caller.
 * Throws DuplicateEmailError if the (normalized) email is already taken.
 */
export async function signup(email: string, password: string): Promise<SafeUser> {
  const normalizedEmail = email.trim().toLowerCase()

  const existing = await findUserByEmail(normalizedEmail)
  if (existing) throw new DuplicateEmailError()

  const passwordHash = await hashPassword(password)
  return createUser({ email: normalizedEmail, passwordHash })
}

/**
 * Authenticates a user by email and password. Uses a single generic
 * InvalidCredentialsError for both "no such user" and "wrong password"
 * so the API never reveals whether a given email is registered.
 */
export async function login(email: string, password: string): Promise<SafeUser> {
  const normalizedEmail = email.trim().toLowerCase()

  const user = await findUserByEmail(normalizedEmail)
  if (!user) throw new InvalidCredentialsError()

  const isValid = await verifyPassword(password, user.passwordHash)
  if (!isValid) throw new InvalidCredentialsError()

  return { id: user.id, email: user.email }
}
