import { NextResponse } from "next/server"

export interface ApiSuccessBody<T> {
  success: true
  message: string
  data?: T
}

export interface ApiErrorBody {
  success: false
  message: string
}

/**
 * Builds the standard success envelope for API responses.
 * Keeping this centralized ensures every route returns the same shape.
 */
export function apiSuccess<T>(message: string, data?: T, status = 200) {
  return NextResponse.json<ApiSuccessBody<T>>({ success: true, message, data }, { status })
}

/**
 * Builds the standard error envelope for API responses.
 * Callers should always pass a safe, client-facing message here —
 * never a raw Prisma/database error.
 */
export function apiError(message: string, status: number) {
  return NextResponse.json<ApiErrorBody>({ success: false, message }, { status })
}
