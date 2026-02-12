import { createColumn } from "@/actions/column-action";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { title, boardId } = await request.json();
  const { success, error, data } = await createColumn({ boardId, title })
  if (!success) {
    return NextResponse.json({ error }, { status: 400 });
  }
  return NextResponse.json({ success: true, data });
}
