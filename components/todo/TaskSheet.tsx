"use client";

import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DynamicEditor } from "@/components/editor/DynamicEditor";
import { TaskForm, TaskFormValue } from "@/components/todo/TaskForm";
import { Member } from "@/types/member";
import { Todo, TodoDescription } from "@/types/todo";
import { User } from "lucide-react";

export type TaskSheetMode = "create" | "view" | "edit";

interface TaskSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: TaskSheetMode;
  onModeChange: (mode: TaskSheetMode) => void;
  /** The task being viewed/edited. `null` in "create" mode. */
  task: Todo | null;
  onCreate: (title: string, description: TodoDescription, assignee?: string) => void;
  onUpdate: (id: string, title: string, description: TodoDescription, assignee?: string) => void;
  /** The real member directory, forwarded to TaskForm's assignee dropdown. */
  members: Member[];
}

const EMPTY_FORM: TaskFormValue = { title: "", description: [], assignee: "" };

/**
 * A single right-side Sheet that handles all three task views: creating a
 * new task, viewing an existing one read-only, and editing it in place -
 * switching modes without closing/reopening the Sheet.
 */
export function TaskSheet({ open, onOpenChange, mode, onModeChange, task, onCreate, onUpdate, members }: TaskSheetProps) {
  const [form, setForm] = useState<TaskFormValue>(EMPTY_FORM);
  // Bumped whenever we (re-)enter create/edit, so the (uncontrolled) BlockNote
  // editor always remounts fresh instead of carrying over a previous session's
  // content (e.g. a cancelled edit, or the previous task's create-mode text).
  const [editorSession, setEditorSession] = useState(0);

  /**
   * Re-seeds the form whenever we enter a new mode or switch which task is
   * targeted. This adjusts state during rendering (React's recommended
   * pattern, same technique `useTodos.ts` uses for its filter-reset) instead
   * of an effect, so the freshly-seeded form is what actually gets painted -
   * an effect would render the stale form for one frame first.
   */
  const sessionKey = `${mode}-${task?.id ?? "new"}`;
  const [prevSessionKey, setPrevSessionKey] = useState(sessionKey);
  if (prevSessionKey !== sessionKey) {
    setPrevSessionKey(sessionKey);
    setEditorSession((n) => n + 1);
    if (mode === "create") {
      setForm(EMPTY_FORM);
    } else if (mode === "edit" && task) {
      setForm({ title: task.title, description: task.description, assignee: task.assignee ?? "" });
    }
  }

  const editorKey = `${sessionKey}-${editorSession}`;

  const handleCreate = () => {
    if (!form.title.trim()) return;
    onCreate(form.title, form.description, form.assignee);
    setForm(EMPTY_FORM);
    setEditorSession((n) => n + 1);
    onOpenChange(false);
  };

  const handleSave = () => {
    if (!task || !form.title.trim()) return;
    onUpdate(task.id, form.title, form.description, form.assignee);
    onModeChange("view");
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex h-full flex-col sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>
            {mode === "create" ? "Create New Task" : mode === "edit" ? "Edit Task" : task?.title}
          </SheetTitle>
          <SheetDescription>
            {mode === "create"
              ? "Add a new task to your list to keep track of your work."
              : mode === "edit"
                ? "Modify the title, assignee, and description of your task."
                : "View the complete task description."}
          </SheetDescription>
        </SheetHeader>

        <div className="min-h-0 flex-1 overflow-hidden">
          {mode === "view" && task ? (
            <div className="flex h-full flex-col gap-4 overflow-hidden px-6 py-4">
              {task.assignee && (
                <div className="flex items-center gap-1 text-muted-foreground">
                  <User className="size-3" />
                  <span className="text-xs font-medium">{task.assignee}</span>
                </div>
              )}
              <Badge variant={task.completed ? "default" : "outline"} className="w-fit">
                {task.completed ? "Completed" : "Pending"}
              </Badge>
              <div className="min-h-0 flex-1 overflow-y-auto rounded-md ">
                <DynamicEditor key={editorKey} initialContent={task.description} editable={false} />
              </div>
            </div>
          ) : (
            <TaskForm value={form} onChange={setForm} editorKey={editorKey} members={members} />
          )}
        </div>

        <SheetFooter>
          {mode === "create" && (
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreate}>Create Task</Button>
            </div>
          )}
          {mode === "view" && (
            <div className="flex justify-end">
              <Button onClick={() => onModeChange("edit")}>Edit</Button>
            </div>
          )}
          {mode === "edit" && (
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button variant="outline" onClick={() => onModeChange("view")}>
                Cancel
              </Button>
              <Button onClick={handleSave}>Save Changes</Button>
            </div>
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
