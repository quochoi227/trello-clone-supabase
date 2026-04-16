"use server"

import { revalidatePath } from "next/cache";
import { getServerClientAndUser } from "@/lib/supabase/server-auth";

export async function sendBoardInvitation({ boardId, email }: { boardId: string; email: string }) {
  const auth = await getServerClientAndUser();
  if ("success" in auth && auth.success === false) return auth;

  const { supabase, user } = auth;

  const { data, error } = await supabase
    .from("board_invitations")
    .insert({
      board_id: boardId,
      invitee_email: email,
      inviter_id: user.id,
    })
    .select()
    .single()
  if (error) {
    throw new Error(error.message)
  }

  return data
}

export async function fetchBoardInvitations() {
  const auth = await getServerClientAndUser();
  if ("success" in auth && auth.success === false) return auth;

  const { supabase, user } = auth;

  const { data, error } = await supabase
    .from("board_invitations")
    .select(`
      id,
      board_id,
      invitee_email,
      inviter_id,
      status,
      created_at,
      board:board_id (
        id,
        title
      )
    `)
    .eq("invitee_email", user.email)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return { success: true, data };
}

export async function acceptBoardInvitation({ invitationId }: { invitationId: string }) {
  const auth = await getServerClientAndUser();
  if ("success" in auth && auth.success === false) return auth;

  const { supabase, user } = auth;

  const { data: invitation, error: invitationError } = await supabase
    .from("board_invitations")
    .update({ status: "accepted" })
    .eq("id", invitationId)
    .eq("invitee_email", user.email)
    .select("id, board_id, status")
    .single();

  if (invitationError) throw new Error(invitationError.message);

  if (invitation?.board_id) {
    const { data: board, error: boardError } = await supabase
      .from("boards")
      .select("id, member_ids")
      .eq("id", invitation.board_id)
      .single();

    if (boardError) throw new Error(boardError.message);

    const memberIds: string[] = board?.member_ids || [];
    if (!memberIds.includes(user.id)) {
      const { error: updateError } = await supabase
        .from("boards")
        .update({ member_ids: [...memberIds, user.id] })
        .eq("id", invitation.board_id);

      if (updateError) throw new Error(updateError.message);
    }
  }

  revalidatePath("/boards");
  return { success: true, data: invitation };
}

export async function declineBoardInvitation({ invitationId }: { invitationId: string }) {
  const auth = await getServerClientAndUser();
  if ("success" in auth && auth.success === false) return auth;

  const { supabase, user } = auth;

  const { data, error } = await supabase
    .from("board_invitations")
    .update({ status: "declined" })
    .eq("id", invitationId)
    .eq("invitee_email", user.email)
    .select("id, board_id, status")
    .single();

  if (error) throw new Error(error.message);
  return { success: true, data };
}
