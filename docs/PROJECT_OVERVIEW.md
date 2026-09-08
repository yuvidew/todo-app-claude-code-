# Project Overview

A Next.js 16 (App Router) todo application with email/password auth, a MySQL
database via Prisma 7, and a rich-text (BlockNote) task description editor.
The repo also carries an unrelated static marketing landing page at `/`.

> **Note on `CLAUDE.md`:** that file currently describes an older, in-memory
> version of the todo app (state only in `useState`, no backend). The app has
> since grown a real backend — Prisma/MySQL, cookie-based sessions, and a
> REST API under `app/api`. This document reflects the current code. Consider
> refreshing `CLAUDE.md`'s Architecture section to match.

## Stack

| Concern | Choice |
|---|---|
| Framework | Next.js `16.3.3` (App Router), React `19.2.8` |
| Language | TypeScript |
| Database | MySQL, via Prisma `7.10.0` (`@prisma/adapter-mariadb` driver adapter) |
| Auth | Custom email/password, `bcryptjs` hashing, `jose` JWT session cookie |
| UI kit | shadcn/ui (`components.json` style `base-maia`) on `@base-ui/react`, Tailwind v4 |
| Rich text | BlockNote (`@blocknote/core`/`react`/`mantine`) for task descriptions |
| Lint | ESLint flat config, `eslint-config-next` core-web-vitals + typescript |
| Tests | None configured |

## Commands

```bash
npm run dev              # start dev server
npm run build             # production build
npm run start              # run production build
npm run lint                # ESLint
npm run prisma:generate  # regenerate Prisma client → generated/prisma
npm run prisma:migrate   # run/create a dev migration
```

## Environment variables

No `.env.example` is checked in. Based on `lib/prisma.ts` and
`lib/auth/session.ts`, the app expects:

- `MYSQL_HOST`, `MYSQL_PORT`, `MYSQL_USER`, `MYSQL_PASSWORD`, `MYSQL_DATABASE`
  — read by the `PrismaMariaDb` driver adapter.
- `SESSION_SECRET` — HMAC key for signing session JWTs; `lib/auth/session.ts`
  throws at import time if it's unset.

## Two unrelated surfaces, one app

- **`app/page.tsx`** — static "NexusCore AI" marketing shell (`Navbar` /
  `Hero` / `ProductVisual` from `components/landing/*`). No todo logic.
- **`app/todos/`** — the actual todo application, gated behind auth.
- **`app/(auth)/sign-in`, `app/(auth)/sign-up`** — login/signup pages, laid
  out via `components/auth/*`.

## Auth flow

Cookie-based sessions, checked at two layers (defense in depth):

1. **`proxy.ts`** (Next's middleware-equivalent, runs on nearly every
   request) — an *optimistic* check that only decodes the session cookie
   (no DB hit, per Next.js proxy guidance). Redirects signed-out visitors
   away from `/todos*`, and signed-in visitors away from `/sign-in`/`/sign-up`.
2. **`app/todos/layout.tsx`** → `lib/auth/dal.ts#verifySession()` — the
   source-of-truth check that runs server-side close to the data, wrapped in
   React `cache()` so it decrypts the cookie once per render pass. Redirects
   to `/sign-in` if invalid.

Route handlers (`app/api/**`) use `getApiUserId()` (also in `lib/auth/dal.ts`)
instead — it never redirects, just returns `userId | null` so the handler can
reply with a JSON 401.

**Session mechanics** (`lib/auth/session.ts`):
- Signed HS256 JWT (via `jose`), 7-day expiry, payload is just
  `{ userId, expiresAt }` — kept minimal since it round-trips as a cookie.
- Stored in an `httpOnly`, `sameSite=lax` cookie named `session`
  (`secure` in production).

**Auth API** (`app/api/auth/*`, backed by `services/auth-service.ts` →
`repositories/user-repository.ts`):
- `POST /api/auth/signup` — normalizes email (trim + lowercase), hashes
  password with bcrypt, throws `DuplicateEmailError` if taken.
- `POST /api/auth/login` — verifies password; throws a single generic
  `InvalidCredentialsError` for both "no such user" and "wrong password" so
  the API never leaks which emails are registered.
- `POST /api/auth/logout` — clears the session cookie.

Passwords are hashed in `lib/auth/password.ts` (bcryptjs); the hash never
leaves the server (`SafeUser` type excludes it).

## Data model (`prisma/schema.prisma`)

```
User  { id, email (unique), passwordHash, createdAt, updatedAt, todos[] }
Todo  { id (cuid), title, description (Json), completed, assignee?,
        createdAt, updatedAt, userId → User, @@index([userId]) }
```

- `description` is stored as JSON — see **Task descriptions**, below.
- `assignee` is a free-text string (name/email), not a foreign key — see
  **Assignees**, below.

## Layered backend: route → service → repository

Every todo/auth operation follows the same three-layer split:

```
app/api/**/route.ts        → HTTP concerns: parse/validate request, map
                              domain errors to status codes, call a service.
services/*.ts                → business rules: ownership checks, trimming
                              input, translating "not found/not yours" into
                              domain errors (TodoNotFoundError,
                              DuplicateEmailError, InvalidCredentialsError).
repositories/*.ts          → pure persistence via Prisma; no auth/validation.
```

`repositories/todo-repository.ts` never filters, sorts beyond
`createdAt desc`, or paginates — it always returns the full set for a user.
Filtering, search, and pagination are entirely client-side in
`hooks/useTodos.ts`, which fetches the full list once per mount.

Ownership is enforced in the service layer: `updateTodo`/`deleteTodo` fetch
the existing row, and throw `TodoNotFoundError` for *both* "no such id" and
"exists but belongs to someone else" — the API never reveals whether an id
exists at all to a non-owner.

## Todos REST API (`app/api/todos/**`)

All responses use the shared envelope from `lib/api-response.ts`:
`{ success, message, data }` on success, `{ success: false, message }` on
error.

| Method & path | Auth | Body | Notes |
|---|---|---|---|
| `GET /api/todos` | required | — | Full list owned by caller, newest first |
| `POST /api/todos` | required | `{ title, description, assignee? }` | 201 on success |
| `PATCH /api/todos/:id` | required | any of `{ title, description, assignee, completed }` | Also used for toggling completion — send just `{ completed }`; no separate toggle endpoint |
| `DELETE /api/todos/:id` | required | — | |

Input is validated in `lib/todos/validators.ts` before hitting the service
layer.

## `hooks/useTodos.ts` — client state

Still the single place all todo UI state lives (per `CLAUDE.md`'s rule), but
it now talks to the REST API rather than holding data purely in memory:

- Fetches the full todo list once on mount (`GET /api/todos`); every
  mutation (`addTodo`/`updateTodo`/`deleteTodo`/`toggleTodo`) updates local
  state directly from that call's response instead of refetching.
- Owns tab filter (all/pending/completed), assignee filter, search query,
  and pagination (`TODOS_PAGE_SIZE = 6`) — all computed client-side over the
  fetched set via `useMemo`.
- Resets to page 1 when filters change; clamps the current page back into
  range if it goes stale (e.g. after deleting the last item on the last
  page) — both done during render rather than in an effect.
- `app/todos/page.tsx` and every `components/todo/*` component stay
  presentational, receiving state/callbacks as props.

## Task descriptions (BlockNote)

`Todo.description` (`types/todo.ts`) is `Block[]` from `@blocknote/core` — a
structured rich-text document (headings, lists, checklists, code blocks),
not a plain string. It's persisted as-is in the `description Json` column.
`lib/blocknote.ts` exports `blocksToPlainText()`, used by `useTodos`'s
search filter to match against the rendered text of the description.
`components/editor/Editor.tsx` / `DynamicEditor.tsx` wrap the BlockNote
editor for use in the create/edit forms.

## Assignees

`constants/members.ts` exports `DUMMY_MEMBERS`, a hardcoded fake member
list shared by `CreateTodoDialog`/`EditTodoDialog`-equivalent forms
(`components/todo/TaskForm.tsx` inside `TaskSheet.tsx`) and the assignee
filter `Select` in `app/todos/page.tsx`. There's no real member/user
directory — `assignee` on `Todo` is just a free-text string chosen from this
list.

## Two `TaskCard` components — don't conflate them

(Carried over from `CLAUDE.md`, still true.)

- `components/todo/TaskCard.tsx` — rendered by `components/todo/TodoList.tsx`
  in the live app; takes a `Todo` + toggle/edit/delete callbacks.
- `components/task-card/TaskCard.tsx` — a separate, more elaborate
  presentational card (tags, due date, subtask progress ring, avatar stack)
  with its own prop types. **Not wired into `app/todos`.**

## UI composition (todo app)

`app/todos/page.tsx` composes:
- `TodoSearch`, `TodoTabs`, assignee `Select` — filter controls.
- `TodoList` → `TaskCard` (per item) — the list itself.
- `TodoPagination` — page controls, rendered only when `totalPages > 1`,
  fixed to the viewport bottom.
- `TaskSheet` (wraps `TaskForm`) — a single sheet with three modes
  (`create` / `view` / `edit`) used for adding, viewing, and editing a task.
- `DeleteTodoDialog` — confirmation dialog for delete.
- `ThemeToggle`, `LogoutButton` — header actions.

Note: `TaskSheet`'s `onUpdate` callback in `app/todos/page.tsx` manually
re-syncs the locally-held `selectedTask` after an edit, since `updateTodo`
returns `void` and rebuilds the todos array immutably rather than mutating
in place — otherwise the sheet's "view" mode would show stale content after
switching back from "edit".

## Theming

Dark/light mode is a `dark` class on `<html>`, applied pre-hydration by an
inline script in `app/layout.tsx` reading `localStorage("theme")` (falls
back to `prefers-color-scheme`). `components/theme-toggle.tsx` flips it at
runtime.

## UI kit

`components/ui/*` is shadcn/ui (`components.json`: style `base-maia`, base
color `neutral`, `rsc: true`) on `@base-ui/react` primitives, Tailwind v4.
`@/*` resolves to the repo root. Prefer `npx shadcn@latest add <component>`
over hand-rolling a new primitive.

## Things worth knowing before changing Next.js–specific code

- `AGENTS.md` warns this project pins a Next.js version (`16.3.3`) with
  breaking changes vs. most training data — check
  `node_modules/next/dist/docs/` before using any Next.js API you're not
  sure about. `AGENTS.md` is regenerated by `next dev`; commit it as-is.
- Route param access is async: `PATCH`/`DELETE` handlers under
  `app/api/todos/[id]/route.ts` take `{ params: Promise<{ id: string }> }`
  and `await params`.
- Middleware lives in `proxy.ts` (not `middleware.ts`) with an exported
  `proxy()` function — a renamed/repositioned API in this Next.js version,
  not a typo.

## Known gaps / things not (yet) true

- No automated tests.
- No `.env.example` — required env vars had to be inferred from
  `lib/prisma.ts` / `lib/auth/session.ts` (see **Environment variables**).
- `README.md` is still the default `create-next-app` boilerplate.
- `components/task-card/TaskCard.tsx` is dead code from the app's
  perspective (unused elsewhere).
