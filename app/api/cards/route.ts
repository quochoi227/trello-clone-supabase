import { createCard } from "@/actions/card-actions";

export async function POST(request: Request) {
  try {
    const { title, columnId, boardId } = await request.json();
    const { data, success, error } = await createCard({
      title,
      columnId,
      boardId,
    });
    if (!success) {
      return new Response(
        JSON.stringify({ success: false, error: error || "Failed to create card" }),
        { status: 500 }
      );
    }
    return new Response(JSON.stringify({ success: true, data }), { status: 200 });
  } catch (error) {
    console.error("Unexpected error creating card:", error);
    return new Response(
      JSON.stringify({ success: false, error: "An unexpected error occurred. Please try again." }),
      { status: 500 }
    );
  }
}
