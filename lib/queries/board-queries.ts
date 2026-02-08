import { Card } from "@/components/kanban";
import { createClient } from "@/lib/supabase/server";
import { generatePlaceholderCard } from "@/utils/formatters";
import { mapOrder } from "@/utils/sorts";
import { isEmpty } from "lodash";

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
  };
}

/**
 * Fetch board detail với filtering options
 */
export async function getBoardWithFilters(boardId: string, options?: {
  includeArchived?: boolean;
  columnLimit?: number;
}) {
  const supabase = await createClient();

  // Build query
  let columnsQuery = `
    *,
    cards!cards_column_id_fkey (*)
  `;

  // Filter archived columns
  if (!options?.includeArchived) {
    columnsQuery = `
      *,
      cards!cards_column_id_fkey (
        *
      )
    `;
  }

  const { data, error } = await supabase
    .from("boards")
    .select(`
      *,
      columns (${columnsQuery})
    `)
    .eq("id", boardId)
    .single();

  if (error) {
    console.error("Error fetching board:", error);
    return null;
  }

  return data;
}

/**
 * Fetch chỉ board info (không include columns/cards)
 */
export async function getBoard(boardId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("boards")
    .select("*")
    .eq("id", boardId)
    .single();

  if (error) {
    console.error("Error fetching board:", error);
    return null;
  }

  return data;
}

/**
 * Fetch columns của board (không include cards)
 */
export async function getBoardColumns(boardId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("columns")
    .select("*")
    .eq("board_id", boardId)
    .order("position", { ascending: true });

  if (error) {
    console.error("Error fetching columns:", error);
    return [];
  }

  return data || [];
}

/**
 * Fetch cards của một column
 */
export async function getColumnCards(columnId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("cards")
    .select("*")
    .eq("column_id", columnId)
    .order("position", { ascending: true });

  if (error) {
    console.error("Error fetching cards:", error);
    return [];
  }

  return data || [];
}
