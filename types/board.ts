// import type { UniqueIdentifier } from "@dnd-kit/core";

import { Board, Card } from "@/components/kanban";

export interface BoardStore {
  currentActiveBoard: Board | null;
  setCurrentActiveBoard: (board: Board | null) => void;
  updateCardInBoard: (updatedCard: Card) => void;
  // fetchProjectDetailsAPI: (projectId: UniqueIdentifier) => Promise<void>;
}
