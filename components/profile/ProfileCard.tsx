"use client";

import { useState } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Field, FieldContent, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import { validateProfileForm, type ProfileFieldErrors } from "@/lib/users/client-validation";
import type { UpdateProfileInput } from "@/hooks/useProfile";
import type { UserProfile } from "@/types/user";

interface ProfileCardProps {
  profile: UserProfile | null;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  onSave: (input: UpdateProfileInput) => Promise<UserProfile>;
}

/** Same first+last-initial derivation used by components/members/MemberTable.tsx. */
function getInitials(name: string) {
  const parts = name.trim().split(/\s+/);
  const initials = parts.length > 1 ? [parts[0], parts[parts.length - 1]] : [parts[0]];
  return initials.map((part) => part[0]?.toUpperCase()).join("");
}

// A small per-person mark on the avatar fallback, cycling through hues the
// app already uses elsewhere (task tags + the primary accent) rather than
// inventing new colors - just enough to make one person's badge feel like
// theirs.
const AVATAR_TINTS = [
  "bg-primary/15 text-primary",
  "bg-tag-blue text-tag-blue-foreground",
  "bg-tag-orange text-tag-orange-foreground",
];

/**
 * Displays the signed-in user's profile with an inline edit mode for
 * name/avatarUrl (email stays read-only). Purely presentational - the
 * fetched profile, save request, and error state all live in useProfile.
 */
export function ProfileCard({ profile, isLoading, isSaving, error, onSave }: ProfileCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [errors, setErrors] = useState<ProfileFieldErrors>({});
  const [formError, setFormError] = useState<string | undefined>();

  // Resets the edit drafts whenever isEditing transitions false -> true, so
  // reopening edit mode always starts from the current profile values
  // rather than a stale previous draft. Adjusted during render (this
  // repo's idiom, see AddMemberDialog.tsx) rather than in a useEffect.
  const [prevEditing, setPrevEditing] = useState(isEditing);
  if (isEditing !== prevEditing) {
    setPrevEditing(isEditing);
    if (isEditing && profile) {
      setName(profile.name ?? "");
      setAvatarUrl(profile.avatarUrl ?? "");
      setErrors({});
      setFormError(undefined);
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-8">
        <div className="flex items-center gap-5">
          <Skeleton className="size-24 rounded-full shrink-0" />
          <div className="flex flex-1 flex-col gap-3">
            <Skeleton className="h-10 w-56" />
            <Skeleton className="h-4 w-40" />
          </div>
        </div>
        <Separator />
        <Skeleton className="h-4 w-48" />
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  const displayName = profile.name?.trim() || profile.email.split("@")[0];
  const tint = AVATAR_TINTS[profile.id % AVATAR_TINTS.length];

  function handleCancel() {
    setIsEditing(false);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") handleCancel();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isSaving) return;

    setFormError(undefined);
    const nextErrors = validateProfileForm({ name, avatarUrl });
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    try {
      await onSave({ name, avatarUrl: avatarUrl.trim() || undefined });
      toast.add({ title: "Saved", type: "success" });
      setIsEditing(false);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    }
  }

  if (!isEditing) {
    return (
      <div className="flex flex-col gap-8">
        {error && <p className="text-sm text-destructive">{error}</p>}

        <div className="flex items-start gap-5">
          <Avatar className="size-24 text-2xl shrink-0">
            {profile.avatarUrl && <AvatarImage src={profile.avatarUrl} alt={displayName} />}
            <AvatarFallback className={cn("text-2xl font-medium", tint)}>
              {getInitials(displayName)}
            </AvatarFallback>
          </Avatar>

          <div className="flex flex-1 items-start justify-between gap-4 pt-1">
            <div>
              <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-foreground leading-tight">
                {displayName}
              </h2>
              <p className="mt-1 text-base text-muted-foreground">{profile.email}</p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
              Edit
            </Button>
          </div>
        </div>

        <Separator />

        <div className="flex items-baseline gap-3 text-sm">
          <span className="text-muted-foreground">Member since</span>
          <span className="font-mono text-foreground">
            {new Date(profile.createdAt).toLocaleDateString(undefined, {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} onKeyDown={handleKeyDown} noValidate className="flex flex-col gap-8">
      <div className="flex items-start gap-5">
        <Avatar className="size-24 text-2xl shrink-0">
          {avatarUrl.trim() && <AvatarImage src={avatarUrl.trim()} alt={name || displayName} />}
          <AvatarFallback className={cn("text-2xl font-medium", tint)}>
            {getInitials(name || displayName)}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1">
          <label htmlFor="profile-name" className="sr-only">
            Name
          </label>
          <Input
            id="profile-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? "profile-name-error" : undefined}
            disabled={isSaving}
            autoFocus
            className="h-auto border-0 border-b border-input bg-transparent px-0 py-1 font-heading text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight leading-tight rounded-none shadow-none focus-visible:ring-0 focus-visible:border-primary"
          />
          <FieldError id="profile-name-error" className="mt-1">
            {errors.name}
          </FieldError>
          <p className="mt-1 text-base text-muted-foreground">{profile.email}</p>
        </div>
      </div>

      <Separator />

      <Field data-invalid={!!errors.avatarUrl} className="max-w-md">
        <FieldLabel htmlFor="profile-avatar">Avatar URL</FieldLabel>
        <FieldContent>
          <Input
            id="profile-avatar"
            placeholder="https://..."
            value={avatarUrl}
            onChange={(e) => setAvatarUrl(e.target.value)}
            aria-invalid={!!errors.avatarUrl}
            aria-describedby={errors.avatarUrl ? "profile-avatar-error" : undefined}
            disabled={isSaving}
          />
          <FieldError id="profile-avatar-error">{errors.avatarUrl}</FieldError>
        </FieldContent>
      </Field>

      {formError && <FieldError>{formError}</FieldError>}

      <div className="flex gap-2">
        <Button type="submit" disabled={isSaving}>
          {isSaving ? "Saving..." : "Save"}
        </Button>
        <Button type="button" variant="outline" onClick={handleCancel} disabled={isSaving}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
