import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface TodoSearchProps {
  /** Current search query string */
  searchQuery: string;
  /** Callback to update the search query */
  setSearchQuery: (query: string) => void;
}

/**
 * TodoSearch component provides the search input for filtering the todo list.
 */
export function TodoSearch({ searchQuery, setSearchQuery }: TodoSearchProps) {
  return (
    <div className="relative w-full md:w-96">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
      <Input
        placeholder="Search tasks by title, desc, status or date..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="pl-10"
      />
    </div>
  );
}
