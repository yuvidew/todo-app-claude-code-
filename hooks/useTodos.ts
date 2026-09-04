import { useState, useMemo } from "react";
import { Todo } from "@/types/todo";

/**
 * Return type for the useTodos hook, providing state and actions
 * for managing a list of todo tasks.
 */
export interface UseTodosReturn {
  // State
  todos: Todo[];
  filteredTodos: Todo[];
  counts: { total: number; completed: number; pending: number };
  searchQuery: string;
  activeTab: string;
  selectedAssignee: string;

  // State Setters
  setSearchQuery: (query: string) => void;
  setActiveTab: (tab: string) => void;
  setSelectedAssignee: (assignee: string) => void;

  // Actions
  addTodo: (title: string, description: string, assignee?: string) => void;
  updateTodo: (id: string, title: string, description: string, assignee?: string) => void;
  deleteTodo: (id: string) => void;
  toggleTodo: (id: string) => void;
}

/**
 * A custom hook that encapsulates all the business logic for the Todo application,
 * including state management, CRUD operations, and filtering/search.
 *
 * @returns An object containing todo state and management functions.
 */
export function useTodos(): UseTodosReturn {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [selectedAssignee, setSelectedAssignee] = useState("");

  /**
   * Computes counts for the different task statuses.
   */
  const counts = useMemo(() => {
    const total = todos.length;
    const completed = todos.filter((t) => t.completed).length;
    const pending = total - completed;
    return { total, completed, pending };
  }, [todos]);

  /**
   * Computes the list of todos filtered by the active tab and search query.
   */
  const filteredTodos = useMemo(() => {
    return todos.filter((todo) => {
      // Tab Filter
      if (activeTab === "pending" && todo.completed) return false;
      if (activeTab === "completed" && !todo.completed) return false;

      // Assignee Filter
      if (selectedAssignee && todo.assignee !== selectedAssignee) return false;

      // Search Filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = todo.title.toLowerCase().includes(query);
        const matchesDesc = todo.description.toLowerCase().includes(query);
        const matchesAssignee = todo.assignee?.toLowerCase().includes(query);
        const matchesStatus = (todo.completed ? "completed" : "pending").toLowerCase().includes(query);
        const matchesDate = todo.createdAt.toLocaleDateString().includes(query);

        if (!matchesTitle && !matchesDesc && !matchesAssignee && !matchesStatus && !matchesDate) {
          return false;
        }
      }

      return true;
    });
  }, [todos, activeTab, searchQuery, selectedAssignee]);

  /**
   * Adds a new todo to the list.
   * @param title - The title of the task.
   * @param description - The description of the task.
   * @param assignee - The person assigned to the task.
   */
  const addTodo = (title: string, description: string, assignee?: string) => {
    const newTodo: Todo = {
      id: crypto.randomUUID(),
      title: title.trim(),
      description: description.trim(),
      completed: false,
      createdAt: new Date(),
      assignee: assignee?.trim(),
    };
    setTodos((prev) => [...prev, newTodo]);
  };

  /**
   * Updates the title and description of an existing todo.
   * @param id - The unique ID of the task to update.
   * @param title - The new title.
   * @param description - The new description.
   * @param assignee - The new assignee.
   */
  const updateTodo = (id: string, title: string, description: string, assignee?: string) => {
    setTodos((prev) =>
      prev.map((t) =>
        t.id === id
          ? { ...t, title: title.trim(), description: description.trim(), assignee: assignee?.trim() }
          : t
      )
    );
  };

  /**
   * Deletes a todo from the list.
   * @param id - The unique ID of the task to delete.
   */
  const deleteTodo = (id: string) => {
    setTodos((prev) => prev.filter((t) => t.id !== id));
  };

  /**
   * Toggles the completion status of a todo.
   * @param id - The unique ID of the task to toggle.
   */
  const toggleTodo = (id: string) => {
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  return {
    todos,
    filteredTodos,
    counts,
    searchQuery,
    activeTab,
    selectedAssignee,
    setSearchQuery,
    setActiveTab,
    setSelectedAssignee,
    addTodo,
    updateTodo,
    deleteTodo,
    toggleTodo,
  };
}
