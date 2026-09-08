import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Member } from "@/types/member";

interface MemberTableProps {
  /** The current page's slice of members to render. */
  members: Member[];
  /** Called when a row's Active/Inactive switch is flipped. */
  onToggleActive: (id: number, isActive: boolean) => void;
}

/** Same first+last-initial derivation used by components/task-card/TaskCard.tsx's avatar stack. */
function getInitials(name: string) {
  const parts = name.trim().split(/\s+/);
  const initials = parts.length > 1 ? [parts[0], parts[parts.length - 1]] : [parts[0]];
  return initials.map((part) => part[0]?.toUpperCase()).join("");
}

/**
 * MemberTable renders the paginated member directory as a table, with an
 * Active/Inactive Switch per row. Purely presentational - state, pagination,
 * and the toggle request all live in useMembers.
 */
export function MemberTable({ members, onToggleActive }: MemberTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Member</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {members.length === 0 ? (
          <TableRow>
            <TableCell colSpan={3} className="text-center py-12 text-muted-foreground">
              No members found.
            </TableCell>
          </TableRow>
        ) : (
          members.map((member) => (
            <TableRow key={member.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar>
                    {member.avatarUrl && <AvatarImage src={member.avatarUrl} alt={member.name} />}
                    <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
                  </Avatar>
                  <span className="font-medium text-foreground">{member.name}</span>
                </div>
              </TableCell>
              <TableCell className="text-muted-foreground">{member.email}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={member.isActive}
                    onCheckedChange={(checked) => onToggleActive(member.id, checked)}
                  />
                  <span className="text-sm text-muted-foreground">
                    {member.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
