"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache";

export async function sendBoardInvitation({ boardId, email }: { boardId: string; email: string }) {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      success: false,
      error: "You must be logged in to create a board",
    };
  }

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
  console.log("Invitation sent:", data)
  return data
}

export async function fetchBoardInvitations() {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      success: false,
      error: "You must be logged in to create a board",
    };
  }

  const { data, error } = await supabase
    .from("board_invitations")
    .select(`
      *,
      board:board_id (
        id,
        title
      )
    `)
    .eq("invitee_email", user.email)
    .order("created_at", { ascending: false })
    
  if (error) {
    throw new Error(error.message)
  }
  return data
}

export async function acceptBoardInvitation({ invitationId }: { invitationId: string }) {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      success: false,
      error: "You must be logged in",
    };
  }

  // Cập nhật status invitation
  const { data: invitation, error: invitationError } = await supabase
    .from("board_invitations")
    .update({ status: 'accepted' })
    .eq("id", invitationId)
    .eq("invitee_email", user.email)
    .select()
    .single()

  if (invitationError) {
    throw new Error(invitationError.message)
  }

  // Thêm user id vào mảng memberIds của board
  if (invitation?.board_id && user.id) {
    // Lấy memberIds hiện tại
    const { data: board, error: boardError } = await supabase
      .from("boards")
      .select()
      .eq("id", invitation.board_id)
      .single()
    if (boardError) {
      throw new Error(boardError.message)
    }
    const memberIds: string[] = board?.member_ids || [];
    // Thêm user nếu chưa có
    if (!memberIds.includes(user.id)) {
      const newMemberIds = [...memberIds, user.id];
      const { error: updateError } = await supabase
        .from("boards")
        .update({ member_ids: newMemberIds })
        .eq("id", invitation.board_id);
      if (updateError) {
        throw new Error(updateError.message);
      }
    }
  }
  revalidatePath("/boards")
  return { success: true, data: invitation }
}

export async function declineBoardInvitation({ invitationId }: { invitationId: string }) {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      success: false,
      error: "You must be logged in",
    };
  }

  const { data, error } = await supabase
    .from("board_invitations")
    .update({ status: 'declined' })
    .eq("id", invitationId)
    .eq("invitee_email", user.email)
    .select()
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return { success: true, data }
}