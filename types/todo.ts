import type { Block } from "@blocknote/core";

/**
 * A task description, authored as a BlockNote document (a structured array
 * of blocks) rather than a plain string, so it can hold headings, lists,
 * checklists, code blocks, etc.
 */
export type TodoDescription = Block[];

/**
 * Interface representing a single Todo item in the application.
 */
export interface Todo {
  /** Unique identifier for the task */
  id: string;
  /** The title of the task */
  title: string;
  /** Detailed description of the task, as a BlockNote document */
  description: TodoDescription;
  /** Whether the task has been marked as completed */
  completed: boolean;
  /** The date and time the task was created */
  createdAt: Date;
  /** The person assigned to the task (name or email) */
  assignee?: string;
}
