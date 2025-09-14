'use client'

import { useState, useEffect } from 'react'
import { X, User, Mail, Phone, Building, Shield, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface Restaurant {
  id: string
  name: string
}

interface ManagerCreateModalProps {
  onClose: () => void
  onSuccess: () => void
}

export default function ManagerCreateModal({ onClose, onSuccess }: ManagerCreateModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    restaurantId: '',
    permissions: [] as string[]
  })
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [availablePermissions] = useState([
    'MANAGE_MENU',
    'MANAGE_ORDERS',
    'VIEW_ANALYTICS',
    'MANAGE_PROMOTIONS'
  ])
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [generatedPassword, setGeneratedPassword] = useState('')

  useEffect(() => {
    fetchRestaurants()
    generatePassword()
  }, [])

  const fetchRestaurants = async () => {
    try {
      const response = await fetch('/api/restaurants')
      const data = await response.json()
      if (data.success) {
        setRestaurants(data.data)
      }
    } catch (error) {
      console.error('Error fetching restaurants:', error)
    }
  }

  const generatePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789'
    let password = ''
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setGeneratedPassword(password)
  }

  const handlePermissionToggle = (permission: string) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permission)
        ? prev.permissions.filter(p => p !== permission)
        : [...prev.permissions, permission]
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name || !formData.email || !formData.restaurantId) {
      alert('Veuillez remplir tous les champs obligatoires')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/admin/managers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          password: generatedPassword
        })
      })

      const data = await response.json()

      if (data.success) {
        alert(`Gestionnaire créé avec succès!\nMot de passe temporaire: ${generatedPassword}\nLe gestionnaire devra le changer lors de sa première connexion.`)
        onSuccess()
        onClose()
      } else {
        alert(data.error || 'Erreur lors de la création')
      }
    } catch (error) {
      console.error('Error creating manager:', error)
      alert('Erreur lors de la création du gestionnaire')
    } finally {
      setLoading(false)
    }
  }

  const getPermissionLabel = (permission: string) => {
    switch (permission) {
      case 'MANAGE_MENU': return 'Gérer le menu'
      case 'MANAGE_ORDERS': return 'Gérer les commandes'
      case 'VIEW_ANALYTICS': return 'Voir les statistiques'
      case 'MANAGE_PROMOTIONS': return 'Gérer les promotions'
      default: return permission
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <User className="h-6 w-6" />
                Nouveau gestionnaire
              </h2>
              <p className="text-orange-100 mt-1">Créer un compte gestionnaire de restaurant</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-orange-200 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Informations personnelles */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <User className="h-5 w-5" />
              Informations personnelles
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom complet *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Ex: Jean Dupont"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="email@exemple.com"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Téléphone
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="+221 77 123 45 67"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Restaurant *
                </label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <select
                    value={formData.restaurantId}
                    onChange={(e) => setFormData(prev => ({ ...prev, restaurantId: e.target.value }))}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    required
                  >
                    <option value="">Sélectionner un restaurant</option>
                    {restaurants.map(restaurant => (
                      <option key={restaurant.id} value={restaurant.id}>
                        {restaurant.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Mot de passe généré */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Mot de passe temporaire
            </h3>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="relative flex-1">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={generatedPassword}
                    readOnly
                    className="w-full px-3 py-2 bg-white border border-amber-300 rounded-lg font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <Button
                  type="button"
                  onClick={generatePassword}
                  variant="outline"
                  size="sm"
                >
                  Générer nouveau
                </Button>
              </div>
              <p className="text-sm text-amber-700">
                Ce mot de passe sera envoyé au gestionnaire qui devra le changer lors de sa première connexion.
              </p>
            </div>
          </div>

          {/* Permissions */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Permissions
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {availablePermissions.map(permission => (
                <label
                  key={permission}
                  className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={formData.permissions.includes(permission)}
                    onChange={() => handlePermissionToggle(permission)}
                    className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    {getPermissionLabel(permission)}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              disabled={loading}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {loading ? 'Création...' : 'Créer le gestionnaire'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}