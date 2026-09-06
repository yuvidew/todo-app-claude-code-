"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Field, FieldContent, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { PasswordInput } from "@/components/auth/PasswordInput"
import { AuthLegal } from "@/components/auth/AuthLegal"
import { toast } from "@/components/ui/toast"
import { type FieldErrors, validateEmail, validateLoginForm } from "@/components/auth/validation"

export interface LoginValues {
  email: string
  password: string
}

interface LoginFormProps {
  /** Isolated integration point for a real sign-in API. Defaults to a
   *  fetch-based implementation that calls POST /api/auth/login — swapping
   *  this prop is the only change needed for tests or a future session change. */
  onSignIn?: (values: LoginValues) => Promise<void>
}

async function defaultOnSignIn(values: LoginValues) {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(values),
  })
  const body = await res.json()
  if (!res.ok || !body.success) {
    throw new Error(body.message ?? "Invalid email or password.")
  }
}

export function LoginForm({ onSignIn = defaultOnSignIn }: LoginFormProps) {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [errors, setErrors] = useState<FieldErrors>({})
  const [formError, setFormError] = useState<string | undefined>()
  const [hasSubmitted, setHasSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  function handleEmailBlur() {
    if (!hasSubmitted) return
    setErrors((prev) => ({ ...prev, email: validateEmail(email) }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (isSubmitting) return

    setFormError(undefined)
    setHasSubmitted(true)
    const nextErrors = validateLoginForm({ email, password })
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    setIsSubmitting(true)
    try {
      await onSignIn({ email, password })
      toast.add({
        title: "Welcome back!",
        description: "You've signed in successfully.",
        type: "success",
      })
      router.push("/todos")
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

      {formError && <FieldError>{formError}</FieldError>}

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Signing in..." : "Sign in"}
      </Button>


      <AuthLegal />
    </form>
  )
}
