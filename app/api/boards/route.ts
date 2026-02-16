import { createBoard, fetchBoardByQuery } from "@/actions/board-actions";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") || "";
  try {
    const { success, data, error } = await fetchBoardByQuery({ title: query });
    if (!success) {
      return new Response(JSON.stringify({ error }), { status: 400 });
    }
    return new Response(JSON.stringify({ success: true, data }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error }), { status: 500 });
  }
}

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
    