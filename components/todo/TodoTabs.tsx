import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface TodoTabsProps {
  /** Current active filter tab value ('all', 'pending', 'completed') */
  activeTab: string;
  /** Callback to update the active filter tab */
  setActiveTab: (tab: string) => void;
  /** Current counts for total, completed, and pending tasks */
  counts: { total: number; completed: number; pending: number };
}

/**
 * TodoTabs component provides the tabs for filtering tasks by status.
 */
export function TodoTabs({ activeTab, setActiveTab, counts }: TodoTabsProps) {
  return (
    <Tabs defaultValue="all" onValueChange={setActiveTab} value={activeTab} className="w-full">
      <TabsList className="grid w-full max-w-md grid-cols-3">
        <TabsTrigger value="all">
          All <span className="ml-2 text-xs opacity-60">({counts.total})</span>
        </TabsTrigger>
        <TabsTrigger value="pending">
          Pending <span className="ml-2 text-xs opacity-60">({counts.pending})</span>
        </TabsTrigger>
        <TabsTrigger value="completed">
          Completed <span className="ml-2 text-xs opacity-60">({counts.completed})</span>
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
