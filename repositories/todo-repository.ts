import { prisma } from "@/lib/prisma"
import type { TodoDescription } from "@/types/todo"
import type { Prisma } from "@/generated/prisma/client"

export interface CreateTodoInput {
  title: string
  description: TodoDescription
  assignee?: string
}

export interface UpdateTodoInput {
  title?: string
  description?: TodoDescription
  assignee?: string
  completed?: boolean
}

/**
 * Finds every todo owned by a user, newest first. This repository never
 * filters/paginates — that stays client-side in useTodos, so it always
 * returns the full set for the caller.
 */
export async function findAllByUser(userId: number) {
  return prisma.todo.findMany({ where: { userId }, orderBy: { createdAt: "desc" } })
}

/**
 * Finds a single todo by id, regardless of owner. Callers are responsible
 * for checking `userId` on the result before treating it as accessible —
 * this repository only persists, it never authorizes.
 */
export async function findById(id: string) {
  return prisma.todo.findUnique({ where: { id } })
}

/**
 * Creates a new todo row owned by the given user. The caller is
 * responsible for validating/trimming input before calling this.
 */
export async function create(userId: number, input: CreateTodoInput) {
  return prisma.todo.create({
    data: {
      title: input.title,
      description: input.description as unknown as Prisma.InputJsonValue,
      assignee: input.assignee,
      userId,
    },
  })
}

/**
 * Updates an existing todo row. The caller is responsible for validating
 * input and verifying ownership before calling this.
 */
export async function update(id: string, input: UpdateTodoInput) {
  return prisma.todo.update({
    where: { id },
    data: {
      ...(input.title !== undefined ? { title: input.title } : {}),
      ...(input.description !== undefined
        ? { description: input.description as unknown as Prisma.InputJsonValue }
        : {}),
      ...(input.assignee !== undefined ? { assignee: input.assignee } : {}),
      ...(input.completed !== undefined ? { completed: input.completed } : {}),
    },
  })
}

/**
 * Deletes a todo row. The caller is responsible for verifying ownership
 * before calling this.
 */
export async function remove(id: string) {
  return prisma.todo.delete({ where: { id } })
}
