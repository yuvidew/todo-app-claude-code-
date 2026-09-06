import { NextRequest } from "next/server"

import { apiSuccess, apiError } from "@/lib/api-response"
import { getApiUserId } from "@/lib/auth/dal"
import { validateCreateTodoInput } from "@/lib/todos/validators"
import { listTodos, createTodo } from "@/services/todo-service"
import type { TodoDescription } from "@/types/todo"

/**
 * GET /api/todos — lists every todo owned by the signed-in user. Filtering,
 * search, and pagination all stay client-side (see hooks/useTodos.ts), so
 * this always returns the full set.
 */
export async function GET() {
  const userId = await getApiUserId()
  if (!userId) return apiError("Unauthorized.", 401)

  const todos = await listTodos(userId)
  return apiSuccess("Todos fetched.", todos)
}

/**
 * POST /api/todos — creates a new todo owned by the signed-in user.
 */
export async function POST(request: NextRequest) {
  const userId = await getApiUserId()
  if (!userId) return apiError("Unauthorized.", 401)

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return apiError("Invalid JSON body.", 400)
  }

  const validation = validateCreateTodoInput(body)
  if (!validation.valid) {
    return apiError(validation.message ?? "Invalid input.", 400)
  }

  const { title, description, assignee } = body as {
    title: string
    description: TodoDescription
    assignee?: string
  }

  try {
    const todo = await createTodo(userId, { title, description, assignee })
    return apiSuccess("Todo created.", todo, 201)
  } catch (err) {
    console.error("[todos:create] unexpected error:", err)
    return apiError("Something went wrong. Please try again.", 500)
  }
}
