import {create} from "zustand"
import { CardStore } from "@/types/card"
import { createClient } from "@/lib/supabase/client"
import { RealtimePostgresDeletePayload, RealtimePostgresInsertPayload, RealtimePostgresUpdatePayload } from "@supabase/supabase-js"
import { Activity } from "@/types/activity"

export const useCardStore = create<CardStore>((set, get) => ({
  cardChannel: null,
  currentActiveCard: null,
  setCurrentActiveCard: (card) => set({ currentActiveCard: card }),

  subscribeToActivity: async (cardId: string) => {
    get().unsubscribeFromActivity()
    const supabase = createClient()

    const { data: { user } } = await supabase.auth.getUser()

    const channel = supabase
      .channel(`card-${cardId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "activities",
          filter: `card_id=eq.${cardId}` },
        (payload: RealtimePostgresInsertPayload<Activity>) => {
          const { new: newRecord } = payload
            // Nếu trong store đã có newRecord thì không thêm nữa
          if (user?.id === newRecord.user_id) {
            console.log("New activity from own action, ignoring")
            return
          }
          fetch('/api/activities/' + payload.new.id)
          .then(res => res.json())
          .then(data => {
            set({ currentActiveCard: {
              ...get().currentActiveCard!,
              activities: [
                data,
                ...get().currentActiveCard!.activities!
              ]
            } })
          })
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "activities",
          filter: `card_id=eq.${cardId}` },
        (payload: RealtimePostgresUpdatePayload<Activity>) => {
          const { new: newRecord } = payload
          if (user?.id === newRecord.user_id) {
            console.log("Updated activity from own action, ignoring")
            return
          }
          set({ currentActiveCard: {
            ...get().currentActiveCard!,
            activities: get().currentActiveCard!.activities!.map(activity =>
              activity.id === newRecord.id ? { ...activity, data: newRecord.data } : activity
            )
          }})
        }
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "activities",
          filter: `card_id=eq.${cardId}`
        },
        (payload: RealtimePostgresDeletePayload<Activity>) => {
          const { old: oldRecord } = payload
          if (user?.id === oldRecord.user_id) {
            console.log("Deleted activity from own action, ignoring")
            return
          }
          set({ currentActiveCard: {
            ...get().currentActiveCard!,
            activities: get().currentActiveCard!.activities!.filter(activity => activity.id !== oldRecord.id)
          }})
        }
      )
      .subscribe()

    set({ cardChannel: channel })
  },
  unsubscribeFromActivity: () => {
    const channel = get().cardChannel
    if (channel) {
      channel.unsubscribe()
      set({ cardChannel: null })
    }
  },
}))
