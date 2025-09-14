import { useEffect } from 'react'
import { useAuthStore } from '@/stores/auth'

const ACTIVITY_TIMEOUT = 30 * 60 * 1000 // 30 minutes
const CHECK_INTERVAL = 5 * 60 * 1000 // 5 minutes

export function useAuthActivity() {
  const { isAuthenticated, updateActivity, logout, lastActivity } = useAuthStore()

  useEffect(() => {
    if (!isAuthenticated) return

    // Événements qui indiquent une activité utilisateur
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click']
    
    const handleActivity = () => {
      updateActivity()
    }

    // Ajouter les listeners
    events.forEach(event => {
      document.addEventListener(event, handleActivity, true)
    })

    // Vérifier périodiquement si la session a expiré
    const interval = setInterval(() => {
      const now = Date.now()
      const timeSinceLastActivity = now - lastActivity

      if (timeSinceLastActivity > ACTIVITY_TIMEOUT) {
        console.log('Session expirée par inactivité')
        logout()
      }
    }, CHECK_INTERVAL)

    return () => {
      // Nettoyer les listeners
      events.forEach(event => {
        document.removeEventListener(event, handleActivity, true)
      })
      clearInterval(interval)
    }
  }, [isAuthenticated, updateActivity, logout, lastActivity])
}