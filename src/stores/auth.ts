import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { AuthUser, UserRole, LoginCredentials } from '@/types/auth'

interface AuthState {
  user: AuthUser | null
  isAuthenticated: boolean
  isLoading: boolean
  isInitialized: boolean
  lastActivity: number
  
  // Actions
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; message?: string }>
  logout: () => void
  initialize: () => Promise<void>
  checkAuth: () => Promise<void>
  refreshUser: () => Promise<void>
  updateUser: (userData: Partial<AuthUser>) => void
  updateActivity: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      isInitialized: false,
      lastActivity: Date.now(),

      login: async (credentials: LoginCredentials) => {
        console.log('🏪 Store - Login called with:', credentials.email)
        set({ isLoading: true })

        try {
          console.log('📡 Store - Making fetch request to /api/auth/login')
          const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(credentials),
          })

          console.log('📨 Store - Response status:', response.status)
          const data = await response.json()
          console.log('📦 Store - Response data:', data)

          if (data.success) {
            console.log('✅ Store - Login successful, updating state')
            set({
              user: data.user,
              isAuthenticated: true,
              isLoading: false,
              lastActivity: Date.now(),
            })
            return { success: true }
          } else {
            console.log('❌ Store - Login failed:', data.message)
            set({ isLoading: false })
            return { success: false, message: data.message }
          }
        } catch (error) {
          console.error('❌ Store - Fetch error:', error)
          set({ isLoading: false })
          return { success: false, message: 'Erreur de connexion' }
        }
      },

      logout: () => {
        try {
          fetch('/api/auth/logout', { method: 'POST' }).catch(console.error)
        } catch (error) {
          console.error('Erreur lors de la déconnexion:', error)
        } finally {
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          })
        }
      },

      initialize: async () => {
        if (get().isInitialized) return

        set({ isLoading: true })

        try {
          // Always call checkAuth to get fresh user data from server
          await get().checkAuth()
        } catch (error) {
          console.error('Erreur lors de l\'initialisation:', error)
          set({
            user: null,
            isAuthenticated: false,
          })
        } finally {
          set({ isInitialized: true, isLoading: false })
        }
      },

      checkAuth: async () => {
        try {
          const response = await fetch('/api/auth/me', {
            credentials: 'include',
          })

          if (response.ok) {
            const data = await response.json()
            if (data.success) {
              set({
                user: data.user,
                isAuthenticated: true,
                lastActivity: Date.now(),
              })
              return
            }
          }
        } catch (error) {
          console.error('Erreur de vérification d\'authentification:', error)
        }

        set({
          user: null,
          isAuthenticated: false,
        })
      },

      refreshUser: async () => {
        // Force refresh user data from server
        await get().checkAuth()
      },

      updateUser: (userData: Partial<AuthUser>) => {
        const currentUser = get().user
        if (currentUser) {
          set({
            user: { ...currentUser, ...userData },
            lastActivity: Date.now(),
          })
        }
      },

      updateActivity: () => {
        set({ lastActivity: Date.now() })
      },
    }),
    {
      name: 'auth-store',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        lastActivity: state.lastActivity,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.isInitialized = false
          state.isLoading = false
        }
      },
    }
  )
)

// Helpers pour vérifier les permissions et rôles
export const useAuthHelpers = () => {
  const { user } = useAuthStore()

  const hasRole = (role: UserRole): boolean => {
    return user?.role === role
  }

  const hasPermission = (permission: string): boolean => {
    if (!user) return false
    
    if (user.role === UserRole.ADMIN) {
      return true // Admin a toutes les permissions
    }
    
    return user.permissions?.includes(permission) || false
  }

  const canAccessRestaurant = (restaurantId: string): boolean => {
    if (!user) return false
    
    if (user.role === UserRole.ADMIN) {
      return true // Admin peut accéder à tous les restaurants
    }
    
    if (user.role === UserRole.RESTAURATOR) {
      return user.restaurantId === restaurantId
    }
    
    return false
  }

  const isAdmin = (): boolean => hasRole(UserRole.ADMIN)
  const isRestaurator = (): boolean => hasRole(UserRole.RESTAURATOR)
  const isCustomer = (): boolean => hasRole(UserRole.CUSTOMER)

  return {
    hasRole,
    hasPermission,
    canAccessRestaurant,
    isAdmin,
    isRestaurator,
    isCustomer,
  }
}