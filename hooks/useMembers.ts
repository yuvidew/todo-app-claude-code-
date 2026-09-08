import { useState, useEffect } from "react";
import type { Member } from "@/types/member";
import type { ApiErrorBody, ApiSuccessBody } from "@/lib/api-response";

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
 * Fetches the real member directory once on mount — replaces the old
 * DUMMY_MEMBERS constant as the source for assignee dropdowns. Read-only:
 * this MVP phase has no UI for creating members (see POST /api/members).
 */
export function useMembers() {
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  return { members, isLoading, error };
}
