import { Button } from "@/components/ui/button";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

interface TodoPaginationProps {
  /** The currently active page (1-indexed) */
  currentPage: number;
  /** Total number of pages available */
  totalPages: number;
  /** Callback triggered when the user navigates to a different page */
  setCurrentPage: (page: number) => void;
}

/**
 * TodoPagination renders a "Page X of Y" indicator alongside
 * Previous/Next controls for navigating the paginated task list.
 */
export function TodoPagination({ currentPage, totalPages, setCurrentPage }: TodoPaginationProps) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-muted-foreground">
        Page <span className="text-foreground font-medium">{currentPage}</span> of{" "}
        <span className="text-foreground font-medium">{totalPages}</span>
      </span>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={currentPage <= 1}
          onClick={() => setCurrentPage(currentPage - 1)}
        >
          <ChevronLeftIcon data-icon="inline-start" />
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={currentPage >= totalPages}
          onClick={() => setCurrentPage(currentPage + 1)}
        >
          Next
          <ChevronRightIcon data-icon="inline-end" />
        </Button>
      </div>
    </div>
  );
}
