'use client'

import { useEffect, useState } from 'react'
import { useAuthStore } from '@/stores/auth'
import {
  TrendingUp,
  Package,
  ShoppingCart,
  Star,
  Clock,
  DollarSign,
  Users,
  ChefHat,
  AlertCircle,
  CheckCircle,
  Timer,
  Ban,
  Eye,
  Edit3,
  Plus
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

interface DashboardStats {
  totalOrders: number
  totalRevenue: number
  totalProducts: number
  averageRating: number
  pendingOrders: number
  completedOrders: number
  cancelledOrders: number
  recentOrders: Array<{
    id: string
    orderNumber: string
    customerName: string
    total: number
    status: string
    createdAt: string
  }>
  topSellingProducts?: Array<{
    id: string
    name: string
    totalSold: number
    revenue: number
    image?: string
    price: number
  }>
}

export default function RestaurantDashboard() {
  const { user } = useAuthStore()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user?.restaurantId) {
      fetchDashboardStats()
    }
  }, [user])

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch(`/api/restaurant/${user?.restaurantId}/dashboard`)
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'RECEIVED': { color: 'bg-orange-100 text-orange-800', icon: Clock, label: 'Reçue' },
      'PREPARING': { color: 'bg-yellow-100 text-yellow-800', icon: Timer, label: 'En préparation' },
      'READY': { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Prête' },
      'DELIVERED': { color: 'bg-gray-100 text-gray-800', icon: CheckCircle, label: 'Livrée' },
      'CANCELLED': { color: 'bg-red-100 text-red-800', icon: Ban, label: 'Annulée' },
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig['RECEIVED']
    const Icon = config.icon

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${config.color}`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </span>
    )
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
    }).format(price)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="loading-spinner w-8 h-8"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-4">
          {user?.restaurant?.image ? (
            <img 
              src={user.restaurant.image} 
              alt={user.restaurant.name} 
              className="w-16 h-16 rounded-xl object-cover border-2 border-white/20"
            />
          ) : (
            <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center">
              <ChefHat className="w-8 h-8" />
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold mb-1">
              Bienvenue, {user?.name} !
            </h1>
            <p className="text-orange-100">
              Tableau de bord - {user?.restaurant?.name}
            </p>
          </div>
        </div>
      </div>

      {/* Statistiques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-orange-50 rounded-lg">
              <ShoppingCart className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600 font-medium">Commandes totales</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.totalOrders || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-50 rounded-lg">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600 font-medium">Chiffre d'affaires</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatPrice(stats?.totalRevenue || 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-50 rounded-lg">
              <Package className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600 font-medium">Produits actifs</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.totalProducts || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-yellow-50 rounded-lg">
              <Star className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600 font-medium">Note moyenne</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats?.averageRating?.toFixed(1) || '0.0'}/5
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Commandes par statut */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-orange-50 rounded-lg">
              <Clock className="h-5 w-5 text-orange-600" />
            </div>
            <h3 className="font-semibold text-gray-900">En attente</h3>
          </div>
          <p className="text-3xl font-bold text-orange-600">{stats?.pendingOrders || 0}</p>
          <p className="text-sm text-gray-600 mt-1">Commandes à traiter</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-green-50 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Terminées</h3>
          </div>
          <p className="text-3xl font-bold text-green-600">{stats?.completedOrders || 0}</p>
          <p className="text-sm text-gray-600 mt-1">Commandes livrées</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-red-50 rounded-lg">
              <Ban className="h-5 w-5 text-red-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Annulées</h3>
          </div>
          <p className="text-3xl font-bold text-red-600">{stats?.cancelledOrders || 0}</p>
          <p className="text-sm text-gray-600 mt-1">Commandes annulées</p>
        </div>
      </div>

      {/* Section en deux colonnes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Commandes récentes */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Commandes récentes
              </h2>
              <Link 
                href="/restaurant/orders"
                className="text-orange-600 hover:text-orange-700 text-sm font-medium flex items-center gap-1"
              >
                Voir toutes →
              </Link>
            </div>
          </div>
          
          {stats?.recentOrders && stats.recentOrders.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {stats.recentOrders.slice(0, 4).map((order) => (
                <div key={order.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                        <span className="font-bold text-orange-600 text-xs">
                          #{order.orderNumber.slice(-3)}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{order.customerName}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(order.createdAt).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className="font-bold text-gray-900 text-sm">{formatPrice(order.total)}</p>
                      <div className="mt-1">
                        {getStatusBadge(order.status)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center">
              <ShoppingCart className="h-10 w-10 text-gray-300 mx-auto mb-3" />
              <h3 className="text-base font-medium text-gray-900 mb-1">Aucune commande</h3>
              <p className="text-sm text-gray-600">Les commandes récentes apparaîtront ici.</p>
            </div>
          )}
        </div>

        {/* Produits populaires */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Package className="h-5 w-5" />
                Produits populaires
              </h2>
              <Link 
                href="/restaurant/products"
                className="text-orange-600 hover:text-orange-700 text-sm font-medium flex items-center gap-1"
              >
                Gérer →
              </Link>
            </div>
          </div>
          
          {stats?.topSellingProducts && stats.topSellingProducts.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {stats.topSellingProducts.slice(0, 4).map((product, index) => (
                <div key={product.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                      {product.image ? (
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="h-6 w-6 text-gray-400" />
                        </div>
                      )}
                      <div className={`absolute -top-1 -left-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                        index === 0 ? 'bg-orange-500' : 
                        index === 1 ? 'bg-red-400' : 
                        index === 2 ? 'bg-red-600' : 'bg-gray-500'
                      }`}>
                        {index + 1}
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900 text-sm truncate">{product.name}</h4>
                          <p className="text-xs text-gray-500">
                            {product.totalSold} vendus • {formatPrice(product.price)}
                          </p>
                        </div>
                        <div className="text-right flex-shrink-0 ml-3">
                          <p className="font-bold text-orange-600 text-sm">
                            {formatPrice(product.revenue)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center">
              <Package className="h-10 w-10 text-gray-300 mx-auto mb-3" />
              <h3 className="text-base font-medium text-gray-900 mb-1">Aucune donnée</h3>
              <p className="text-sm text-gray-600 mb-4">Vos produits populaires apparaîtront ici après vos premières ventes.</p>
              <Link href="/restaurant/products">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-50 text-orange-600 rounded-lg hover:bg-orange-100 transition-colors text-sm font-medium">
                  <Plus className="h-4 w-4" />
                  Ajouter des produits
                </div>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Actions rapides */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <a
          href="/restaurant/products"
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow group"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 bg-orange-50 rounded-lg group-hover:bg-orange-100 transition-colors">
              <Package className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Gérer les produits</h3>
              <p className="text-sm text-gray-600">Ajouter, modifier vos plats</p>
            </div>
          </div>
        </a>

        <a
          href="/restaurant/orders"
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow group"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-50 rounded-lg group-hover:bg-green-100 transition-colors">
              <ShoppingCart className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Voir les commandes</h3>
              <p className="text-sm text-gray-600">Gérer les nouvelles commandes</p>
            </div>
          </div>
        </a>

        <a
          href="/restaurant/profile"
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow group"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-50 rounded-lg group-hover:bg-red-100 transition-colors">
              <Users className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Profil restaurant</h3>
              <p className="text-sm text-gray-600">Modifier les informations</p>
            </div>
          </div>
        </a>
      </div>
    </div>
  )
}