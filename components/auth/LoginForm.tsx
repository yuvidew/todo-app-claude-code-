"use client"

import { useState } from "react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Field, FieldContent, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { PasswordInput } from "@/components/auth/PasswordInput"
import { AuthLegal } from "@/components/auth/AuthLegal"
import { type FieldErrors, validateEmail, validateLoginForm } from "@/components/auth/validation"

export interface LoginValues {
  email: string
  password: string
}

interface LoginFormProps {
  /** Isolated integration point for a real sign-in API. Defaults to a no-op
   *  stub — swapping this prop is the only change needed once a backend exists. */
  onSignIn?: (values: LoginValues) => Promise<void>
}

async function defaultOnSignIn(values: LoginValues) {
  // TODO(auth): wire up the real sign-in API/session once one exists.
  console.info("Sign-in submitted (not yet wired to a backend).", { email: values.email })
}

export function LoginForm({ onSignIn = defaultOnSignIn }: LoginFormProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [errors, setErrors] = useState<FieldErrors>({})
  const [hasSubmitted, setHasSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  function handleEmailBlur() {
    if (!hasSubmitted) return
    setErrors((prev) => ({ ...prev, email: validateEmail(email) }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (isSubmitting) return

    setHasSubmitted(true)
    const nextErrors = validateLoginForm({ email, password })
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    setIsSubmitting(true)
    try {
      await onSignIn({ email, password })
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
          <div className="flex items-center justify-between gap-2">
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <Link
              href="/forgot-password"
              className="text-sm font-medium text-primary underline-offset-4 hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <FieldContent>
            <PasswordInput
              id="password"
              placeholder="Enter your password"
              value={password}
              onChange={setPassword}
              ariaInvalid={!!errors.password}
              ariaDescribedBy={errors.password ? "password-error" : undefined}
              disabled={isSubmitting}
              autoComplete="current-password"
            />
            <FieldError id="password-error">{errors.password}</FieldError>
          </FieldContent>
        </Field>
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Signing in..." : "Sign in"}
      </Button>


      <AuthLegal />
    </form>
  )
}
