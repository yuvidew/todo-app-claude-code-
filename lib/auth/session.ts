import "server-only"

import { cookies } from "next/headers"
import { SignJWT, jwtVerify } from "jose"

const COOKIE_NAME = "session"
const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000 // 7 days

const secretKey = process.env.SESSION_SECRET
if (!secretKey) {
  throw new Error("SESSION_SECRET environment variable is not set.")
}
const encodedKey = new TextEncoder().encode(secretKey)

export interface SessionPayload {
  userId: number
  expiresAt: string
  [key: string]: unknown
}

/**
 * Signs a session payload into a compact JWT. The payload must stay
 * minimal (just enough to identify the user) — never put passwords or
 * other sensitive data in here, since it round-trips through the client
 * as a cookie value.
 */
export async function encrypt(payload: SessionPayload): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(encodedKey)
}

/**
 * Verifies and decodes a session JWT. Returns undefined for a missing,
 * expired, or tampered token rather than throwing, so callers can treat
 * "no session" and "invalid session" the same way.
 */
export async function decrypt(session: string | undefined = ""): Promise<SessionPayload | undefined> {
  try {
    const { payload } = await jwtVerify(session, encodedKey, {
      algorithms: ["HS256"],
    })
    return payload as SessionPayload
  } catch {
    return undefined
  }
}

/**
 * Creates a signed session for the given user and stores it as an
 * httpOnly cookie. Call this right after a successful login/signup.
 */
export async function createSession(userId: number): Promise<void> {
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS)
  const session = await encrypt({ userId, expiresAt: expiresAt.toISOString() })

  const cookieStore = await cookies()
  cookieStore.set(COOKIE_NAME, session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: expiresAt,
    path: "/",
  })
}

/**
 * Clears the session cookie. Call this on logout.
 */
export async function deleteSession(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(COOKIE_NAME)
}

/**
 * Reads and decrypts the session cookie from an incoming request's
 * cookie jar (works with both `next/headers` cookies() and the
 * `request.cookies` API exposed in Proxy).
 */
export async function getSessionCookieValue(): Promise<string | undefined> {
  const cookieStore = await cookies()
  return cookieStore.get(COOKIE_NAME)?.value
}

export const SESSION_COOKIE_NAME = COOKIE_NAME
