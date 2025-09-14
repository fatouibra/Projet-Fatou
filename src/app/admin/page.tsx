'use client'

import { useEffect, useState } from 'react'
import { useAuthStore } from '@/stores/auth'
import { formatPrice } from '@/lib/utils'
import Link from 'next/link'
import { 
  Users, 
  Store, 
  TrendingUp, 
  AlertCircle,
  Package,
  ShoppingCart,
  Euro,
  Clock,
  Activity,
  RefreshCw,
  CheckCircle,
  XCircle
} from 'lucide-react'

interface DashboardStats {
  restaurants: {
    total: number
    active: number
    inactive: number
  }
  users: {
    total: number
    admins: number
    restaurateurs: number
    customers: number
  }
  products: {
    total: number
  }
  orders: {
    total: number
    pending: number
    completed: number
    cancelled: number
  }
  revenue: {
    total: number
    averageOrderValue: number
  }
  activity: Array<{
    id: string
    type: string
    description: string
    amount: number
    time: string
  }>
}

export default function AdminDashboard() {
  const { user } = useAuthStore()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/dashboard/stats')
      const result = await response.json()
      
      if (response.ok && result.success) {
        setStats(result.data)
        setError('')
      } else {
        setError(result.message || 'Erreur lors du chargement des statistiques')
      }
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error)
      setError('Erreur de connexion')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="loading-spinner w-8 h-8"></div>
      </div>
    )
  }

  if (error || !stats) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-red-600" />
          <div className="flex-1">
            <p className="text-red-800">{error || 'Impossible de charger les statistiques'}</p>
          </div>
          <button
            onClick={fetchStats}
            className="text-red-600 hover:text-red-800"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Bienvenue, {user?.name}
          </h1>
          <p className="text-gray-600 mt-1">
            Tableau de bord administrateur - Vue d'ensemble du système
          </p>
        </div>
        <button
          onClick={fetchStats}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Actualiser
        </button>
      </div>

      {/* Statistiques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Restaurants */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Restaurants</p>
              <div className="flex items-center gap-2 mt-2">
                <p className="text-2xl font-bold text-gray-900">{stats.restaurants.total}</p>
                <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                  {stats.restaurants.active} actifs
                </span>
              </div>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Store className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4">
            <Link 
              href="/admin/restaurants"
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Gérer les restaurants →
            </Link>
          </div>
        </div>

        {/* Utilisateurs */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Utilisateurs</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{stats.users.total}</p>
              <div className="flex gap-2 text-xs text-gray-500 mt-1">
                <span>{stats.users.admins} admins</span>
                <span>•</span>
                <span>{stats.users.restaurateurs} resto</span>
                <span>•</span>
                <span>{stats.users.customers} clients</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Users className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4">
            <Link 
              href="/admin/users"
              className="text-sm text-green-600 hover:text-green-700 font-medium"
            >
              Gérer les utilisateurs →
            </Link>
          </div>
        </div>

        {/* Commandes */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Commandes</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{stats.orders.total}</p>
              <div className="flex gap-2 text-xs mt-1">
                <span className="text-yellow-600">{stats.orders.pending} en attente</span>
                <span className="text-green-600">{stats.orders.completed} livrées</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <ShoppingCart className="h-6 w-6 text-orange-600" />
            </div>
          </div>
          <div className="mt-4">
            <Link 
              href="/admin/orders"
              className="text-sm text-orange-600 hover:text-orange-700 font-medium"
            >
              Voir les commandes →
            </Link>
          </div>
        </div>

        {/* Chiffre d'affaires */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Chiffre d'affaires</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {formatPrice(stats.revenue.total)}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Panier moyen : {formatPrice(stats.revenue.averageOrderValue)}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4">
            <Link 
              href="/admin/finances"
              className="text-sm text-purple-600 hover:text-purple-700 font-medium"
            >
              Voir les finances →
            </Link>
          </div>
        </div>
      </div>

      {/* Statistiques détaillées */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Vue d'ensemble des statuts */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">État du système</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium text-gray-700">Restaurants actifs</span>
              </div>
              <span className="text-sm font-bold text-gray-900">
                {stats.restaurants.active}/{stats.restaurants.total}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Package className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-medium text-gray-700">Produits disponibles</span>
              </div>
              <span className="text-sm font-bold text-gray-900">{stats.products.total}</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-yellow-600" />
                <span className="text-sm font-medium text-gray-700">Commandes en attente</span>
              </div>
              <span className="text-sm font-bold text-gray-900">{stats.orders.pending}</span>
            </div>

            {stats.orders.cancelled > 0 && (
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <XCircle className="h-5 w-5 text-red-600" />
                  <span className="text-sm font-medium text-gray-700">Commandes annulées</span>
                </div>
                <span className="text-sm font-bold text-gray-900">{stats.orders.cancelled}</span>
              </div>
            )}
          </div>
        </div>

        {/* Activité récente */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Activité récente</h3>
          {stats.activity.length > 0 ? (
            <div className="space-y-3">
              {stats.activity.slice(0, 5).map((item, index) => (
                <div key={item.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                    <Activity className="h-4 w-4 text-primary-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {item.description}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(item.time).toLocaleString('fr-FR')}
                    </p>
                  </div>
                  <div className="text-sm font-bold text-gray-900">
                    {formatPrice(item.amount)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Activity className="mx-auto h-12 w-12 text-gray-300" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Aucune activité récente</h3>
              <p className="mt-1 text-sm text-gray-500">
                L'activité apparaîtra ici une fois que des commandes seront passées.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Actions rapides */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions rapides</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link 
            href="/admin/restaurants"
            className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <Store className="h-8 w-8 text-blue-600" />
            <div>
              <p className="font-medium text-blue-900">Gérer les restaurants</p>
              <p className="text-sm text-blue-600">Approuver, modifier, désactiver</p>
            </div>
          </Link>

          <Link 
            href="/admin/orders"
            className="flex items-center gap-3 p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
          >
            <ShoppingCart className="h-8 w-8 text-green-600" />
            <div>
              <p className="font-medium text-green-900">Suivre les commandes</p>
              <p className="text-sm text-green-600">Vue globale des commandes</p>
            </div>
          </Link>

          <Link 
            href="/admin/users"
            className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
          >
            <Users className="h-8 w-8 text-purple-600" />
            <div>
              <p className="font-medium text-purple-900">Gérer les utilisateurs</p>
              <p className="text-sm text-purple-600">Comptes et permissions</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}