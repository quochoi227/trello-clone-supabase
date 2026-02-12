import { User } from '@supabase/supabase-js'

export interface UserStore {
  currentUser: User | null
  setCurrentUser: (user: User | null) => void
}