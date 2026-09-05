import { cn } from "@/lib/utils"

interface LogoProps {
  /** Mark size. "sm" matches the navbar; "lg" is used on the auth pages. */
  size?: "sm" | "lg"
  /** Whether to render the "NexusCore" wordmark next to the mark. */
  showWordmark?: boolean
  className?: string
}

const markSizeClasses = {
  sm: "size-8",
  lg: "size-10",
} as const

const dotSizeClasses = {
  sm: "size-4",
  lg: "size-5",
} as const

/** The application's brand mark — a rounded square with an inset dot. Shared by
 *  the landing navbar and the authentication pages so both stay in sync. */
export function Logo({ size = "sm", showWordmark = true, className }: LogoProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div
        className={cn(
          "flex items-center justify-center rounded-lg bg-primary text-primary-foreground",
          markSizeClasses[size]
        )}
      >
        <div className={cn("rounded-sm bg-primary-foreground/30", dotSizeClasses[size])} />
      </div>
      {showWordmark && (
        <span className="text-lg font-bold tracking-tight text-foreground">NexusCore</span>
      )}
    </div>
  )
}
