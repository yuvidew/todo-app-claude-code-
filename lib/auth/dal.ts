import "server-only"

import { cache } from "react"
import { redirect } from "next/navigation"

import { decrypt, getSessionCookieValue } from "@/lib/auth/session"

/**
 * Verifies the caller's session cookie. Redirects to /sign-in if there is
 * no valid session, otherwise returns the identifying info from the
 * session payload. Wrapped in React's cache() so multiple calls within
 * the same render pass (layout + page, etc.) only decrypt the cookie once.
 *
 * This is the defense-in-depth check that runs close to the data source,
 * complementing the optimistic redirect already done in proxy.ts.
 */
export const verifySession = cache(async () => {
  const cookie = await getSessionCookieValue()
  const session = await decrypt(cookie)

  if (!session?.userId) {
    redirect("/sign-in")
  }

  return { isAuth: true, userId: session.userId }
})
