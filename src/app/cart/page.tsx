'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/client/Header'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useCartStore } from '@/stores/cart'
import { formatPrice } from '@/lib/utils'
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

export default function CartPage() {
  const router = useRouter()
  const { items, total, updateQuantity, removeItem, clearCart } = useCartStore()
  const [isOrdering, setIsOrdering] = useState(false)
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    address: '',
    deliveryType: 'DELIVERY' as 'DELIVERY' | 'PICKUP',
    notes: ''
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const deliveryFee = formData.deliveryType === 'DELIVERY' ? 3.50 : 0
  const finalTotal = total + deliveryFee

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.customerName.trim()) {
      newErrors.customerName = 'Le nom est requis'
    }

    if (!formData.customerPhone.trim()) {
      newErrors.customerPhone = 'Le téléphone est requis'
    } else if (!/^[0-9\s+\-()]{8,}$/.test(formData.customerPhone)) {
      newErrors.customerPhone = 'Format de téléphone invalide'
    }

    if (!formData.address.trim() && formData.deliveryType === 'DELIVERY') {
      newErrors.address = 'L\'adresse est requise pour la livraison'
    }

    if (formData.customerEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.customerEmail)) {
      newErrors.customerEmail = 'Format d\'email invalide'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmitOrder = async () => {
    if (!validateForm()) return
    if (items.length === 0) return

    setIsOrdering(true)
    
    try {
      const orderItems = items.map(item => ({
        productId: item.id,
        quantity: item.quantity,
        price: item.price
      }))

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          items: orderItems
        })
      })

      const data = await response.json()

      if (data.success) {
        clearCart()
        router.push(`/tracking/${data.data.orderNumber}`)
      } else {
        alert('Erreur lors de la commande. Veuillez réessayer.')
      }
    } catch (error) {
      alert('Erreur lors de la commande. Veuillez réessayer.')
    } finally {
      setIsOrdering(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="container mx-auto px-4 py-12">
          <div className="max-w-md mx-auto text-center">
            <ShoppingBag className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Votre panier est vide
            </h1>
            <p className="text-gray-600 mb-8">
              Découvrez nos délicieux plats et commencez votre commande.
            </p>
            <Link href="/">
              <Button>Voir le menu</Button>
            </Link>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Mon panier</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Cart Items */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold mb-4">Articles ({items.length})</h2>
            
            {items.map((item) => (
              <div key={item.id} className="card">
                <div className="flex items-center space-x-4">
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden">
                    <Image
                      src={item.image || '/placeholder-food.jpg'}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{item.name}</h3>
                    <p className="text-gray-600">{formatPrice(item.price)}</p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="p-1"
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    
                    <span className="w-8 text-center font-semibold">
                      {item.quantity}
                    </span>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="p-1"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeItem(item.id)}
                    className="text-red-500 hover:text-red-700 p-1"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Order Form */}
          <div className="card">
            <h2 className="text-xl font-semibold mb-6">Informations de livraison</h2>
            
            <div className="space-y-4">
              <Input
                label="Nom complet *"
                value={formData.customerName}
                onChange={(e) => handleInputChange('customerName', e.target.value)}
                error={errors.customerName}
                placeholder="Votre nom"
              />

              <Input
                label="Téléphone *"
                value={formData.customerPhone}
                onChange={(e) => handleInputChange('customerPhone', e.target.value)}
                error={errors.customerPhone}
                placeholder="06 12 34 56 78"
              />

              <Input
                label="Email (optionnel)"
                type="email"
                value={formData.customerEmail}
                onChange={(e) => handleInputChange('customerEmail', e.target.value)}
                error={errors.customerEmail}
                placeholder="votre@email.com"
              />

              {/* Delivery Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mode de livraison *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleInputChange('deliveryType', 'DELIVERY')}
                    className={`p-3 border rounded-xl font-medium transition-colors ${
                      formData.deliveryType === 'DELIVERY'
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-gray-300 hover:border-primary-300'
                    }`}
                  >
                    Livraison
                  </button>
                  <button
                    type="button"
                    onClick={() => handleInputChange('deliveryType', 'PICKUP')}
                    className={`p-3 border rounded-xl font-medium transition-colors ${
                      formData.deliveryType === 'PICKUP'
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-gray-300 hover:border-primary-300'
                    }`}
                  >
                    À emporter
                  </button>
                </div>
              </div>

              {formData.deliveryType === 'DELIVERY' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Adresse de livraison *
                  </label>
                  <textarea
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    className={`input-field h-20 ${errors.address ? 'border-red-500' : ''}`}
                    placeholder="Adresse complète"
                  />
                  {errors.address && (
                    <p className="mt-1 text-sm text-red-600">{errors.address}</p>
                  )}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes (optionnel)
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  className="input-field h-16"
                  placeholder="Instructions spéciales..."
                />
              </div>
            </div>

            {/* Order Summary */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Sous-total</span>
                  <span>{formatPrice(total)}</span>
                </div>
                
                {formData.deliveryType === 'DELIVERY' && (
                  <div className="flex justify-between">
                    <span>Frais de livraison</span>
                    <span>{formatPrice(deliveryFee)}</span>
                  </div>
                )}
                
                <div className="flex justify-between font-bold text-lg pt-2 border-t">
                  <span>Total</span>
                  <span className="text-primary-600">{formatPrice(finalTotal)}</span>
                </div>
              </div>

              <Button
                onClick={handleSubmitOrder}
                isLoading={isOrdering}
                className="w-full mt-6"
                size="lg"
              >
                Confirmer la commande
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}