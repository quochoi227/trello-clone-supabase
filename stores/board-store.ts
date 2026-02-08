import { create } from "zustand";
import type { BoardStore } from "@/types/board.ts";

export const useBoardStore = create<BoardStore>((set) => ({
  currentActiveBoard: null,
  setCurrentActiveBoard: (board) => set({ currentActiveBoard: board }),
  updateCardInBoard: (updatedCard) =>
    set((state) => {
      const board = state.currentActiveBoard;
      if (!board) return state;
      const updatedColumns = board.columns.map((column) => {
        if (column.id === updatedCard.columnId) {
          const updatedCards = column.cards.map((card) =>
            card.id === updatedCard.id ? { ...card, ...updatedCard } : card
          );
          return { ...column, cards: updatedCards };
        }
        return column;
      });
      return {
        currentActiveBoard: {
          ...board,
          columns: updatedColumns,
        },
      };
    }),
  // fetchProjectDetailsAPI: async (projectId) => {
  //   console.log("Gọi API fetch chi tiết project với ID:", projectId);
  //   // Giả lập gọi API với dữ liệu mock
  //   set({ currentActiveBoard: mockData.project as Project });
  // }
}))