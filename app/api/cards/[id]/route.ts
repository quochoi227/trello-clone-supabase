import { getCardDetails, updateCard, deleteCard } from "@/actions/card-actions";
import { Card } from "@/components/kanban";

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const { data, error } = await getCardDetails(id);

  if (error) {
    return new Response(JSON.stringify({ success: false, error }), { status: 500 });
  }
  return new Response(JSON.stringify({ success: true, data }), { status: 200 });
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const updateData: Partial<Card> = await request.json();
  const { success, error, data } = await updateCard(id, updateData);

  if (!success) {
    return new Response(JSON.stringify({ success: false, error }), { status: 500 });
  }
  return new Response(JSON.stringify({ success: true, data }), { status: 200 });
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  const { columnId } = await request.json();
  const { id } = await context.params;
  const { success, error } = await deleteCard(id, columnId);
  if (!success) {
    return new Response(JSON.stringify({ success: false, error }), { status: 500 });
  }
  return new Response(JSON.stringify({ success: true }), { status: 200 });
}
