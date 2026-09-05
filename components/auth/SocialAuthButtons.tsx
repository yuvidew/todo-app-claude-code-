"use client"

import { Apple } from "lucide-react"

import { Button } from "@/components/ui/button"
import { FieldSeparator } from "@/components/ui/field"

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v2.98h3.88c2.27-2.09 3.54-5.17 3.54-8.8z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.94-2.92l-3.88-2.98c-1.08.72-2.45 1.15-4.06 1.15-3.13 0-5.78-2.11-6.73-4.96H1.27v3.09C3.25 21.3 7.31 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.27A11.98 11.98 0 0 0 0 12c0 1.93.46 3.76 1.27 5.38l4-3.09z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.44-3.44C17.94 1.19 15.24 0 12 0 7.31 0 3.25 2.7 1.27 6.62l4 3.09C6.22 6.86 8.87 4.75 12 4.75z"
      />
    </svg>
  )
}

// Not wired to a real OAuth provider yet — the handlers are intentionally
// side-effect-free placeholders. TODO(auth): replace with a real
// OAuth redirect/popup flow once a provider is chosen.
function handleGoogleAuth() {
  console.info("Google sign-in is not yet implemented.")
}

function handleAppleAuth() {
  console.info("Apple sign-in is not yet implemented.")
}

export function SocialAuthButtons() {
  return (
    <div className="flex flex-col gap-3">
      <FieldSeparator>Or continue with</FieldSeparator>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <Button
          type="button"
          variant="outline"
          className="w-full whitespace-normal"
          onClick={handleGoogleAuth}
        >
          <GoogleIcon className="size-4" />
          Continue with Google
        </Button>
        <Button
          type="button"
          variant="outline"
          className="w-full whitespace-normal"
          onClick={handleAppleAuth}
        >
          <Apple className="size-4" />
          Continue with Apple
        </Button>
      </div>
    </div>
  )
}
