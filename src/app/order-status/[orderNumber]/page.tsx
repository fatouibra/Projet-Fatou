'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Header } from '@/components/client/Header'
import { Button } from '@/components/ui/Button'
import { OrderTracker } from '@/components/client/OrderTracker'
import { Order } from '@/types'
import { toast } from '@/stores/toast'
import { 
  ArrowLeft,
  Package,
  RefreshCw
} from 'lucide-react'
import Link from 'next/link'

export default function OrderStatusPage() {
  const params = useParams()
  const router = useRouter()
  const orderNumber = params.orderNumber as string

  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchOrder = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/orders?orderNumber=${orderNumber}`)
      const data = await response.json()

      if (data.success && data.data.length > 0) {
        setOrder(data.data[0])
        setError(null)
      } else {
        setError('Commande non trouvée')
      }
    } catch (error) {
      console.error('Error fetching order:', error)
      setError('Erreur lors de la récupération de la commande')
      toast.error('Erreur', 'Impossible de charger les détails de la commande')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (orderNumber) {
      fetchOrder()
    }
  }, [orderNumber])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary-50/20">
        <Header />
        <main className="container mx-auto px-4 py-12">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="loading-spinner w-8 h-8 mx-auto mb-4"></div>
              <span className="text-gray-600">Chargement des détails de votre commande...</span>
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary-50/20">
        <Header />
        <main className="container mx-auto px-4 py-12">
          <div className="max-w-md mx-auto text-center">
            <Package className="h-16 w-16 text-gray-400 mx-auto mb-6" />
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              {error || 'Commande introuvable'}
            </h1>
            <p className="text-gray-600 mb-8">
              Vérifiez votre numéro de commande et réessayez.
            </p>
            <div className="space-x-4">
              <Link href="/my-orders">
                <Button>Mes commandes</Button>
              </Link>
              <Button variant="outline" onClick={() => router.back()}>
                Retour
              </Button>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary-50/20">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header avec retour et refresh */}
          <div className="flex items-center justify-between mb-8">
            <Link 
              href="/my-orders" 
              className="inline-flex items-center gap-3 text-primary-600 hover:text-primary-700 transition-colors font-semibold"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour à mes commandes
            </Link>
            
            <Button 
              variant="outline"
              onClick={fetchOrder}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Actualiser
            </Button>
          </div>

          {/* Titre de la page */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Suivi de votre commande
            </h1>
            <p className="text-lg text-gray-600">
              Commande #{orderNumber}
            </p>
          </div>

          {/* Order Tracker - Notre nouveau composant */}
          <OrderTracker order={order} />

          {/* Détails des produits */}
          <div className="mt-8 bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Articles commandés</h3>
            
            <div className="space-y-4">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between py-3 border-b last:border-b-0">
                  <div className="flex items-center gap-4">
                    {item.product?.image && (
                      <img 
                        src={item.product.image} 
                        alt={item.product.name}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                    )}
                    <div>
                      <h4 className="font-medium text-gray-900">{item.product?.name || 'Produit supprimé'}</h4>
                      <p className="text-sm text-gray-500">Quantité: {item.quantity}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      {(item.price * item.quantity).toLocaleString('fr-FR', { 
                        style: 'currency', 
                        currency: 'XOF',
                        minimumFractionDigits: 0 
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Aide et support */}
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6 text-center">
            <h4 className="text-lg font-semibold text-blue-900 mb-2">Besoin d'aide ?</h4>
            <p className="text-blue-700 mb-4">
              Si vous avez des questions sur votre commande, contactez-nous
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href={`tel:${order.restaurant?.phone || '+221 XX XXX XX XX'}`}>
                <Button variant="outline" className="w-full sm:w-auto">
                  Appeler le restaurant
                </Button>
              </Link>
              <Link href="/" as="/contact">
                <Button className="w-full sm:w-auto">
                  Contacter le support
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}