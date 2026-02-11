import { RealtimeChannel } from "@supabase/supabase-js";

export interface ColumnStore {
  columnChannel: RealtimeChannel | null;
  subscribeToColumn: (columnId: string) => void;
  unsubscribeFromColumn: () => void;
}