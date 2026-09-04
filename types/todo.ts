/**
 * Interface representing a single Todo item in the application.
 */
export interface Todo {
  /** Unique identifier for the task */
  id: string;
  /** The title of the task */
  title: string;
  /** Detailed description of the task */
  description: string;
  /** Whether the task has been marked as completed */
  completed: boolean;
  /** The date and time the task was created */
  createdAt: Date;
  /** The person assigned to the task (name or email) */
  assignee?: string;
}
