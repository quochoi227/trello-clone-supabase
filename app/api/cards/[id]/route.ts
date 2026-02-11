import { getCardDetails } from "@/actions/card-actions";

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const { data, error } = await getCardDetails(id);

  if (error) {
    return new Response(JSON.stringify({ success: false, error }), { status: 500 });
  }
  return new Response(JSON.stringify({ success: true, data }), { status: 200 });
}