import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import type { User } from '../types/api'

interface AuthState {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  setSession: (user: User, accessToken: string, refreshToken: string) => void
  setTokens: (accessToken: string, refreshToken: string) => void
  updateUser: (patch: Partial<User>) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      setSession: (user, accessToken, refreshToken) => set({ user, accessToken, refreshToken }),
      setTokens: (accessToken, refreshToken) => set({ accessToken, refreshToken }),
      updateUser: (patch) => set((s) => ({ user: s.user ? { ...s.user, ...patch } : s.user })),
      logout: () => set({ user: null, accessToken: null, refreshToken: null }),
    }),
    { name: 'ptx-auth' },
  ),
)
