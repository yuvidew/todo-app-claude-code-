# Task Sheet Refactor — Dialog → Sheet, Overflow Fix

## Context

The BlockNote rich-text editor is already integrated (previous work, done). `.claude/specs/bloack-ui-issue.md` now asks for two follow-up UI changes:

1. **A real bug:** long, unbroken strings typed into the BlockNote editor overflow their container horizontally instead of wrapping, because nothing in `Editor.tsx` or the surrounding `Dialog` constrains width/height — `components/ui/dialog.tsx`'s `DialogContent` has no `max-height`/`overflow-y` at all, so the whole dialog just grows with the content.
2. **A UX upgrade:** replace the centered `Dialog` (`CreateTodoDialog`/`EditTodoDialog`) with a single right-side `Sheet` that handles three modes — `create`, `view` (read-only, opened by clicking a task card, showing the full document), and `edit` (opened from inside View, in the same Sheet instance, no close/reopen).

**Key discovery that changes the spec's own assumptions:** `components/ui/sheet.tsx` **already exists** in this repo (pre-existing, tracked, unmodified — confirmed by reading it) and is already built on the same `@base-ui/react/dialog` primitive `components/ui/dialog.tsx` uses. It already exports `Sheet, SheetTrigger, SheetClose, SheetContent, SheetHeader, SheetFooter, SheetTitle, SheetDescription`, `SheetContent` already takes a `side` prop (default `"right"`) and already bakes in `flex flex-col` + `h-full` + `w-3/4 sm:max-w-sm` for `side="right"`, and `SheetFooter` already has `mt-auto`. **So the spec's "Install Shadcn Sheet" step (`npx shadcn@latest add sheet`) should be skipped** — regenerating risks clobbering this file for no benefit. The only tweak needed is widening it a bit at the call site (`sm:max-w-sm` / 384px is cramped for title+assignee+rich editor) via an explicit `className="sm:max-w-lg"` override, not by editing `ui/sheet.tsx` itself.

Also confirmed: there's a pre-existing, **orphaned** `components/task-card/TaskCard.tsx` (unrelated elaborate card, not imported anywhere). The spec's suggested `components/task/` folder would sit confusingly close to that name, so **everything new stays under `components/todo/`**, matching the codebase's existing one-feature-folder convention.

Per user's choice: the card's pencil-icon quick-edit button stays (opens Edit mode directly), additive to the new card-click → View flow.

## Approach

### 1. Overflow fix — `components/editor/editor.css` (new) + `Editor.tsx`

New plain global stylesheet (not a CSS module — `.bn-editor` etc. are BlockNote's own global class names):
```css
.bn-editor { min-width: 0; max-width: 100%; overflow-x: hidden; }
.bn-block-content, .bn-inline-content { min-width: 0; max-width: 100%; overflow-wrap: anywhere; word-break: break-word; }
```
Imported in `Editor.tsx` right after the existing `import "@blocknote/mantine/style.css";`. This is the same technique already used there for BlockNote's own global CSS, so it's a low-risk, consistent addition. No other change needed to `Editor.tsx` — `editable` is already a prop (default `true`), so View mode's read-only render is just `editable={false}`, and `DynamicEditor` (a bare `next/dynamic` re-export) already forwards it.

### 2. New components — `components/todo/`

- **`TaskSheet.tsx`** (new) — the single Sheet instance for all three modes. **Controlled** by `app/todos/page.tsx` (mirrors how `page.tsx` already owns `editingTodo`/`deletingTodoId` today — no state lives inside `TaskSheet` beyond the form itself):
  ```ts
  interface TaskSheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    mode: "create" | "view" | "edit";
    onModeChange: (mode: "create" | "view" | "edit") => void;
    task: Todo | null; // null in "create" mode
    onCreate: (title: string, description: TodoDescription, assignee?: string) => void;
    onUpdate: (id: string, title: string, description: TodoDescription, assignee?: string) => void;
  }
  ```
  Renders `Sheet`/`SheetContent side="right" className="flex h-full flex-col sm:max-w-lg"`/`SheetHeader`/`SheetFooter` from `@/components/ui/sheet`, with mode-appropriate title/description text and footer buttons (`create`: Cancel/Create Task; `view`: Edit; `edit`: Cancel/Save — Cancel returns to `view` via `onModeChange`, it does not close the Sheet).

  **Editor remount strategy** (replaces the old `formKey` trick, which relied on the parent unmounting the whole dialog): since one `TaskSheet` instance now persists across mode switches, use an effect keyed on `mode`/`task?.id` that reseeds local `form` state and bumps an `editorSession` counter:
  ```tsx
  const [form, setForm] = useState<{ title: string; description: TodoDescription; assignee: string }>({ title: "", description: [], assignee: "" });
  const [editorSession, setEditorSession] = useState(0);

  useEffect(() => {
    if (mode === "create") setForm({ title: "", description: [], assignee: "" });
    else if (mode === "edit" && task) setForm({ title: task.title, description: task.description, assignee: task.assignee ?? "" });
    setEditorSession((n) => n + 1);
  }, [mode, task?.id]);

  const editorKey = `${mode}-${task?.id ?? "new"}-${editorSession}`;
  ```
  - `create` submit: call `onCreate(...)`, then reset `form` and bump `editorSession` inline (same shape as today's `formKey` bump in `CreateTodoDialog`).
  - `view → edit`: the effect above fires because `mode` changed, reseeding `form` fresh from `task` and remounting the editor — guarantees no stale content from a previous cancelled edit.
  - `edit → cancel` (`onModeChange("view")`): no explicit reset needed — view mode renders its own `DynamicEditor` reading straight from the (untouched) `task` prop, so it just shows the original content; the next `edit` entry re-triggers the effect anyway.
  - `edit → save`: call `onUpdate(...)`, then `onModeChange("view")` (stay in the same Sheet, per spec). **Important:** `useTodos.updateTodo` returns `void` and rebuilds the todos array immutably, so `task`/`selectedTask` held in `page.tsx` goes stale after a save unless re-synced — see §4.

- **`TaskForm.tsx`** (new) — the shared Title/Assignee/Editor fields for `create`/`edit` modes only (View mode renders its own simpler read-only block directly in `TaskSheet`, not through this). Purely controlled (`value`/`onChange` for the form object, `editorKey`), reusing exactly what `CreateTodoDialog`/`EditTodoDialog` already used: `Field`/`FieldLabel` (`@/components/ui/field`), `Input`, `Select`/`SelectContent`/`SelectItem`/`SelectTrigger`/`SelectValue` + `DUMMY_MEMBERS` (`@/constants/members`), `DynamicEditor` (`@/components/editor/DynamicEditor`).

  Wrapper structure (both `TaskForm`'s editor and `TaskSheet`'s view-mode editor use this same nesting, per the spec's flex/`min-h-0`/`overflow` snippets):
  ```tsx
  <div className="min-h-0 flex-1 overflow-hidden">
    <div className="flex h-full flex-col gap-4 overflow-hidden px-6 py-4">
      {/* Title / Assignee fields (fixed height, not scrolling) */}
      <div className="min-h-0 flex-1 overflow-y-auto rounded-md border">
        <DynamicEditor key={editorKey} editable={mode !== "view"} initialContent={...} onChange={...} />
      </div>
    </div>
  </div>
  ```
  This ensures only the editor's own inner box scrolls for long documents — the Sheet header/footer never move, satisfying "Sheet remains inside the viewport" / "Footer remains accessible."

### 3. `TaskCard.tsx` / `TodoList.tsx`

- `TaskCard.tsx`: add an `onOpen: (todo: Todo) => void` prop, wired to an `onClick`/`role="button"`/`tabIndex={0}`/`onKeyDown` (Enter/Space) on the `Card` root, opening View mode. Keep the existing pencil (`onEdit`) button per user's choice — wrap the footer's interactive controls (checkbox, pencil, trash) in a small `<div onClick={(e) => e.stopPropagation()}>` so they don't also trigger the new card-level click.
- `TodoList.tsx`: add `onOpen` to its props, forwarded straight to `TaskCard` alongside the existing `onToggle`/`onEdit`/`onDelete`.

### 4. `app/todos/page.tsx`

- Remove `CreateTodoDialog`/`EditTodoDialog` imports and the `editingTodo`/`setEditingTodo` state.
- Add:
  ```ts
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Todo | null>(null);
  const [sheetMode, setSheetMode] = useState<"create" | "view" | "edit">("create");
  ```
- Replace `<CreateTodoDialog onCreate={addTodo} />` with a plain button that flips controlled state (it can no longer be a self-contained `SheetTrigger`+`SheetContent`, since the same `TaskSheet` instance also serves view/edit):
  ```tsx
  <Button className="w-full md:w-auto gap-2" onClick={() => { setSelectedTask(null); setSheetMode("create"); setSheetOpen(true); }}>
    <Plus className="size-4" /> Add Task
  </Button>
  ```
- `TodoList`: wire `onOpen`/`onEdit` to open the same sheet in `view`/`edit` mode respectively:
  ```tsx
  <TodoList
    todos={paginatedTodos}
    onToggle={toggleTodo}
    onOpen={(todo) => { setSelectedTask(todo); setSheetMode("view"); setSheetOpen(true); }}
    onEdit={(todo) => { setSelectedTask(todo); setSheetMode("edit"); setSheetOpen(true); }}
    onDelete={setDeletingTodoId}
  />
  ```
- Replace the `<EditTodoDialog .../>` block with:
  ```tsx
  <TaskSheet
    open={sheetOpen}
    onOpenChange={setSheetOpen}
    mode={sheetMode}
    onModeChange={setSheetMode}
    task={selectedTask}
    onCreate={addTodo}
    onUpdate={(id, title, description, assignee) => {
      updateTodo(id, title, description, assignee);
      // updateTodo returns void; re-sync selectedTask by hand so the Sheet's
      // own "view" mode (which reads straight from the `task` prop) shows the
      // just-saved content instead of stale data.
      setSelectedTask((prev) =>
        prev && prev.id === id ? { ...prev, title: title.trim(), description, assignee: assignee?.trim() } : prev
      );
    }}
  />
  ```
- `DeleteTodoDialog` block: unchanged.

### 5. Delete

- `components/todo/CreateTodoDialog.tsx`
- `components/todo/EditTodoDialog.tsx`

## Files touched

- New: `components/todo/TaskSheet.tsx`, `components/todo/TaskForm.tsx`, `components/editor/editor.css`
- Modified: `components/editor/Editor.tsx`, `components/todo/TaskCard.tsx`, `components/todo/TodoList.tsx`, `app/todos/page.tsx`
- Deleted: `components/todo/CreateTodoDialog.tsx`, `components/todo/EditTodoDialog.tsx`
- Untouched (verified, no action needed): `components/ui/sheet.tsx`, `components/ui/dialog.tsx` (no longer used by the todo app but left in place — other code/future use may still want it), `hooks/useTodos.ts`, `types/todo.ts`, `lib/blocknote.ts`, `DeleteTodoDialog.tsx`

## Verification

Run through all of the below in **both light and dark mode** (existing `ThemeToggle`):

1. **Create**: "+ Add Task" → Sheet slides in from the right, empty form, Cancel/Create Task reachable without scrolling. Type a title + a long unbroken string (e.g. 200 chars, no spaces) into the editor — confirm it wraps inside the editor instead of overflowing horizontally. Submit → card appears, Sheet closes.
2. **View**: click a card's body (not checkbox/pencil/trash) → Sheet opens in View mode with the full, **read-only** document (typing does nothing) and an Edit button.
3. **Edit in place**: from View, click Edit → same Sheet instance, form pre-filled with current title/assignee/content. Change the title, Save → returns to View showing the *updated* content (not stale), and the card behind it reflects the change.
4. **Edit cancel**: Edit again, change something, Cancel → back to View showing the **original**, unsaved content. Edit again → confirm no leftover text from the cancelled session (tests the `editorSession` remount).
5. **Pencil shortcut**: click a card's pencil icon → Sheet opens straight into Edit for that task.
6. **Long-document scroll**: a very long multi-paragraph document scrolls inside the editor's own box only — header/footer stay fixed, page behind the Sheet doesn't scroll.
7. **Viewport clamping**: shrink the browser window height — Sheet stays within the viewport, footer buttons stay visible/clickable.
8. **CRUD unaffected**: create/view/edit+save/delete all work; search/tabs/assignee-filter/pagination on the page are unaffected.
9. `npm run lint` and `npx tsc --noEmit` clean; `npm run build` succeeds.
