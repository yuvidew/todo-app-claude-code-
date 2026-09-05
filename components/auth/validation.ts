/**
 * Pure, framework-free validation helpers for the login and signup forms.
 * No form library is used in this project — forms drive these functions
 * from plain `useState`.
 */

export interface FieldErrors {
  email?: string
  password?: string
  confirmPassword?: string
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function validateEmail(email: string): string | undefined {
  if (!email.trim()) return "Email is required."
  if (!EMAIL_REGEX.test(email.trim())) return "Please enter a valid email address."
  return undefined
}

/** Signup requires a minimum length; login only requires the field be filled in
 *  (retroactively enforcing a new minimum on existing accounts isn't this UI's call). */
export function validatePassword(password: string): string | undefined {
  if (!password) return "Password is required."
  if (password.length < 8) return "Password must contain at least 8 characters."
  return undefined
}

export function validateConfirmPassword(
  password: string,
  confirmPassword: string
): string | undefined {
  if (!confirmPassword) return "Please confirm your password."
  if (password !== confirmPassword) return "Passwords do not match."
  return undefined
}

export function validateLoginForm(values: { email: string; password: string }): FieldErrors {
  const errors: FieldErrors = {}
  const emailError = validateEmail(values.email)
  if (emailError) errors.email = emailError
  if (!values.password) errors.password = "Password is required."
  return errors
}

export function validateSignupForm(values: {
  email: string
  password: string
  confirmPassword: string
}): FieldErrors {
  const errors: FieldErrors = {}
  const emailError = validateEmail(values.email)
  if (emailError) errors.email = emailError

  const passwordError = validatePassword(values.password)
  if (passwordError) errors.password = passwordError

  const confirmError = validateConfirmPassword(values.password, values.confirmPassword)
  if (confirmError) errors.confirmPassword = confirmError

  return errors
}
