import { Input } from "@/components/ui/input";
import { DynamicEditor } from "@/components/editor/DynamicEditor";
import { Field, FieldLabel } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DUMMY_MEMBERS } from "@/constants/members";
import { TodoDescription } from "@/types/todo";

export interface TaskFormValue {
  title: string;
  description: TodoDescription;
  assignee: string;
}

interface TaskFormProps {
  /** Current form values (title/assignee/description). */
  value: TaskFormValue;
  /** Called with the updated form value on every field change. */
  onChange: (value: TaskFormValue) => void;
  /**
   * Forces the BlockNote editor to remount with a fresh instance - it's
   * uncontrolled after mount (`initialContent` only applies once), so a new
   * key is required whenever the underlying task/session changes.
   */
  editorKey: string | number;
}

/**
 * The shared Title / Assignee / Description fields used by TaskSheet's
 * create and edit modes. Purely controlled - all state lives in the parent.
 */
export function TaskForm({ value, onChange, editorKey }: TaskFormProps) {
  return (
    <div className="flex h-full flex-col gap-4 overflow-hidden px-6 py-4">
      <Field>
        <FieldLabel>Title</FieldLabel>
        <Input
          placeholder="Task title..."
          value={value.title}
          onChange={(e) => onChange({ ...value, title: e.target.value })}
        />
      </Field>
      <Field>
        <FieldLabel>Assignee</FieldLabel>
        <Select
          value={value.assignee}
          onValueChange={(assignee) => onChange({ ...value, assignee: assignee ?? "" })}
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
      <Field className="min-h-0 flex-1">
        <FieldLabel>Description</FieldLabel>
        <div className="min-h-0 flex-1 overflow-y-auto rounded-md ">
          <DynamicEditor
            key={editorKey}
            initialContent={value.description}
            onChange={(description) => onChange({ ...value, description })}
          />
        </div>
      </Field>
    </div>
  );
}
