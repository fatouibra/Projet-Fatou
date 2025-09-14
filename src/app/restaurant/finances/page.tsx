'use client'

import { useEffect, useState } from 'react'
import { useAuthStore } from '@/stores/auth'
import { formatPrice } from '@/lib/utils'
import {
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Package,
  Clock,
  Eye
} from 'lucide-react'
import Image from 'next/image'

interface FinancialStats {
  overview: {
    totalOrders: number
    completedOrders: number
    pendingOrders: number
    totalRevenue: number
    totalPendingRevenue: number
    averageOrderValue: number
  }
  topProducts: Array<{
    id: string
    name: string
    quantity: number
    revenue: number
    image?: string
  }>
  chartData: Array<{
    date: string
    orders: number
    revenue: number
  }>
  recentOrders: Array<{
    id: string
    orderNumber: string
    customerName: string
    total: number
    status: string
    createdAt: string
    itemsCount: number
  }>
}

export default function RestaurantFinances() {
  const { user } = useAuthStore()
  const [stats, setStats] = useState<FinancialStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState('30')
  const [customDateRange, setCustomDateRange] = useState({
    startDate: '',
    endDate: ''
  })
  const [showCustomDate, setShowCustomDate] = useState(false)

  useEffect(() => {
    if (user?.restaurantId) {
      fetchFinancialStats()
    }
  }, [user, selectedPeriod, customDateRange])

  const fetchFinancialStats = async () => {
    setLoading(true)
    try {
      let url = `/api/restaurant/${user?.restaurantId}/finances?period=${selectedPeriod}`
      
      if (showCustomDate && customDateRange.startDate && customDateRange.endDate) {
        url += `&startDate=${customDateRange.startDate}&endDate=${customDateRange.endDate}`
      }

      const response = await fetch(url)
      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          setStats(result.data)
        }
      }
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques financières:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePeriodChange = (period: string) => {
    setSelectedPeriod(period)
    if (period !== 'custom') {
      setShowCustomDate(false)
    } else {
      setShowCustomDate(true)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DELIVERED': return 'bg-green-100 text-green-800'
      case 'PREPARING': return 'bg-orange-100 text-orange-800'
      case 'READY': return 'bg-orange-100 text-orange-800'
      case 'RECEIVED': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'DELIVERED': return 'Livré'
      case 'PREPARING': return 'En préparation'
      case 'READY': return 'Prêt'
      case 'RECEIVED': return 'Reçu'
      default: return status
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="loading-spinner w-8 h-8"></div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <TrendingUp className="h-12 w-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Aucune donnée disponible
        </h3>
        <p className="text-gray-600">
          Les statistiques financières apparaîtront ici une fois que vous aurez des commandes.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* En-tête avec filtres */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <TrendingUp className="h-6 w-6" />
            Finances
          </h1>
          <p className="text-gray-600 mt-1">
            Analysez vos ventes et revenus
          </p>
        </div>

        {/* Filtres de période */}
        <div className="flex flex-wrap gap-2">
          <select
            value={selectedPeriod}
            onChange={(e) => handlePeriodChange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white"
          >
            <option value="7">7 derniers jours</option>
            <option value="30">30 derniers jours</option>
            <option value="90">90 derniers jours</option>
            <option value="all">Toutes les données</option>
            <option value="custom">Période personnalisée</option>
          </select>

          {showCustomDate && (
            <>
              <input
                type="date"
                value={customDateRange.startDate}
                onChange={(e) => setCustomDateRange({ ...customDateRange, startDate: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
              <input
                type="date"
                value={customDateRange.endDate}
                onChange={(e) => setCustomDateRange({ ...customDateRange, endDate: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </>
          )}
        </div>
      </div>

      {/* Statistiques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-orange-50 to-red-50 rounded-lg">
              <DollarSign className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Chiffre d'affaires</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatPrice(stats.overview.totalRevenue)}
              </p>
              {stats.overview.totalPendingRevenue > 0 && (
                <p className="text-xs text-orange-600">
                  +{formatPrice(stats.overview.totalPendingRevenue)} en attente
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-orange-50 to-red-50 rounded-lg">
              <ShoppingCart className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Commandes totales</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.overview.totalOrders}
              </p>
              <p className="text-xs text-green-600">
                {stats.overview.completedOrders} livrées
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-orange-50 to-red-50 rounded-lg">
              <TrendingUp className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Panier moyen</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatPrice(stats.overview.averageOrderValue)}
              </p>
              <p className="text-xs text-gray-600">
                Par commande livrée
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-orange-50 to-red-50 rounded-lg">
              <Clock className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">En cours</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.overview.pendingOrders}
              </p>
              <p className="text-xs text-orange-600">
                Commandes actives
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Graphique simple des ventes */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">Évolution des ventes (30 derniers jours)</h2>
        </div>
        <div className="p-6">
          <div className="h-64 flex items-end justify-between gap-1">
            {stats.chartData.slice(-15).map((day, index) => {
              const maxRevenue = Math.max(...stats.chartData.map(d => d.revenue))
              const height = maxRevenue > 0 ? (day.revenue / maxRevenue) * 200 : 0
              
              return (
                <div key={day.date} className="flex-1 flex flex-col items-center">
                  <div 
                    className="w-full bg-gradient-to-t from-orange-500 to-red-500 rounded-t-sm min-h-[4px] transition-all duration-300 hover:opacity-80 cursor-pointer"
                    style={{ height: `${height + 4}px` }}
                    title={`${new Date(day.date).toLocaleDateString('fr-FR')}: ${formatPrice(day.revenue)} (${day.orders} commandes)`}
                  />
                  <span className="text-xs text-gray-500 mt-2 transform -rotate-45 origin-left">
                    {new Date(day.date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })}
                  </span>
                </div>
              )
            })}
          </div>
          <div className="mt-4 text-center text-sm text-gray-600">
            Survolez les barres pour voir les détails
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top produits */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Package className="h-5 w-5 text-orange-600" />
              Produits les plus vendus
            </h2>
          </div>
          <div className="p-6">
            {stats.topProducts.length > 0 ? (
              <div className="space-y-4">
                {stats.topProducts.slice(0, 5).map((product, index) => (
                  <div key={product.id} className="flex items-center gap-4">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                      index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-orange-500' : 'bg-gray-300'
                    }`}>
                      {index + 1}
                    </div>
                    
                    <div className="w-12 h-12 relative rounded-lg overflow-hidden bg-gray-100">
                      {product.image ? (
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="h-5 w-5 text-gray-400" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 truncate">{product.name}</h3>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>{product.quantity} vendus</span>
                        <span className="font-medium text-orange-600">
                          {formatPrice(product.revenue)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">Aucune vente pour cette période</p>
            )}
          </div>
        </div>

        {/* Commandes récentes */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Eye className="h-5 w-5 text-orange-600" />
              Commandes récentes
            </h2>
          </div>
          <div className="p-6">
            {stats.recentOrders.length > 0 ? (
              <div className="space-y-4">
                {stats.recentOrders.slice(0, 6).map((order) => (
                  <div key={order.id} className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">#{order.orderNumber}</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                          {getStatusText(order.status)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        {order.customerName} • {order.itemsCount} article{order.itemsCount > 1 ? 's' : ''}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(order.createdAt).toLocaleString('fr-FR')}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-gray-900">
                        {formatPrice(order.total)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">Aucune commande pour cette période</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}