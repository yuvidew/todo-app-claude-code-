import { NextRequest } from "next/server"

import { apiSuccess, apiError } from "@/lib/api-response"
import { getApiUserId } from "@/lib/auth/dal"
import { validateUpdateTodoInput } from "@/lib/todos/validators"
import { updateTodo, deleteTodo, TodoNotFoundError } from "@/services/todo-service"
import type { TodoDescription } from "@/types/todo"

interface RouteParams {
  params: Promise<{ id: string }>
}

/**
 * PATCH /api/todos/:id — updates a todo owned by the signed-in user. Also
 * covers toggling completion (send just `{ completed }`) — there's no
 * separate toggle endpoint.
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const userId = await getApiUserId()
  if (!userId) return apiError("Unauthorized.", 401)

  const { id } = await params

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return apiError("Invalid JSON body.", 400)
  }

  const validation = validateUpdateTodoInput(body)
  if (!validation.valid) {
    return apiError(validation.message ?? "Invalid input.", 400)
  }

  const { title, description, assignee, completed } = body as {
    title?: string
    description?: TodoDescription
    assignee?: string
    completed?: boolean
  }

  try {
    const todo = await updateTodo(userId, id, { title, description, assignee, completed })
    return apiSuccess("Todo updated.", todo)
  } catch (err) {
    if (err instanceof TodoNotFoundError) {
      return apiError("Todo not found.", 404)
    }
    console.error("[todos:update] unexpected error:", err)
    return apiError("Something went wrong. Please try again.", 500)
  }
}

/**
 * DELETE /api/todos/:id — deletes a todo owned by the signed-in user.
 */
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const userId = await getApiUserId()
  if (!userId) return apiError("Unauthorized.", 401)

  const { id } = await params

  try {
    await deleteTodo(userId, id)
    return apiSuccess("Todo deleted.", null)
  } catch (err) {
    if (err instanceof TodoNotFoundError) {
      return apiError("Todo not found.", 404)
    }
    console.error("[todos:delete] unexpected error:", err)
    return apiError("Something went wrong. Please try again.", 500)
  }
}
