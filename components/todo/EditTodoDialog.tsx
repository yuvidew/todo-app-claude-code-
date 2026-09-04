import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldLabel } from "@/components/ui/field";
import { Todo } from "@/types/todo";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DUMMY_MEMBERS } from "@/constants/members";

interface EditTodoDialogProps {
  /** The todo task currently being edited. If null, the dialog is closed. */
  todo: Todo | null;
  /** Callback to close the dialog */
  onCancel: () => void;
  /** Callback triggered when the task is updated */
  onUpdate: (id: string, title: string, description: string, assignee?: string) => void;
}

/**
 * EditTodoDialog component provides a modal form for modifying an existing task's title and description.
 */
export function EditTodoDialog({ todo, onCancel, onUpdate }: EditTodoDialogProps) {
  const [form, setForm] = useState({
    title: todo?.title ?? "",
    description: todo?.description ?? "",
    assignee: todo?.assignee ?? ""
  });

  const handleSubmit = () => {
    if (!todo || !form.title.trim()) return;
    onUpdate(todo.id, form.title, form.description, form.assignee);
  };

  if (!todo) return null;

  return (
    <Dialog open={!!todo} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Task</DialogTitle>
          <DialogDescription>
            Modify the title and description of your task.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <Field>
            <FieldLabel>Title</FieldLabel>
            <Input
              placeholder="Task title..."
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </Field>
          <Field>
            <FieldLabel>Assignee</FieldLabel>
            <Select
              value={form.assignee}
              onValueChange={(value) => setForm({ ...form, assignee: value ?? "" })}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a member..." />
              </SelectTrigger>
              <SelectContent>
                {DUMMY_MEMBERS.map((member) => (
                  <SelectItem key={member.id} value={member.name}>
                    {member.name} ({member.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field>
            <FieldLabel>Description</FieldLabel>
            <Textarea
              placeholder="Task description..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </Field>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
