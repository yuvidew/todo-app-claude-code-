import Link from "next/link"

export function AuthLegal() {
  return (
    <p className="text-center text-xs text-balance text-muted-foreground">
      By continuing, you agree to our{" "}
      <Link href="/terms" className="underline underline-offset-4 hover:text-foreground">
        Terms of Service
      </Link>{" "}
      and{" "}
      <Link href="/privacy" className="underline underline-offset-4 hover:text-foreground">
        Privacy Policy
      </Link>
      .
    </p>
  )
}
