import Link from "next/link"

import { Logo } from "@/components/brand/Logo"

interface AuthHeaderProps {
  heading: string
  description: string
  switchText: string
  switchLinkText: string
  switchHref: "/sign-in" | "/sign-up"
}

export function AuthHeader({
  heading,
  description,
  switchText,
  switchLinkText,
  switchHref,
}: AuthHeaderProps) {
  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <Logo size="lg" showWordmark={false} />
      <div className="flex flex-col gap-1">
        <h1 className="font-heading text-xl font-semibold text-foreground">{heading}</h1>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <p className="text-sm text-muted-foreground">
        {switchText}{" "}
        <Link
          href={switchHref}
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          {switchLinkText}
        </Link>
      </p>
    </div>
  )
}
