import { create } from 'zustand'
import type { Toast, ToastType } from '@/components/ui/Toast'

interface ToastState {
  toasts: Toast[]
  addToast: (type: ToastType, title: string, message?: string, duration?: number) => void
  removeToast: (id: string) => void
  clearAll: () => void
}

export const useToastStore = create<ToastState>((set, get) => ({
  toasts: [],

  addToast: (type, title, message, duration = 5000) => {
    const id = Math.random().toString(36).substring(2) + Date.now().toString(36)
    const toast: Toast = { id, type, title, message, duration }
    
    set(state => ({
      toasts: [...state.toasts, toast]
    }))
  },

  removeToast: (id) => {
    set(state => ({
      toasts: state.toasts.filter(toast => toast.id !== id)
    }))
  },

  clearAll: () => {
    set({ toasts: [] })
  }
}))

// Helper functions pour plus de facilité
export const toast = {
  success: (title: string, message?: string, duration?: number) => 
    useToastStore.getState().addToast('success', title, message, duration),
  
  error: (title: string, message?: string, duration?: number) => 
    useToastStore.getState().addToast('error', title, message, duration),
  
  warning: (title: string, message?: string, duration?: number) => 
    useToastStore.getState().addToast('warning', title, message, duration),
  
  info: (title: string, message?: string, duration?: number) => 
    useToastStore.getState().addToast('info', title, message, duration)
}