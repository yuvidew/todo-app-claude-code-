import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface DeleteTodoDialogProps {
  /** The ID of the todo task to be deleted. If null, the dialog is closed. */
  todoId: string | null;
  /** Callback to close the dialog */
  onCancel: () => void;
  /** Callback triggered when the user confirms deletion */
  onConfirm: (id: string) => void;
}

/**
 * DeleteTodoDialog component provides a confirmation prompt before permanently deleting a task.
 */
export function DeleteTodoDialog({ todoId, onCancel, onConfirm }: DeleteTodoDialogProps) {
  if (!todoId) return null;

  return (
    <AlertDialog open={!!todoId} onOpenChange={(open) => !open && onCancel()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the task from your list.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            onClick={() => onConfirm(todoId)}
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
