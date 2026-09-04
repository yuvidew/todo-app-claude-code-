import { Todo } from "@/types/todo";
import { TaskCard } from "./TaskCard";

interface TodoListProps {
  /** The list of todos to render */
  todos: Todo[];
  /** Callback triggered when a task's completion status is toggled */
  onToggle: (id: string) => void;
  /** Callback triggered when a task is selected for editing */
  onEdit: (todo: Todo) => void;
  /** Callback triggered when a task is selected for deletion */
  onDelete: (id: string) => void;
}

/**
 * TodoList component renders a grid of TaskCard components.
 * It handles the empty state when no tasks match the current filters.
 */
export function TodoList({ todos, onToggle, onEdit, onDelete }: TodoListProps) {
  if (todos.length === 0) {
    return (
      <div className="col-span-full text-center py-12 text-muted-foreground">
        No tasks found matching your criteria.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {todos.map((todo) => (
        <TaskCard
          key={todo.id}
          todo={todo}
          onToggle={onToggle}
          onEdit={onEdit}
          onDelete={() => onDelete(todo.id)}
        />
      ))}
    </div>
  );
}
