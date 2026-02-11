import { deleteBoard } from "@/actions/board-actions";
import { getBoardWithDetails } from "@/actions/board-actions";

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const board = await getBoardWithDetails(id);
  if (!board) {
    return new Response("Board not found", { status: 404 });
  }
  return new Response(JSON.stringify(board), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  // Implement deletion logic here
  const { success } = await deleteBoard(id)
  if (!success) {
    return new Response("Failed to delete board", { status: 500 });
  }
  return new Response("Board deleted successfully", { status: 200 });
}