"use client";

import { useState } from "react";
import Link from "next/link";
import { useMembers } from "@/hooks/useMembers";
import { MemberTable } from "@/components/members/MemberTable";
import { AddMemberDialog } from "@/components/members/AddMemberDialog";
import { TodoPagination } from "@/components/todo/TodoPagination";
import { ThemeToggle } from "@/components/theme-toggle";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { Plus } from "lucide-react";

/**
 * Dedicated member directory page: a paginated table of every member with
 * an Active/Inactive switch per row, and an "Add Member" action. All
 * business logic lives in useMembers - this page is presentational glue.
 */
export default function MembersPage() {
  const {
    paginatedMembers,
    currentPage,
    totalPages,
    setCurrentPage,
    createMember,
    toggleMemberActive,
    error,
  } = useMembers();

  const [addOpen, setAddOpen] = useState(false);

  function handleToggleActive(id: number, isActive: boolean) {
    toggleMemberActive(id, isActive).catch((err) => {
      toast.add({
        title: "Couldn't update member",
        description: err instanceof Error ? err.message : "Something went wrong.",
        type: "error",
      });
    });
  }

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
            <ThemeToggle />
            <LogoutButton />
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto space-y-8 p-4 md:p-8 h-full">
        {/* Header: Title and Add Member action */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <h1 className="text-2xl font-bold text-foreground">Members</h1>
          <Button className="w-full md:w-auto gap-2" onClick={() => setAddOpen(true)}>
            <Plus className="size-4" /> Add Member
          </Button>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        {/* Main Content: Paginated Member Table */}
        <div className="mt-6">
          <MemberTable members={paginatedMembers} onToggleActive={handleToggleActive} />
        </div>
      </div>

      {/* Pagination: fixed to the bottom of the viewport, same as /todos */}
      {totalPages > 1 && (
        <footer className="fixed inset-x-0 bottom-0 z-50 border-t border-border backdrop-blur supports-[backdrop-filter]:bg-background/80">
          <div className="max-w-6xl mx-auto px-4 md:px-8 py-3 pb-9">
            <TodoPagination
              currentPage={currentPage}
              totalPages={totalPages}
              setCurrentPage={setCurrentPage}
            />
          </div>
        </footer>
      )}

      <AddMemberDialog open={addOpen} onOpenChange={setAddOpen} onCreate={createMember} />
    </div>
  );
}
