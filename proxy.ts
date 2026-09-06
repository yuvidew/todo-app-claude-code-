import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

import { decrypt } from "@/lib/auth/session"

// Routes that require a signed-in user.
const protectedRoutes = ["/todos"]
// Routes a signed-in user shouldn't need to see again.
const authRoutes = ["/sign-in", "/sign-up"]

/**
 * Optimistic auth check that runs on (almost) every request. Only ever
 * reads the session cookie — no database lookup — per Next.js's Proxy
 * guidance, since Proxy runs on every navigation including prefetches.
 * This is the first line of defense; app/todos/layout.tsx re-verifies
 * the session server-side as the source of truth.
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  const isProtectedRoute = protectedRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  )
  const isAuthRoute = authRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  )

  if (!isProtectedRoute && !isAuthRoute) {
    return NextResponse.next()
  }

  const cookie = request.cookies.get("session")?.value
  const session = await decrypt(cookie)

  if (isProtectedRoute && !session?.userId) {
    const signInUrl = new URL("/sign-in", request.url)
    return NextResponse.redirect(signInUrl)
  }

  if (isAuthRoute && session?.userId) {
    return NextResponse.redirect(new URL("/todos", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.(?:png|svg|ico)$).*)"],
}
