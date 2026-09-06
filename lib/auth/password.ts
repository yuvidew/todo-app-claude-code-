import bcrypt from "bcryptjs"

const SALT_ROUNDS = 10

/**
 * Securely hashes a plaintext password before database storage.
 * Passwords must never be persisted as plaintext.
 */
export async function hashPassword(plainTextPassword: string): Promise<string> {
  return bcrypt.hash(plainTextPassword, SALT_ROUNDS)
}

/**
 * Verifies a plaintext password against a stored bcrypt hash.
 * Never compare passwords manually — always go through this function.
 */
export async function verifyPassword(
  plainTextPassword: string,
  passwordHash: string
): Promise<boolean> {
  return bcrypt.compare(plainTextPassword, passwordHash)
}
