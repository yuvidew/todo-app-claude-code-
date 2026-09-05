"use client";

import { useState } from "react";
import Link from "next/link";
import { useTodos } from "@/hooks/useTodos";
import { TodoSearch } from "@/components/todo/TodoSearch";
import { TodoTabs } from "@/components/todo/TodoTabs";
import { TodoList } from "@/components/todo/TodoList";
import { TodoPagination } from "@/components/todo/TodoPagination";
import { TaskSheet, TaskSheetMode } from "@/components/todo/TaskSheet";
import { DeleteTodoDialog } from "@/components/todo/DeleteTodoDialog";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Todo } from "@/types/todo";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DUMMY_MEMBERS } from "@/constants/members";
import { Plus } from "lucide-react";

/**
 * Home component serves as the main entry point for the Todo application.
 * It coordinates the layout and manages the high-level UI state for dialogs.
 * All business logic is delegated to the `useTodos` custom hook.
 */
export default function Home() {
  // Business logic and state from custom hook
  const {
    paginatedTodos,
    counts,
    searchQuery,
    setSearchQuery,
    activeTab,
    setActiveTab,
    selectedAssignee,
    setSelectedAssignee,
    currentPage,
    totalPages,
    setCurrentPage,
    addTodo,
    updateTodo,
    deleteTodo,
    toggleTodo,
  } = useTodos();

  // UI state for managing modal visibility
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Todo | null>(null);
  const [sheetMode, setSheetMode] = useState<TaskSheetMode>("create");
  const [deletingTodoId, setDeletingTodoId] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* App Header: brand, back to home, theme toggle */}
      <header className="sticky top-0 z-50 border-b border-border backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-4 md:px-8 py-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex items-center justify-center size-8 rounded-lg bg-primary text-primary-foreground">
              <div className="size-4 rounded-sm bg-primary-foreground/30" />
            </div>
            <span className="text-lg font-bold tracking-tight text-foreground">NexusCore</span>
          </Link>
          <ThemeToggle />
        </div>
      </header>

      <div className="max-w-6xl mx-auto space-y-8 p-4 md:p-8 h-full">

        {/* Header: Search and Create Action */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <TodoSearch
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />
          <Button
            className="w-full md:w-auto gap-2"
            onClick={() => {
              setSelectedTask(null);
              setSheetMode("create");
              setSheetOpen(true);
            }}
          >
            <Plus className="size-4" /> Add Task
          </Button>
        </div>

        {/* Filter Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <TodoTabs
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            counts={counts}
          />
          <div className="flex items-center gap-2 w-full md:w-auto">
            <span className="text-sm text-muted-foreground whitespace-nowrap">Filter by member:</span>
            <Select
              value={selectedAssignee}
              onValueChange={(value) => setSelectedAssignee(value ?? "")}
            >
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="All members" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All members</SelectItem>
                {DUMMY_MEMBERS.map((member) => (
                  <SelectItem key={member.id} value={member.name}>
                    {member.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Main Content: Filtered Todo List */}
        <div className="mt-6">
          <TodoList
            todos={paginatedTodos}
            onToggle={toggleTodo}
            onOpen={(todo) => {
              setSelectedTask(todo);
              setSheetMode("view");
              setSheetOpen(true);
            }}
            onEdit={(todo) => {
              setSelectedTask(todo);
              setSheetMode("edit");
              setSheetOpen(true);
            }}
            onDelete={setDeletingTodoId}
          />
        </div>
      </div>

      {/* Pagination: fixed to the bottom of the viewport, like the header is fixed to the top */}
      <footer className="fixed inset-x-0 bottom-0 z-50 border-t border-border backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-3 pb-9">
          <TodoPagination
            currentPage={currentPage}
            totalPages={totalPages}
            setCurrentPage={setCurrentPage}
          />
        </div>
      </footer>

      {/* Overlays: Task Sheet (create/view/edit) and Delete Dialog */}
      <TaskSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        mode={sheetMode}
        onModeChange={setSheetMode}
        task={selectedTask}
        onCreate={addTodo}
        onUpdate={(id, title, description, assignee) => {
          updateTodo(id, title, description, assignee);
          // updateTodo rebuilds the todos array immutably and returns void, so
          // selectedTask (held here) must be re-synced by hand or the Sheet's
          // "view" mode (which reads straight from the `task` prop) would show
          // stale content after switching back from "edit".
          setSelectedTask((prev) =>
            prev && prev.id === id
              ? { ...prev, title: title.trim(), description, assignee: assignee?.trim() }
              : prev
          );
        }}
      />

      <DeleteTodoDialog
        todoId={deletingTodoId}
        onCancel={() => setDeletingTodoId(null)}
        onConfirm={(id) => {
          deleteTodo(id);
          setDeletingTodoId(null);
        }}
      />
    </div>
  );
}
