"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Field, FieldContent, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { PasswordInput } from "@/components/auth/PasswordInput"
import { AuthLegal } from "@/components/auth/AuthLegal"
import { toast } from "@/components/ui/toast"
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
  /** Isolated integration point for a real sign-up API. Defaults to a
   *  fetch-based implementation that calls POST /api/auth/signup — swapping
   *  this prop is the only change needed for tests or a future session change. */
  onSignUp?: (values: SignupValues) => Promise<void>
}

async function defaultOnSignUp(values: SignupValues) {
  const res = await fetch("/api/auth/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(values),
  })
  const body = await res.json()
  if (!res.ok || !body.success) {
    throw new Error(body.message ?? "Something went wrong. Please try again.")
  }
}

export function SignupForm({ onSignUp = defaultOnSignUp }: SignupFormProps) {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [errors, setErrors] = useState<FieldErrors>({})
  const [formError, setFormError] = useState<string | undefined>()
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

    setFormError(undefined)
    setHasSubmitted(true)
    const nextErrors = validateSignupForm({ email, password, confirmPassword })
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    setIsSubmitting(true)
    try {
      await onSignUp({ email, password })
      toast.add({
        title: "Account created",
        description: "Your account has been created successfully. Please sign in.",
        type: "success",
      })
      router.push("/sign-in")
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Something went wrong. Please try again.")
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

      {formError && <FieldError>{formError}</FieldError>}

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Creating account..." : "Create account"}
      </Button>


      <AuthLegal />
    </form>
  )
}
