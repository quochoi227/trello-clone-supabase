import { Card } from "@/components/kanban";
import { RealtimeChannel } from "@supabase/supabase-js";

export interface CardStore {
  cardChannel: RealtimeChannel | null;
  currentActiveCard: Card | null;
  setCurrentActiveCard: (card: Card | null) => void;
  subscribeToActivity: (cardId: string) => void;
  unsubscribeFromActivity: () => void;
}