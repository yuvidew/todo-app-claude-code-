"use client";

import Link from "next/link";
import { useProfile } from "@/hooks/useProfile";
import { ProfileCard } from "@/components/profile/ProfileCard";
import { ThemeToggle } from "@/components/theme-toggle";
import { LogoutButton } from "@/components/auth/LogoutButton";

export default function ProfilePage() {
  const { profile, isLoading, isSaving, error, updateProfile } = useProfile();

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* App Header: brand, back to home, nav, theme toggle */}
      <header className="sticky top-0 z-50 border-b border-border backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-4 md:px-8 py-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex items-center justify-center size-8 rounded-lg bg-primary text-primary-foreground">
              <div className="size-4 rounded-sm bg-primary-foreground/30" />
            </div>
            <span className="text-lg font-bold tracking-tight text-foreground">NexusCore</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/todos"
              className="text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              Todos
            </Link>
            <Link
              href="/members"
              className="text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              Members
            </Link>
            <ThemeToggle />
            <LogoutButton />
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto p-4 md:p-8">
        <ProfileCard
          profile={profile}
          isLoading={isLoading}
          isSaving={isSaving}
          error={error}
          onSave={updateProfile}
        />
      </div>
    </div>
  );
}
