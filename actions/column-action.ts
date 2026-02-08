"use server"

import { Column } from "@/components/kanban";
import { createClient } from "@/lib/supabase/server";

export async function createColumn({
  boardId,
  title
}: { boardId: string, title: string }): Promise<{ success: boolean; error?: string, data?: Column }> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from("columns").insert({
      board_id: boardId,
      title: title
    }).select().single();
    if (error) {
      return { success: false, error: error.message };
    }

    // Thêm cột vào column_order_ids của bảng Board
    const { data: boardData, error: boardError } = await supabase.from("boards").select("column_order_ids").eq("id", boardId).single();
    if (boardError) {
      return { success: false, error: boardError.message };
    }
    const updatedColumnOrderIds = boardData.column_order_ids ? [...boardData.column_order_ids, data.id] : [data.id];
    const { error: updateError } = await supabase.from("boards").update({ column_order_ids: updatedColumnOrderIds }).eq("id", boardId);

    if (updateError) {
      return { success: false, error: updateError.message };
    }
    return { success: true, data };
  } catch (error) {
    console.error("Unexpected error creating column:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

export async function updateColumn(updateData: Partial<Column>) {
  try {
    const supabase = await createClient();

    // Check authentication
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

    // Create board in database
    // TODO: Update this based on your actual database schema
    const { error } = await supabase
      .from("columns")
      .update({
        card_order_ids: updateData.cardOrderIds
      })
      .eq("id", updateData.id);

    if (error) {
      console.error("Error updating board:", error);
      return {
        success: false,
        error: "Failed to updating board. Please try again.",
      };
    }
    
  } catch (error) {
    console.error("Unexpected error updating board:", error);
    return {
      success: false,
      error: "An unexpected error occurred. Please try again.",
    };
  }
}

export async function deleteColumn(columnId: string, boardId: string) {
  try {
    const supabase = await createClient();
    // Delete column from database
    const { error } = await supabase.from("columns").delete().eq("id", columnId);
    if (error) {
      return { success: false, error: error.message };
    }
    // Remove columnId from board's column_order_ids
    const { data: boardData, error: boardError } = await supabase.from("boards").select("column_order_ids").eq("id", boardId).single();
    if (boardError) {
      return { success: false, error: boardError.message };
    }
    const updatedColumnOrderIds = boardData.column_order_ids.filter((id: string) => id !== columnId);
    const { error: updateError } = await supabase.from("boards").update({ column_order_ids: updatedColumnOrderIds }).eq("id", boardId);
    if (updateError) {
      return { success: false, error: updateError.message };
    }
    return { success: true };
  } catch (error) {
    console.error("Unexpected error deleting column:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}
