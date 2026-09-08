import * as userRepository from "@/repositories/user-repository"
import type { UpdateUserProfileInput } from "@/repositories/user-repository"

export class UserNotFoundError extends Error {}

/**
 * Fetches the signed-in user's profile. Only realistically throws
 * UserNotFoundError if a session outlives its user row.
 */
export async function getProfile(userId: number) {
  const user = await userRepository.findById(userId)
  if (!user) throw new UserNotFoundError()
  return user
}

/**
 * Updates the signed-in user's profile, first verifying the row still
 * exists. Trims free-text fields the same way todo-service's updateTodo
 * does.
 */
export async function updateProfile(userId: number, patch: UpdateUserProfileInput) {
  const existing = await userRepository.findById(userId)
  if (!existing) throw new UserNotFoundError()

  return userRepository.update(userId, {
    ...(patch.name !== undefined ? { name: patch.name.trim() } : {}),
    ...(patch.avatarUrl !== undefined ? { avatarUrl: patch.avatarUrl.trim() } : {}),
  })
}
