import type { Column } from "@/components/kanban/kanban-board"

export const generatePlaceholderCard = (column: Column) => {
  return {
    id: `${column.id}-placeholder-card`,
    boardId: column.boardId,
    columnId: column.id,
    FE_PlaceholderCard: true
  }
}