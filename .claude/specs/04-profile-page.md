# Spec: Profile Page

## Overview

Every signed-in user currently has no way to see or manage their own
account — `User` only carries `email`/`passwordHash`, and there's no page
that shows "who am I" beyond the `LogoutButton` in the app header. This
phase adds a dedicated **`/profile` page**: a read view of the signed-in
user's account (avatar, display name, email, member-since date) with an
inline edit mode for **name** and **avatar URL**, backed by two new
columns on `User` and a new `GET`/`PATCH /api/user/me` route pair. This
follows the same "dedicated page + hook + presentational components"
shape `.claude/specs/03-add-member-ui.md` used for `/members`.

**Scoped down for this MVP:** email is displayed but not editable (email
is unique and used for login, so changing it needs its own re-verification
flow), and password change / 2FA / account deletion stay out of scope —
`.claude/specs/authentication_api.md` already lists those as separate,
later phases. This phase is *view + edit basic profile info only*.

## Depends on

- **Authentication API** (`.claude/specs/authentication_api.md`) —
  already implemented and merged to `main`. This phase reuses its
  session/JWT plumbing (`lib/auth/session.ts`, `getApiUserId()` from
  `lib/auth/dal.ts`) and the `User` model/`user-repository.ts` it
  introduced.
- **Team Members** (`.claude/specs/02-team-members.md`) and
  **Members Page** (`.claude/specs/03-add-member-ui.md`) — not a hard
  dependency, but this spec mirrors their `name`/`avatarUrl` column shape
  on `Member` and their page/hook/component layering for consistency.

Neither is marked incomplete anywhere in `CLAUDE.md` or its own spec, so
this phase is safe to start.

## Routes

- `GET /api/user/me` — returns the signed-in user's profile (`id`,
  `email`, `name`, `avatarUrl`, `createdAt`) — logged-in
- `PATCH /api/user/me` — updates `name` and/or `avatarUrl` for the
  signed-in user — logged-in

No route takes a `:id` — both always act on the caller's own session
(`getApiUserId()`), never another user's row. No email/password routes
in this MVP phase.

## Database changes

Verified against the current `prisma/schema.prisma` — `User` has no
`name` or `avatarUrl` column today. Add both, mirroring `Member`'s
existing shape:

```prisma
model User {
  id           Int      @id @default(autoincrement())
  email        String   @unique
  passwordHash String
  name         String?
  avatarUrl    String?
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  todos        Todo[]
}
```

New migration via `npx prisma migrate dev --name add_user_profile_fields`.
Both columns are optional (`String?`), so every existing `User` row
migrates cleanly with `name`/`avatarUrl` as `null` — the profile page
must render sensibly for a user who has never set either (e.g. fall back
to the email's local part or a generic initial avatar).

## Templates

(This project has no server-rendered template system — "templates" below
means the Next.js pages/components that render this feature.)

- **Create:**
  - `app/profile/page.tsx` — the new dedicated profile page: same
    sticky header pattern as `app/todos/page.tsx`/`app/members/page.tsx`
    (brand, nav links, `ThemeToggle`, `LogoutButton`), with a
    `ProfileCard` as the page body.
  - `components/profile/ProfileCard.tsx` — presentational
    (`profile`, `isLoading`, `isSaving`, `error`, `onSave` props).
    Read mode shows avatar (falls back to a generated initial when
    `avatarUrl` is unset), name, email (always read-only), and
    "Member since <date>". An "Edit" button switches Name/Avatar URL to
    controlled inputs with Save/Cancel, following the same
    `Field`/`FieldLabel` pattern as `components/todo/TaskForm.tsx`.
- **Modify:**
  - `app/todos/page.tsx` — add a "Profile" nav link next to the existing
    "Members" link in the header.
  - `app/members/page.tsx` — same "Profile" nav link addition, so the
    page is reachable from anywhere in the app.

## Files to change

- `prisma/schema.prisma` — add `name`/`avatarUrl` to `User` (above).
- `repositories/user-repository.ts`:
  - Add `findById(id)` — returns the full safe profile shape (no
    `passwordHash`), mirrors `findUserByEmail`'s `select`.
  - Add `update(id, data)` — patches `name`/`avatarUrl` only, mirrors
    `todo-repository.ts`'s `update` (spread only defined fields).
- `app/todos/page.tsx` / `app/members/page.tsx` — add the "Profile" nav
  link (see Templates above).

## Files to create

- A new Prisma migration (`add_user_profile_fields`)
- `types/user.ts` — client-facing `UserProfile` type (`id`, `email`,
  `name`, `avatarUrl`, `createdAt`), the shape `GET /api/user/me`
  returns — mirrors `types/member.ts`.
- `app/api/user/me/route.ts` — `GET` + `PATCH`, mirrors the
  route → service → repository shape of `app/api/todos/[id]/route.ts`,
  but always acts on `getApiUserId()` rather than a route param.
- `lib/users/validators.ts` — `validateUpdateProfileInput`: `name`
  optional string (trimmed, max length, reuse the pattern from
  `lib/auth/validators.ts`), `avatarUrl` optional string that must be a
  valid URL when present and non-empty.
- `lib/users/client-validation.ts` — client-side mirror of the same
  checks, so `ProfileCard`'s edit mode can show inline errors before
  hitting the network (same split as `lib/members/client-validation.ts`).
- `services/user-service.ts` — `getProfile(userId)` and
  `updateProfile(userId, patch)`, with a `UserNotFoundError` class,
  mirroring `todo-service.ts`'s shape (even though "not found" should
  only happen if a session outlives its user row).
- `hooks/useProfile.ts` — owns all profile state per this repo's
  "state lives in the hook" convention (see `CLAUDE.md`): fetches
  `GET /api/user/me` on mount (`profile`, `isLoading`, `error`), exposes
  `updateProfile(input)` that `PATCH`es `/api/user/me` and merges the
  response into local state (`isSaving`, surfaces a client-facing error
  on failure), following `useMembers.ts`'s `parseApiResponse` pattern.
- `app/profile/page.tsx`
- `components/profile/ProfileCard.tsx`

## New dependencies

No new dependencies — reuses the existing shadcn `Button`/`Field`/`Input`
primitives, Prisma, and Next.js stack already in the project.

## Rules for implementation

- All database access goes through Prisma's query builder — never
  interpolate user input into a raw SQL string.
- `GET`/`PATCH /api/user/me` require a signed-in user: reuse
  `getApiUserId()` from `lib/auth/dal.ts` the same way `app/api/todos/**`
  and `app/api/members/**` already do — return 401 via `apiError` if
  there's no session, never look up another user's id from the request.
- Never accept or return `passwordHash` from `user-repository.ts`'s
  `findById`/`update` or from `GET`/`PATCH /api/user/me` — `select` it
  out explicitly, mirroring `findUserByEmail`'s existing safety there.
- Email is **read-only** in this phase — `PATCH /api/user/me` must
  ignore/reject an `email` field in the body rather than silently
  accepting it (there's no re-verification flow yet).
- No password hashing/verification applies to this feature — nothing
  here touches `passwordHash` or `lib/auth/password.ts`.
- Use the project's existing Tailwind/shadcn design tokens (CSS
  variables) for any new UI — never hardcode hex colors.
- New API responses use the shared `{ success, message, data }` envelope
  from `lib/api-response.ts` — do not invent a second response shape.
- `ProfileCard` is presentational only — it owns its own local edit-mode
  form drafts, but the fetched profile, save request, and error state all
  live in `useProfile`, matching this repo's "state lives in the hook,
  components are presentational" convention (see `CLAUDE.md`).
- Don't touch `login`/`signup`'s `SafeUser` return shape or
  `lib/auth/session.ts`'s JWT payload — the profile page fetches its own
  data via `GET /api/user/me` rather than growing the session cookie.

## Definition of done

- [ ] `User.name` and `User.avatarUrl` columns exist in MySQL, both
      nullable, existing rows unaffected (verify with
      `npx prisma studio` or `SELECT * FROM user;`)
- [ ] `/profile` renders the signed-in user's avatar (or initial
      fallback when `avatarUrl` is unset), name (or fallback when unset),
      email, and "Member since" date
- [ ] Visiting `/profile` while signed out redirects to `/sign-in`
      (same behavior as `/todos` and `/members`)
- [ ] Clicking "Edit" reveals editable Name/Avatar URL fields pre-filled
      with the current values; Cancel discards changes without a network
      request
- [ ] Saving a valid change calls `PATCH /api/user/me`, updates the DB
      (verify in the DB), and the page reflects the new values
      immediately without a refetch
- [ ] Submitting an invalid Avatar URL (not a URL) is blocked
      client-side before any network request fires
- [ ] Attempting to send `email` in the `PATCH` body has no effect on
      the stored email (confirm via direct API call, e.g. curl/Postman)
- [ ] `GET`/`PATCH /api/user/me` both return 401 when called without a
      valid session
- [ ] `/todos` and `/members` both link to `/profile`, and `/profile`
      links back into the app
- [ ] `npm run lint` passes
- [ ] `npx tsc --noEmit` passes
- [ ] `npm run build` succeeds
- [ ] Existing todo and member flows still work end-to-end
