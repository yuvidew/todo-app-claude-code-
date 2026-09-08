/**
 * A team member who can be assigned to a task — the wire shape returned by
 * /api/members and consumed by the assignee dropdowns.
 */
export interface Member {
  id: number;
  name: string;
  email: string;
  avatarUrl?: string | null;
  isActive: boolean;
}
