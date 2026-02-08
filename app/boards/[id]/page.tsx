import { KanbanBoard } from "@/components/kanban/kanban-board";
import { getBoardWithDetails } from "@/lib/queries/board-queries";
import { notFound } from "next/navigation";

export default async function BoardPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // Query board với nested columns và cards
  const board = await getBoardWithDetails(id);
  // console.log("Board detail:", board);

  // Handle not found
  if (!board) {
    notFound();
  }

  return (
    <div className="h-full p-3">
      <KanbanBoard initialData={board} />
    </div>
  );
}
