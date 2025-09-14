'use client'

import { useCartStore } from '@/stores/cart'
import { formatPrice } from '@/lib/utils'
import { 
  ShoppingCart, 
  X, 
  Plus, 
  Minus, 
  Trash2,
  Store,
  Truck,
  MessageSquare,
  ShoppingBag
} from 'lucide-react'
import Image from 'next/image'
import { useState } from 'react'
import Link from 'next/link'

export function Cart() {
  const { 
    items, 
    total, 
    itemCount, 
    isOpen, 
    currentRestaurant,
    updateQuantity, 
    removeItem, 
    updateNotes,
    toggleCart, 
    closeCart, 
    getDeliveryFee,
    getFinalTotal 
  } = useCartStore()

  const [editingNotes, setEditingNotes] = useState<string | null>(null)
  const [noteText, setNoteText] = useState('')

  if (itemCount === 0) return null

  const handleNotesClick = (uniqueId: string, currentNotes: string) => {
    setEditingNotes(uniqueId)
    setNoteText(currentNotes || '')
  }

  const handleNotesSave = (uniqueId: string) => {
    updateNotes(uniqueId, noteText)
    setEditingNotes(null)
    setNoteText('')
  }

  const deliveryFee = getDeliveryFee()
  const finalTotal = getFinalTotal()

  return (
    <>
      {/* Cart Button */}
      <button
        onClick={toggleCart}
        className="fixed bottom-6 right-6 z-50 bg-primary-600 hover:bg-primary-700 text-white rounded-full p-4 shadow-2xl transition-all duration-300 hover:scale-110"
      >
        <ShoppingCart className="h-6 w-6" />
        {itemCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center animate-pulse">
            {itemCount}
          </span>
        )}
      </button>

      {/* Cart Sidebar */}
      <div className={`fixed inset-y-0 right-0 z-50 w-full max-w-md transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        {/* Backdrop */}
        <div 
          className="absolute inset-0 bg-black bg-opacity-50 lg:hidden"
          onClick={closeCart}
        />
        
        {/* Cart Content */}
        <div className="relative bg-white h-full shadow-2xl flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-primary-500 to-primary-600 text-white">
            <div className="flex items-center gap-3">
              <ShoppingBag className="h-6 w-6" />
              <div>
                <h2 className="text-xl font-bold">Votre Panier</h2>
                <p className="text-sm opacity-90">{itemCount} article{itemCount > 1 ? 's' : ''}</p>
              </div>
            </div>
            <button 
              onClick={closeCart}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Restaurant Info */}
          {currentRestaurant && (
            <div className="p-4 bg-gray-50 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full flex items-center justify-center">
                  <Store className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{currentRestaurant.name}</h3>
                  <p className="text-sm text-primary-600">{currentRestaurant.cuisine}</p>
                </div>
              </div>
            </div>
          )}

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                <ShoppingCart className="h-16 w-16 text-gray-300 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Panier vide</h3>
                <p className="text-gray-600">Ajoutez des plats pour commencer</p>
              </div>
            ) : (
              <div className="p-4 space-y-4">
                {items.map((item) => (
                  <div key={item.uniqueId} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                    <div className="flex items-start gap-3">
                      {/* Product Image */}
                      <div className="relative w-16 h-16 flex-shrink-0">
                        <Image
                          src={item.image || '/placeholder-food.jpg'}
                          alt={item.name}
                          fill
                          className="object-cover rounded-xl"
                        />
                      </div>

                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 text-sm mb-1">{item.name}</h4>
                        <p className="text-primary-600 font-bold text-sm mb-2">
                          {formatPrice(item.price)}
                        </p>

                        {/* Quantity Controls */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => updateQuantity(item.uniqueId, item.quantity - 1)}
                              className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="w-8 text-center font-semibold">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.uniqueId, item.quantity + 1)}
                              className="w-8 h-8 rounded-full bg-primary-100 hover:bg-primary-200 text-primary-600 flex items-center justify-center transition-colors"
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>

                          <button
                            onClick={() => removeItem(item.uniqueId)}
                            className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>

                        {/* Notes */}
                        <div className="mt-2">
                          {editingNotes === item.uniqueId ? (
                            <div className="space-y-2">
                              <textarea
                                value={noteText}
                                onChange={(e) => setNoteText(e.target.value)}
                                placeholder="Instructions spéciales..."
                                className="w-full text-xs p-2 border border-gray-200 rounded-lg resize-none"
                                rows={2}
                              />
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleNotesSave(item.uniqueId)}
                                  className="px-3 py-1 bg-primary-600 text-white text-xs rounded-lg hover:bg-primary-700 transition-colors"
                                >
                                  Sauvegarder
                                </button>
                                <button
                                  onClick={() => setEditingNotes(null)}
                                  className="px-3 py-1 text-gray-600 text-xs hover:text-gray-800 transition-colors"
                                >
                                  Annuler
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleNotesClick(item.uniqueId, item.notes || '')}
                              className="flex items-center gap-1 text-xs text-gray-500 hover:text-primary-600 transition-colors"
                            >
                              <MessageSquare className="h-3 w-3" />
                              {item.notes ? 'Modifier les notes' : 'Ajouter des notes'}
                            </button>
                          )}
                          {item.notes && editingNotes !== item.uniqueId && (
                            <p className="text-xs text-gray-600 mt-1 italic">"{item.notes}"</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer - Order Summary */}
          {items.length > 0 && (
            <div className="border-t border-gray-200 p-6 bg-gray-50">
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Sous-total</span>
                  <span className="font-semibold">{formatPrice(total)}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Truck className="h-4 w-4" />
                    <span>Livraison</span>
                  </div>
                  <span className="font-semibold">
                    {deliveryFee === 0 ? 'Gratuite' : formatPrice(deliveryFee)}
                  </span>
                </div>
                
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-primary-600">{formatPrice(finalTotal)}</span>
                  </div>
                </div>
              </div>

              <Link 
                href="/checkout"
                className="w-full bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-bold py-4 px-6 rounded-2xl transition-all duration-300 hover:shadow-lg transform hover:scale-105 flex items-center justify-center gap-2"
              >
                <ShoppingBag className="h-5 w-5" />
                Commander • {formatPrice(finalTotal)}
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  )
}