import { useState, useMemo, useEffect, useCallback } from "react";
import { Todo, TodoDescription } from "@/types/todo";
import { blocksToPlainText } from "@/lib/blocknote";
import type { ApiErrorBody, ApiSuccessBody } from "@/lib/api-response";

/** Number of tasks shown per page in the paginated task list. */
export const TODOS_PAGE_SIZE = 6;

/** Shape a todo takes over the wire — `createdAt` is a JSON string, not a Date. */
type TodoDTO = Omit<Todo, "createdAt"> & { createdAt: string };

function fromDTO(dto: TodoDTO): Todo {
  return { ...dto, createdAt: new Date(dto.createdAt) };
}

/**
 * Parses the shared `{ success, message, data }` API envelope (see
 * lib/api-response.ts) and throws with the server's message on failure, so
 * every call site can just try/catch instead of re-checking `success`.
 */
async function parseApiResponse<T>(response: Response): Promise<T> {
  const body = (await response.json()) as ApiSuccessBody<T> | ApiErrorBody;
  if (!body.success) throw new Error(body.message);
  return body.data as T;
}

/**
 * Return type for the useTodos hook, providing state and actions
 * for managing a list of todo tasks.
 */
export interface UseTodosReturn {
  // State
  todos: Todo[];
  filteredTodos: Todo[];
  paginatedTodos: Todo[];
  counts: { total: number; completed: number; pending: number };
  searchQuery: string;
  activeTab: string;
  selectedAssignee: string;
  currentPage: number;
  totalPages: number;
  isLoading: boolean;
  error: string | null;

  // State Setters
  setSearchQuery: (query: string) => void;
  setActiveTab: (tab: string) => void;
  setSelectedAssignee: (assignee: string) => void;
  setCurrentPage: (page: number) => void;

  // Actions
  addTodo: (title: string, description: TodoDescription, assignee?: string) => Promise<void>;
  updateTodo: (id: string, title: string, description: TodoDescription, assignee?: string) => Promise<void>;
  deleteTodo: (id: string) => Promise<void>;
  toggleTodo: (id: string) => Promise<void>;
}

/**
 * A custom hook that encapsulates all the business logic for the Todo application:
 * fetching/persisting todos through the `/api/todos` REST API, plus
 * client-side filtering, search, and pagination over the fetched set.
 *
 * @returns An object containing todo state and management functions.
 */
export function useTodos(): UseTodosReturn {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [selectedAssignee, setSelectedAssignee] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  /**
   * Loads every todo owned by the signed-in user. Runs once on mount —
   * every mutation below updates local state directly from its response
   * rather than re-fetching the whole list.
   */
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const response = await fetch("/api/todos");
        const data = await parseApiResponse<TodoDTO[]>(response);
        if (!cancelled) setTodos(data.map(fromDTO));
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load todos.");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

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
        const matchesDesc = blocksToPlainText(todo.description).toLowerCase().includes(query);
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
   * Total number of pages available for the current filtered list.
   */
  const totalPages = Math.max(1, Math.ceil(filteredTodos.length / TODOS_PAGE_SIZE));

  /**
   * Resets to the first page whenever the active filters change, so the
   * user isn't left stranded on a now out-of-range page. This adjusts state
   * during rendering (React's recommended pattern, using state rather than a
   * ref so it stays compatible with the React Compiler) instead of an effect,
   * so it takes effect before the browser paints rather than after.
   */
  const filterKey = `${activeTab}|${searchQuery}|${selectedAssignee}`;
  const [prevFilterKey, setPrevFilterKey] = useState(filterKey);
  let page = currentPage;
  if (prevFilterKey !== filterKey) {
    setPrevFilterKey(filterKey);
    page = 1;
    setCurrentPage(1);
  }

  /**
   * Clamps the current page back into range if it becomes invalid,
   * e.g. after deleting the last task on the final page.
   */
  page = Math.min(page, totalPages);

  /**
   * Computes the slice of filtered todos to display on the current page.
   */
  const paginatedTodos = useMemo(() => {
    const start = (page - 1) * TODOS_PAGE_SIZE;
    return filteredTodos.slice(start, start + TODOS_PAGE_SIZE);
  }, [filteredTodos, page]);

  /**
   * Adds a new todo via the API, then appends the server's copy (with its
   * real id) to local state.
   * @param title - The title of the task.
   * @param description - The description of the task.
   * @param assignee - The person assigned to the task.
   */
  const addTodo = useCallback(
    async (title: string, description: TodoDescription, assignee?: string) => {
      const response = await fetch("/api/todos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, assignee }),
      });
      const created = await parseApiResponse<TodoDTO>(response);
      setTodos((prev) => [fromDTO(created), ...prev]);
    },
    []
  );

  /**
   * Updates the title, description, and assignee of an existing todo via
   * the API, then merges the server's copy into local state.
   * @param id - The unique ID of the task to update.
   * @param title - The new title.
   * @param description - The new description.
   * @param assignee - The new assignee.
   */
  const updateTodo = useCallback(
    async (id: string, title: string, description: TodoDescription, assignee?: string) => {
      const response = await fetch(`/api/todos/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, assignee }),
      });
      const updated = await parseApiResponse<TodoDTO>(response);
      setTodos((prev) => prev.map((t) => (t.id === id ? fromDTO(updated) : t)));
    },
    []
  );

  /**
   * Deletes a todo via the API, then removes it from local state.
   * @param id - The unique ID of the task to delete.
   */
  const deleteTodo = useCallback(async (id: string) => {
    const response = await fetch(`/api/todos/${id}`, { method: "DELETE" });
    await parseApiResponse<null>(response);
    setTodos((prev) => prev.filter((t) => t.id !== id));
  }, []);

  /**
   * Toggles the completion status of a todo via the API, then merges the
   * server's copy into local state.
   * @param id - The unique ID of the task to toggle.
   */
  const toggleTodo = useCallback(
    async (id: string) => {
      const current = todos.find((t) => t.id === id);
      if (!current) return;

      const response = await fetch(`/api/todos/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: !current.completed }),
      });
      const updated = await parseApiResponse<TodoDTO>(response);
      setTodos((prev) => prev.map((t) => (t.id === id ? fromDTO(updated) : t)));
    },
    [todos]
  );

  return {
    todos,
    filteredTodos,
    paginatedTodos,
    counts,
    searchQuery,
    activeTab,
    selectedAssignee,
    currentPage: page,
    totalPages,
    isLoading,
    error,
    setSearchQuery,
    setActiveTab,
    setSelectedAssignee,
    setCurrentPage,
    addTodo,
    updateTodo,
    deleteTodo,
    toggleTodo,
  };
}
