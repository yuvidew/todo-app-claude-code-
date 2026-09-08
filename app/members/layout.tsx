import { verifySession } from "@/lib/auth/dal"

/**
 * Server-side auth gate for the members page, mirroring app/todos/layout.tsx.
 */
export default async function MembersLayout({ children }: { children: React.ReactNode }) {
  await verifySession()
  return <>{children}</>
}
