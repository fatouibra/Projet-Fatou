import { create } from 'zustand'
import type { Order } from '@/types'

interface OrderState {
  currentOrder: Order | null
  isLoading: boolean
  error: string | null
  setCurrentOrder: (order: Order) => void
  clearCurrentOrder: () => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
}

export const useOrderStore = create<OrderState>((set) => ({
  currentOrder: null,
  isLoading: false,
  error: null,

  setCurrentOrder: (order) => set({ currentOrder: order, error: null }),
  clearCurrentOrder: () => set({ currentOrder: null }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error, isLoading: false }),
}))