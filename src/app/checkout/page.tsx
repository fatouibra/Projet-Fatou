'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useCartStore } from '@/stores/cart'
import { formatPrice } from '@/lib/utils'
import { Header } from '@/components/client/Header'
import { toast } from '@/stores/toast'
import { 
  MapPin, 
  Phone, 
  Mail, 
  User, 
  CreditCard,
  Truck,
  Clock,
  Store,
  ShoppingBag,
  Check,
  ArrowLeft,
  AlertCircle
} from 'lucide-react'
import Image from 'next/image'

interface CustomerInfo {
  firstName: string
  lastName: string
  phone: string
  email: string
  address: string
  city: string
  postalCode: string
  notes?: string
}

interface PaymentMethod {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  available: boolean
}

export default function CheckoutPage() {
  const router = useRouter()
  const { 
    items, 
    total, 
    currentRestaurant, 
    getDeliveryFee, 
    getFinalTotal,
    clearCart 
  } = useCartStore()
  
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    address: '',
    city: 'Dakar',
    postalCode: '',
    notes: ''
  })
  
  const [selectedPayment, setSelectedPayment] = useState<string>('cash')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Partial<CustomerInfo>>({})

  // Redirect si panier vide
  useEffect(() => {
    if (items.length === 0) {
      router.push('/')
    }
  }, [items, router])

  const paymentMethods: PaymentMethod[] = [
    {
      id: 'cash',
      name: 'Paiement à la livraison',
      description: 'Payez en espèces à la réception',
      icon: <CreditCard className="h-5 w-5" />,
      available: true
    },
    {
      id: 'mobile',
      name: 'Mobile Money',
      description: 'Orange Money, Wave, Free Money',
      icon: <Phone className="h-5 w-5" />,
      available: true
    },
    {
      id: 'card',
      name: 'Carte bancaire',
      description: 'Visa, Mastercard (Bientôt disponible)',
      icon: <CreditCard className="h-5 w-5" />,
      available: false
    }
  ]

  const handleInputChange = (field: keyof CustomerInfo, value: string) => {
    setCustomerInfo(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Partial<CustomerInfo> = {}

    if (!customerInfo.firstName.trim()) {
      newErrors.firstName = 'Prénom requis'
    }
    if (!customerInfo.lastName.trim()) {
      newErrors.lastName = 'Nom requis'
    }
    if (!customerInfo.phone.trim()) {
      newErrors.phone = 'Téléphone requis'
    } else if (customerInfo.phone.length < 9) {
      newErrors.phone = 'Numéro de téléphone trop court (min 9 chiffres)'
    }
    if (!customerInfo.email.trim()) {
      newErrors.email = 'Email requis'
    } else if (!/\S+@\S+\.\S+/.test(customerInfo.email)) {
      newErrors.email = 'Email invalide'
    }
    if (!customerInfo.address.trim()) {
      newErrors.address = 'Adresse requise'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      // Préparer les données de la commande
      const orderData = {
        customerName: `${customerInfo.firstName} ${customerInfo.lastName}`,
        customerEmail: customerInfo.email,
        customerPhone: customerInfo.phone,
        address: `${customerInfo.address}, ${customerInfo.city}`,
        deliveryType: 'DELIVERY',
        paymentMethod: selectedPayment === 'cash' ? 'CASH_ON_DELIVERY' : selectedPayment,
        notes: customerInfo.notes,
        items: items.map(item => ({
          productId: item.id,
          quantity: item.quantity,
          price: item.price
        }))
      }

      // Envoyer la commande via API
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderData)
      })

      const result = await response.json()

      if (result.success) {
        // Afficher toast de succès
        toast.success(
          'Commande confirmée !', 
          `Numéro de commande: ${result.data.orderNumber}`, 
          6000
        )
        
        // Vider le panier
        clearCart()
        
        // Rediriger vers la page de confirmation après un délai
        setTimeout(() => {
          router.push(`/order-confirmation/${result.data.id}`)
        }, 2000)
      } else {
        throw new Error(result.error || 'Erreur lors de la commande')
      }
    } catch (error) {
      console.error('Erreur lors de la commande:', error)
      toast.error(
        'Erreur de commande',
        'Une erreur est survenue lors de la commande. Veuillez réessayer.'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ShoppingBag className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Panier vide</h2>
          <p className="text-gray-600">Redirection en cours...</p>
        </div>
      </div>
    )
  }

  const deliveryFee = getDeliveryFee()
  const finalTotal = getFinalTotal()

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary-50/20">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.back()}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Finaliser la commande</h1>
            <p className="text-gray-600">Vérifiez vos informations avant de confirmer</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Formulaire de commande */}
          <div className="lg:col-span-2 space-y-8">
            {/* Informations personnelles */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <User className="h-5 w-5 text-blue-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Informations personnelles</h2>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Prénom *
                    </label>
                    <input
                      type="text"
                      value={customerInfo.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                        errors.firstName ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Votre prénom"
                    />
                    {errors.firstName && (
                      <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nom *
                    </label>
                    <input
                      type="text"
                      value={customerInfo.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                        errors.lastName ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Votre nom"
                    />
                    {errors.lastName && (
                      <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Téléphone *
                    </label>
                    <input
                      type="tel"
                      value={customerInfo.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                        errors.phone ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="+221 77 123 45 67"
                    />
                    {errors.phone && (
                      <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      value={customerInfo.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                        errors.email ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="votre@email.com"
                    />
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Adresse de livraison *
                  </label>
                  <input
                    type="text"
                    value={customerInfo.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                      errors.address ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Votre adresse complète"
                  />
                  {errors.address && (
                    <p className="mt-1 text-sm text-red-600">{errors.address}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Instructions spéciales (optionnel)
                  </label>
                  <textarea
                    value={customerInfo.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Instructions pour la livraison..."
                  />
                </div>
              </form>
            </div>

            {/* Mode de paiement */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                  <CreditCard className="h-5 w-5 text-green-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Mode de paiement</h2>
              </div>
              
              <div className="space-y-4">
                {paymentMethods.map((method) => (
                  <div
                    key={method.id}
                    className={`relative flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all ${
                      selectedPayment === method.id
                        ? 'border-primary-500 bg-primary-50'
                        : method.available
                        ? 'border-gray-200 hover:border-gray-300'
                        : 'border-gray-100 bg-gray-50 cursor-not-allowed opacity-60'
                    }`}
                    onClick={() => method.available && setSelectedPayment(method.id)}
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className={`p-2 rounded-lg ${
                        selectedPayment === method.id ? 'bg-primary-100 text-primary-600' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {method.icon}
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{method.name}</h3>
                        <p className="text-sm text-gray-600">{method.description}</p>
                      </div>
                    </div>
                    
                    {method.available && (
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        selectedPayment === method.id
                          ? 'border-primary-500 bg-primary-500'
                          : 'border-gray-300'
                      }`}>
                        {selectedPayment === method.id && (
                          <Check className="h-3 w-3 text-white" />
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Résumé de commande */}
          <div className="space-y-6">
            {/* Restaurant */}
            {currentRestaurant && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl flex items-center justify-center">
                    <Store className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{currentRestaurant.name}</h3>
                    <p className="text-sm text-primary-600">{currentRestaurant.cuisine}</p>
                  </div>
                </div>
                
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>Livraison estimée: 25-40 min</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Truck className="h-4 w-4" />
                    <span>
                      {deliveryFee === 0 ? 'Livraison gratuite' : `Livraison ${formatPrice(deliveryFee)}`}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Articles */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-4">Votre commande ({items.length} article{items.length > 1 ? 's' : ''})</h3>
              
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.uniqueId} className="flex items-center gap-3">
                    <div className="relative w-12 h-12 flex-shrink-0">
                      <Image
                        src={item.image || '/placeholder-food.jpg'}
                        alt={item.name}
                        fill
                        className="object-cover rounded-lg"
                      />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 text-sm">{item.name}</h4>
                      <p className="text-xs text-gray-600">Quantité: {item.quantity}</p>
                      {item.notes && (
                        <p className="text-xs text-gray-500 italic">"{item.notes}"</p>
                      )}
                    </div>
                    
                    <p className="font-semibold text-gray-900">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Total */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="space-y-3">
                <div className="flex justify-between text-gray-600">
                  <span>Sous-total</span>
                  <span>{formatPrice(total)}</span>
                </div>
                
                <div className="flex justify-between text-gray-600">
                  <span>Livraison</span>
                  <span>{deliveryFee === 0 ? 'Gratuite' : formatPrice(deliveryFee)}</span>
                </div>
                
                <div className="border-t pt-3">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-primary-600">{formatPrice(finalTotal)}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full mt-6 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-4 px-6 rounded-2xl transition-all duration-300 hover:shadow-lg transform hover:scale-105 disabled:transform-none disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Commande en cours...
                  </>
                ) : (
                  <>
                    <Check className="h-5 w-5" />
                    Confirmer la commande
                  </>
                )}
              </button>

              <p className="text-xs text-gray-500 mt-4 text-center">
                En confirmant, vous acceptez nos conditions de vente
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}