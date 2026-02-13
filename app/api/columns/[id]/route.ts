import { getColumnDetails, updateColumn, deleteColumn } from "@/actions/column-action";

// Next.js Route Handler: lấy id từ params
export async function GET(req: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const { data, error } = await getColumnDetails(id);

  if (error) {
    return new Response(JSON.stringify({ success: false, error }), { status: 500 });
  }
  return new Response(JSON.stringify({ success: true, data }), { status: 200 });
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const updateData = await request.json();
  const { success, error } = await updateColumn(id, updateData);

  if (!success) {
    return new Response(JSON.stringify({ success: false, error }), { status: 500 });
  }
  return new Response(JSON.stringify({ success: true }), { status: 200 });
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const { boardId } = await request.json();
  const { success, error } = await deleteColumn(id, boardId);
  if (!success) {
    return new Response(JSON.stringify({ success: false, error }), { status: 500 });
  }
  return new Response(JSON.stringify({ success: true }), { status: 200 });
}
