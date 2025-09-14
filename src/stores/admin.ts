import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Admin } from '@/types'

interface AdminState {
  admin: Admin | null
  isAuthenticated: boolean
  isLoading: boolean
  isInitialized: boolean
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  setLoading: (loading: boolean) => void
  initialize: () => void
}

export const useAdminStore = create<AdminState>()(
  persist(
    (set, get) => ({
      admin: null,
      isAuthenticated: false,
      isLoading: false,
      isInitialized: false,

      initialize: () => {
        set({ isInitialized: true })
      },

      login: async (email: string, password: string) => {
        set({ isLoading: true })
        
        try {
          const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
          })

          const data = await response.json()

          if (data.success) {
            set({ 
              admin: data.data,
              isAuthenticated: true,
              isLoading: false 
            })
            return true
          } else {
            set({ isLoading: false })
            return false
          }
        } catch (error) {
          set({ isLoading: false })
          return false
        }
      },

      logout: () => {
        set({
          admin: null,
          isAuthenticated: false
        })
      },

      setLoading: (loading) => set({ isLoading: loading })
    }),
    {
      name: 'admin-storage',
      partialize: (state) => ({ 
        admin: state.admin, 
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
)