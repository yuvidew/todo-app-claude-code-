---
description: Create a single dummy task (Todo) in the database using the existing Prisma Todo schema
allowed-tools: Read, Bash
---

# Seed Dummy Task

Create exactly one dummy task in the database using the existing Prisma setup.

## Instructions

1. Read `prisma/schema.prisma` first.

2. Inspect the `Todo` model and determine:
   - Required fields
   - Optional fields
   - Default values
   - Field types
   - Its relation to `User` (`userId`)

3. Do not assume the Todo schema shown in this command is still current.
   Always use the actual `prisma/schema.prisma` as the source of truth.

4. Inspect the project before creating the seed logic:
   - `package.json`
   - existing Prisma configuration (`lib/prisma.ts`, `prisma7.config.ts`)
   - existing Prisma client
   - `repositories/todo-repository.ts` and `services/todo-service.ts`
   - `types/todo.ts` (the `Todo` / `TodoDescription` shape)
   - `constants/members.ts` (the `DUMMY_MEMBERS` list used for `assignee`)
   - existing seed scripts, in particular `.claude/commands/seed-user.md`

5. Reuse existing project utilities whenever possible — prefer
   `services/todo-service.ts#createTodo()` (or the repository it wraps) over
   writing raw `prisma.todo.create()` calls, so validation/trimming stays
   consistent with the real API.

6. Do NOT create a duplicate Prisma client.

7. A `Todo` belongs to a `User` (`userId` is required, `onDelete: Cascade`).
   Before creating the task, find a user to own it:
   - Prefer the most recently created user already in the database.
   - If no user exists yet, create one dummy user first, following the same
     approach as `/seed-user` (reuse its logic/utilities — do not invent a
     second, different way to create a dummy user).

8. `description` is a BlockNote document (`Block[]`, stored as `Json`) — not
   a plain string. Build it as a small, valid, minimal BlockNote document,
   e.g. one or two `"paragraph"` blocks each shaped like:
   ```json
   {
     "id": "<any unique string>",
     "type": "paragraph",
     "props": { "textColor": "default", "backgroundColor": "default", "textAlignment": "left" },
     "content": [{ "type": "text", "text": "<some readable sentence>", "styles": {} }],
     "children": []
   }
   ```
   Keep the text short and clearly identifiable as seed/dev content.

9. `assignee` is optional free text (not a foreign key). Pick one name from
   `constants/members.ts`'s `DUMMY_MEMBERS`, or leave it unset — either is
   fine.

10. `completed` defaults to `false` in the schema — do not set it explicitly
    unless you intentionally want to seed a completed task.

11. Before creating the task, check whether a task with the same title
    already exists for the chosen user.

12. If a matching task already exists:
    - Do not create another one.
    - Report that the dummy task already exists.
    - Display the existing task's id and title.

13. If it does not exist:
    - Create the task.
    - Let Prisma generate `id`, `createdAt`, and `updatedAt`.

14. Never manually provide fields that Prisma generates automatically.

15. Do not modify `prisma/schema.prisma`.

16. Do not create migrations.

17. Do not modify existing application code unless absolutely required for
    the seed operation.

18. Do not modify the todo UI.

## Dummy Task

Use a clearly identifiable development-only task.

Title: something like `"Seed task <2-3 digit random number>"` (unique per
run, mirroring how `/seed-user` suffixes its dummy email).

Description: a short BlockNote document, per the shape in step 8 — e.g. a
single paragraph like "This is a seeded dev task, safe to delete."

Assignee: one name from `DUMMY_MEMBERS`, or omitted.

Important:

- This task is only for local development/testing.
- Never seed dummy tasks in production.

## Expected Flow

Follow this flow:

Read Schema
    ↓
Inspect Existing Project
    ↓
Find Existing Prisma/Todo/User Utilities
    ↓
Find or Create Owning User
    ↓
Check Dummy Task
    ↓
Task Exists?
    ├── Yes → Do not create → Report existing task
    │
    └── No
          ↓
      Build BlockNote Description
          ↓
      Create Task (via services/todo-service.ts#createTodo)
          ↓
      Verify Creation
          ↓
      Report Result

## Database Operation

Prefer the project's existing service/repository access pattern.

Conceptually:

```typescript
const existingTask = await prisma.todo.findFirst({
  where: {
    userId: user.id,
    title: "Seed task 42",
  },
});

if (!existingTask) {
  const task = await createTodo(user.id, {
    title: "Seed task 42",
    description: [
      {
        id: "seed-task-42-p1",
        type: "paragraph",
        props: { textColor: "default", backgroundColor: "default", textAlignment: "left" },
        content: [{ type: "text", text: "This is a seeded dev task, safe to delete.", styles: {} }],
        children: [],
      },
    ],
    assignee: "Alice Johnson",
  });
}
```
