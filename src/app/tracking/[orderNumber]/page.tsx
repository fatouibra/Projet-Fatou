'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Header } from '@/components/client/Header'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { OrderTracker } from '@/components/client/OrderTracker'
import { Order } from '@/types'
import { toast } from '@/stores/toast'
import { formatPrice, formatDate, getStatusText, getDeliveryTypeText, getEstimatedTime } from '@/lib/utils'
import { 
  Clock, 
  MapPin, 
  Phone, 
  Mail, 
  Package, 
  Truck, 
  CheckCircle, 
  ChefHat,
  Car,
  Home,
  Star,
  RefreshCw,
  ArrowLeft
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

export default function TrackingPage() {
  const params = useParams()
  const orderNumber = params.orderNumber as string
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (orderNumber) {
      fetchOrder()
    }
  }, [orderNumber])

  const fetchOrder = async () => {
    try {
      const response = await fetch(`/api/orders?orderNumber=${orderNumber}`)
      const data = await response.json()
      
      if (data.success && data.data.length > 0) {
        setOrder(data.data[0])
      } else {
        setError('Commande introuvable')
      }
    } catch (error) {
      setError('Erreur lors du chargement de la commande')
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string, isActive = false, isCompleted = false) => {
    const baseClass = "h-6 w-6 transition-all duration-300"
    const className = isCompleted ? "text-white" : isActive ? "text-primary-600" : "text-gray-400"
    
    switch (status) {
      case 'RECEIVED':
        return <Package className={`${baseClass} ${className}`} />
      case 'PREPARING':
        return <ChefHat className={`${baseClass} ${className}`} />
      case 'READY':
        return <CheckCircle className={`${baseClass} ${className}`} />
      case 'DELIVERING':
        return <Car className={`${baseClass} ${className}`} />
      case 'DELIVERED':
        return <Home className={`${baseClass} ${className}`} />
      default:
        return <Package className={`${baseClass} ${className}`} />
    }
  }

  const getStatusSteps = () => [
    { key: 'RECEIVED', label: 'Commande reçue', description: 'Votre commande a été reçue' },
    { key: 'PREPARING', label: 'Préparation', description: 'Nos chefs préparent vos plats' },
    { key: 'READY', label: 'Prête', description: 'Votre commande est prête' },
    { key: 'DELIVERING', label: 'En livraison', description: 'En route vers vous' },
    { key: 'DELIVERED', label: 'Livrée', description: 'Commande livrée avec succès' }
  ]

  const getStatusProgress = (status: string) => {
    const statusOrder = ['RECEIVED', 'PREPARING', 'READY', 'DELIVERING', 'DELIVERED']
    const currentIndex = statusOrder.indexOf(status)
    return ((currentIndex + 1) / statusOrder.length) * 100
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="container mx-auto px-4 py-12">
          <div className="flex items-center justify-center">
            <div className="loading-spinner w-8 h-8"></div>
            <span className="ml-2 text-gray-600">Chargement...</span>
          </div>
        </main>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="container mx-auto px-4 py-12">
          <div className="max-w-md mx-auto text-center">
            <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              {error || 'Commande introuvable'}
            </h1>
            <p className="text-gray-600 mb-8">
              Vérifiez votre numéro de commande et réessayez.
            </p>
            <Link href="/my-orders">
              <Button>Mes commandes</Button>
            </Link>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary-50/20">
      <Header />
      
      {/* Hero Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 via-transparent to-primary-600/10 pointer-events-none"></div>
      
      <main className="relative container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Back Button */}
          <div className="mb-8 animate-fade-in-up">
            <Link 
              href="/my-orders" 
              className="inline-flex items-center gap-3 text-primary-600 hover:text-primary-700 transition-all duration-300 font-semibold bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg hover:shadow-xl hover:scale-105"
            >
              <ArrowLeft className="h-4 w-4" />
              Mes commandes
            </Link>
          </div>

          {/* Order Header */}
          <div className="bg-gradient-to-br from-white via-white to-primary-50/30 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/50 mb-8 animate-fade-in-scale">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <Package className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl lg:text-4xl font-black bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">
                      Commande #{orderNumber}
                    </h1>
                    <p className="text-gray-600 font-medium">
                      Passée le {formatDate(new Date(order.createdAt))}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <button 
                  onClick={fetchOrder}
                  className="p-3 bg-white/80 hover:bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
                  title="Actualiser"
                >
                  <RefreshCw className="h-5 w-5 text-gray-600" />
                </button>
                
                <div className="bg-gradient-to-r from-primary-100 to-pink-100 rounded-2xl p-4 shadow-lg">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(order.status, true)}
                    <span className="font-bold text-primary-700">
                      {getStatusText(order.status)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Status Timeline */}
            <div className="mb-8">
              <div className="relative">
                {/* Progress Line */}
                <div className="absolute top-6 left-6 right-6 h-1 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full"></div>
                <div 
                  className="absolute top-6 left-6 h-1 bg-gradient-to-r from-primary-500 via-primary-400 to-pink-500 rounded-full transition-all duration-1000 ease-out"
                  style={{ 
                    width: `calc(${getStatusProgress(order.status)}% - 48px)`,
                    maxWidth: 'calc(100% - 48px)'
                  }}
                ></div>
                
                {/* Steps */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {getStatusSteps().map((step, index) => {
                    const statusOrder = ['RECEIVED', 'PREPARING', 'READY', 'DELIVERING', 'DELIVERED']
                    const currentIndex = statusOrder.indexOf(order.status)
                    const isCompleted = index < currentIndex
                    const isActive = index === currentIndex
                    const isPending = index > currentIndex
                    
                    return (
                      <div key={step.key} className="flex flex-col items-center text-center">
                        {/* Icon Circle */}
                        <div className={`
                          relative w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 mb-3 shadow-lg
                          ${isCompleted ? 'bg-gradient-to-br from-green-500 to-green-600 scale-110' : 
                            isActive ? 'bg-gradient-to-br from-primary-500 to-primary-600 scale-110 animate-pulse' : 
                            'bg-white border-2 border-gray-200'}
                        `}>
                          {getStatusIcon(step.key, isActive, isCompleted)}
                          
                          {isCompleted && (
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                              <CheckCircle className="h-3 w-3 text-white" />
                            </div>
                          )}
                        </div>
                        
                        {/* Labels */}
                        <div className="space-y-1">
                          <p className={`font-bold text-sm transition-colors ${
                            isCompleted || isActive ? 'text-primary-700' : 'text-gray-400'
                          }`}>
                            {step.label}
                          </p>
                          <p className={`text-xs transition-colors ${
                            isCompleted || isActive ? 'text-gray-600' : 'text-gray-400'
                          }`}>
                            {step.description}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Estimated Time */}
            {order.status !== 'DELIVERED' && order.status !== 'CANCELLED' && (
              <div className="bg-gradient-to-r from-primary-50 via-pink-50 to-primary-50 rounded-2xl p-6 border border-primary-100">
                <div className="flex items-center justify-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center">
                    <Clock className="h-5 w-5 text-white animate-pulse" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600 font-medium">Temps estimé</p>
                    <p className="text-xl font-black bg-gradient-to-r from-primary-600 to-pink-500 bg-clip-text text-transparent">
                      {getEstimatedTime(order.status)}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            {/* Order Details */}
            <div className="space-y-6">
              {/* Customer Info */}
              <div className="bg-gradient-to-br from-white/80 to-gray-50/80 backdrop-blur-sm rounded-3xl p-6 shadow-xl border border-white/30 hover:shadow-2xl transition-all duration-300">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <Phone className="h-5 w-5 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Informations client</h2>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-white/60 rounded-2xl border border-gray-100">
                    <div className="w-8 h-8 bg-primary-100 rounded-xl flex items-center justify-center">
                      <span className="text-primary-600 font-bold text-sm">
                        {order.customerName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{order.customerName}</p>
                      <p className="text-sm text-gray-500">Nom du client</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-white/60 rounded-2xl border border-gray-100">
                    <div className="w-8 h-8 bg-green-100 rounded-xl flex items-center justify-center">
                      <Phone className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{order.customerPhone}</p>
                      <p className="text-sm text-gray-500">Téléphone</p>
                    </div>
                  </div>
                  
                  {order.customerEmail && (
                    <div className="flex items-center gap-3 p-3 bg-white/60 rounded-2xl border border-gray-100">
                      <div className="w-8 h-8 bg-purple-100 rounded-xl flex items-center justify-center">
                        <Mail className="h-4 w-4 text-purple-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{order.customerEmail}</p>
                        <p className="text-sm text-gray-500">Email</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Delivery Info */}
              <div className="bg-gradient-to-br from-white/80 to-gray-50/80 backdrop-blur-sm rounded-3xl p-6 shadow-xl border border-white/30 hover:shadow-2xl transition-all duration-300">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg">
                    {order.deliveryType === 'DELIVERY' ? <Truck className="h-5 w-5 text-white" /> : <Package className="h-5 w-5 text-white" />}
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Livraison</h2>
                </div>
                
                <div className="space-y-4">
                  <div className="p-4 bg-gradient-to-r from-orange-50 to-orange-100 rounded-2xl border border-orange-200">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-orange-800">Type de livraison</span>
                      <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                        {getDeliveryTypeText(order.deliveryType)}
                      </span>
                    </div>
                  </div>
                  
                  {order.address && (
                    <div className="flex items-start gap-3 p-3 bg-white/60 rounded-2xl border border-gray-100">
                      <div className="w-8 h-8 bg-red-100 rounded-xl flex items-center justify-center mt-1">
                        <MapPin className="h-4 w-4 text-red-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 leading-relaxed">{order.address}</p>
                        <p className="text-sm text-gray-500">Adresse de livraison</p>
                      </div>
                    </div>
                  )}
                  
                  {order.notes && (
                    <div className="space-y-2">
                      <p className="font-bold text-gray-900">Notes spéciales :</p>
                      <div className="p-4 bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-2xl border border-yellow-200">
                        <p className="text-gray-700 leading-relaxed">{order.notes}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="bg-gradient-to-br from-white/80 to-gray-50/80 backdrop-blur-sm rounded-3xl p-6 shadow-xl border border-white/30 hover:shadow-2xl transition-all duration-300">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Package className="h-5 w-5 text-white" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Articles commandés</h2>
              </div>
              
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 p-4 bg-white/60 rounded-2xl border border-gray-100 hover:shadow-lg transition-all duration-300">
                    <div className="relative w-16 h-16 rounded-2xl overflow-hidden shadow-lg">
                      <Image
                        src={item.product.image || '/placeholder-food.jpg'}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 mb-1">{item.product.name}</h3>
                      <div className="flex items-center gap-2">
                        <span className="bg-primary-100 text-primary-700 px-2 py-1 rounded-full text-xs font-bold">
                          Qté: {item.quantity}
                        </span>
                        <span className="text-gray-500">×</span>
                        <span className="text-gray-600 font-medium">{formatPrice(item.price)}</span>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-xl font-black bg-gradient-to-r from-primary-600 to-pink-500 bg-clip-text text-transparent">
                        {formatPrice(item.price * item.quantity)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Summary */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="bg-gradient-to-r from-primary-50 via-pink-50 to-primary-50 rounded-2xl p-6 border border-primary-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center">
                        <Star className="h-4 w-4 text-white" />
                      </div>
                      <span className="text-lg font-bold text-gray-900">Total de la commande</span>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-black bg-gradient-to-r from-primary-600 via-primary-500 to-pink-500 bg-clip-text text-transparent">
                        {formatPrice(order.total)}
                      </div>
                      <p className="text-sm text-gray-500 font-medium">TTC, frais inclus</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-12 animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
            <div className="bg-gradient-to-br from-white/80 to-gray-50/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/30">
              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                <Link href="/" className="group">
                  <Button 
                    className="h-14 px-8 bg-gradient-to-r from-primary-600 via-primary-500 to-pink-500 hover:from-primary-700 hover:via-primary-600 hover:to-pink-600 shadow-xl hover:shadow-2xl transform group-hover:scale-105 transition-all duration-300 rounded-2xl text-lg font-bold"
                    size="lg"
                  >
                    <Package className="h-5 w-5 mr-3" />
                    Continuer mes achats
                  </Button>
                </Link>
                
                <Link href="/my-orders" className="group">
                  <Button 
                    variant="outline" 
                    className="h-14 px-8 border-2 border-primary-300 text-primary-700 hover:bg-primary-50 hover:border-primary-400 shadow-lg hover:shadow-xl transform group-hover:scale-105 transition-all duration-300 rounded-2xl text-lg font-bold"
                    size="lg"
                  >
                    <Clock className="h-5 w-5 mr-3" />
                    Mes commandes
                  </Button>
                </Link>
              </div>
              
              <div className="mt-6 text-center">
                <p className="text-gray-600 font-medium">
                  Besoin d'aide ? 
                  <a href="tel:0123456789" className="text-primary-600 hover:text-primary-700 font-bold ml-2 hover:underline">
                    📞 01 23 45 67 89
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}