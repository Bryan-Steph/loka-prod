import { create } from 'zustand'

//lib/store/authStore.ts
export type UserRole = 'buyer' | 'vendor' | 'admin'

export interface AuthUser {
  id: string
  full_name: string
  email: string
  phone: string | null
  role: UserRole
  language_pref: 'en' | 'fr'
  avatar_url: string | null
}

interface AuthState {
  // Token lives in memory only — clears on tab close (intentional)
  accessToken: string | null
  user: AuthUser | null
  isLoading: boolean
  isAuthenticated: boolean

  // Actions
  setAuth: (token: string, user: AuthUser) => void
  clearAuth: () => void
  setLoading: (loading: boolean) => void
  updateUser: (updates: Partial<AuthUser>) => void
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  user: null,
  isLoading: true, // true on mount — stays true until first refresh attempt completes
  isAuthenticated: false,

  setAuth: (token, user) =>
    set({
      accessToken: token,
      user,
      isAuthenticated: true,
      isLoading: false,
    }),

  clearAuth: () =>
    set({
      accessToken: null,
      user: null,
      isAuthenticated: false,
      isLoading: false,
    }),

  setLoading: (loading) => set({ isLoading: loading }),

  updateUser: (updates) =>
    set((state) => ({
      user: state.user ? { ...state.user, ...updates } : null,
    })),
}))