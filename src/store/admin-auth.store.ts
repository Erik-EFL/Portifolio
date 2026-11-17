import { create } from 'zustand'
import {
  AdminAuthUser,
  clearFirebaseAuthSession,
  getStoredAdminUser
} from '@/services/firebase-auth.service'

interface AdminAuthState {
  user: AdminAuthUser | null
  setUser: (user: AdminAuthUser) => void
  signOut: () => void
}

export const useAdminAuthStore = create<AdminAuthState>()(set => ({
  user: getStoredAdminUser(),
  setUser: user => set({ user }),
  signOut: () => {
    void clearFirebaseAuthSession()
    set({ user: null })
  }
}))
