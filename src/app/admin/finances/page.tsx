'use client'

import { useEffect, useState } from 'react'
import {
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Package,
  Store,
  Users,
  Eye,
  Calendar,
  ArrowUp,
  ArrowDown,
  Euro
} from 'lucide-react'

interface FinancialData {
  overview: {
    totalRevenue: number
    monthlyRevenue: number
    totalOrders: number
    monthlyOrders: number
    averageOrderValue: number
    totalRestaurants: number
    activeRestaurants: number
    commission: number
  }
  revenueByRestaurant: Array<{
    id: string
    name: string
    revenue: number
    orders: number
    commission: number
    growth: number
  }>
  monthlyTrends: Array<{
    month: string
    revenue: number
    orders: number
    commission: number
  }>
  topPerformers: Array<{
    id: string
    name: string
    totalRevenue: number
    avgRating: number
    totalOrders: number
  }>
}

export default function AdminFinancesPage() {
  const [financialData, setFinancialData] = useState<FinancialData | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState('month')

  // Mock data
  const mockData: FinancialData = {
    overview: {
      totalRevenue: 125000,
      monthlyRevenue: 28500,
      totalOrders: 1547,
      monthlyOrders: 342,
      averageOrderValue: 25.50,
      totalRestaurants: 8,
      activeRestaurants: 6,
      commission: 18750
    },
    revenueByRestaurant: [
      {
        id: '1',
        name: 'Chez Luigi',
        revenue: 35000,
        orders: 245,
        commission: 5250,
        growth: 12.5
      },
      {
        id: '2',
        name: 'Burger House',
        revenue: 28000,
        orders: 198,
        commission: 4200,
        growth: 8.3
      },
      {
        id: '3',
        name: 'Tokyo Sushi',
        revenue: 25000,
        orders: 167,
        commission: 3750,
        growth: 15.2
      },
      {
        id: '4',
        name: 'Green Garden',
        revenue: 18500,
        orders: 124,
        commission: 2775,
        growth: -2.1
      },
      {
        id: '5',
        name: 'Pizza Express',
        revenue: 12000,
        orders: 89,
        commission: 1800,
        growth: 5.8
      },
      {
        id: '6',
        name: 'Tacos Loco',
        revenue: 6500,
        orders: 56,
        commission: 975,
        growth: -8.5
      }
    ],
    monthlyTrends: [
      { month: 'Jan', revenue: 22000, orders: 289, commission: 3300 },
      { month: 'Fév', revenue: 25500, orders: 312, commission: 3825 },
      { month: 'Mar', revenue: 28000, orders: 356, commission: 4200 },
      { month: 'Avr', revenue: 24500, orders: 298, commission: 3675 },
      { month: 'Mai', revenue: 28500, orders: 342, commission: 4275 }
    ],
    topPerformers: [
      { id: '1', name: 'Chez Luigi', totalRevenue: 35000, avgRating: 4.8, totalOrders: 245 },
      { id: '2', name: 'Burger House', totalRevenue: 28000, avgRating: 4.6, totalOrders: 198 },
      { id: '3', name: 'Tokyo Sushi', totalRevenue: 25000, avgRating: 4.9, totalOrders: 167 }
    ]
  }

  useEffect(() => {
    setTimeout(() => {
      setFinancialData(mockData)
      setLoading(false)
    }, 1000)
  }, [selectedPeriod])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!financialData) return null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <TrendingUp className="h-7 w-7 text-primary-600" />
            Finances & Analytics
          </h1>
          <p className="text-gray-600">Vue d'ensemble des performances financières</p>
        </div>
        
        <select
          value={selectedPeriod}
          onChange={(e) => setSelectedPeriod(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        >
          <option value="week">Cette semaine</option>
          <option value="month">Ce mois</option>
          <option value="quarter">Ce trimestre</option>
          <option value="year">Cette année</option>
        </select>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Chiffre d'affaires total</p>
              <p className="text-2xl font-bold text-gray-900">
                {financialData.overview.totalRevenue.toLocaleString()} XOF
              </p>
              <p className="text-sm text-green-600 flex items-center gap-1 mt-1">
                <ArrowUp className="h-3 w-3" />
                +12.5% vs mois dernier
              </p>
            </div>
            <DollarSign className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Commandes totales</p>
              <p className="text-2xl font-bold text-gray-900">
                {financialData.overview.totalOrders.toLocaleString()}
              </p>
              <p className="text-sm text-blue-600 flex items-center gap-1 mt-1">
                <ArrowUp className="h-3 w-3" />
                +8.3% vs mois dernier
              </p>
            </div>
            <ShoppingCart className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Panier moyen</p>
              <p className="text-2xl font-bold text-gray-900">
                {financialData.overview.averageOrderValue.toFixed(2)} XOF
              </p>
              <p className="text-sm text-orange-600 flex items-center gap-1 mt-1">
                <ArrowUp className="h-3 w-3" />
                +3.8% vs mois dernier
              </p>
            </div>
            <Package className="h-8 w-8 text-orange-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Commission (15%)</p>
              <p className="text-2xl font-bold text-gray-900">
                {financialData.overview.commission.toLocaleString()} XOF
              </p>
              <p className="text-sm text-purple-600 flex items-center gap-1 mt-1">
                <ArrowUp className="h-3 w-3" />
                +12.5% vs mois dernier
              </p>
            </div>
            <Euro className="h-8 w-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Revenue Trend Chart */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Évolution mensuelle</h3>
        </div>
        
        <div className="h-64 flex items-end justify-between space-x-2">
          {financialData.monthlyTrends.map((data, index) => {
            const maxRevenue = Math.max(...financialData.monthlyTrends.map(d => d.revenue))
            const height = (data.revenue / maxRevenue) * 200
            
            return (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div className="w-full flex items-end justify-center mb-2">
                  <div
                    className="w-full bg-primary-500 rounded-t transition-all duration-300 hover:bg-primary-600 cursor-pointer relative group"
                    style={{ height: `${height}px` }}
                  >
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                      {data.revenue.toLocaleString()} XOF
                    </div>
                  </div>
                </div>
                <span className="text-sm text-gray-600 font-medium">{data.month}</span>
                <span className="text-xs text-gray-500">{data.orders} cmd</span>
              </div>
            )
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue by Restaurant */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenus par restaurant</h3>
          
          <div className="space-y-4">
            {financialData.revenueByRestaurant.map((restaurant) => (
              <div key={restaurant.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                    <Store className="h-5 w-5 text-primary-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{restaurant.name}</p>
                    <p className="text-sm text-gray-500">{restaurant.orders} commandes</p>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="font-semibold text-gray-900">
                    {restaurant.revenue.toLocaleString()} XOF
                  </p>
                  <div className={`flex items-center text-sm ${
                    restaurant.growth >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {restaurant.growth >= 0 ? (
                      <ArrowUp className="h-3 w-3 mr-1" />
                    ) : (
                      <ArrowDown className="h-3 w-3 mr-1" />
                    )}
                    {Math.abs(restaurant.growth).toFixed(1)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Performers */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performers</h3>
          
          <div className="space-y-4">
            {financialData.topPerformers.map((performer, index) => (
              <div key={performer.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                    index === 0 ? 'bg-yellow-500' : 
                    index === 1 ? 'bg-gray-400' : 'bg-orange-500'
                  }`}>
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{performer.name}</p>
                    <p className="text-sm text-gray-500">
                      ⭐ {performer.avgRating.toFixed(1)} • {performer.totalOrders} commandes
                    </p>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="font-semibold text-gray-900">
                    {performer.totalRevenue.toLocaleString()} XOF
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Commission Details */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Détail des commissions (15%)</h3>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Restaurant
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Chiffre d'affaires
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Commission
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Commandes
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Croissance
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {financialData.revenueByRestaurant.map((restaurant) => (
                <tr key={restaurant.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center mr-3">
                        <Store className="h-4 w-4 text-primary-600" />
                      </div>
                      <div className="text-sm font-medium text-gray-900">{restaurant.name}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {restaurant.revenue.toLocaleString()} XOF
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                    {restaurant.commission.toLocaleString()} XOF
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {restaurant.orders}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`flex items-center text-sm ${
                      restaurant.growth >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {restaurant.growth >= 0 ? (
                        <ArrowUp className="h-4 w-4 mr-1" />
                      ) : (
                        <ArrowDown className="h-4 w-4 mr-1" />
                      )}
                      {Math.abs(restaurant.growth).toFixed(1)}%
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}