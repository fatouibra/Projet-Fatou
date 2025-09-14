'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface RestaurantManager {
  id: string
  email: string
  name: string
  phone?: string
  restaurantId: string
  restaurant?: {
    id: string
    name: string
    description?: string
    address: string
    phone: string
    email: string
    image?: string
    rating: number
    likesCount: number
    isActive: boolean
    cuisine: string
    deliveryFee: number
    minOrderAmount: number
    openingHours: string
  }
  isActive: boolean
  permissions: string[]
}

interface RestaurantStore {
  manager: RestaurantManager | null
  isAuthenticated: boolean
  isInitialized: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  initialize: () => void
  hasPermission: (permission: string) => boolean
}

export const useRestaurantStore = create<RestaurantStore>()(
  persist(
    (set, get) => ({
      manager: null,
      isAuthenticated: false,
      isInitialized: false,

      login: async (email: string, password: string) => {
        try {
          const response = await fetch('/api/auth/restaurant-login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
          })

          const data = await response.json()

          if (data.success) {
            const permissions = data.manager.permissions ? data.manager.permissions.split(',') : []
            const managerData = {
              ...data.manager,
              permissions
            }
            
            set({
              manager: managerData,
              isAuthenticated: true,
            })
            return { success: true }
          } else {
            return { success: false, error: data.error || 'Erreur de connexion' }
          }
        } catch (error) {
          console.error('Login error:', error)
          return { success: false, error: 'Erreur de connexion' }
        }
      },

      logout: () => {
        set({
          manager: null,
          isAuthenticated: false,
        })
      },

      initialize: () => {
        set({ isInitialized: true })
      },

      hasPermission: (permission: string) => {
        const { manager } = get()
        if (!manager) return false
        return manager.permissions.includes(permission)
      },
    }),
    {
      name: 'restaurant-auth',
      partialize: (state) => ({
        manager: state.manager,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)