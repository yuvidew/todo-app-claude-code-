"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Field, FieldContent, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/toast";
import { validateAddMemberForm, type AddMemberFieldErrors } from "@/lib/members/client-validation";
import type { CreateMemberInput } from "@/hooks/useMembers";
import type { Member } from "@/types/member";

interface AddMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Creates the member via the API - thrown errors (e.g. a 409 duplicate
   *  email) are caught here and surfaced inline as formError. */
  onCreate: (input: CreateMemberInput) => Promise<Member>;
}

/**
 * A dialog form for adding a new member to the directory. Client-validates
 * before calling onCreate, and surfaces any server-side error (duplicate
 * email, network failure) inline instead of failing silently.
 */
export function AddMemberDialog({ open, onOpenChange, onCreate }: AddMemberDialogProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [errors, setErrors] = useState<AddMemberFieldErrors>({});
  const [formError, setFormError] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Resets the form whenever the dialog transitions closed -> open, so a
  // reopened dialog never shows the previous submission's values/errors.
  // Adjusted during render (this repo's idiom, see TaskSheet.tsx) rather
  // than in a useEffect.
  const [prevOpen, setPrevOpen] = useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setName("");
      setEmail("");
      setAvatarUrl("");
      setErrors({});
      setFormError(undefined);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isSubmitting) return;

    setFormError(undefined);
    const nextErrors = validateAddMemberForm({ name, email });
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setIsSubmitting(true);
    try {
      const member = await onCreate({ name, email, avatarUrl: avatarUrl.trim() || undefined });
      toast.add({
        title: "Member added",
        description: `${member.name} has been added.`,
        type: "success",
      });
      onOpenChange(false);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit} noValidate>
          <DialogHeader>
            <DialogTitle>Add Member</DialogTitle>
            <DialogDescription>
              Add a new member to the directory so they can be assigned to tasks.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 py-4">
            <Field data-invalid={!!errors.name}>
              <FieldLabel htmlFor="member-name">Name</FieldLabel>
              <FieldContent>
                <Input
                  id="member-name"
                  placeholder="Jane Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  aria-invalid={!!errors.name}
                  aria-describedby={errors.name ? "member-name-error" : undefined}
                  disabled={isSubmitting}
                />
                <FieldError id="member-name-error">{errors.name}</FieldError>
              </FieldContent>
            </Field>

            <Field data-invalid={!!errors.email}>
              <FieldLabel htmlFor="member-email">Email</FieldLabel>
              <FieldContent>
                <Input
                  id="member-email"
                  type="email"
                  placeholder="jane@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? "member-email-error" : undefined}
                  disabled={isSubmitting}
                />
                <FieldError id="member-email-error">{errors.email}</FieldError>
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel htmlFor="member-avatar">Avatar URL (optional)</FieldLabel>
              <Input
                id="member-avatar"
                placeholder="https://..."
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                disabled={isSubmitting}
              />
            </Field>

            {formError && <FieldError>{formError}</FieldError>}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Adding..." : "Add Member"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
