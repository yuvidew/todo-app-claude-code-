"use client";

import { useState } from "react";
import Link from "next/link";
import { useTodos } from "@/hooks/useTodos";
import { TodoSearch } from "@/components/todo/TodoSearch";
import { TodoTabs } from "@/components/todo/TodoTabs";
import { TodoList } from "@/components/todo/TodoList";
import { CreateTodoDialog } from "@/components/todo/CreateTodoDialog";
import { EditTodoDialog } from "@/components/todo/EditTodoDialog";
import { DeleteTodoDialog } from "@/components/todo/DeleteTodoDialog";
import { ThemeToggle } from "@/components/theme-toggle";
import { Todo } from "@/types/todo";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DUMMY_MEMBERS } from "@/constants/members";

/**
 * Home component serves as the main entry point for the Todo application.
 * It coordinates the layout and manages the high-level UI state for dialogs.
 * All business logic is delegated to the `useTodos` custom hook.
 */
export default function Home() {
  // Business logic and state from custom hook
  const {
    filteredTodos,
    counts,
    searchQuery,
    setSearchQuery,
    activeTab,
    setActiveTab,
    selectedAssignee,
    setSelectedAssignee,
    addTodo,
    updateTodo,
    deleteTodo,
    toggleTodo,
  } = useTodos();

  // UI state for managing modal visibility
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [deletingTodoId, setDeletingTodoId] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-background">
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

      <div className="max-w-6xl mx-auto space-y-8 p-4 md:p-8">

        {/* Header: Search and Create Action */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <TodoSearch
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />
          <CreateTodoDialog onCreate={addTodo} />
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
            todos={filteredTodos}
            onToggle={toggleTodo}
            onEdit={setEditingTodo}
            onDelete={setDeletingTodoId}
          />
        </div>
      </div>

      {/* Overlays: Edit and Delete Dialogs */}
      <EditTodoDialog
        key={editingTodo?.id}
        todo={editingTodo}
        onCancel={() => setEditingTodo(null)}
        onUpdate={(id, title, description, assignee) => {
          updateTodo(id, title, description, assignee);
          setEditingTodo(null);
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
