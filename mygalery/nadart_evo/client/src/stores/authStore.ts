import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '../types'

interface AuthState {
  token: string | null
  user: User | null
  isAuthenticated: boolean
  login: (token: string, user: User) => void
  logout: () => void
  checkAuth: () => boolean
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      isAuthenticated: false,

      login: (token: string, user: User) => {
        set({ token, user, isAuthenticated: true })
      },

      logout: () => {
        set({ token: null, user: null, isAuthenticated: false })
      },

      checkAuth: () => {
        const state = get()
        if (!state.token) {
          return false
        }
        // Check if token is expired (JWT tokens have exp claim)
        try {
          const payload = JSON.parse(atob(state.token.split('.')[1]))
          if (payload.exp * 1000 < Date.now()) {
            get().logout()
            return false
          }
          return true
        } catch {
          get().logout()
          return false
        }
      },
    }),
    {
      name: 'nadart-auth',
      partialize: (state) => ({ token: state.token, user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
)
