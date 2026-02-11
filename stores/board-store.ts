import { create } from "zustand";
import type { BoardStore } from "@/types/board.ts";
import { createClient } from "@/lib/supabase/client";
import { mapOrder } from "@/utils/sorts";

export const useBoardStore = create<BoardStore>((set, get) => ({
  boardChannel: null,
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
  updateColumnsInBoard: (updatedColumns) => 
    set((state) => {
      const board = state.currentActiveBoard;
      if (!board) return state;
      return {
        currentActiveBoard: {
          ...board,
          columns: updatedColumns,
        },
      };
    }),
  updateCardsInColumn: (columnId, updatedCards) =>
    set((state) => {
      const board = state.currentActiveBoard;
      if (!board) return state;
      const updatedColumns = board.columns.map((column) => {
        if (column.id === columnId) {
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
  subscribeToBoard: (boardId) => {
    get().unsubscribeFromBoard(); // Unsubscribe from any existing channel
    const supabase = createClient();
    const channel = supabase
      .channel(`board-${boardId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "boards",
          filter: `id=eq.${boardId}`
        },
        (payload) => {
          const { eventType, new: newRecord } = payload;
          console.log("Received board event:", eventType);
          if (eventType === "UPDATE") {
            // Cập nhật tất cả các thuộc tính của board
            const board = get().currentActiveBoard;
            console.log("Found target board for update:", board);
            Object.assign(board!, newRecord);
            // console.log(board?.columnOrderIds)
            // console.log("Received board update via subscription:", newRecord.column_order_ids);
            // Nếu số lượng column_order_ids bằng nhau và thứ tự column_order_ids khác nhau, cập nhật lại danh sách columns
            if (board && board.columnOrderIds.length === newRecord.column_order_ids.length && JSON.stringify(board.columnOrderIds) !== JSON.stringify(newRecord.column_order_ids)) {
              console.log("case 1: column_order_ids changed order");
              board.columns = mapOrder(
                board.columns,
                newRecord.column_order_ids,
                'id'
              );
              set((state) => ({
                currentActiveBoard: {
                  ...state.currentActiveBoard!,
                  columns: board.columns,
                  columnOrderIds: newRecord.column_order_ids,
                },
              }));
            } else if (newRecord.column_order_ids.length < board!.columnOrderIds.length) {
              console.log("case 2: column_order_ids reduced");
              // Nếu column_order_ids ít hơn trước, loại bỏ các cột không còn trong danh sách
              const eliminatedColumnIds = board!.columnOrderIds.filter(id => !newRecord.column_order_ids.includes(id));
              if (eliminatedColumnIds.length > 0) {
                board!.columns = board!.columns.filter(column => !eliminatedColumnIds.includes(column.id));
              }
              set((state) => ({
                currentActiveBoard: {
                  ...state.currentActiveBoard!,
                  columns: board!.columns,
                  columnOrderIds: newRecord.column_order_ids,
                },
              }));
            } else if (newRecord.column_order_ids.length > board!.columnOrderIds.length) {
              console.log("case 3: column_order_ids increased");
              // Nếu column_order_ids nhiều hơn trước
              // Lọc ra các column id mới xuất hiện kèm theo index của nó trong board, query thông tin chi tiết
              const newColumnIds = newRecord.column_order_ids.filter((id: string) => !board!.columnOrderIds.includes(id));
              const columnIdsWithIndex = newColumnIds.map((id: string) => ({
                id,
                index: newRecord.column_order_ids.indexOf(id),
              }));
              Promise.all(columnIdsWithIndex.map(({ id }: { id: string }) =>
                fetch(`/api/columns/${id}`, {
                  method: "GET",
                }).then((res) => res.json())
              )).then((newColumns) => {
                console.log("Fetched new columns to insert:", newColumns);
                newColumns.forEach((column, idx) => {
                  const insertIndex = columnIdsWithIndex[idx].index;
                  board!.columns.splice(insertIndex, 0, column.data);
                });
                set((state) => ({
                  currentActiveBoard: {
                    ...state.currentActiveBoard!,
                    columns: board!.columns,
                    columnOrderIds: newRecord.column_order_ids,
                  },
                }));
              });

            }
          } else if (eventType === "DELETE") {
            // Handle board deletion if necessary
            console.log("Board has been deleted:", newRecord);
          }
        })
      .subscribe();
    set({ boardChannel: channel });
  },
  unsubscribeFromBoard: () => {
    const channel = get().boardChannel;
    if (channel) {
      channel.unsubscribe();
      set({ boardChannel: null });
    }
  },
  subscribeToColumn: (boardId: string) => {
    get().unsubscribeFromColumn();
    // Implement subscription logic here
    if (!boardId) return;
    const supabase = createClient()
    const channel = supabase
      .channel(`column-${boardId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "columns",
          filter: `board_id=eq.${boardId}` },
        (payload) => {
          // console.log("Received payload for column:", payload);
          // Handle real-time updates for the column here
          const { eventType, new: newRecord } = payload;
          console.log("Received column event:", eventType);
          if (eventType === "UPDATE") {
            const targetColumn = get().currentActiveBoard?.columns.find(col => col.id === newRecord.id);
            if (targetColumn && !targetColumn.cardOrderIds) {
              targetColumn.cardOrderIds = [];
            }
            if (targetColumn) {
              // console.log("Found target column for update:", targetColumn);
              // console.log("Updating column in store:", newRecord);
              // Cập nhật tất cả các thuộc tính của cột
              Object.assign(targetColumn, newRecord);
              
              // Nếu số lượng card_order_ids bằng nhau và thứ tự card_order_ids khác nhau, cập nhật lại danh sách cards
              if (targetColumn.cardOrderIds.length === newRecord.card_order_ids.length && JSON.stringify(targetColumn.cardOrderIds) !== JSON.stringify(newRecord.card_order_ids)) {
                console.log("case 1: card_order_ids changed order");
                targetColumn.cards = mapOrder(
                  targetColumn.cards,
                  newRecord.card_order_ids,
                  'id'
                );

                set((state) => ({
                  currentActiveBoard: {
                    ...state.currentActiveBoard!,
                    columns: state.currentActiveBoard!.columns.map(col =>
                      col.id === targetColumn.id ? {
                        ...targetColumn,
                        cardOrderIds: newRecord.card_order_ids
                      } : col
                    ),
                  },
                }));
              } else if (newRecord.card_order_ids.length < targetColumn.cardOrderIds.length) {
                console.log("case 2: card_order_ids reduced");
                // Nếu card_order_ids ít hơn trước, loại bỏ các thẻ không còn trong danh sách
                const eliminatedColumnIds = targetColumn.cardOrderIds.filter(id => !newRecord.card_order_ids.includes(id));
                if (eliminatedColumnIds.length > 0) {
                  targetColumn.cards = targetColumn.cards.filter(card => !eliminatedColumnIds.includes(card.id));
                }
                set((state) => ({
                currentActiveBoard: {
                  ...state.currentActiveBoard!,
                  columns: state.currentActiveBoard!.columns.map(col =>
                    col.id === targetColumn.id ? {
                      ...targetColumn,
                      cardOrderIds: newRecord.card_order_ids
                    } : col
                  ),
                },
              }));
              } else if (newRecord.card_order_ids.length > targetColumn.cardOrderIds.length) {
                console.log("case 3: card_order_ids increased");
                // Nếu card_order_ids nhiều hơn trước
                // Lọc ra các card id mới xuất hiện kèm theo index của nó trong column, query thông tin chi tiết
                // và thêm vào vị trí cũ
                const newCardIds = newRecord.card_order_ids.filter((id: string) => !targetColumn.cardOrderIds.includes(id));
                const cardIdsWithIndex = newCardIds.map((id: string) => ({
                  id,
                  index: newRecord.card_order_ids.indexOf(id),
                }));
                Promise.all(cardIdsWithIndex.map(({ id }: { id: string }) =>
                  fetch(`/api/cards/${id}`, {
                    method: "GET",
                  }).then((res) => res.json())
                )).then((newCards) => {
                  console.log("Fetched new cards to insert:", newCards);
                  newCards.forEach((card, idx) => {
                    const insertIndex = cardIdsWithIndex[idx].index;
                    targetColumn.cards.splice(insertIndex, 0, card.data);
                  });
                  set((state) => ({
                    currentActiveBoard: {
                      ...state.currentActiveBoard!,
                      columns: state.currentActiveBoard!.columns.map(col =>
                        col.id === targetColumn.id ? {
                          ...targetColumn,
                          cardOrderIds: newRecord.card_order_ids
                        } : col
                      ),
                    },
                  }));
                });

              }
            }
          }
        }
      )
      .subscribe();

    set({ boardChannel: channel });
  },
  unsubscribeFromColumn: () => {
    const channel = get().boardChannel;
    if (channel) {
      // Implement unsubscription logic here
      console.log("Unsubscribed from column channel");
      set({ boardChannel: null });
    }
  },
}))