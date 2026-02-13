import { moveCardToDifferentColumnAction } from "@/actions/card-actions";

export async function PUT(request: Request) {
  try {
    const updateData = await request.json();
    const { success, error } = await moveCardToDifferentColumnAction(updateData);
    if (!success) {
      return new Response(
        JSON.stringify({ success: false, error: error || "Failed to move card" }),
        { status: 500 }
      );
    }
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    console.error("Unexpected error moving card:", error);
    return new Response(
      JSON.stringify({ success: false, error: "An unexpected error occurred. Please try again." }),
      { status: 500 }
    );
  }
}