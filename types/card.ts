import { Card } from "@/components/kanban";

export interface CardStore {
  currentActiveCard: Card | null;
  setCurrentActiveCard: (card: Card | null) => void;
}