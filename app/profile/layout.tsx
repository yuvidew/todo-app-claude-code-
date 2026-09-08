import { verifySession } from "@/lib/auth/dal"

/**
 * Server-side auth gate for the profile page, mirroring
 * app/todos/layout.tsx and app/members/layout.tsx.
 */
export default async function ProfileLayout({ children }: { children: React.ReactNode }) {
  await verifySession()
  return <>{children}</>
}
