import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";
import { Field, FieldLabel } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DUMMY_MEMBERS } from "@/constants/members";

interface CreateTodoDialogProps {
  /** Callback triggered when a new task is successfully created */
  onCreate: (title: string, description: string, assignee?: string) => void;
}

/**
 * CreateTodoDialog component provides a modal form for adding new tasks.
 * It uses local state for form input and calls the onCreate callback on submission.
 */
export function CreateTodoDialog({ onCreate }: CreateTodoDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", assignee: "" });

  const handleSubmit = () => {
    if (!form.title.trim()) return;
    onCreate(form.title, form.description, form.assignee);
    setForm({ title: "", description: "", assignee: "" });
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger render={<Button className="w-full md:w-auto gap-2" />}>
        <Plus className="size-4" /> Add Task
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Task</DialogTitle>
          <DialogDescription>
            Add a new task to your list to keep track of your work.
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
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Create Task</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
