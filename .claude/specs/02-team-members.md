# Spec: Team Members

## Overview

Today, task assignees are sourced from `constants/members.ts`'s hardcoded
`DUMMY_MEMBERS` array — four fake people shared by the create/edit task form
and the assignee filter on `/todos`. This phase replaces that hardcoded list
with a real `Member` table in MySQL and a small `/api/members` API, so the
assignee dropdowns are backed by actual, persisted data instead of a
constant baked into the frontend bundle.

**Scoped down for this MVP:** `Todo.assignee` stays the free-text
`String?` column it is today (populated from a real member's name instead
of a fake one). Turning it into a proper foreign-key relation to `Member`
(with `assigneeId`) is a natural follow-up but is **not** part of this
phase — it touches search (`hooks/useTodos.ts`), the repository/service
layer, and every place that renders `todo.assignee` as a string, and
deserves its own spec once the member directory itself exists and is
proven out.

## Depends on

- **Database Setup** (`.claude/specs/database-setup.md`) — Prisma/MySQL
  connection already exists and is required for the new `Member` table.
- **Authentication API/UI** (`.claude/specs/authentication_api.md`,
  `authentication_ui_specification.md`) — already complete; the new member
  routes require a signed-in user the same way `/api/todos` does.

Both are already implemented and merged to `main`.

## Routes

- `GET /api/members` — lists every member, for the assignee dropdowns —
  logged-in
- `POST /api/members` — creates a new member (name + email) — logged-in

No update/delete endpoints in this MVP phase — editing/removing a member is
deferred to a later phase.

## Database changes

Verified against the current `prisma/schema.prisma` — there is no existing
member/team table. Add one:

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

No changes to the `Todo` model in this phase — `assignee String?` stays as
is (see "Not in scope" above).

## Templates

(This project has no server-rendered template system — "templates" below
means the Next.js pages/components that render this feature.)

- **Create:** none — no new pages, only new API routes and updates to
  existing components.
- **Modify:**
  - `components/todo/TaskForm.tsx` — assignee `Select` sources its options
    from members fetched via the API instead of `DUMMY_MEMBERS`.
  - `app/todos/page.tsx` — the "Filter by member" `Select` sources from the
    same members data.

## Files to change

- `components/todo/TaskForm.tsx`
- `app/todos/page.tsx`
- `constants/members.ts` — remove `DUMMY_MEMBERS` once nothing imports it
  (confirm via a repo-wide search before deleting).
- `CLAUDE.md` — its "Data model & dummy data" note currently documents
  `DUMMY_MEMBERS` as the shared source of truth for assignees; update it to
  point at the new `Member` table/API instead.

## Files to create

- A new Prisma migration (via `npx prisma migrate dev --name add_member`)
- `repositories/member-repository.ts` — Prisma queries only (`findAll`,
  `findByEmail`, `create`), mirroring `repositories/todo-repository.ts`.
- `services/member-service.ts` — business logic (email normalization,
  duplicate-email check), mirroring `services/todo-service.ts` /
  `services/auth-service.ts`.
- `lib/members/validators.ts` — request validation, mirroring
  `lib/todos/validators.ts`.
- `app/api/members/route.ts` — `GET`/`POST`, mirroring
  `app/api/todos/route.ts`'s route → service → repository shape.
- `hooks/useMembers.ts` — client hook that fetches `/api/members` once,
  mirroring the fetch/DTO pattern already in `hooks/useTodos.ts`.

## New dependencies

No new dependencies — this reuses the existing Prisma/Next.js stack already
in `package.json`.

## Rules for implementation

- Reuse the project's existing Prisma repository → service → route layering
  (this project's ORM is Prisma; there is no raw-SQL/SQLAlchemy layer to
  match, and none should be introduced).
- All database access goes through Prisma's query builder — never
  interpolate user input into a raw SQL string.
- No password/credential handling applies to this feature; if that ever
  changes, reuse `lib/auth/password.ts`'s existing bcrypt hashing rather
  than adding a new hashing utility.
- Use the project's existing Tailwind/shadcn design tokens (CSS variables)
  for any new UI — never hardcode hex colors.
- New API responses use the shared `{ success, message, data }` envelope
  from `lib/api-response.ts` — do not invent a second response shape.
- Member routes require a signed-in user: reuse `getApiUserId()` from
  `lib/auth/dal.ts`, the same way `app/api/todos/**` does.
- Do not modify `Todo.assignee`'s type or the todos API/repository in this
  phase — only the source of the member *options* changes.

## Definition of done

- [ ] `Member` table exists in MySQL (verify with `npx prisma studio` or a
      direct `SELECT * FROM member;`)
- [ ] `GET /api/members` returns members in the `{ success, message, data }`
      envelope
- [ ] `POST /api/members` creates a member and rejects a duplicate email
      with a client-facing error (not a raw Prisma/MySQL error)
- [ ] The task create/edit assignee dropdown (`TaskForm.tsx`) lists members
      from the database, not `DUMMY_MEMBERS`
- [ ] The "Filter by member" dropdown on `/todos` lists the same real
      members
- [ ] `DUMMY_MEMBERS` is no longer imported anywhere under `app/` or
      `components/`
- [ ] `npm run lint` passes
- [ ] `npx tsc --noEmit` passes
- [ ] `npm run build` succeeds
- [ ] Existing todo create/edit/delete/toggle flows still work end-to-end
      with a real member as the assignee
