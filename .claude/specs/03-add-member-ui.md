# Spec: Members Page

## Overview

`.claude/specs/02-team-members.md` built the `Member` table and the
`GET`/`POST /api/members` routes, but the member directory is currently
read-only from the app's perspective (`hooks/useMembers.ts` only ever
fetches, never creates) and has no UI of its own at all — members are only
ever seen as options inside the todo assignee dropdowns. This phase adds a
dedicated **`/members` page**: a paginated table of every member with an
"Add Member" action and an Active/Inactive `Switch` per row, backed by a
new `isActive` column and a new `PATCH /api/members/:id` route. Only
**active** members are selectable in the existing task assignee dropdowns
(`TaskForm.tsx`'s assignee field and the "Filter by member" filter on
`/todos`) — deactivating a member removes them from those pickers without
deleting their record or touching todos already assigned to them.

## Depends on

- **Team Members** (`.claude/specs/02-team-members.md`) — already
  implemented and merged to `main`. This phase reuses its `Member` model,
  `POST /api/members` route, `member-service.ts`, `member-repository.ts`,
  `lib/members/validators.ts`, and `hooks/useMembers.ts` as its base and
  extends all of them.

## Routes

- `PATCH /api/members/:id` — updates `isActive` for a member — logged-in
  (new route, mirrors `app/api/todos/[id]/route.ts`'s `PATCH`)
- `POST /api/members` — creates a new member — logged-in (already exists
  from step 02, unchanged)
- `GET /api/members` — lists every member — logged-in (already exists from
  step 02, unchanged — still returns all members regardless of
  `isActive`; filtering active-only happens client-side, matching how
  `useTodos` filters client-side rather than via query params)

No delete endpoint — deactivating (`isActive: false`) is the only removal
mechanism in this phase, by design (matches the "Active/Deactivate via
Switch" ask, not a hard delete).

## Database changes

Add one column to the existing `Member` model in `prisma/schema.prisma`:

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

New migration via `npx prisma migrate dev --name add_member_is_active`.
Existing rows default to `isActive: true`, so nothing already in the
directory silently disappears from the assignee dropdowns.

## Templates

(This project has no server-rendered template system — "templates" below
means the Next.js pages/components that render this feature.)

- **Create:**
  - `app/members/page.tsx` — the new dedicated members page: header +
    "Add Member" button, a `Table` (`components/ui/table.tsx`) of every
    member (Name / Email / Avatar / Status), an Active/Inactive `Switch`
    (`components/ui/switch.tsx`) per row, and pagination at the bottom.
  - `components/members/MemberTable.tsx` — the table body, presentational
    (`members`, `onToggleActive` props), following the same
    "components are presentational, state lives in the hook" split as
    `components/todo/TodoList.tsx`.
  - `components/members/AddMemberDialog.tsx` — a shadcn `Dialog` with
    Name / Email / Avatar URL (optional) fields, following the same
    controlled `Field`/`FieldLabel` pattern as `components/todo/TaskForm.tsx`
    and the confirm/cancel footer pattern in
    `components/todo/DeleteTodoDialog.tsx`.
- **Modify:**
  - `components/todo/TodoPagination.tsx` — genuinely generic already
    (props are just `currentPage`/`totalPages`/`setCurrentPage`, no todo
    references in its body) — reuse it directly on the members page rather
    than forking it. No change needed unless review flags the cross-domain
    import as worth a rename/move to a shared location.
  - `hooks/useMembers.ts` — see "Files to change" below.
  - `app/todos/page.tsx` — add a nav link to `/members` (e.g. next to the
    "NexusCore" header, or as a small link near the assignee filter) so
    the new page is reachable; add a link back to `/todos` on the members
    page too.
  - `components/todo/TaskForm.tsx` and the "Filter by member" `Select` in
    `app/todos/page.tsx` — both already just map over the `members` array
    they're given; no prop-shape change, they'll simply receive the
    already-filtered *active-only* list from `useMembers` (see below).

## Files to change

- `types/member.ts` — add `isActive: boolean` to the `Member` interface.
- `hooks/useMembers.ts`:
  - Add `createMember(input)` — POSTs to `/api/members` via the existing
    `parseApiResponse` helper, appends the returned member to local state.
  - Add `toggleMemberActive(id, isActive)` — PATCHes
    `/api/members/:id`, merges the server's copy into local state
    (mirrors `useTodos`'s `toggleTodo`).
  - Add `activeMembers` (derived via `useMemo`, `members.filter(m =>
    m.isActive)`) — this is what `TaskForm`'s assignee dropdown and the
    "Filter by member" `Select` should now consume instead of raw
    `members`, per the "hide inactive from pickers" decision.
  - Add pagination state for the new table — `currentPage`,
    `totalPages`, `paginatedMembers`, `setCurrentPage` — mirroring
    `useTodos`'s `TODOS_PAGE_SIZE`/pagination block exactly (same slice-
    based approach, same page-clamping behavior on deactivate/create).
  - Surface a client-facing error message on `createMember`/
    `toggleMemberActive` failure (e.g. duplicate email → the API's
    existing 409 message).
- `app/todos/page.tsx` — swap `members` → `activeMembers` when passing
  props to `TaskForm`/the assignee filter `Select`; add the `/members`
  nav link.
- `app/api/members/route.ts` — no behavior change, but note in a comment
  that `GET` intentionally still returns inactive members (the members
  table needs them; only the dropdowns filter).

## Files to create

- A new Prisma migration (`add_member_is_active`)
- `app/api/members/[id]/route.ts` — `PATCH` only, mirrors
  `app/api/todos/[id]/route.ts`'s route → service → repository shape;
  body is `{ isActive: boolean }`.
- `lib/members/validators.ts` — add `validateUpdateMemberInput` alongside
  the existing `validateCreateMemberInput` (same file, not a new one).
- `services/member-service.ts` — add `updateMemberActive(id, isActive)`
  and a `MemberNotFoundError` class, mirroring `todo-service.ts`'s
  `updateTodo`/`TodoNotFoundError`.
- `repositories/member-repository.ts` — add `update(id, data)`, mirroring
  `todo-repository.ts`'s update function.
- `app/members/page.tsx`
- `components/members/MemberTable.tsx`
- `components/members/AddMemberDialog.tsx`
- `lib/members/client-validation.ts` — client-side mirror of
  `validateCreateMemberInput`'s checks (required name, `validateEmail`
  from `components/auth/validation.ts`), so `AddMemberDialog` can show
  inline errors before hitting the network.

## New dependencies

No new dependencies — `components/ui/table.tsx` and
`components/ui/switch.tsx` already exist in the shadcn kit; everything
else reuses the existing Prisma/Next.js stack.

## Rules for implementation

- Reuse the project's existing Prisma repository → service → route
  layering for the new `PATCH` route — same shape as `app/api/todos/[id]`.
- All database access goes through Prisma's query builder — never
  interpolate user input into a raw SQL string.
- Use the project's existing Tailwind/shadcn design tokens (CSS
  variables) for any new UI — never hardcode hex colors.
- New/updated API responses use the shared `{ success, message, data }`
  envelope from `lib/api-response.ts` — do not invent a second response
  shape.
- The `/members` page and `PATCH /api/members/:id` require a signed-in
  user: reuse `getApiUserId()` from `lib/auth/dal.ts`, the same way
  `app/api/todos/**` and `GET/POST /api/members` already do.
- Pagination on `/members` must follow the exact same client-side
  slice/page-clamp pattern `useTodos` uses for todos (see
  `TODOS_PAGE_SIZE`) — introduce a matching `MEMBERS_PAGE_SIZE` constant
  in `useMembers.ts` rather than a different pagination approach.
- `MemberTable`/`AddMemberDialog` are presentational only — they own
  their own local form-input drafts but the member list, pagination, and
  create/update requests all live in `useMembers`, matching this repo's
  "state lives in the hook, components are presentational" convention
  (see `CLAUDE.md`).
- Deactivating a member is **not** a delete — it must never remove the
  row from `/members` or affect any existing `Todo.assignee` string
  already set to that member's name. It only removes them from future
  assignee selection.
- No password/credential handling applies to this feature.
- Don't touch `Todo.assignee`'s type or the todos API/repository in this
  phase — only member data and its own routes change.

## Definition of done

- [ ] `Member.isActive` column exists in MySQL, defaulting existing rows
      to `true` (verify with `npx prisma studio` or
      `SELECT * FROM member;`)
- [ ] `/members` page renders a paginated table of all members (Name,
      Email, Avatar, Status)
- [ ] Pagination on `/members` behaves the same as on `/todos` (Previous/
      Next, page clamping, correct page size)
- [ ] Each row has a working Active/Inactive `Switch` that calls
      `PATCH /api/members/:id` and updates immediately without a refetch
- [ ] "Add Member" button opens a dialog; submitting a valid name+email
      creates a member (verify in the DB) and it appears in the table
      immediately, active by default
- [ ] Submitting a duplicate email in the Add Member dialog shows the
      API's 409 error inline, not a raw/unhandled error
- [ ] Submitting an empty name or invalid email is blocked client-side
      before any network request fires
- [ ] Deactivating a member removes them from `TaskForm`'s assignee
      dropdown and the "Filter by member" filter on `/todos`, but they
      remain visible (toggled off) on `/members`
- [ ] Reactivating a member makes them selectable again in both
      dropdowns
- [ ] An existing todo already assigned to a now-inactive member still
      displays that assignee name unchanged
- [ ] `/todos` and `/members` link to each other
- [ ] `npm run lint` passes
- [ ] `npx tsc --noEmit` passes
- [ ] `npm run build` succeeds
- [ ] Existing todo create/edit/delete/toggle flows still work end-to-end
