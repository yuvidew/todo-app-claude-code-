// Client-side mirror of lib/users/validators.ts's checks, so ProfileCard
// can show inline field errors before hitting the network - matching the
// pattern in lib/members/client-validation.ts.

const MAX_NAME_LENGTH = 100

export interface ProfileFieldErrors {
  name?: string
  avatarUrl?: string
}

export function validateProfileName(name: string): string | undefined {
  if (!name.trim()) return "Name is required."
  if (name.trim().length > MAX_NAME_LENGTH) return `Name must be ${MAX_NAME_LENGTH} characters or fewer.`
  return undefined
}

export function validateProfileAvatarUrl(avatarUrl: string): string | undefined {
  if (!avatarUrl.trim()) return undefined // optional

  try {
    const url = new URL(avatarUrl.trim())
    if (url.protocol !== "http:" && url.protocol !== "https:") throw new Error()
  } catch {
    return "Please enter a valid URL."
  }

  return undefined
}

export function validateProfileForm(values: { name: string; avatarUrl: string }): ProfileFieldErrors {
  const errors: ProfileFieldErrors = {}

  const nameError = validateProfileName(values.name)
  if (nameError) errors.name = nameError

  const avatarError = validateProfileAvatarUrl(values.avatarUrl)
  if (avatarError) errors.avatarUrl = avatarError

  return errors
}
