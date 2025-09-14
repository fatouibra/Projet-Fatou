'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Header } from '@/components/client/Header'
import { formatPrice } from '@/lib/utils'
import { 
  CheckCircle, 
  Clock, 
  Truck, 
  Phone, 
  MapPin,
  User,
  Store,
  Receipt,
  Home,
  RefreshCw
} from 'lucide-react'

interface Order {
  id: string
  orderNumber: string
  status: string
  customerName: string
  customerPhone: string
  customerEmail: string
  deliveryAddress: string
  notes?: string
  paymentMethod: string
  subtotal: number
  deliveryFee: number
  total: number
  createdAt: string
  restaurant: {
    id: string
    name: string
    phone: string
    cuisine: string
  }
  items: Array<{
    id: string
    productName: string
    quantity: number
    price: number
    notes?: string
  }>
}

export default function OrderConfirmationPage() {
  const params = useParams()
  const orderId = params.id as string
  
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (orderId) {
      fetchOrder()
    }
  }, [orderId])

  const fetchOrder = async () => {
    try {
      const response = await fetch(`/api/orders/${orderId}`)
      const data = await response.json()
      
      if (data.success) {
        setOrder(data.data)
      } else {
        setError('Commande non trouvée')
      }
    } catch (error) {
      setError('Erreur lors du chargement de la commande')
    } finally {
      setLoading(false)
    }
  }

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'RECEIVED':
        return {
          label: 'Commande reçue',
          color: 'text-blue-600 bg-blue-100',
          icon: <Receipt className="h-5 w-5" />
        }
      case 'PREPARING':
        return {
          label: 'En préparation',
          color: 'text-yellow-600 bg-yellow-100',
          icon: <Clock className="h-5 w-5" />
        }
      case 'READY':
        return {
          label: 'Prête',
          color: 'text-purple-600 bg-purple-100',
          icon: <CheckCircle className="h-5 w-5" />
        }
      case 'DELIVERING':
        return {
          label: 'En livraison',
          color: 'text-indigo-600 bg-indigo-100',
          icon: <Truck className="h-5 w-5" />
        }
      case 'DELIVERED':
        return {
          label: 'Livrée',
          color: 'text-green-600 bg-green-100',
          icon: <CheckCircle className="h-5 w-5" />
        }
      default:
        return {
          label: 'En cours',
          color: 'text-gray-600 bg-gray-100',
          icon: <Clock className="h-5 w-5" />
        }
    }
  }

  const getPaymentMethodName = (method: string) => {
    switch (method) {
      case 'cash':
        return 'Paiement à la livraison'
      case 'mobile':
        return 'Mobile Money'
      case 'card':
        return 'Carte bancaire'
      default:
        return method
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary-50/20">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center py-16">
            <div className="loading-spinner w-12 h-12"></div>
            <span className="ml-4 text-xl text-gray-600 font-medium">Chargement de la commande...</span>
          </div>
        </div>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary-50/20">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-16">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">{error}</h1>
            <Link 
              href="/" 
              className="inline-flex items-center gap-2 bg-primary-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-primary-700 transition-colors"
            >
              <Home className="h-4 w-4" />
              Retour à l'accueil
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const statusInfo = getStatusInfo(order.status)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary-50/20">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Commande confirmée !</h1>
          <p className="text-gray-600 text-lg">Votre commande a été transmise au restaurant</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Détails de la commande */}
          <div className="lg:col-span-2 space-y-6">
            {/* Statut et numéro */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-2">
                    Commande #{order.orderNumber}
                  </h2>
                  <p className="text-gray-600">
                    Passée le {new Date(order.createdAt).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-semibold ${statusInfo.color}`}>
                  {statusInfo.icon}
                  {statusInfo.label}
                </div>
              </div>
              
              <div className="mt-6 pt-6 border-t border-gray-200">
                <button
                  onClick={fetchOrder}
                  className="flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium"
                >
                  <RefreshCw className="h-4 w-4" />
                  Actualiser le statut
                </button>
              </div>
            </div>

            {/* Restaurant */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl flex items-center justify-center">
                  <Store className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{order.restaurant.name}</h3>
                  <p className="text-sm text-primary-600">{order.restaurant.cuisine}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  <span>{order.restaurant.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>Livraison estimée: 25-40 min</span>
                </div>
              </div>
            </div>

            {/* Articles commandés */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-4">
                Articles commandés ({order.items.length})
              </h3>
              
              <div className="space-y-4">
                {order.items.map((item, index) => (
                  <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{item.productName}</h4>
                      <p className="text-sm text-gray-600">Quantité: {item.quantity}</p>
                      {item.notes && (
                        <p className="text-sm text-gray-500 italic">"{item.notes}"</p>
                      )}
                    </div>
                    
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                      <p className="text-sm text-gray-600">
                        {formatPrice(item.price)} × {item.quantity}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Informations de livraison */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Truck className="h-5 w-5 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Informations de livraison</h3>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <User className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">{order.customerName}</p>
                    <p className="text-sm text-gray-600">{order.customerPhone}</p>
                    <p className="text-sm text-gray-600">{order.customerEmail}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">Adresse de livraison</p>
                    <p className="text-sm text-gray-600">{order.deliveryAddress}</p>
                  </div>
                </div>
                
                {order.notes && (
                  <div className="flex items-start gap-3">
                    <Receipt className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-900">Instructions spéciales</p>
                      <p className="text-sm text-gray-600">"{order.notes}"</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Récapitulatif */}
          <div className="space-y-6">
            {/* Facture */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-4">Récapitulatif</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between text-gray-600">
                  <span>Sous-total</span>
                  <span>{formatPrice(order.subtotal)}</span>
                </div>
                
                <div className="flex justify-between text-gray-600">
                  <span>Livraison</span>
                  <span>
                    {order.deliveryFee === 0 ? 'Gratuite' : formatPrice(order.deliveryFee)}
                  </span>
                </div>
                
                <div className="border-t pt-3">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-primary-600">{formatPrice(order.total)}</span>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  <strong>Mode de paiement:</strong> {getPaymentMethodName(order.paymentMethod)}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-4">
              <Link
                href={`/order-status/${order.orderNumber}`}
                className="block w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 px-6 rounded-2xl transition-colors text-center"
              >
                Suivre ma commande
              </Link>
              
              <Link
                href="/my-orders"
                className="block w-full bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 px-6 rounded-2xl transition-colors text-center"
              >
                Voir mes commandes
              </Link>
              
              <Link
                href="/"
                className="block w-full bg-white hover:bg-gray-50 text-gray-700 font-medium py-3 px-6 rounded-2xl border border-gray-300 transition-colors text-center"
              >
                Continuer mes achats
              </Link>
            </div>

            {/* Support */}
            <div className="bg-gradient-to-r from-primary-50 to-primary-100 rounded-2xl p-6">
              <h3 className="font-semibold text-gray-900 mb-2">Besoin d'aide ?</h3>
              <p className="text-sm text-gray-600 mb-4">
                Notre équipe est là pour vous aider
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-primary-600" />
                  <span>+221 77 000 00 00</span>
                </div>
                <div className="flex items-center gap-2">
                  <Receipt className="h-4 w-4 text-primary-600" />
                  <span>support@mnufood.com</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}