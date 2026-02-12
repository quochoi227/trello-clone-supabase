import { create } from "zustand";
import type { BoardStore } from "@/types/board.ts";
import { createClient } from "@/lib/supabase/client";
import { mapOrder } from "@/utils/sorts";
import { Board, Card, Column } from "@/components/kanban";
import { generatePlaceholderCard } from "@/utils/formatters";
import { RealtimePostgresDeletePayload, RealtimePostgresInsertPayload, RealtimePostgresUpdatePayload } from "@supabase/supabase-js";
import { useCardStore } from "./card-store";

export const useBoardStore = create<BoardStore>((set, get) => ({
  boardChannel: null,
  columnChannel: null,
  cardChannel: null,
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
  subscribeToBoard: async (boardId) => {
    get().unsubscribeFromBoard(); // Unsubscribe from any existing channel
    const supabase = createClient();

    const { data: { user } } = await supabase.auth.getUser()

    const channel = supabase
      .channel(`board-${boardId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "boards",
          filter: `id=eq.${boardId}`
        },
        (payload: RealtimePostgresUpdatePayload<Board>) => {
          const { new: newRecord } = payload;
          
          if (newRecord.user_id === user?.id) {
            console.log("Received board event for own action");
            return;
          }
        
          // Cập nhật tất cả các thuộc tính của board
          const board = get().currentActiveBoard;
          Object.assign(board!, newRecord);
          if (board && board.columnOrderIds.length === newRecord.column_order_ids?.length && JSON.stringify(board.columnOrderIds) !== JSON.stringify(newRecord.column_order_ids)) {
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
              } as typeof state.currentActiveBoard,
            }));
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
  subscribeToColumn: async (boardId: string) => {
    get().unsubscribeFromColumn();
    const supabase = createClient();

    const { data: { user } } = await supabase.auth.getUser()
    // Implement subscription logic here
    if (!boardId) return;
    const channel = supabase
      .channel(`column-${boardId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "columns",
          filter: `board_id=eq.${boardId}` },
        (payload: RealtimePostgresInsertPayload<Column>) => {
          // console.log("Received payload for column:", payload);
          // Handle real-time updates for the column here
          const { new: newRecord } = payload;
          if (newRecord.user_id === user?.id) {
            console.log("Received column event for own action");
            return;
          }

          const board = get().currentActiveBoard;
          if (!board) return;
          const placeholderCard = generatePlaceholderCard(newRecord as Column);
          const newColumn: Column = { ...newRecord, cards: [placeholderCard], cardOrderIds: [placeholderCard.id] } as unknown as Column;

          set((state) => ({
            currentActiveBoard: {
              ...state.currentActiveBoard!,
              columns: [...state.currentActiveBoard!.columns, newColumn],
              columnOrderIds: [...state.currentActiveBoard!.columnOrderIds, newRecord.id],
            },
          }))
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "columns",
          filter: `board_id=eq.${boardId}` },
        (payload: RealtimePostgresUpdatePayload<Column>) => {
          const { new: newRecord } = payload;
          if (newRecord.user_id === user?.id) {
            console.log("Received column event for own action");
            return;
          }
          const targetColumn = get().currentActiveBoard?.columns.find(col => col.id === newRecord.id);
          if (targetColumn) {
            // console.log("Found target column for update:", targetColumn);
            // console.log("Updating column in store:", newRecord);
            // Cập nhật tất cả các thuộc tính của cột
            // Nếu số lượng card_order_ids bằng nhau và thứ tự card_order_ids khác nhau, cập nhật lại danh sách cards
            const isColumnIncludesPlaceholderCard = targetColumn.cardOrderIds[0]?.includes("placeholder-card");
            if (!isColumnIncludesPlaceholderCard && targetColumn.cardOrderIds.length === newRecord.card_order_ids?.length && JSON.stringify(targetColumn.cardOrderIds) !== JSON.stringify(newRecord.card_order_ids)) {
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
                } as typeof state.currentActiveBoard,
              }));
            }
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "columns",
          filter: `board_id=eq.${boardId}` },
        (payload: RealtimePostgresDeletePayload<Column>) => {
          const { old: oldRecord } = payload;
          if (oldRecord.user_id === user?.id) {
            console.log("Received column event for own action");
            return;
          }

          const board = get().currentActiveBoard;
          if (!board) return;
          set((state) => ({
            currentActiveBoard: {
              ...state.currentActiveBoard!,
              columns: state.currentActiveBoard!.columns.filter(col => col.id !== oldRecord.id),
              columnOrderIds: state.currentActiveBoard!.columnOrderIds.filter(id => id !== oldRecord.id),
            },
          }))
        }
      )
      
      .subscribe();

    set({ columnChannel: channel });
  },
  unsubscribeFromColumn: () => {
    const channel = get().columnChannel;
    if (channel) {
      // Implement unsubscription logic here
      set({ columnChannel: null });
    }
  },
  subscribeToCard: async (boardId: string) => {
      get().unsubscribeFromCard()
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      const channel = supabase
        .channel(`card-${boardId}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "cards",
            filter: `board_id=eq.${boardId}` },
          (payload: RealtimePostgresInsertPayload<Card>) => {
            const { new: newRecord } = payload
            if (user?.id === newRecord.owner_id) {
              console.log("Updated card from own action, ignoring")
              return
            }

            // Handle real-time insert card if needed
            const targetColumn = get().currentActiveBoard?.columns.find(col => col.id === newRecord.column_id)
            if (targetColumn?.cardOrderIds?.[0].includes("placeholder-card")) {
              targetColumn.cards = []
              targetColumn.cardOrderIds = []
            }
            if (targetColumn) {
              targetColumn.cards.push(newRecord)
              targetColumn.cardOrderIds!.push(newRecord.id)
              set((state) => ({
                currentActiveBoard: {
                  ...state.currentActiveBoard!,
                  columns: state.currentActiveBoard!.columns.map(col =>
                    col.id === targetColumn.id ? targetColumn : col
                  ),
                } as typeof state.currentActiveBoard,
              }))
            }
          }
        )
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "cards",
            filter: `board_id=eq.${boardId}` },
          (payload: RealtimePostgresUpdatePayload<Card>) => {
            const { old: oldRecord, new: newRecord } = payload
            if (user?.id === newRecord.owner_id) {
              console.log("Updated card from own action, ignoring")
              return
            }

            console.log("payload received for new card:", payload)

            // Nếu column_id cũ khác column_id mới, nghĩa là thẻ đã được di chuyển giữa các cột
            if (oldRecord.column_id !== newRecord.column_id) {
              // Xóa thẻ khỏi cột cũ
              const oldColumn = get().currentActiveBoard?.columns.find(col => col.id === oldRecord.column_id)
              

              const targetCard = oldColumn?.cards.find(card => card.id === newRecord.id)
              if (oldColumn) {
                oldColumn.cards = oldColumn.cards.filter(card => card.id !== oldRecord.id)
                oldColumn.cardOrderIds = oldColumn.cardOrderIds?.filter(id => id !== oldRecord.id)
                oldColumn.card_order_ids = oldColumn.cardOrderIds
                console.log("After removing card, oldColumn:", oldColumn)
                // if (oldColumn.cardOrderIds?.[0].includes("placeholder-card")) {
                //   const placeholderCard = generatePlaceholderCard(oldColumn)
                //   oldColumn.cards = [placeholderCard]
                //   oldColumn.cardOrderIds = [placeholderCard.id]
                // }
              }

              // Tìm ra thẻ hiện tại

              // Thêm thẻ vào cột mới
              const newColumn = get().currentActiveBoard?.columns.find(col => col.id === newRecord.column_id)
              if (newColumn) {
                newColumn.cards?.splice(newRecord.new_index as number, 0, targetCard as Card)
                newColumn.cardOrderIds?.splice(newRecord.new_index as number, 0, newRecord.id)
                newColumn.card_order_ids = newColumn.cardOrderIds
                console.log("After adding card, newColumn:", newColumn)
              }
              
              set((state) => ({
                currentActiveBoard: {
                  ...state.currentActiveBoard!,
                  columns: state.currentActiveBoard!.columns.map(col => {
                    if (col.id === oldRecord.column_id) return oldColumn!;
                    if (col.id === newRecord.column_id) return newColumn!;
                    return col;
                  }),
                } as typeof state.currentActiveBoard,
              }))
              return
            }

            const currentActiveCard = useCardStore.getState().currentActiveCard
            if (currentActiveCard && currentActiveCard.id === newRecord.id) {
              const newActiveCard = {
              ...currentActiveCard,
              ...newRecord
              }
              useCardStore.getState().setCurrentActiveCard(newActiveCard as Card)
            }
            
            const targetColumn = get().currentActiveBoard?.columns.find(col => col.id === newRecord.column_id)
            if (targetColumn) {
              targetColumn.cards = targetColumn.cards.map(card =>
                card.id === newRecord.id ? { ...card, ...newRecord } : card
              )
              set((state) => ({
                currentActiveBoard: {
                  ...state.currentActiveBoard!,
                  columns: state.currentActiveBoard!.columns.map(col =>
                    col.id === targetColumn.id ? targetColumn : col
                  ),
                } as typeof state.currentActiveBoard,
              }))
            }
          }
        )
        .on(
          "postgres_changes",
          {
            event: "DELETE",
            schema: "public",
            table: "cards",
            filter: `board_id=eq.${boardId}` },
          (payload: RealtimePostgresDeletePayload<Card>) => {
            const { old: oldRecord } = payload
            if (user?.id === oldRecord.owner_id) {
              console.log("Deleted card from own action, ignoring")
              return
            }

            const targetColumn = get().currentActiveBoard?.columns.find(col => col.cardOrderIds?.includes(oldRecord.id as string))
            if (targetColumn) {
              targetColumn.cards = targetColumn.cards.filter(card => card.id !== oldRecord.id)
              targetColumn.cardOrderIds = targetColumn.cardOrderIds?.filter(id => id !== oldRecord.id)
              set((state) => ({
                currentActiveBoard: {
                  ...state.currentActiveBoard!,
                  columns: state.currentActiveBoard!.columns.map(col =>
                    col.id === targetColumn.id ? targetColumn : col
                  ),
                } as typeof state.currentActiveBoard,
              }))
            }
          }
        )
        .subscribe()

      set({ cardChannel: channel })
    },
    unsubscribeFromCard: () => {
      const channel = get().cardChannel
      if (channel) {
        channel.unsubscribe()
        set({ cardChannel: null })
      }
    },
}))