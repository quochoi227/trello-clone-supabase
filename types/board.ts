// import type { UniqueIdentifier } from "@dnd-kit/core";

import { Board, Card } from "@/components/kanban";
import { RealtimeChannel } from "@supabase/supabase-js";

export interface BoardStore {
  boardChannel: RealtimeChannel | null;
  columnChannel: RealtimeChannel | null;
  cardChannel: RealtimeChannel | null;
  currentActiveBoard: Board | null;
  setCurrentActiveBoard: (board: Board | null) => void;
  updateCardInBoard: (updatedCard: Card) => void;
  // fetchProjectDetailsAPI: (projectId: UniqueIdentifier) => Promise<void>;
  updateColumnsInBoard: (updatedColumns: Board["columns"]) => void;
  updateCardsInColumn: (columnId: string, updatedCards: Card[]) => void;
  subscribeToBoard: (boardId: string) => void;
  unsubscribeFromBoard: () => void;
  subscribeToColumn: (columnId: string) => void;
  unsubscribeFromColumn: () => void;
  subscribeToCard: (cardId: string) => void;
  unsubscribeFromCard: () => void;
}
