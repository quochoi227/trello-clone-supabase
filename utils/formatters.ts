import type { Column } from "@/components/kanban/kanban-board"

export const generatePlaceholderCard = (column: Column) => {
  return {
    _id: `${column._id}-placeholder-card`,
    boardId: column.boardId,
    columnId: column._id,
    FE_PlaceholderCard: true
  }
}