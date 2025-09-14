'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  User,
  Save,
  Mail,
  Lock,
  Phone,
  ChefHat,
  AlertCircle,
  ArrowLeft,
  Key,
  UserPlus
} from 'lucide-react'

interface Restaurant {
  id: string
  name: string
  cuisine: string
  email: string
  phone: string
}

interface Manager {
  id?: string
  email: string
  name: string
  phone?: string
  password: string
  permissions: string[]
}

const availablePermissions = [
  { key: 'dashboard', label: 'Dashboard', description: 'Accès au tableau de bord' },
  { key: 'products', label: 'Produits', description: 'Gérer les produits du restaurant' },
  { key: 'orders', label: 'Commandes', description: 'Gérer les commandes' },
  { key: 'finances', label: 'Finances', description: 'Voir les rapports financiers' },
  { key: 'profile', label: 'Profil', description: 'Modifier le profil du restaurant' }
]

export default function RestaurantManagerPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const restaurantId = params.id
  
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [manager, setManager] = useState<Manager | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    fetchData()
  }, [restaurantId])

  const fetchData = async () => {
    try {
      // Récupérer les infos du restaurant
      const restaurantResponse = await fetch(`/api/restaurants/${restaurantId}`)
      if (restaurantResponse.ok) {
        const restaurantData = await restaurantResponse.json()
        if (restaurantData.success) {
          setRestaurant(restaurantData.data)
        }
      }

      // Vérifier s'il existe déjà un manager
      const managerResponse = await fetch(`/api/admin/restaurant-manager?restaurantId=${restaurantId}`)
      if (managerResponse.ok) {
        const managerData = await managerResponse.json()
        if (managerData.manager) {
          const permissions = managerData.manager.permissions ? managerData.manager.permissions.split(',') : []
          setManager({
            ...managerData.manager,
            permissions,
            password: '' // Ne pas afficher le mot de passe existant
          })
          setIsEditing(true)
        } else {
          // Nouveau manager - valeurs par défaut
          setManager({
            email: '',
            name: '',
            phone: '',
            password: '',
            permissions: ['dashboard', 'products', 'orders', 'profile', 'finances']
          })
        }
      }
    } catch (error) {
      console.error('Erreur lors du chargement:', error)
      setMessage({ type: 'error', text: 'Erreur lors du chargement des données' })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!manager || !restaurant) return

    setSaving(true)
    setMessage(null)

    try {
      const url = isEditing 
        ? `/api/admin/restaurant-manager/${manager.id}`
        : '/api/admin/restaurant-manager'
      
      const method = isEditing ? 'PUT' : 'POST'
      
      let requestData = {
        ...manager,
        restaurantId,
        permissions: manager.permissions.join(',')
      }

      // Si on modifie et qu'il n'y a pas de nouveau mot de passe, on ne l'envoie pas
      if (isEditing && !manager.password) {
        const { password, ...dataWithoutPassword } = requestData
        requestData = dataWithoutPassword as typeof requestData
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      })

      const data = await response.json()

      if (response.ok) {
        setMessage({ 
          type: 'success', 
          text: isEditing 
            ? 'Gestionnaire mis à jour avec succès' 
            : 'Gestionnaire créé avec succès' 
        })
        
        if (!isEditing) {
          // Si c'était une création, passer en mode édition
          setIsEditing(true)
          setManager(prev => ({ ...prev!, id: data.manager.id }))
        }
      } else {
        setMessage({ type: 'error', text: data.error || 'Erreur lors de l\'enregistrement' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erreur lors de l\'enregistrement' })
    } finally {
      setSaving(false)
    }
  }

  const handlePermissionChange = (permission: string, checked: boolean) => {
    if (!manager) return
    
    const newPermissions = checked
      ? [...manager.permissions, permission]
      : manager.permissions.filter(p => p !== permission)
    
    setManager({ ...manager, permissions: newPermissions })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="loading-spinner w-8 h-8"></div>
      </div>
    )
  }

  if (!restaurant) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Restaurant non trouvé</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <UserPlus className="h-6 w-6" />
              {isEditing ? 'Modifier le gestionnaire' : 'Créer un gestionnaire'}
            </h1>
            <p className="text-gray-600 mt-1">
              Pour le restaurant: <span className="font-medium">{restaurant.name}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Message de feedback */}
      {message && (
        <div className={`p-4 rounded-xl border ${
          message.type === 'success' 
            ? 'bg-green-50 border-green-200 text-green-700'
            : 'bg-red-50 border-red-200 text-red-700'
        }`}>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            <span>{message.text}</span>
          </div>
        </div>
      )}

      {/* Informations du restaurant */}
      <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-6 border border-orange-100">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-orange-200 rounded-xl flex items-center justify-center">
            <ChefHat className="h-6 w-6 text-orange-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{restaurant.name}</h2>
            <p className="text-gray-600">{restaurant.cuisine}</p>
            <p className="text-sm text-gray-500">{restaurant.email} • {restaurant.phone}</p>
          </div>
        </div>
      </div>

      {/* Formulaire du gestionnaire */}
      {manager && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <User className="inline h-4 w-4 mr-1" />
                  Nom complet
                </label>
                <input
                  type="text"
                  value={manager.name}
                  onChange={(e) => setManager({ ...manager, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <Mail className="inline h-4 w-4 mr-1" />
                  Adresse email
                </label>
                <input
                  type="email"
                  value={manager.email}
                  onChange={(e) => setManager({ ...manager, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <Phone className="inline h-4 w-4 mr-1" />
                  Téléphone
                </label>
                <input
                  type="tel"
                  value={manager.phone || ''}
                  onChange={(e) => setManager({ ...manager, phone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <Lock className="inline h-4 w-4 mr-1" />
                  {isEditing ? 'Nouveau mot de passe' : 'Mot de passe'}
                </label>
                <input
                  type="password"
                  value={manager.password}
                  onChange={(e) => setManager({ ...manager, password: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  required={!isEditing}
                  placeholder={isEditing ? 'Laisser vide pour ne pas changer' : ''}
                />
                {isEditing && (
                  <p className="text-xs text-gray-500 mt-1">
                    Laisser vide pour conserver le mot de passe actuel
                  </p>
                )}
              </div>
            </div>

            {/* Permissions */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Key className="h-5 w-5" />
                Permissions d'accès
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {availablePermissions.map((permission) => (
                  <div
                    key={permission.key}
                    className="flex items-start gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <input
                      type="checkbox"
                      id={`permission-${permission.key}`}
                      checked={manager.permissions.includes(permission.key)}
                      onChange={(e) => handlePermissionChange(permission.key, e.target.checked)}
                      className="mt-1 h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                    />
                    <div>
                      <label
                        htmlFor={`permission-${permission.key}`}
                        className="font-medium text-gray-900 cursor-pointer"
                      >
                        {permission.label}
                      </label>
                      <p className="text-sm text-gray-600">{permission.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-6 border-t border-gray-200">
              <button
                type="submit"
                disabled={saving}
                className="bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white px-6 py-2 rounded-xl font-medium flex items-center gap-2 transition-colors"
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Enregistrement...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    {isEditing ? 'Mettre à jour' : 'Créer le gestionnaire'}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}