# Team Members — Real Assignee Directory

## Context

Per `.claude/specs/02-team-members.md`: assignee dropdowns (task create/edit
form, and the "Filter by member" filter on `/todos`) currently read from
`constants/members.ts`'s hardcoded `DUMMY_MEMBERS` array. This plan replaces
that with a real `Member` table in MySQL plus a `GET/POST /api/members` API,
following the same repository → service → route layering the todos and auth
features already use.

**Confirmed against the current codebase before planning:**
- `DUMMY_MEMBERS` is imported in exactly two places:
  `components/todo/TaskForm.tsx` (create/edit assignee `Select`) and
  `app/todos/page.tsx` (filter `Select`) — both are touched below, and
  `constants/members.ts` can be deleted outright once they are.
- `Todo.assignee` stays the free-text `String?` column it already is — the
  spec explicitly scopes out turning it into an `assigneeId` relation. So
  `hooks/useTodos.ts`, `services/todo-service.ts`,
  `repositories/todo-repository.ts`, and the `Todo` model are **untouched**.
- `components/todo/TaskSheet.tsx` mounts `TaskForm` only while the Sheet is
  open (Base UI dialog content unmounts when closed), so fetching members
  *inside* `TaskForm` would re-fetch on every open. Instead, `useMembers()`
  is called once in `app/todos/page.tsx` (which already owns `useTodos()`
  the same way) and `members` is passed down as a prop through `TaskSheet`
  into `TaskForm`, and used directly for the filter `Select` — matching
  CLAUDE.md's rule that state lives in hooks/pages, components stay
  presentational.
- Reused as-is rather than re-implemented: `lib/api-response.ts`
  (`apiSuccess`/`apiError`), `lib/auth/dal.ts#getApiUserId()`,
  `components/auth/validation.ts#validateEmail()` (member emails get the
  same format check as user emails), and the fetch/DTO/`parseApiResponse`
  pattern already in `hooks/useTodos.ts`.
- No UI is built for *creating* a member in this phase (the spec's
  "Templates" section lists no new pages) — `POST /api/members` exists as
  an integration point, and members are seeded directly via that endpoint
  during verification below.

## Approach

### 1. Schema — `prisma/schema.prisma`

Append a new model (no relation to `User`/`Todo` in this phase — members
are a global directory, matching how `DUMMY_MEMBERS` was global today):

```prisma
model Member {
  id        Int      @id @default(autoincrement())
  name      String
  email     String   @unique
  avatarUrl String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

Then run against the local dev database (already connected, per
`docs/PROJECT_OVERVIEW.md`):

```bash
npx prisma migrate dev --name add_member
npx prisma generate
```

### 2. `repositories/member-repository.ts` (new)

Prisma queries only — mirrors `repositories/todo-repository.ts`'s shape
and its "this repository only persists" comment convention:

```ts
import { prisma } from "@/lib/prisma"

export interface CreateMemberInput {
  name: string
  email: string
  avatarUrl?: string
}

/** Lists every member, alphabetically - used to populate assignee dropdowns. */
export async function findAll() {
  return prisma.member.findMany({ orderBy: { name: "asc" } })
}

/** Finds a member by their normalized email, for the duplicate check in the service layer. */
export async function findByEmail(email: string) {
  return prisma.member.findUnique({ where: { email } })
}

/** Creates a new member row. The caller is responsible for validating/normalizing input first. */
export async function create(input: CreateMemberInput) {
  return prisma.member.create({
    data: { name: input.name, email: input.email, avatarUrl: input.avatarUrl },
  })
}
```

### 3. `services/member-service.ts` (new)

Business logic — mirrors `services/auth-service.ts`'s email normalization
and `services/todo-service.ts`'s trimming/domain-error conventions:

```ts
import * as memberRepository from "@/repositories/member-repository"

export class DuplicateMemberEmailError extends Error {}

export interface CreateMemberInput {
  name: string
  email: string
  avatarUrl?: string
}

/** Lists every member, for the assignee dropdowns. */
export async function listMembers() {
  return memberRepository.findAll()
}

/**
 * Creates a new member. Normalizes the email the same way signup does, so
 * lookups and the unique constraint stay case-insensitive.
 */
export async function createMember(input: CreateMemberInput) {
  const email = input.email.trim().toLowerCase()

  const existing = await memberRepository.findByEmail(email)
  if (existing) throw new DuplicateMemberEmailError()

  return memberRepository.create({
    name: input.name.trim(),
    email,
    avatarUrl: input.avatarUrl?.trim() || undefined,
  })
}
```

### 4. `lib/members/validators.ts` (new)

Mirrors `lib/todos/validators.ts` and reuses `validateEmail` rather than
duplicating the email regex:

```ts
import { validateEmail } from "@/components/auth/validation"
import type { ValidationResult } from "@/lib/auth/validators"

/** Validates a raw "create member" request body. */
export function validateCreateMemberInput(body: unknown): ValidationResult {
  if (typeof body !== "object" || body === null) {
    return { valid: false, message: "Invalid request body." }
  }

  const { name, email, avatarUrl } = body as Record<string, unknown>

  if (typeof name !== "string" || name.trim().length === 0) {
    return { valid: false, message: "Name is required." }
  }

  if (typeof email !== "string") {
    return { valid: false, message: "Email is required." }
  }
  const emailError = validateEmail(email)
  if (emailError) return { valid: false, message: emailError }

  if (avatarUrl !== undefined && typeof avatarUrl !== "string") {
    return { valid: false, message: "Avatar URL must be a string." }
  }

  return { valid: true }
}
```

### 5. `app/api/members/route.ts` (new)

Route → service shape, mirroring `app/api/todos/route.ts` exactly (auth
check, JSON parse guard, validation, domain-error → status mapping):

```ts
import { NextRequest } from "next/server"

import { apiSuccess, apiError } from "@/lib/api-response"
import { getApiUserId } from "@/lib/auth/dal"
import { validateCreateMemberInput } from "@/lib/members/validators"
import { listMembers, createMember, DuplicateMemberEmailError } from "@/services/member-service"

/** GET /api/members — lists every member, for the assignee dropdowns. */
export async function GET() {
  const userId = await getApiUserId()
  if (!userId) return apiError("Unauthorized.", 401)

  const members = await listMembers()
  return apiSuccess("Members fetched.", members)
}

/** POST /api/members — creates a new member. */
export async function POST(request: NextRequest) {
  const userId = await getApiUserId()
  if (!userId) return apiError("Unauthorized.", 401)

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return apiError("Invalid JSON body.", 400)
  }

  const validation = validateCreateMemberInput(body)
  if (!validation.valid) {
    return apiError(validation.message ?? "Invalid input.", 400)
  }

  const { name, email, avatarUrl } = body as { name: string; email: string; avatarUrl?: string }

  try {
    const member = await createMember({ name, email, avatarUrl })
    return apiSuccess("Member created.", member, 201)
  } catch (err) {
    if (err instanceof DuplicateMemberEmailError) {
      return apiError("A member with this email already exists.", 409)
    }
    console.error("[members:create] unexpected error:", err)
    return apiError("Something went wrong. Please try again.", 500)
  }
}
```

### 6. `types/member.ts` (new — small addition beyond the spec's file list)

The spec didn't call out a types file explicitly, but `types/todo.ts`
already exists as the DTO/shared shape for `Todo`, and both `TaskForm` and
`app/todos/page.tsx` need a `Member` type without importing the hook
module just for its type. Mirrors `TodoDTO`'s "wire shape" comment in
`hooks/useTodos.ts`:

```ts
/**
 * A team member who can be assigned to a task — the wire shape returned by
 * /api/members and consumed by the assignee dropdowns.
 */
export interface Member {
  id: number;
  name: string;
  email: string;
  avatarUrl?: string | null;
}
```

### 7. `hooks/useMembers.ts` (new)

Fetch-once hook mirroring `hooks/useTodos.ts`'s `parseApiResponse` pattern,
scoped down to read-only (no create/update actions needed by the UI in
this phase):

```ts
import { useState, useEffect } from "react";
import type { Member } from "@/types/member";
import type { ApiErrorBody, ApiSuccessBody } from "@/lib/api-response";

async function parseApiResponse<T>(response: Response): Promise<T> {
  const body = (await response.json()) as ApiSuccessBody<T> | ApiErrorBody;
  if (!body.success) throw new Error(body.message);
  return body.data as T;
}

/**
 * Fetches the real member directory once on mount — the replacement for
 * the old DUMMY_MEMBERS constant as the source for assignee dropdowns.
 */
export function useMembers() {
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const response = await fetch("/api/members");
        const data = await parseApiResponse<Member[]>(response);
        if (!cancelled) setMembers(data);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load members.");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return { members, isLoading, error };
}
```

### 8. `components/todo/TaskForm.tsx` (modify)

- Remove `import { DUMMY_MEMBERS } from "@/constants/members";`
- Add `members: Member[]` to `TaskFormProps` (import `Member` from
  `@/types/member`).
- In the assignee `Select`, map over the `members` prop instead of
  `DUMMY_MEMBERS`, keyed/valued the same way (`member.id` / `member.name`):
  ```tsx
  {members.map((member) => (
    <SelectItem key={member.id} value={member.name}>
      {member.name} ({member.email})
    </SelectItem>
  ))}
  ```

### 9. `components/todo/TaskSheet.tsx` (modify)

- Add `members: Member[]` to `TaskSheetProps`.
- Forward it: `<TaskForm value={form} onChange={setForm} editorKey={editorKey} members={members} />`.

### 10. `app/todos/page.tsx` (modify)

- Replace `import { DUMMY_MEMBERS } from "@/constants/members";` with
  `import { useMembers } from "@/hooks/useMembers";`.
- Add `const { members } = useMembers();` alongside the existing
  `useTodos()` call.
- "Filter by member" `Select`: map over `members` instead of
  `DUMMY_MEMBERS` (same `member.id`/`member.name` shape as today).
- Pass `members={members}` to `<TaskSheet ... />`.

### 11. Delete `constants/members.ts`

Once steps 8 and 10 land, nothing imports `DUMMY_MEMBERS` — confirmed via
a repo-wide search before deleting, per the spec.

### 12. `CLAUDE.md` (modify)

Its "Data model & dummy data" paragraph currently reads:

> `constants/members.ts` exports `DUMMY_MEMBERS`, the shared fake member
> list used by `CreateTodoDialog`, `EditTodoDialog`, and the assignee
> filter `Select` in `app/todos/page.tsx` — reuse this constant rather than
> inventing another member list.

(Note: `CreateTodoDialog`/`EditTodoDialog` no longer exist — a prior
refactor replaced them with `TaskSheet`/`TaskForm`; this doc line is
already stale on that point too.) Replace it with something like:

> `types/member.ts` defines `Member`, the shared shape returned by
> `GET /api/members` (backed by the `Member` Prisma model) and consumed by
> `hooks/useMembers.ts`. `components/todo/TaskForm.tsx` and the assignee
> filter `Select` in `app/todos/page.tsx` both source their options from
> this hook — reuse it rather than inventing another member list or
> re-adding hardcoded dummy data.

## Files touched

- **New:** `repositories/member-repository.ts`, `services/member-service.ts`,
  `lib/members/validators.ts`, `app/api/members/route.ts`,
  `types/member.ts`, `hooks/useMembers.ts`, a new Prisma migration under
  `prisma/migrations/`.
- **Modified:** `prisma/schema.prisma`, `components/todo/TaskForm.tsx`,
  `components/todo/TaskSheet.tsx`, `app/todos/page.tsx`, `CLAUDE.md`.
- **Deleted:** `constants/members.ts`.
- **Untouched (verified, no action needed):** `hooks/useTodos.ts`,
  `services/todo-service.ts`, `repositories/todo-repository.ts`,
  `types/todo.ts` (`Todo.assignee` stays `string | undefined`),
  `lib/todos/validators.ts`.

## Verification

1. `npx prisma migrate dev --name add_member` applies cleanly against the
   local `todo_app` database; `npx prisma studio` (or a direct `SELECT`)
   shows an empty `member` table.
2. Start the app (`npm run dev`), sign in, then seed a few real members
   directly through the new endpoint (no UI exists to do this yet, by
   design):
   ```bash
   curl -b <cookie jar> -X POST http://localhost:3000/api/members \
     -H "Content-Type: application/json" \
     -d '{"name":"Alice Johnson","email":"alice@example.com"}'
   ```
   Repeat for 2–3 members. Confirm a repeat call with the same email
   returns `409` with `"A member with this email already exists."`, not a
   raw Prisma error.
3. `GET /api/members` (or just reloading `/todos`) returns those members in
   the `{ success, message, data }` envelope.
4. On `/todos`: the "Filter by member" dropdown lists the real seeded
   members, not `Alice Johnson`/`Bob Smith`/etc. from the old
   `DUMMY_MEMBERS`.
5. "+ Add Task" → the assignee `Select` in the form lists the same real
   members; pick one, create a task, confirm the card shows that assignee.
6. Edit that task's assignee to a different member, save, confirm it
   updates. Filter by that member on `/todos` and confirm the task appears.
7. Confirm `constants/members.ts` no longer exists and nothing references
   `DUMMY_MEMBERS` (`grep -r DUMMY_MEMBERS` returns nothing).
8. `npm run lint`, `npx tsc --noEmit`, and `npm run build` all pass clean.
9. Full regression on existing todo flows: create/edit/delete/toggle,
   search, tab filter, and pagination all still work as before.
