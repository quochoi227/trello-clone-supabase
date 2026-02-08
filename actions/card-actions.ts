"use server"

import { Card } from "@/components/kanban";
import { createClient } from "@/lib/supabase/server";

export async function createCard({
  boardId,
  columnId,
  title
}: { boardId: string, columnId: string, title: string }): Promise<{ success: boolean; error?: string, data?: Card }> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from("cards").insert({
      board_id: boardId,
      column_id: columnId,
      title: title
    }).select().single();
    if (error) {
      return { success: false, error: error.message };
    }

    // Thêm cột vào card_order_ids của bảng Board
    const { data: columnData, error: columnError } = await supabase.from("columns").select("card_order_ids").eq("id", columnId).single();
    if (columnError) {
      return { success: false, error: columnError.message };
    }
    const updatedCardOrderIds = columnData.card_order_ids ? [...columnData.card_order_ids, data.id] : [data.id];
    const { error: updateError } = await supabase.from("columns").update({ card_order_ids: updatedCardOrderIds }).eq("id", columnId);

    if (updateError) {
      return { success: false, error: updateError.message };
    }

    return { success: true, data: { ...data, columnId: data.column_id } };
  } catch (error) {
    console.error("Unexpected error creating column:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

interface IPropsMoveCardDifferentColumn {
  currentCardId: string;
  prevColumnId: string;
  prevCardOrderIds: string[];
  nextColumnId: string;
  nextCardOrderIds: string[];
}

export async function moveCardToDifferentColumnAction(updateData: IPropsMoveCardDifferentColumn) {
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
    const res1 = supabase
      .from("columns")
      .update({
        card_order_ids: updateData.prevCardOrderIds
      })
      .eq("id", updateData.prevColumnId);
      
    const res2 = supabase
      .from("columns")
      .update({
        card_order_ids: updateData.nextCardOrderIds
      })
      .eq("id", updateData.nextColumnId);

    const res3 = supabase
      .from("cards")
      .update({
        column_id: updateData.nextColumnId
      })
      .eq("id", updateData.currentCardId);

    await Promise.all([res1, res2, res3]);
  } catch (error) {
    console.error("Unexpected error updating board:", error);
    return {
      success: false,
      error: "An unexpected error occurred. Please try again.",
    };
  }
}
