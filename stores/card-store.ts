import {create} from "zustand"
import { CardStore } from "@/types/card"

export const useCardStore = create<CardStore>((set) => ({
  currentActiveCard: null,
  setCurrentActiveCard: (card) => set({ currentActiveCard: card }),
}))
