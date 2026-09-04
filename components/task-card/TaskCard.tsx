"use client";

import { useState } from "react";
import { Calendar, CircleAlert, MessageSquare } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export interface TaskCardTag {
  /** Text shown on the pill */
  label: string;
  /** Accent used for the pill's background/text pairing */
  color: "blue" | "orange";
}

export interface TaskCardAssignee {
  /** Full name — used for the avatar's fallback initials and alt text */
  name: string;
  /** Optional avatar image; falls back to initials when omitted */
  imageSrc?: string;
}

export interface TaskCardProps {
  /** Task title shown at the top of the card */
  title: string;
  /** Short supporting description shown under the title */
  description: string;
  /** Category/label pills rendered below the description */
  tags?: TaskCardTag[];
  /** Short, pre-formatted due date (e.g. "Jan 25") */
  dueDate?: string;
  /** Number of comments on the task */
  commentCount?: number;
  /** Subtask completion, rendered as a small ring + "done/total" */
  progress?: { completed: number; total: number };
  /** People assigned to the task, rendered as overlapping avatars */
  assignees?: TaskCardAssignee[];
  /** Whether to show the red priority/warning indicator */
  priority?: boolean;
  /** Initial checked state of the completion checkbox (uncontrolled) */
  defaultChecked?: boolean;
  /** Called whenever the completion checkbox changes */
  onCheckedChange?: (checked: boolean) => void;
  className?: string;
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/);
  const initials = parts.length > 1 ? [parts[0], parts[parts.length - 1]] : [parts[0]];
  return initials.map((part) => part[0]?.toUpperCase()).join("");
}

const tagStyles: Record<TaskCardTag["color"], string> = {
  blue: "bg-tag-blue text-tag-blue-foreground",
  orange: "bg-tag-orange text-tag-orange-foreground",
};

/** A small ring-shaped progress indicator, e.g. for "1/4 subtasks done". */
function CircularProgress({ value, size = 15, strokeWidth = 2 }: { value: number; size?: number; strokeWidth?: number }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - Math.min(Math.max(value, 0), 1));

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="-rotate-90 shrink-0"
      aria-hidden="true"
    >
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" strokeWidth={strokeWidth} className="stroke-border" />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        className="stroke-primary transition-[stroke-dashoffset]"
      />
    </svg>
  );
}

/**
 * TaskCard is a compact, self-contained task summary card: a completion
 * checkbox, title with an optional priority flag, description, category
 * tags, a metadata row (due date, comments, subtask progress), and
 * overlapping assignee avatars. Every color adapts automatically between
 * light and dark mode via the app's theme tokens (see app/globals.css).
 */
export function TaskCard({
  title,
  description,
  tags = [],
  dueDate,
  commentCount,
  progress,
  assignees = [],
  priority = false,
  defaultChecked = false,
  onCheckedChange,
  className,
}: TaskCardProps) {
  const [checked, setChecked] = useState(defaultChecked);

  const handleCheckedChange = (next: boolean) => {
    setChecked(next);
    onCheckedChange?.(next);
  };

  return (
    <div
      className={cn(
        "w-full max-w-sm rounded-2xl border border-border bg-card p-4 text-card-foreground shadow-sm dark:shadow-none",
        className
      )}
    >
      <div className="flex gap-3">
        <Checkbox
          checked={checked}
          onCheckedChange={handleCheckedChange}
          className="mt-1 size-[18px] rounded-full"
          aria-label={checked ? "Mark task incomplete" : "Mark task complete"}
        />

        <div className="min-w-0 flex-1 space-y-3">
          {/* Title + priority indicator */}
          <div className="flex items-start justify-between gap-2">
            <h3
              className={cn(
                "text-sm font-semibold leading-snug text-foreground",
                checked && "text-muted-foreground line-through"
              )}
            >
              {title}
            </h3>
            {priority && (
              <CircleAlert className="mt-0.5 size-4 shrink-0 text-destructive" aria-label="High priority" />
            )}
          </div>

          {/* Description */}
          <p
            className={cn(
              "text-xs text-muted-foreground",
              checked && "line-through"
            )}
          >
            {description}
          </p>

          {/* Tags */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {tags.map((tag) => (
                <span
                  key={tag.label}
                  className={cn(
                    "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                    tagStyles[tag.color]
                  )}
                >
                  {tag.label}
                </span>
              ))}
            </div>
          )}

          <Separator />

          {/* Metadata + assignees */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              {dueDate && (
                <span className="flex items-center gap-1">
                  <Calendar className="size-3.5" />
                  {dueDate}
                </span>
              )}
              {commentCount !== undefined && (
                <span className="flex items-center gap-1">
                  <MessageSquare className="size-3.5" />
                  {commentCount}
                </span>
              )}
              {progress && (
                <span className="flex items-center gap-1.5">
                  <CircularProgress value={progress.total > 0 ? progress.completed / progress.total : 0} />
                  {progress.completed}/{progress.total}
                </span>
              )}
            </div>

            {assignees.length > 0 && (
              <div className="flex -space-x-2">
                {assignees.map((assignee) => (
                  <Avatar key={assignee.name} size="sm" className="ring-2 ring-card">
                    {assignee.imageSrc && <AvatarImage src={assignee.imageSrc} alt={assignee.name} />}
                    <AvatarFallback>{getInitials(assignee.name)}</AvatarFallback>
                  </Avatar>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
