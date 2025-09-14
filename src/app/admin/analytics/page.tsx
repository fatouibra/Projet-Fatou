'use client'

import { useState, useEffect } from 'react'
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  ShoppingCart, 
  DollarSign, 
  Calendar,
  Download,
  Filter,
  Eye,
  Store
} from 'lucide-react'

interface AnalyticsData {
  totalRevenue: number
  totalOrders: number
  totalCustomers: number
  totalRestaurants: number
  revenueGrowth: number
  ordersGrowth: number
  customersGrowth: number
  topRestaurants: Array<{
    id: string
    name: string
    revenue: number
    orders: number
    growth: number
  }>
  revenueByMonth: Array<{
    month: string
    revenue: number
    orders: number
  }>
  ordersByStatus: Array<{
    status: string
    count: number
    percentage: number
  }>
  categoryPerformance: Array<{
    category: string
    revenue: number
    orders: number
    avgOrderValue: number
  }>
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState('30d')
  const [selectedMetric, setSelectedMetric] = useState('revenue')

  // Mock data
  const mockAnalytics: AnalyticsData = {
    totalRevenue: 45250.75,
    totalOrders: 1234,
    totalCustomers: 567,
    totalRestaurants: 8,
    revenueGrowth: 12.5,
    ordersGrowth: 8.3,
    customersGrowth: 15.7,
    topRestaurants: [
      {
        id: '1',
        name: 'Chez Luigi',
        revenue: 12500.00,
        orders: 320,
        growth: 18.5
      },
      {
        id: '2',
        name: 'Burger House',
        revenue: 9800.50,
        orders: 280,
        growth: 12.3
      },
      {
        id: '3',
        name: 'Tokyo Sushi',
        revenue: 8750.25,
        orders: 195,
        growth: 25.7
      },
      {
        id: '4',
        name: 'Green Garden',
        revenue: 6200.00,
        orders: 150,
        growth: -5.2
      },
      {
        id: '5',
        name: 'Pizza Express',
        revenue: 4800.75,
        orders: 125,
        growth: 8.9
      }
    ],
    revenueByMonth: [
      { month: 'Jan', revenue: 32500, orders: 850 },
      { month: 'Fév', revenue: 38200, orders: 920 },
      { month: 'Mar', revenue: 41800, orders: 1050 },
      { month: 'Avr', revenue: 39500, orders: 980 },
      { month: 'Mai', revenue: 45250, orders: 1234 },
    ],
    ordersByStatus: [
      { status: 'Livrées', count: 985, percentage: 79.8 },
      { status: 'En cours', count: 156, percentage: 12.6 },
      { status: 'Annulées', count: 93, percentage: 7.6 }
    ],
    categoryPerformance: [
      { category: 'Pizza', revenue: 15680.00, orders: 420, avgOrderValue: 37.33 },
      { category: 'Burger', revenue: 12450.75, orders: 380, avgOrderValue: 32.77 },
      { category: 'Sushi', revenue: 8920.50, orders: 185, avgOrderValue: 48.22 },
      { category: 'Salade', revenue: 4200.25, orders: 145, avgOrderValue: 28.97 },
      { category: 'Desserts', revenue: 3999.25, orders: 104, avgOrderValue: 38.45 }
    ]
  }

  useEffect(() => {
    setTimeout(() => {
      setAnalytics(mockAnalytics)
      setLoading(false)
    }, 1000)
  }, [selectedPeriod])

  const exportData = () => {
    if (!analytics) return
    
    const data = {
      period: selectedPeriod,
      exportDate: new Date().toISOString(),
      ...analytics
    }
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `analytics-${selectedPeriod}-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="loading-spinner w-8 h-8"></div>
      </div>
    )
  }

  if (!analytics) return null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <BarChart3 className="h-7 w-7 text-primary-600" />
            Analytics & Insights
          </h1>
          <p className="text-gray-600">Analyses détaillées de la performance de la plateforme</p>
        </div>
        
        <div className="flex items-center gap-3">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="7d">7 derniers jours</option>
            <option value="30d">30 derniers jours</option>
            <option value="90d">3 derniers mois</option>
            <option value="1y">12 derniers mois</option>
          </select>
          
          <button
            onClick={exportData}
            className="inline-flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Download className="h-4 w-4" />
            Exporter
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Chiffre d'affaires</p>
              <p className="text-2xl font-bold text-gray-900">
                {analytics.totalRevenue.toLocaleString('fr-FR', { style: 'currency', currency: 'XOF' })}
              </p>
              <div className={`flex items-center text-sm mt-1 ${
                analytics.revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {analytics.revenueGrowth >= 0 ? (
                  <TrendingUp className="h-4 w-4 mr-1" />
                ) : (
                  <TrendingDown className="h-4 w-4 mr-1" />
                )}
                {Math.abs(analytics.revenueGrowth).toFixed(1)}%
              </div>
            </div>
            <DollarSign className="h-8 w-8 text-green-600" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Commandes</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.totalOrders.toLocaleString()}</p>
              <div className={`flex items-center text-sm mt-1 ${
                analytics.ordersGrowth >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {analytics.ordersGrowth >= 0 ? (
                  <TrendingUp className="h-4 w-4 mr-1" />
                ) : (
                  <TrendingDown className="h-4 w-4 mr-1" />
                )}
                {Math.abs(analytics.ordersGrowth).toFixed(1)}%
              </div>
            </div>
            <ShoppingCart className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Clients</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.totalCustomers.toLocaleString()}</p>
              <div className={`flex items-center text-sm mt-1 ${
                analytics.customersGrowth >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {analytics.customersGrowth >= 0 ? (
                  <TrendingUp className="h-4 w-4 mr-1" />
                ) : (
                  <TrendingDown className="h-4 w-4 mr-1" />
                )}
                {Math.abs(analytics.customersGrowth).toFixed(1)}%
              </div>
            </div>
            <Users className="h-8 w-8 text-purple-600" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Restaurants</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.totalRestaurants}</p>
              <div className="text-sm text-gray-500 mt-1">Restaurants actifs</div>
            </div>
            <Store className="h-8 w-8 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Revenue Trend Chart */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Évolution du chiffre d'affaires</h3>
          <div className="flex items-center gap-2">
            <select
              value={selectedMetric}
              onChange={(e) => setSelectedMetric(e.target.value)}
              className="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-primary-500"
            >
              <option value="revenue">Chiffre d'affaires</option>
              <option value="orders">Nombre de commandes</option>
            </select>
          </div>
        </div>
        
        <div className="h-64 flex items-end justify-between space-x-2">
          {analytics.revenueByMonth.map((data, index) => {
            const value = selectedMetric === 'revenue' ? data.revenue : data.orders
            const maxValue = Math.max(...analytics.revenueByMonth.map(d => 
              selectedMetric === 'revenue' ? d.revenue : d.orders
            ))
            const height = (value / maxValue) * 200
            
            return (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div className="w-full flex items-end justify-center mb-2">
                  <div
                    className="w-full bg-primary-500 rounded-t transition-all duration-300 hover:bg-primary-600 cursor-pointer relative group"
                    style={{ height: `${height}px` }}
                  >
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                      {selectedMetric === 'revenue' 
                        ? value.toLocaleString('fr-FR', { style: 'currency', currency: 'XOF' })
                        : value.toLocaleString()
                      }
                    </div>
                  </div>
                </div>
                <span className="text-sm text-gray-600 font-medium">{data.month}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Orders Status & Top Restaurants */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Orders by Status */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Statut des commandes</h3>
          <div className="space-y-4">
            {analytics.ordersByStatus.map((status, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ 
                      backgroundColor: index === 0 ? '#10B981' : index === 1 ? '#F59E0B' : '#EF4444'
                    }}
                  />
                  <span className="text-sm font-medium text-gray-700">{status.status}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-900 font-semibold">
                    {status.count.toLocaleString()}
                  </span>
                  <span className="text-xs text-gray-500">
                    ({status.percentage.toFixed(1)}%)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Restaurants */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Restaurants</h3>
          <div className="space-y-4">
            {analytics.topRestaurants.map((restaurant, index) => (
              <div key={restaurant.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-primary-600 font-semibold text-sm">#{index + 1}</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{restaurant.name}</p>
                    <p className="text-sm text-gray-500">{restaurant.orders} commandes</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">
                    {restaurant.revenue.toLocaleString('fr-FR', { style: 'currency', currency: 'XOF' })}
                  </p>
                  <div className={`flex items-center text-sm ${
                    restaurant.growth >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {restaurant.growth >= 0 ? (
                      <TrendingUp className="h-3 w-3 mr-1" />
                    ) : (
                      <TrendingDown className="h-3 w-3 mr-1" />
                    )}
                    {Math.abs(restaurant.growth).toFixed(1)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Category Performance */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance par catégorie</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Catégorie
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Chiffre d'affaires
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Commandes
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Panier moyen
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Part du CA
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {analytics.categoryPerformance.map((category, index) => {
                const revenueShare = (category.revenue / analytics.totalRevenue) * 100
                
                return (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="text-sm font-medium text-gray-900">{category.category}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {category.revenue.toLocaleString('fr-FR', { style: 'currency', currency: 'XOF' })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {category.orders.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {category.avgOrderValue.toLocaleString('fr-FR', { style: 'currency', currency: 'XOF' })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                          <div 
                            className="bg-primary-600 h-2 rounded-full"
                            style={{ width: `${revenueShare}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-900 font-medium">
                          {revenueShare.toFixed(1)}%
                        </span>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}