"use client"

import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Field, FieldContent, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { PasswordInput } from "@/components/auth/PasswordInput"
import { SocialAuthButtons } from "@/components/auth/SocialAuthButtons"
import { AuthLegal } from "@/components/auth/AuthLegal"
import {
  type FieldErrors,
  validateConfirmPassword,
  validateEmail,
  validatePassword,
  validateSignupForm,
} from "@/components/auth/validation"

export interface SignupValues {
  email: string
  password: string
}

interface SignupFormProps {
  /** Isolated integration point for a real sign-up API. Defaults to a no-op
   *  stub — swapping this prop is the only change needed once a backend exists. */
  onSignUp?: (values: SignupValues) => Promise<void>
}

async function defaultOnSignUp(values: SignupValues) {
  // TODO(auth): wire up the real sign-up API/session once one exists.
  console.info("Sign-up submitted (not yet wired to a backend).", { email: values.email })
}

export function SignupForm({ onSignUp = defaultOnSignUp }: SignupFormProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [errors, setErrors] = useState<FieldErrors>({})
  const [hasSubmitted, setHasSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  function handleEmailBlur() {
    if (!hasSubmitted) return
    setErrors((prev) => ({ ...prev, email: validateEmail(email) }))
  }

  function handlePasswordBlur() {
    if (!hasSubmitted) return
    setErrors((prev) => ({
      ...prev,
      password: validatePassword(password),
      confirmPassword: validateConfirmPassword(password, confirmPassword),
    }))
  }

  function handleConfirmPasswordBlur() {
    if (!hasSubmitted) return
    setErrors((prev) => ({
      ...prev,
      confirmPassword: validateConfirmPassword(password, confirmPassword),
    }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (isSubmitting) return

    setHasSubmitted(true)
    const nextErrors = validateSignupForm({ email, password, confirmPassword })
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    setIsSubmitting(true)
    try {
      await onSignUp({ email, password })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form className="flex flex-col gap-6" onSubmit={handleSubmit} noValidate>
      <div className="flex flex-col gap-4">
        <Field data-invalid={!!errors.email}>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <FieldContent>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={handleEmailBlur}
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? "email-error" : undefined}
              disabled={isSubmitting}
              autoComplete="email"
            />
            <FieldError id="email-error">{errors.email}</FieldError>
          </FieldContent>
        </Field>

        <Field data-invalid={!!errors.password}>
          <FieldLabel htmlFor="password">Password</FieldLabel>
          <FieldContent>
            <PasswordInput
              id="password"
              placeholder="Create a password"
              value={password}
              onChange={setPassword}
              onBlur={handlePasswordBlur}
              ariaInvalid={!!errors.password}
              ariaDescribedBy={errors.password ? "password-error" : undefined}
              disabled={isSubmitting}
              autoComplete="new-password"
            />
            <FieldError id="password-error">{errors.password}</FieldError>
          </FieldContent>
        </Field>

        <Field data-invalid={!!errors.confirmPassword}>
          <FieldLabel htmlFor="confirm-password">Confirm password</FieldLabel>
          <FieldContent>
            <PasswordInput
              id="confirm-password"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={setConfirmPassword}
              onBlur={handleConfirmPasswordBlur}
              ariaInvalid={!!errors.confirmPassword}
              ariaDescribedBy={errors.confirmPassword ? "confirm-password-error" : undefined}
              disabled={isSubmitting}
              autoComplete="new-password"
            />
            <FieldError id="confirm-password-error">{errors.confirmPassword}</FieldError>
          </FieldContent>
        </Field>
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Creating account..." : "Create account"}
      </Button>

      <SocialAuthButtons />

      <AuthLegal />
    </form>
  )
}
