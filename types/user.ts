/**
 * The signed-in user's profile — the wire shape returned by
 * GET/PATCH /api/user/me and consumed by useProfile/ProfileCard.
 * createdAt is a string (the DTO shape crossing JSON), converted to a
 * Date at render time rather than in a separate fromDTO layer.
 */
export interface UserProfile {
  id: number;
  email: string;
  name: string | null;
  avatarUrl: string | null;
  createdAt: string;
}
