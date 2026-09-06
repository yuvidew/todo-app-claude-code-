import * as todoRepository from "@/repositories/todo-repository"
import type { CreateTodoInput, UpdateTodoInput } from "@/repositories/todo-repository"

export class TodoNotFoundError extends Error {}

/**
 * Lists every todo owned by the given user, newest first.
 */
export async function listTodos(userId: number) {
  return todoRepository.findAllByUser(userId)
}

/**
 * Creates a new todo owned by the given user. Trims free-text fields the
 * same way the client-only version of useTodos used to.
 */
export async function createTodo(userId: number, input: CreateTodoInput) {
  return todoRepository.create(userId, {
    title: input.title.trim(),
    description: input.description,
    assignee: input.assignee?.trim() || undefined,
  })
}

/**
 * Updates a todo, first verifying it exists and belongs to the caller.
 * Throws TodoNotFoundError for both "no such todo" and "not yours" so the
 * API never reveals whether a given id belongs to another user.
 */
export async function updateTodo(userId: number, id: string, patch: UpdateTodoInput) {
  const existing = await todoRepository.findById(id)
  if (!existing || existing.userId !== userId) throw new TodoNotFoundError()

  return todoRepository.update(id, {
    ...patch,
    title: patch.title?.trim(),
    assignee: patch.assignee !== undefined ? patch.assignee.trim() || undefined : undefined,
  })
}

/**
 * Deletes a todo, first verifying it exists and belongs to the caller.
 */
export async function deleteTodo(userId: number, id: string) {
  const existing = await todoRepository.findById(id)
  if (!existing || existing.userId !== userId) throw new TodoNotFoundError()

  await todoRepository.remove(id)
}
