'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChefHat, Mail, Phone, Building, ArrowLeft, Key, Eye, EyeOff } from 'lucide-react'

interface Manager {
  id: string
  name: string
  email: string
  phone?: string
  isActive: boolean
  restaurantName: string
}

export default function RecoverAccess() {
  const router = useRouter()
  const [managers, setManagers] = useState<Manager[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedManager, setSelectedManager] = useState<Manager | null>(null)
  const [newPassword, setNewPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [resettingPassword, setResettingPassword] = useState(false)

  useEffect(() => {
    fetchManagers()
  }, [])

  const fetchManagers = async () => {
    try {
      const response = await fetch('/api/restaurant-managers/list')
      const data = await response.json()
      
      if (data.success) {
        setManagers(data.managers)
      }
    } catch (error) {
      console.error('Error fetching managers:', error)
    } finally {
      setLoading(false)
    }
  }

  const generatePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789'
    let password = ''
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setNewPassword(password)
  }

  const handleResetPassword = async () => {
    if (!selectedManager || !newPassword) return

    setResettingPassword(true)
    try {
      const response = await fetch(`/api/admin/managers/${selectedManager.id}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword })
      })

      const data = await response.json()

      if (data.success) {
        alert(`Mot de passe réinitialisé avec succès!\n\nEmail: ${selectedManager.email}\nNouveau mot de passe: ${newPassword}\n\nVous pouvez maintenant vous connecter avec ces informations.`)
        router.push('/restaurant/login')
      } else {
        alert(data.error || 'Erreur lors de la réinitialisation')
      }
    } catch (error) {
      console.error('Error resetting password:', error)
      alert('Erreur lors de la réinitialisation du mot de passe')
    } finally {
      setResettingPassword(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des comptes...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Key className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Récupérer vos accès
          </h1>
          <p className="text-gray-600">
            Sélectionnez votre compte et réinitialisez votre mot de passe
          </p>
          
          <button
            onClick={() => router.push('/restaurant/login')}
            className="mt-4 inline-flex items-center gap-2 text-orange-600 hover:text-orange-700 font-medium transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour à la connexion
          </button>
        </div>

        {managers.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <ChefHat className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Aucun compte trouvé
            </h3>
            <p className="text-gray-600 mb-6">
              Il n'y a aucun compte gestionnaire de restaurant dans la base de données.
            </p>
            <button
              onClick={() => router.push('/restaurant/login')}
              className="bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold py-3 px-6 rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200"
            >
              Créer un nouveau restaurant
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Liste des gestionnaires */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Comptes gestionnaires existants
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {managers.map((manager) => (
                  <div
                    key={manager.id}
                    className={`p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                      selectedManager?.id === manager.id
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedManager(manager)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">
                          {manager.name}
                        </h3>
                        
                        <div className="space-y-1 text-sm">
                          <div className="flex items-center gap-2 text-gray-600">
                            <Mail className="h-4 w-4" />
                            <span>{manager.email}</span>
                          </div>
                          
                          {manager.phone && (
                            <div className="flex items-center gap-2 text-gray-600">
                              <Phone className="h-4 w-4" />
                              <span>{manager.phone}</span>
                            </div>
                          )}
                          
                          <div className="flex items-center gap-2 text-gray-600">
                            <Building className="h-4 w-4" />
                            <span>{manager.restaurantName}</span>
                          </div>
                        </div>
                        
                        <div className="mt-2">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            manager.isActive 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {manager.isActive ? 'Actif' : 'Inactif'}
                          </span>
                        </div>
                      </div>
                      
                      {selectedManager?.id === manager.id && (
                        <div className="text-orange-500">
                          <div className="w-6 h-6 border-2 border-orange-500 rounded-full flex items-center justify-center">
                            <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Réinitialisation du mot de passe */}
            {selectedManager && (
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Réinitialiser le mot de passe
                </h3>
                
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                  <p className="text-blue-800 font-medium">
                    Compte sélectionné: {selectedManager.name}
                  </p>
                  <p className="text-blue-600 text-sm">
                    Email de connexion: {selectedManager.email}
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nouveau mot de passe
                    </label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-gray-50 focus:bg-white font-mono"
                          placeholder="Entrez un nouveau mot de passe"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                      <button
                        onClick={generatePassword}
                        className="px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium whitespace-nowrap"
                      >
                        Générer
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={handleResetPassword}
                    disabled={!newPassword || resettingPassword}
                    className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold py-3 px-6 rounded-xl hover:from-orange-600 hover:to-red-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {resettingPassword ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Réinitialisation...</span>
                      </div>
                    ) : (
                      'Réinitialiser et récupérer les accès'
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}