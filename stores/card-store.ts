import {create} from "zustand"
import { CardStore } from "@/types/card"
import { createClient } from "@/lib/supabase/client"

export const useCardStore = create<CardStore>((set, get) => ({
  cardChannel: null,
  currentActiveCard: null,
  setCurrentActiveCard: (card) => set({ currentActiveCard: card }),
  subscribeToCard: (cardId: string) => {
    get().unsubscribeFromCard()
    const supabase = createClient()
    const channel = supabase
      .channel(`card-${cardId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "activities",
          filter: `card_id=eq.${cardId}` },
        (payload) => {
          const { eventType, new: newRecord, old: oldRecord } = payload
          if (eventType === "INSERT") {
            // Nếu trong store đã có newRecord thì không thêm nữa
            if (get().currentActiveCard?.activities?.some(activity => activity.id === newRecord.id)) {
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
          } else if (eventType === "UPDATE") {
            // console.log("Activity updated:", newRecord)
            // update lại data trong activities
            // Nếu data của activity trùng với data trong store thì không update nữa
            if (JSON.stringify(get().currentActiveCard?.activities?.find(activity => activity.id === newRecord.id)?.data) === JSON.stringify(newRecord.data)) {
              return
            }
            set({ currentActiveCard: {
              ...get().currentActiveCard!,
              activities: get().currentActiveCard!.activities!.map(activity =>
                activity.id === newRecord.id ? { ...activity, data: newRecord.data } : activity
              )
            }})
          } else if (eventType === "DELETE") {
            console.log("Activity deleted:", newRecord)
            // console.log("Activity deleted:", newRecord)
            // Nếu activity id không tồn tại trong store thì không làm gì cả
            if (!get().currentActiveCard?.activities?.some(activity => activity.id === oldRecord.id)) {
              console.log(newRecord)
              return
            }

            set({ currentActiveCard: {
              ...get().currentActiveCard!,
              activities: get().currentActiveCard!.activities!.filter(activity => activity.id !== oldRecord.id)
            }})
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
