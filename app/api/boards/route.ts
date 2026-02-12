import { createBoard } from "@/actions/board-actions";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { title, visibility } = await request.json();
    const { success, error, data } = await createBoard({ title, visibility })
    if (!success) {
      return NextResponse.json({ error }, { status: 400 });
    }
    return NextResponse.json({ success: true, data: { id: data?.id } });
  } catch (error) {
    return NextResponse.json(
      { error },
      { status: 500 }
    );
  }
}
    