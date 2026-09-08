# Plan: Members Page (spec `.claude/specs/03-add-member-ui.md`)

## Context

`.claude/specs/02-team-members.md` already built a real `Member` table
and `GET`/`POST /api/members`, but the member directory has no UI of its
own — members only ever appear as options inside the todo assignee
dropdowns, and there's no way to create one from the app at all
(`hooks/useMembers.ts` is read-only). The user asked for this to become a
first-class feature: a dedicated `/members` page with a paginated table
(mirroring the `/todos` page's pagination), an "Add Member" action, and an
Active/Inactive toggle per member via a `Switch`. Confirmed with the user:
deactivating a member removes them from the task assignee dropdowns
(`TaskForm`'s assignee field, and the "Filter by member" filter on
`/todos`) without deleting the record or touching any `Todo.assignee`
string already set to their name — reactivating brings them back.

This plan was produced from two rounds of live codebase research (backend
route/service/repository/validator conventions from the todo equivalents;
frontend Table/Switch/Dialog/Field APIs and page composition from
`app/todos/page.tsx`, `TaskForm.tsx`, `TaskSheet.tsx`, `TodoList.tsx`,
`LoginForm.tsx`) — every pattern below is confirmed against real files in
this repo, not assumed.

## Build order

1. Prisma schema + migration
2. `repositories/member-repository.ts`
3. `services/member-service.ts`
4. `lib/members/validators.ts`
5. `app/api/members/[id]/route.ts` (+ comment on `app/api/members/route.ts`)
6. `types/member.ts`
7. `hooks/useMembers.ts` (full rewrite)
8. `lib/members/client-validation.ts`
9. `components/members/MemberTable.tsx`
10. `components/members/AddMemberDialog.tsx`
11. `app/members/layout.tsx`
12. `app/members/page.tsx`
13. `app/todos/page.tsx` edits
14. `npm run lint` / `npx tsc --noEmit` / `npm run build`

## 1. Database

Add one column to `prisma/schema.prisma`'s `Member` model:

```prisma
model Member {
  id        Int      @id @default(autoincrement())
  name      String
  email     String   @unique
  avatarUrl String?
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

Run `npx prisma migrate dev --name add_member_is_active`. `@default(true)`
backfills every existing row non-destructively — nothing currently in the
dropdowns disappears. This also regenerates `generated/prisma/client`,
which the repository layer needs before it will typecheck.

## 2. Backend — repository, service, validators, route

Mirror the todo equivalents exactly (`app/api/todos/[id]/route.ts` →
`services/todo-service.ts` → `repositories/todo-repository.ts` →
`lib/todos/validators.ts`), with two differences: `Member.id` is `Int`
(autoincrement), not a `String` cuid like `Todo.id` — route params always
arrive as strings, so the new route must `Number(id)` and reject
non-integers before calling the service; and `Member` has no `userId`, so
`updateMemberActive` only needs an existence check, not an ownership
comparison.

**`repositories/member-repository.ts`** — add:
```ts
export interface UpdateMemberInput { isActive?: boolean }

export async function findById(id: number) {
  return prisma.member.findUnique({ where: { id } })
}

export async function update(id: number, input: UpdateMemberInput) {
  return prisma.member.update({
    where: { id },
    data: { ...(input.isActive !== undefined ? { isActive: input.isActive } : {}) },
  })
}
```

**`services/member-service.ts`** — add:
```ts
export class MemberNotFoundError extends Error {}

export async function updateMemberActive(id: number, isActive: boolean) {
  const existing = await memberRepository.findById(id)
  if (!existing) throw new MemberNotFoundError()
  return memberRepository.update(id, { isActive })
}
```

**`lib/members/validators.ts`** — add alongside the existing
`validateCreateMemberInput`:
```ts
export function validateUpdateMemberInput(body: unknown): ValidationResult {
  if (typeof body !== "object" || body === null) {
    return { valid: false, message: "Invalid request body." }
  }
  const { isActive } = body as Record<string, unknown>
  if (typeof isActive !== "boolean") {
    return { valid: false, message: "isActive must be a boolean." }
  }
  return { valid: true }
}
```

**`app/api/members/[id]/route.ts`** (new) — `PATCH` only:
```ts
import { NextRequest } from "next/server"
import { apiSuccess, apiError } from "@/lib/api-response"
import { getApiUserId } from "@/lib/auth/dal"
import { validateUpdateMemberInput } from "@/lib/members/validators"
import { updateMemberActive, MemberNotFoundError } from "@/services/member-service"

interface RouteParams { params: Promise<{ id: string }> }

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const userId = await getApiUserId()
  if (!userId) return apiError("Unauthorized.", 401)

  const { id } = await params
  const memberId = Number(id)
  if (!Number.isInteger(memberId)) return apiError("Invalid member id.", 400)

  let body: unknown
  try { body = await request.json() } catch { return apiError("Invalid JSON body.", 400) }

  const validation = validateUpdateMemberInput(body)
  if (!validation.valid) return apiError(validation.message ?? "Invalid input.", 400)

  const { isActive } = body as { isActive: boolean }

  try {
    const member = await updateMemberActive(memberId, isActive)
    return apiSuccess("Member updated.", member)
  } catch (err) {
    if (err instanceof MemberNotFoundError) return apiError("Member not found.", 404)
    console.error("[members:update] unexpected error:", err)
    return apiError("Something went wrong. Please try again.", 500)
  }
}
```

`app/api/members/route.ts` — no behavior change; add a one-line comment
on `GET` noting it intentionally still returns inactive members (the
`/members` table needs them; only the dropdowns filter, client-side).

## 3. `types/member.ts`

Add `isActive: boolean;` to the `Member` interface.

## 4. `hooks/useMembers.ts` — full rewrite

Mirrors `useTodos.ts`'s conventions (`parseApiResponse`, `useCallback`
actions, `useMemo` derivations, slice-based pagination). Simpler than
`useTodos`'s pagination since there's no filter state to reset from — just
clamp `currentPage` to `totalPages`.

```ts
export const MEMBERS_PAGE_SIZE = 8;

export interface CreateMemberInput { name: string; email: string; avatarUrl?: string }

export interface UseMembersReturn {
  members: Member[];
  activeMembers: Member[];
  paginatedMembers: Member[];
  currentPage: number;
  totalPages: number;
  isLoading: boolean;
  error: string | null;
  setCurrentPage: (page: number) => void;
  createMember: (input: CreateMemberInput) => Promise<Member>;
  toggleMemberActive: (id: number, isActive: boolean) => Promise<void>;
}
```

Key pieces:
- Fetch-on-mount effect: unchanged from the current file.
- `activeMembers = useMemo(() => members.filter(m => m.isActive), [members])`
  — this is what `TaskForm` and the `/todos` assignee filter consume from
  now on, instead of raw `members`.
- `totalPages = Math.max(1, Math.ceil(members.length / MEMBERS_PAGE_SIZE))`;
  `page = Math.min(currentPage, totalPages)`;
  `paginatedMembers = useMemo(() => { const start = (page-1)*MEMBERS_PAGE_SIZE; return members.slice(start, start+MEMBERS_PAGE_SIZE) }, [members, page])`.
  Paginate over the full `members` list (not `activeMembers`) — the table
  must show inactive members too.
- `createMember` — POSTs `/api/members`, appends the created member and
  re-sorts by name locally (no re-fetch) to match the server's
  `findAll()` ordering:
  ```ts
  const createMember = useCallback(async (input: CreateMemberInput) => {
    const response = await fetch("/api/members", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    const created = await parseApiResponse<Member>(response);
    setMembers((prev) => [...prev, created].sort((a, b) => a.name.localeCompare(b.name)));
    return created;
  }, []);
  ```
  Throws on failure (via `parseApiResponse`'s rethrow, e.g. the 409
  duplicate-email message) — `AddMemberDialog` catches this directly
  rather than the hook holding a mutation-error state, matching how
  `LoginForm.tsx` handles its own `formError`.
- `toggleMemberActive` — PATCHes and merges the server's copy, mirroring
  `toggleTodo`; no optimistic update, consistent with `toggleTodo`'s
  existing behavior:
  ```ts
  const toggleMemberActive = useCallback(async (id: number, isActive: boolean) => {
    const response = await fetch(`/api/members/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive }),
    });
    const updated = await parseApiResponse<Member>(response);
    setMembers((prev) => prev.map((m) => (m.id === id ? updated : m)));
  }, []);
  ```
- Return `currentPage: page` (the clamped value), matching `useTodos`'s
  return shape.

## 5. `lib/members/client-validation.ts` (new)

Mirrors `components/auth/validation.ts`'s per-field + whole-form shape,
reusing `validateEmail` from there (already reused server-side in
`lib/members/validators.ts`):

```ts
import { validateEmail } from "@/components/auth/validation";

export interface AddMemberFieldErrors { name?: string; email?: string }

export function validateMemberName(name: string): string | undefined {
  if (!name.trim()) return "Name is required.";
  return undefined;
}

export function validateAddMemberForm(values: { name: string; email: string }): AddMemberFieldErrors {
  const errors: AddMemberFieldErrors = {};
  const nameError = validateMemberName(values.name);
  if (nameError) errors.name = nameError;
  const emailError = validateEmail(values.email);
  if (emailError) errors.email = emailError;
  return errors;
}
```

`avatarUrl` stays unvalidated (optional, free-text), matching the
server's `validateCreateMemberInput`.

## 6. `components/members/MemberTable.tsx` (new)

Presentational only — mirrors `TodoList.tsx`'s split (state lives in the
hook, this renders + forwards callbacks).

```tsx
interface MemberTableProps {
  members: Member[];
  onToggleActive: (id: number, isActive: boolean) => void;
}
```

`Table > TableHeader > TableRow > TableHead` for **Member** (avatar +
name), **Email**, **Status** (one column: `Switch` + a small
`text-muted-foreground` "Active"/"Inactive" label — this single column
covers both the "Status" and "Switch per row" requirements rather than
splitting into two columns). Avatar cell uses `components/ui/avatar.tsx`'s
`Avatar`/`AvatarImage`/`AvatarFallback` (confirmed to exist), falling back
to initials via the exact `getInitials(name)` helper already in
`components/task-card/TaskCard.tsx:48-52` (split on whitespace, first +
last initial, uppercased) — reuse that logic rather than reinventing it.

Empty state, unlike `TodoList`'s "replace the whole grid" pattern, keeps
the header visible and renders inside `TableBody` as one spanning row:
`<TableRow><TableCell colSpan={3} className="text-center py-12 text-muted-foreground">No members found.</TableCell></TableRow>`
when `members.length === 0`.

Row switch: `<Switch checked={member.isActive} onCheckedChange={(checked) => onToggleActive(member.id, checked)} />`
— `components/ui/switch.tsx` is base-ui-backed (`checked`/`onCheckedChange(checked: boolean, eventDetails)`,
not Radix's `data-state`), confirmed via direct read; this is the first
real consumer of both `Table` and `Switch` in the repo (zero prior usages
found).

## 7. `components/members/AddMemberDialog.tsx` (new)

Uses `Dialog`/`DialogContent`/`DialogHeader`/`DialogFooter` (not
`AlertDialog` — needs a real form body). Field layout, reset-on-open, and
error handling directly mirror `components/auth/LoginForm.tsx` (confirmed
via full read — same `Field`/`FieldContent`/`FieldError`/`formError`/
`toast.add` pattern).

```tsx
interface AddMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (input: CreateMemberInput) => Promise<Member>;
}
```

State: `name`, `email`, `avatarUrl` (plain `useState<string>` each),
`errors: AddMemberFieldErrors`, `formError: string | undefined`,
`isSubmitting: boolean`.

Reset-on-open via the render-time "session key" idiom already used in
`TaskSheet.tsx` (not a `useEffect`):
```tsx
const [prevOpen, setPrevOpen] = useState(open);
if (open !== prevOpen) {
  setPrevOpen(open);
  if (open) {
    setName(""); setEmail(""); setAvatarUrl("");
    setErrors({}); setFormError(undefined);
  }
}
```

Submit flow (mirrors `LoginForm.handleSubmit`):
```tsx
async function handleSubmit(e: React.FormEvent) {
  e.preventDefault();
  if (isSubmitting) return;
  setFormError(undefined);
  const nextErrors = validateAddMemberForm({ name, email });
  setErrors(nextErrors);
  if (Object.keys(nextErrors).length > 0) return;

  setIsSubmitting(true);
  try {
    const member = await onCreate({ name, email, avatarUrl: avatarUrl.trim() || undefined });
    toast.add({ title: "Member added", description: `${member.name} has been added.`, type: "success" });
    onOpenChange(false);
  } catch (err) {
    setFormError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
  } finally {
    setIsSubmitting(false);
  }
}
```

Body: `Field`+`FieldLabel`+`FieldContent`+`Input`+`FieldError` for Name
and Email (with `aria-invalid`/`aria-describedby`, exactly like
`LoginForm`), a plain `Field`+`Input` for the optional Avatar URL (no
error slot), `{formError && <FieldError>{formError}</FieldError>}` above
the footer for the 409/network case, `DialogFooter` with `variant="outline"`
Cancel (`onClick={() => onOpenChange(false)}`) + submit `Button`
(`type="submit"`, `disabled={isSubmitting}`, text
`isSubmitting ? "Adding..." : "Add Member"`).

This satisfies the spec's DoD: empty-name/invalid-email blocked
client-side before any fetch fires; duplicate email surfaces the API's
409 message inline via `formError`, not a raw/unhandled error.

## 8. `app/members/layout.tsx` (new)

Byte-for-byte mirror of the confirmed `app/todos/layout.tsx`:
```tsx
import { verifySession } from "@/lib/auth/dal"

export default async function MembersLayout({ children }: { children: React.ReactNode }) {
  await verifySession()
  return <>{children}</>
}
```

## 9. `app/members/page.tsx` (new)

Mirrors `app/todos/page.tsx`'s shell exactly (`"use client"`, sticky
header, `max-w-6xl mx-auto space-y-8 p-4 md:p-8` container, fixed-bottom
pagination footer only when `totalPages > 1`, overlay dialog at the
bottom of JSX). Reuses `components/todo/TodoPagination.tsx` directly
(confirmed fully generic — no todo-specific coupling) rather than
forking it.

```tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { useMembers } from "@/hooks/useMembers";
import { MemberTable } from "@/components/members/MemberTable";
import { AddMemberDialog } from "@/components/members/AddMemberDialog";
import { TodoPagination } from "@/components/todo/TodoPagination";
import { ThemeToggle } from "@/components/theme-toggle";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { Plus } from "lucide-react";

export default function MembersPage() {
  const {
    paginatedMembers, currentPage, totalPages, setCurrentPage,
    createMember, toggleMemberActive, isLoading, error,
  } = useMembers();
  const [addOpen, setAddOpen] = useState(false);

  function handleToggleActive(id: number, isActive: boolean) {
    toggleMemberActive(id, isActive).catch((err) => {
      toast.add({
        title: "Couldn't update member",
        description: err instanceof Error ? err.message : "Something went wrong.",
        type: "error",
      });
    });
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-50 border-b border-border backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-4 md:px-8 py-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex items-center justify-center size-8 rounded-lg bg-primary text-primary-foreground">
              <div className="size-4 rounded-sm bg-primary-foreground/30" />
            </div>
            <span className="text-lg font-bold tracking-tight text-foreground">NexusCore</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/todos" className="text-sm font-medium text-muted-foreground hover:text-foreground">
              Todos
            </Link>
            <ThemeToggle />
            <LogoutButton />
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto space-y-8 p-4 md:p-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <h1 className="text-2xl font-bold text-foreground">Members</h1>
          <Button className="w-full md:w-auto gap-2" onClick={() => setAddOpen(true)}>
            <Plus className="size-4" /> Add Member
          </Button>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <MemberTable members={paginatedMembers} onToggleActive={handleToggleActive} />
      </div>

      {totalPages > 1 && (
        <footer className="fixed inset-x-0 bottom-0 z-50 border-t border-border backdrop-blur supports-[backdrop-filter]:bg-background/80">
          <div className="max-w-6xl mx-auto px-4 md:px-8 py-3 pb-9">
            <TodoPagination currentPage={currentPage} totalPages={totalPages} setCurrentPage={setCurrentPage} />
          </div>
        </footer>
      )}

      <AddMemberDialog open={addOpen} onOpenChange={setAddOpen} onCreate={createMember} />
    </div>
  );
}
```

(`isLoading` is available but not required by the DoD — no loading
skeleton needed, matching `/todos`'s current lack of one.)

## 10. `app/todos/page.tsx` edits

1. Destructure `activeMembers` from `useMembers()` instead of `members`;
   pass `activeMembers` to `<TaskSheet members={...}>` (forwards to
   `TaskForm`) and the "Filter by member" `Select`'s `.map()`. No
   downstream prop-shape changes — both already just map over whatever
   array they're given (confirmed by reading `TaskForm.tsx` in full).
2. Add a `/members` nav link in the header, next to `ThemeToggle`/
   `LogoutButton`:
   ```tsx
   <Link href="/members" className="text-sm font-medium text-muted-foreground hover:text-foreground">
     Members
   </Link>
   ```

## Design decisions worth flagging

- **Header duplication**: `app/todos/page.tsx` already duplicates its
  header inline rather than using a shared layout — `app/members/page.tsx`
  follows the same convention (minimal diff). Extracting a shared
  `<AppHeader>` is a reasonable follow-up but out of scope here.
- **`MEMBERS_PAGE_SIZE = 8`**: the spec only asks to mirror `TODOS_PAGE_SIZE`'s
  slice-based *approach*, not its exact value (6, sized for a card grid).
  8 is a reasonable table-row default — easy to change if the user wants
  a specific number.
- **No optimistic UI on toggle**: intentionally matches `toggleTodo`'s
  existing await-then-update behavior rather than introducing a new
  optimistic-update pattern this codebase doesn't otherwise use.
- **Local re-sort after create**: `createMember` re-sorts the appended
  member into the array by name (matching the server's
  `findAll({ orderBy: { name: "asc" } })`) since there's no re-fetch —
  otherwise the table's alphabetical order would drift after the first
  creation.

## Verification (no test runner in this repo)

- **Migration**: `npx prisma studio` (or `SELECT * FROM member;`) —
  confirm `isActive` exists and every pre-existing row is `true`.
- **`/members` renders**: `npm run dev`, sign in, visit `/members` —
  table shows Name/Email/Avatar/Status for all members, paginated once
  more than `MEMBERS_PAGE_SIZE` exist.
- **Pagination parity**: seed enough members (via Add Member, repeated)
  to exceed one page; confirm Previous/Next match `/todos`'s behavior
  exactly (same component, so guaranteed by construction).
- **Switch**: toggle a row, confirm the UI updates without a full
  refetch, and confirm via Prisma Studio that `isActive` flipped
  server-side.
- **Add Member happy path**: submit valid name+email → appears
  immediately in the table (active, switch on) → confirm in the DB.
- **Duplicate email**: submit an email already in use → dialog shows the
  409 message inline, no console error/blank dialog.
- **Client-side validation**: submit empty name / malformed email →
  confirm no network request fires (Network tab) and inline errors show.
- **Dropdown filtering**: deactivate a member on `/members` → confirm
  they're gone from `TaskForm`'s assignee `Select` and the "Filter by
  member" filter on `/todos`; reactivate → confirm they reappear in both.
- **Assignee string preservation**: assign a member to a todo, then
  deactivate them → open that todo, confirm the assignee name still
  displays unchanged (todos store `assignee` as a free-text snapshot).
- **Cross-linking**: `/todos` → "Members" link → `/members`; and back.
- **Regression**: existing todo create/edit/delete/toggle flows on
  `/todos` still work end-to-end (assignee source changed to
  `activeMembers`).
- **Final gate**: `npm run lint`, `npx tsc --noEmit`, `npm run build` all
  pass clean.

## Critical files

- `prisma/schema.prisma`
- `repositories/member-repository.ts`, `services/member-service.ts`,
  `lib/members/validators.ts`, `app/api/members/[id]/route.ts`
- `hooks/useMembers.ts`
- `components/members/MemberTable.tsx`,
  `components/members/AddMemberDialog.tsx`
- `app/members/layout.tsx`, `app/members/page.tsx`
- `app/todos/page.tsx`
