import { useState, useEffect, useMemo, useCallback } from "react";
import type { Member } from "@/types/member";
import type { ApiErrorBody, ApiSuccessBody } from "@/lib/api-response";

/** Number of members shown per page on the /members table. */
export const MEMBERS_PAGE_SIZE = 8;

export interface CreateMemberInput {
  name: string;
  email: string;
  avatarUrl?: string;
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

export interface UseMembersReturn {
  members: Member[];
  /** Only members with isActive === true - what the task assignee
   *  dropdowns (TaskForm, the "Filter by member" filter) should consume. */
  activeMembers: Member[];
  /** The current page's slice of the full member list, for the /members table. */
  paginatedMembers: Member[];
  currentPage: number;
  totalPages: number;
  isLoading: boolean;
  error: string | null;
  setCurrentPage: (page: number) => void;
  createMember: (input: CreateMemberInput) => Promise<Member>;
  toggleMemberActive: (id: number, isActive: boolean) => Promise<void>;
}

/**
 * Fetches the real member directory once on mount, and exposes create/
 * toggle-active mutations plus client-side pagination over the full list
 * (mirroring useTodos's slice-based pagination approach).
 */
export function useMembers(): UseMembersReturn {
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const response = await fetch("/api/members");
        const data = await parseApiResponse<Member[]>(response);
        if (!cancelled) setMembers(data);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load members.");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  /**
   * Active-only members, for the task assignee dropdowns - deactivating a
   * member removes them from future assignment without deleting them or
   * touching any Todo.assignee string already set to their name.
   */
  const activeMembers = useMemo(() => members.filter((m) => m.isActive), [members]);

  /**
   * Total pages for the current (full, not just active) member list, and
   * the current page clamped back into range if it becomes invalid, e.g.
   * after the list shrinks. No filter state here to reset from, unlike
   * useTodos - just a straight clamp.
   */
  const totalPages = Math.max(1, Math.ceil(members.length / MEMBERS_PAGE_SIZE));
  const page = Math.min(currentPage, totalPages);

  /**
   * Computes the slice of members to display on the current page. Paginates
   * over the full list (not activeMembers) - the table shows inactive
   * members too, only the dropdowns filter them out.
   */
  const paginatedMembers = useMemo(() => {
    const start = (page - 1) * MEMBERS_PAGE_SIZE;
    return members.slice(start, start + MEMBERS_PAGE_SIZE);
  }, [members, page]);

  /**
   * Creates a new member via the API, then appends the server's copy and
   * re-sorts by name to match the server's findAll() ordering (there's no
   * re-fetch after create). Throws on failure (e.g. a 409 duplicate-email
   * message) so callers like AddMemberDialog can surface it inline.
   */
  const createMember = useCallback(async (input: CreateMemberInput) => {
    const response = await fetch("/api/members", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    const created = await parseApiResponse<Member>(response);
    setMembers((prev) => [...prev, created].sort((a, b) => a.name.localeCompare(b.name)));
    return created;
  }, []);

  /**
   * Toggles a member's active status via the API, then merges the server's
   * copy into local state. No optimistic update, matching toggleTodo.
   */
  const toggleMemberActive = useCallback(async (id: number, isActive: boolean) => {
    const response = await fetch(`/api/members/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive }),
    });
    const updated = await parseApiResponse<Member>(response);
    setMembers((prev) => prev.map((m) => (m.id === id ? updated : m)));
  }, []);

  return {
    members,
    activeMembers,
    paginatedMembers,
    currentPage: page,
    totalPages,
    isLoading,
    error,
    setCurrentPage,
    createMember,
    toggleMemberActive,
  };
}
