import { NextResponse } from "next/server";
import { fetchBoardInvitations, sendBoardInvitation } from "@/actions/board-invitation-actions";

export async function GET() {
  const data = await fetchBoardInvitations();
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const { boardId, email } = await request.json();
  const data = await sendBoardInvitation({ boardId, email });
  return NextResponse.json(data);
}