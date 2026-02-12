"use server";

import { Board } from "@/components/kanban";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { Card } from "@/components/kanban";
import { generatePlaceholderCard } from "@/utils/formatters";
import { mapOrder } from "@/utils/sorts";
import { isEmpty } from "lodash";

export type CreateBoardInput = {
  title: string;
  visibility: "private" | "workspace" | "public";
};

export type ActionResponse<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
};

// Hàm trả về boards mà user id nằm trong owner_ids hoặc member_ids
export async function fetchUserBoards(): Promise<ActionResponse<Board[]>> {
  const supabase = await createClient();

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
    .from("boards")
    .select("*")
    .or(`owner_ids.cs.{${user.id}},member_ids.cs.{${user.id}}`);
  if (error) {
    console.error("Error fetching user boards:", error);
    return { success: false, error: error.message };
  }
  return { success: true, data: data || [] };
}

export async function getBoardWithDetails(boardId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("boards")
    .select(`
      *,
      columns (
        *,
        boardId: board_id,
        cards (
          *,
          boardId: board_id,
          columnId: column_id
        )
      )
    `)
    .eq("id", boardId)
    .single();

  if (error) {
    console.error("Error fetching board:", error);
    return null;
  }

  const sortedColumns = mapOrder(data.columns, data.column_order_ids, 'id')
  const columnOrderIds = data.column_order_ids
  sortedColumns.forEach((column) => {
    if (isEmpty(column.cards)) {
      column.cards = [generatePlaceholderCard(column)]
      column.cardOrderIds = [generatePlaceholderCard(column).id]
    } else {
      column.cards = mapOrder(column?.cards, column?.card_order_ids, 'id')
      column.cardOrderIds = column?.cards.map((card: Card) => card.id)
    }
  })

  return {
    ...data,
    columns: sortedColumns,
    columnOrderIds
  };
}

export async function createBoard(
  input: CreateBoardInput
): Promise<ActionResponse<{ id: string }>> {
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

    // Validate input
    if (!input.title.trim()) {
      return {
        success: false,
        error: "Board title is required",
      };
    }

    // Create board in database
    // TODO: Update this based on your actual database schema
    const { data, error } = await supabase
      .from("boards")
      .insert({
        title: input.title.trim(),
        type: input.visibility,
        slug: input.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)+/g, ""),
        description: "",
        owner_ids: [user.id],
        user_id: user.id,
      })
      .select("id")
      .single();

    if (error) {
      console.error("Error creating board:", error);
      return {
        success: false,
        error: "Failed to create board. Please try again.",
      };
    }

    // Revalidate boards page
    revalidatePath("/boards");

    return {
      success: true,
      data: { id: data.id },
    };
  } catch (error) {
    console.error("Unexpected error creating board:", error);
    return {
      success: false,
      error: "An unexpected error occurred. Please try again.",
    };
  }
}

export async function updateBoard(boardId: string, updateData: Partial<Board> & { column_order_ids?: string[] }) {
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
      .from("boards")
      .update({
        ...updateData,
        user_id: user.id,
      })
      .eq("id", boardId);

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

export const deleteBoard = async (boardId: string) => {
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
        error: "You must be logged in to delete a board",
      };
    }
    console.log("Deleting board with ID:", boardId);
    const { error } = await supabase
      .from("boards")
      .delete()
      .eq("id", boardId);
    if (error) {
      console.error("Error deleting board:", error);
      return {
        success: false,
        error: "Failed to delete board. Please try again.",
      };
    }
    // Revalidate boards page
    revalidatePath("/boards");
    return {
      success: true,
    };
  } catch (error) {
    console.error("Unexpected error deleting board:", error);
    return {
      success: false,
      error: "An unexpected error occurred. Please try again.",
    };
  }
};
