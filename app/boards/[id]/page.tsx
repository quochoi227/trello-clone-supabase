import { mockData } from "@/apis/mock-data";
import { KanbanBoard } from "@/components/kanban/kanban-board";

export default function BoardPage() {
  // In a real app, you would fetch the board data based on the route params
  // For now, we're using the mock data
  return (
    <div className="h-full p-3">
      <KanbanBoard initialData={mockData.board} />
    </div>
  );
}
