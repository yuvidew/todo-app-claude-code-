import { AuthHeader } from "@/components/auth/AuthHeader"
import { SignupForm } from "@/components/auth/SignupForm"

export default function SignUpPage() {
  return (
    <>
      <AuthHeader
        heading="Create your account"
        description="Get started with your account"
        switchText="Already have an account?"
        switchLinkText="Sign in"
        switchHref="/sign-in"
      />
      <SignupForm />
    </>
  )
}
