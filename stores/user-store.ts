import {create} from 'zustand'
import { UserStore } from '@/types/user'
import { User } from '@supabase/supabase-js'

export const useUserStore = create<UserStore>((set) => ({
  currentUser: null,
  setCurrentUser: (user: User | null) => set({ currentUser: user }),
}))