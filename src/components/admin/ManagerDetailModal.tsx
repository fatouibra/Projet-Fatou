'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { 
  X, 
  Edit, 
  User, 
  Mail, 
  Phone, 
  Building, 
  Shield, 
  Calendar, 
  CheckCircle, 
  XCircle,
  Key,
  Activity,
  MapPin,
  Clock,
  Star,
  TrendingUp
} from 'lucide-react'

interface Manager {
  id: string
  name: string
  email: string
  phone?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  restaurant?: {
    id: string
    name: string
    address: string
    phone: string
    rating: number
    deliveryFee: number
  }
  permissions: string[]
}

interface ManagerDetailModalProps {
  manager: Manager
  onClose: () => void
  onEdit: (manager: Manager) => void
}

export default function ManagerDetailModal({ manager, onClose, onEdit }: ManagerDetailModalProps) {
  const [stats, setStats] = useState({
    totalOrders: 0,
    monthlyOrders: 0,
    revenue: 0,
    avgRating: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (manager.restaurant) {
      fetchManagerStats()
    } else {
      setLoading(false)
    }
  }, [manager])

  const fetchManagerStats = async () => {
    try {
      const response = await fetch(`/api/admin/managers/${manager.id}/stats`)
      if (response.ok) {
        const data = await response.json()
        setStats(data.stats)
      }
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  const getPermissionColor = (permission: string) => {
    const colors = {
      'dashboard': 'bg-blue-100 text-blue-800',
      'products': 'bg-green-100 text-green-800',
      'orders': 'bg-orange-100 text-orange-800',
      'finances': 'bg-purple-100 text-purple-800',
      'profile': 'bg-gray-100 text-gray-800',
    }
    return colors[permission as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl mx-4 max-h-[95vh] overflow-hidden">
        {/* En-tête avec dégradé */}
        <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                <User className="h-8 w-8" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">{manager.name}</h2>
                <p className="text-blue-100">{manager.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                manager.isActive 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {manager.isActive ? 'Actif' : 'Inactif'}
              </span>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Badges de statut */}
          <div className="flex items-center gap-3 mt-4">
            <div className="flex items-center gap-1 bg-white/20 px-3 py-1 rounded-lg">
              <Building className="h-4 w-4" />
              <span className="text-sm">
                {manager.restaurant ? 'Avec restaurant' : 'Sans restaurant'}
              </span>
            </div>
            <div className="flex items-center gap-1 bg-white/20 px-3 py-1 rounded-lg">
              <Shield className="h-4 w-4" />
              <span className="text-sm">{manager.permissions.length} permissions</span>
            </div>
            <div className="flex items-center gap-1 bg-white/20 px-3 py-1 rounded-lg">
              <Calendar className="h-4 w-4" />
              <span className="text-sm">Depuis {formatDate(manager.createdAt)}</span>
            </div>
          </div>
        </div>

        {/* Corps du modal */}
        <div className="p-6 overflow-y-auto max-h-[calc(95vh-200px)]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Colonne gauche - Informations personnelles */}
            <div className="space-y-6">
              
              {/* Informations de contact */}
              <div className="bg-gray-50 p-4 rounded-xl">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <User className="h-5 w-5 text-blue-600" />
                  Informations personnelles
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-900">{manager.email}</span>
                  </div>
                  {manager.phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-900">{manager.phone}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">
                      Créé le {formatDate(manager.createdAt)}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">
                      Modifié le {formatDate(manager.updatedAt)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Permissions */}
              <div className="bg-gray-50 p-4 rounded-xl">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Shield className="h-5 w-5 text-purple-600" />
                  Permissions ({manager.permissions.length})
                </h3>
                <div className="flex flex-wrap gap-2">
                  {manager.permissions.map((permission, index) => (
                    <span 
                      key={index}
                      className={`px-3 py-1 rounded-lg text-sm font-medium ${getPermissionColor(permission)}`}
                    >
                      {permission}
                    </span>
                  ))}
                </div>
              </div>

              {/* Statut et actions */}
              <div className="bg-gray-50 p-4 rounded-xl">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Activity className="h-5 w-5 text-green-600" />
                  Statut du compte
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">État du compte</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      manager.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {manager.isActive ? 'Actif' : 'Inactif'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Restaurant assigné</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      manager.restaurant 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-orange-100 text-orange-800'
                    }`}>
                      {manager.restaurant ? 'Oui' : 'Non'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Colonne droite - Restaurant et statistiques */}
            <div className="space-y-6">
              
              {/* Restaurant assigné */}
              {manager.restaurant ? (
                <div className="bg-blue-50 p-4 rounded-xl">
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Building className="h-5 w-5 text-blue-600" />
                    Restaurant assigné
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium text-gray-900">{manager.restaurant.name}</h4>
                    </div>
                    <div className="flex items-center gap-3">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600 text-sm">{manager.restaurant.address}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600 text-sm">{manager.restaurant.phone}</span>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-blue-100">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-500" />
                        <span className="text-sm font-medium">{manager.restaurant.rating}</span>
                      </div>
                      <div className="text-sm text-gray-600">
                        Livraison: {manager.restaurant.deliveryFee} FCFA
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-orange-50 p-4 rounded-xl border border-orange-200">
                  <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <Building className="h-5 w-5 text-orange-600" />
                    Aucun restaurant assigné
                  </h3>
                  <p className="text-orange-700 text-sm">
                    Ce gestionnaire n'a pas encore de restaurant assigné. 
                    Vous pouvez lui en assigner un en modifiant ses informations.
                  </p>
                </div>
              )}

              {/* Statistiques */}
              {manager.restaurant && (
                <div className="bg-gray-50 p-4 rounded-xl">
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    Statistiques du restaurant
                  </h3>
                  {loading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="loading-spinner w-6 h-6"></div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-white rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">{stats.totalOrders}</div>
                        <div className="text-xs text-gray-600">Commandes totales</div>
                      </div>
                      <div className="text-center p-3 bg-white rounded-lg">
                        <div className="text-2xl font-bold text-green-600">{stats.monthlyOrders}</div>
                        <div className="text-xs text-gray-600">Ce mois</div>
                      </div>
                      <div className="text-center p-3 bg-white rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">
                          {stats.revenue.toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-600">CA (FCFA)</div>
                      </div>
                      <div className="text-center p-3 bg-white rounded-lg">
                        <div className="text-2xl font-bold text-orange-600">
                          {stats.avgRating.toFixed(1)}
                        </div>
                        <div className="text-xs text-gray-600">Note moyenne</div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer avec actions */}
        <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-t">
          <div className="text-sm text-gray-500">
            ID: {manager.id}
          </div>
          <div className="flex items-center gap-3">
            <Button 
              onClick={onClose}
              variant="outline"
            >
              Fermer
            </Button>
            <Button 
              onClick={() => onEdit(manager)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Edit className="h-4 w-4 mr-2" />
              Modifier
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}