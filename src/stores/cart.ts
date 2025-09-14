import { create } from 'zustand'
import type { CartItem, Product, Restaurant } from '@/types'
import { toast } from './toast'

interface ExtendedCartItem extends CartItem {
  description?: string
  restaurant: Restaurant
  notes?: string
  uniqueId: string
}

interface CartState {
  items: ExtendedCartItem[]
  total: number
  itemCount: number
  isOpen: boolean
  currentRestaurant: Restaurant | null
  
  // Actions
  addItem: (product: Product, restaurant: Restaurant, quantity?: number, notes?: string) => void
  removeItem: (uniqueId: string) => void
  updateQuantity: (uniqueId: string, quantity: number) => void
  updateNotes: (uniqueId: string, notes: string) => void
  clearCart: () => void
  toggleCart: () => void
  openCart: () => void
  closeCart: () => void
  
  // Getters
  getItemQuantity: (productId: string) => number
  getDeliveryFee: () => number
  getFinalTotal: () => number
  canAddFromRestaurant: (restaurantId: string) => boolean
}

const calculateTotal = (items: ExtendedCartItem[]): number => {
  return items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
}

const calculateItemCount = (items: ExtendedCartItem[]): number => {
  return items.reduce((sum, item) => sum + item.quantity, 0)
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  total: 0,
  itemCount: 0,
  isOpen: false,
  currentRestaurant: null,

  addItem: (product, restaurant, quantity = 1, notes = '') => {
    const state = get()
    
    // Vérifier si on peut ajouter depuis ce restaurant
    if (!state.canAddFromRestaurant(restaurant.id)) {
      // Si le panier contient des items d'un autre restaurant, on demande confirmation
      const confirmClear = window.confirm(
        `Votre panier contient des plats de ${state.currentRestaurant?.name}. Voulez-vous vider le panier pour ajouter des plats de ${restaurant.name} ?`
      )
      if (!confirmClear) return
      
      // Vider le panier
      set({ 
        items: [], 
        total: 0, 
        itemCount: 0,
        currentRestaurant: null
      })
    }

    // Générer un ID unique pour l'item
    const uniqueId = `${product.id}_${Date.now()}`
    
    // Créer le nouvel item
    const newItem: ExtendedCartItem = {
      id: product.id,
      uniqueId,
      name: product.name,
      price: product.price,
      image: product.image,
      description: product.description,
      quantity,
      categoryName: product.category?.name,
      restaurantId: restaurant.id,
      restaurantName: restaurant.name,
      restaurant,
      notes
    }

    const newItems = [...state.items, newItem]
    
    set({
      items: newItems,
      total: calculateTotal(newItems),
      itemCount: calculateItemCount(newItems),
      currentRestaurant: restaurant,
      isOpen: true
    })

    // Afficher toast de succès
    toast.success(
      'Produit ajouté !',
      `${product.name} a été ajouté au panier`,
      3000
    )

    // Save to localStorage manually
    if (typeof window !== 'undefined') {
      localStorage.setItem('cart-storage', JSON.stringify({ 
        items: newItems, 
        currentRestaurant: restaurant 
      }))
    }
  },

  removeItem: (uniqueId) => {
    const state = get()
    const itemToRemove = state.items.find(item => item.uniqueId === uniqueId)
    const newItems = state.items.filter(item => item.uniqueId !== uniqueId)
    const newRestaurant = newItems.length > 0 ? newItems[0].restaurant : null
    
    set({
      items: newItems,
      total: calculateTotal(newItems),
      itemCount: calculateItemCount(newItems),
      currentRestaurant: newRestaurant
    })

    // Toast de suppression
    if (itemToRemove) {
      toast.info(
        'Produit retiré',
        `${itemToRemove.name} a été retiré du panier`,
        2000
      )
    }

    // Save to localStorage manually
    if (typeof window !== 'undefined') {
      localStorage.setItem('cart-storage', JSON.stringify({ 
        items: newItems,
        currentRestaurant: newRestaurant 
      }))
    }
  },

  updateQuantity: (uniqueId, quantity) => {
    if (quantity <= 0) {
      get().removeItem(uniqueId)
      return
    }

    const newItems = get().items.map(item =>
      item.uniqueId === uniqueId ? { ...item, quantity } : item
    )

    set({
      items: newItems,
      total: calculateTotal(newItems),
      itemCount: calculateItemCount(newItems)
    })

    // Save to localStorage manually
    if (typeof window !== 'undefined') {
      localStorage.setItem('cart-storage', JSON.stringify({ 
        items: newItems,
        currentRestaurant: get().currentRestaurant 
      }))
    }
  },

  updateNotes: (uniqueId, notes) => {
    const newItems = get().items.map(item =>
      item.uniqueId === uniqueId ? { ...item, notes } : item
    )

    set({ items: newItems })

    // Save to localStorage manually
    if (typeof window !== 'undefined') {
      localStorage.setItem('cart-storage', JSON.stringify({ 
        items: newItems,
        currentRestaurant: get().currentRestaurant 
      }))
    }
  },

  toggleCart: () => {
    set(state => ({ isOpen: !state.isOpen }))
  },

  openCart: () => {
    set({ isOpen: true })
  },

  closeCart: () => {
    set({ isOpen: false })
  },

  clearCart: () => {
    set({
      items: [],
      total: 0,
      itemCount: 0,
      currentRestaurant: null,
      isOpen: false
    })

    // Clear localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('cart-storage')
    }
  },

  getItemQuantity: (productId) => {
    return get().items
      .filter(item => item.id === productId)
      .reduce((total, item) => total + item.quantity, 0)
  },

  getDeliveryFee: () => {
    return get().currentRestaurant?.deliveryFee || 0
  },

  getFinalTotal: () => {
    return get().total + get().getDeliveryFee()
  },

  canAddFromRestaurant: (restaurantId) => {
    const currentRestaurant = get().currentRestaurant
    return !currentRestaurant || currentRestaurant.id === restaurantId
  }
}))

// Initialize from localStorage on client side
if (typeof window !== 'undefined') {
  const stored = localStorage.getItem('cart-storage')
  if (stored) {
    try {
      const data = JSON.parse(stored)
      if (data.items) {
        useCartStore.setState({
          items: data.items,
          total: calculateTotal(data.items),
          itemCount: calculateItemCount(data.items),
          currentRestaurant: data.currentRestaurant || null
        })
      }
    } catch (error) {
      console.error('Error loading cart from localStorage:', error)
    }
  }
}