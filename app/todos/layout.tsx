import { verifySession } from "@/lib/auth/dal"

/**
 * Server-side auth gate for the todo app. Complements the optimistic
 * redirect in proxy.ts with a check close to the route itself — the
 * page.tsx below stays a plain client component, this layout is the
 * only thing that needs to run on the server to redirect out
 * unauthenticated visitors.
 */
export default async function TodosLayout({ children }: { children: React.ReactNode }) {
  await verifySession()
  return <>{children}</>
}
