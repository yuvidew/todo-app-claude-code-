import { useState, useEffect, useCallback } from "react";
import type { UserProfile } from "@/types/user";
import type { ApiErrorBody, ApiSuccessBody } from "@/lib/api-response";

/**
 * Parses the shared `{ success, message, data }` API envelope (see
 * lib/api-response.ts) and throws with the server's message on failure, so
 * every call site can just try/catch instead of re-checking `success`.
 * (Duplicated per-hook in this repo rather than a shared helper — same
 * copy lives in useMembers.ts/useTodos.ts.)
 */
async function parseApiResponse<T>(response: Response): Promise<T> {
  const body = (await response.json()) as ApiSuccessBody<T> | ApiErrorBody;
  if (!body.success) throw new Error(body.message);
  return body.data as T;
}

export interface UpdateProfileInput {
  name?: string;
  avatarUrl?: string;
}

export interface UseProfileReturn {
  profile: UserProfile | null;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  updateProfile: (input: UpdateProfileInput) => Promise<UserProfile>;
}

/**
 * Owns all profile state for /profile: fetches GET /api/user/me on mount,
 * and exposes updateProfile to PATCH changes and merge the result back
 * into local state - the "state lives in the hook" convention (see
 * CLAUDE.md). ProfileCard stays presentational.
 */
export function useProfile(): UseProfileReturn {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const response = await fetch("/api/user/me");
        const data = await parseApiResponse<UserProfile>(response);
        if (!cancelled) setProfile(data);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load profile.");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // Re-throws on failure (doesn't swallow) so ProfileCard's submit handler
  // can catch it into a local, inline form error - mirrors how
  // AddMemberDialog handles its onCreate call.
  const updateProfile = useCallback(async (input: UpdateProfileInput) => {
    setIsSaving(true);
    try {
      const response = await fetch("/api/user/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const updated = await parseApiResponse<UserProfile>(response);
      setProfile(updated);
      return updated;
    } finally {
      setIsSaving(false);
    }
  }, []);

  return { profile, isLoading, isSaving, error, updateProfile };
}
