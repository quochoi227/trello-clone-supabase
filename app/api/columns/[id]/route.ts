import { getColumnDetails } from "@/actions/column-action";

// Next.js Route Handler: lấy id từ params
export async function GET(req: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const { data, error } = await getColumnDetails(id);

  if (error) {
    return new Response(JSON.stringify({ success: false, error }), { status: 500 });
  }
  return new Response(JSON.stringify({ success: true, data }), { status: 200 });
}