import { createClient } from "@/lib/supabase/client";
import { ColumnStore } from "@/types/column";
import { create } from "zustand";

export const useColumnStore = create<ColumnStore>((set, get) => ({
  columnChannel: null,
  subscribeToColumn: (columnId: string) => {
    get().unsubscribeFromColumn();
    // Implement subscription logic here
    console.log(`Subscribed to column with ID: ${columnId}`);
    const supabase = createClient()
    const channel = supabase
      .channel(`column-${columnId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "columns", filter: `id=eq.${columnId}` },
        (payload) => {
          console.log("Received payload for column:", payload);
          // Handle real-time updates for the column here
        }
      )
      .subscribe();

  },
  unsubscribeFromColumn: () => {
    const channel = get().columnChannel;
    if (channel) {
      // Implement unsubscription logic here
      console.log("Unsubscribed from column channel");
      set({ columnChannel: null });
    }
  },
}));