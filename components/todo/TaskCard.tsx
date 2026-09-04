import { Todo } from "@/types/todo";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Pencil, Trash2, User } from "lucide-react";

interface TaskCardProps {
  /** The todo task data to display */
  todo: Todo;
  /** Callback triggered when the completion checkbox is toggled */
  onToggle: (id: string) => void;
  /** Callback triggered when the edit button is clicked */
  onEdit: (todo: Todo) => void;
  /** Callback triggered when the delete button is clicked */
  onDelete: () => void;
}

/**
 * TaskCard component displays the details of a single todo task in a card format.
 * It provides actions to toggle completion, edit the task, and delete it.
 */
export function TaskCard({ todo, onToggle, onEdit, onDelete }: TaskCardProps) {
  return (
    <Card className="flex flex-col justify-between group transition-all hover:shadow-md py-0">
      <CardHeader className="p-4">
        <div className="flex justify-between items-start gap-2">
          <CardTitle className={cn(
            "text-lg leading-tight",
            todo.completed && "line-through text-muted-foreground"
          )}>
            {todo.title}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0 pb-4">
        <p className={cn(
          "text-sm text-muted-foreground line-clamp-3",
          todo.completed && "line-through"
        )}>
          {todo.description || "No description provided."}
        </p>
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant={todo.completed ? "default" : "outline"}>
              {todo.completed ? "Completed" : "Pending"}
            </Badge>
            {todo.assignee && (
              <div className="flex items-center gap-1 text-muted-foreground">
                <User className="size-3" />
                <span className="text-xs font-medium">{todo.assignee}</span>
              </div>
            )}
          </div>
          <span className="text-[10px] text-muted-foreground">
            {todo.createdAt.toLocaleDateString()}
          </span>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex items-center justify-between border-t bg-muted/30">
        <div className="flex items-center gap-2">
          <Checkbox
            checked={todo.completed}
            onCheckedChange={() => onToggle(todo.id)}
          />
          <span className="text-xs text-muted-foreground">Done</span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="size-8 text-blue-600 hover:text-blue-700"
            onClick={() => onEdit(todo)}
          >
            <Pencil className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-8 text-destructive hover:text-destructive/80"
            onClick={onDelete}
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
