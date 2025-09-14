import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { toast } from './toast'

interface LikeState {
  // Map des likes par target (format: "PRODUCT:id" ou "RESTAURANT:id")
  likes: Record<string, boolean>
  userFingerprint: string
  
  // Actions
  toggleLike: (targetType: 'PRODUCT' | 'RESTAURANT', targetId: string, userPhone?: string, userEmail?: string) => Promise<boolean>
  isLiked: (targetType: 'PRODUCT' | 'RESTAURANT', targetId: string) => boolean
  initializeUserFingerprint: () => void
}

// Génère un fingerprint unique pour l'utilisateur
const generateFingerprint = () => {
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substring(2)
  const userAgent = typeof window !== 'undefined' ? 
    window.navigator.userAgent.replace(/\D/g, '').substring(0, 10) : 
    '0000000000'
  return `fp_${timestamp}_${random}_${userAgent}`
}

export const useLikesStore = create<LikeState>()(
  persist(
    (set, get) => ({
      likes: {},
      userFingerprint: '',

      initializeUserFingerprint: () => {
        const state = get()
        if (!state.userFingerprint) {
          set({ userFingerprint: generateFingerprint() })
        }
      },

      toggleLike: async (targetType, targetId, userPhone, userEmail) => {
        const state = get()
        const key = `${targetType}:${targetId}`
        const currentlyLiked = state.likes[key] || false
        const action = currentlyLiked ? 'unlike' : 'like'

        // Optimistic update
        set({
          likes: {
            ...state.likes,
            [key]: !currentlyLiked
          }
        })

        try {
          const response = await fetch('/api/likes', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              targetType,
              targetId,
              userPhone,
              userEmail,
              userFingerprint: state.userFingerprint,
              action
            })
          })

          const data = await response.json()

          if (data.success) {
            // Confirmer l'état optimiste
            const finalLiked = data.liked
            set({
              likes: {
                ...get().likes,
                [key]: finalLiked
              }
            })

            // Toast de feedback
            if (finalLiked) {
              toast.success(
                '❤️ Ajouté aux favoris', 
                targetType === 'PRODUCT' ? 'Plat ajouté à vos favoris' : 'Restaurant ajouté à vos favoris',
                2000
              )
            } else {
              toast.info(
                '💔 Retiré des favoris',
                targetType === 'PRODUCT' ? 'Plat retiré de vos favoris' : 'Restaurant retiré de vos favoris',
                2000
              )
            }

            return finalLiked
          } else {
            // Revert optimistic update on error
            set({
              likes: {
                ...get().likes,
                [key]: currentlyLiked
              }
            })

            toast.error('Erreur', 'Impossible de mettre à jour vos favoris')
            return currentlyLiked
          }
        } catch (error) {
          console.error('Error toggling like:', error)

          // Revert optimistic update on error
          set({
            likes: {
              ...get().likes,
              [key]: currentlyLiked
            }
          })

          toast.error('Erreur', 'Impossible de mettre à jour vos favoris')
          return currentlyLiked
        }
      },

      isLiked: (targetType, targetId) => {
        const state = get()
        const key = `${targetType}:${targetId}`
        return state.likes[key] || false
      }
    }),
    {
      name: 'likes-storage',
      // Persister les likes et le fingerprint dans localStorage
      partialize: (state) => ({ 
        likes: state.likes, 
        userFingerprint: state.userFingerprint 
      })
    }
  )
)

// Hook pour initialiser le fingerprint au chargement
export const initializeLikes = () => {
  if (typeof window !== 'undefined') {
    useLikesStore.getState().initializeUserFingerprint()
  }
}