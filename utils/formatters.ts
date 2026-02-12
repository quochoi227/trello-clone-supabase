import type { Card, Column } from "@/components/kanban/kanban-board"
import { RealtimePostgresInsertPayload } from "@supabase/supabase-js"

export const generatePlaceholderCard = (column: Column) => {
  return {
    id: `${column.id}-placeholder-card`,
    boardId: column.boardId,
    columnId: column.id,
    FE_PlaceholderCard: true
  }
}

export const generateScaffoldCard = (cardFromRealtime: RealtimePostgresInsertPayload<Card>) => {
  return {
    ...cardFromRealtime.new,
    boardId: cardFromRealtime.new.board_id,
    columnId: cardFromRealtime.new.column_id,
  }
}
