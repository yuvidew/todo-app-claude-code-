import { AuthHeader } from "@/components/auth/AuthHeader"
import { LoginForm } from "@/components/auth/LoginForm"

export default function SignInPage() {
  return (
    <>
      <AuthHeader
        heading="Welcome back"
        description="Sign in to continue to your account"
        switchText="Don't have an account?"
        switchLinkText="Sign up"
        switchHref="/sign-up"
      />
      <LoginForm />
    </>
  )
}
