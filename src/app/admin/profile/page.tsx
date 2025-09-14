'use client'

import { useState, useEffect } from 'react'
import { useAuthStore } from '@/stores/auth'
import { 
  User, 
  Mail, 
  Shield, 
  Save, 
  Eye, 
  EyeOff, 
  Edit, 
  Key,
  AlertTriangle,
  CheckCircle
} from 'lucide-react'
import { toast } from '@/stores/toast'

interface ProfileData {
  name: string
  email: string
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export default function AdminProfilePage() {
  const { user, updateUser } = useAuthStore()
  const [isEditing, setIsEditing] = useState(false)
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [profileData, setProfileData] = useState<ProfileData>({
    name: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  useEffect(() => {
    if (user) {
      setProfileData(prev => ({
        ...prev,
        name: user.name || '',
        email: user.email || ''
      }))
    }
  }, [user])

  const handleSaveProfile = async () => {
    if (!profileData.name.trim()) {
      toast.error('Erreur', 'Le nom ne peut pas être vide')
      return
    }

    if (!profileData.email.trim()) {
      toast.error('Erreur', 'L\'email ne peut pas être vide')
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(profileData.email)) {
      toast.error('Erreur', 'Format d\'email invalide')
      return
    }

    setLoading(true)
    try {
      // Simulated API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Update user store
      if (user) {
        updateUser({
          ...user,
          name: profileData.name,
          email: profileData.email
        })
      }

      toast.success('Succès', 'Profil mis à jour avec succès')
      setIsEditing(false)
    } catch (error) {
      toast.error('Erreur', 'Erreur lors de la mise à jour du profil')
    } finally {
      setLoading(false)
    }
  }

  const handleChangePassword = async () => {
    if (!profileData.currentPassword) {
      toast.error('Erreur', 'Veuillez saisir votre mot de passe actuel')
      return
    }

    if (profileData.newPassword.length < 6) {
      toast.error('Erreur', 'Le nouveau mot de passe doit contenir au moins 6 caractères')
      return
    }

    if (profileData.newPassword !== profileData.confirmPassword) {
      toast.error('Erreur', 'Les mots de passe ne correspondent pas')
      return
    }

    setLoading(true)
    try {
      // Simulated API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      toast.success('Succès', 'Mot de passe modifié avec succès')
      setShowPasswordForm(false)
      setProfileData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }))
    } catch (error) {
      toast.error('Erreur', 'Erreur lors du changement de mot de passe')
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="loading-spinner w-8 h-8"></div>
          <p className="mt-2 text-gray-600">Chargement du profil...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <User className="h-7 w-7 text-primary-600" />
            Mon Profil
          </h1>
          <p className="text-gray-600 mt-1">Gérez vos informations personnelles et votre sécurité</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <User className="h-5 w-5" />
                Informations personnelles
              </h2>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary-600 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors"
              >
                <Edit className="h-4 w-4" />
                {isEditing ? 'Annuler' : 'Modifier'}
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom complet
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={profileData.name}
                    onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Votre nom complet"
                  />
                ) : (
                  <p className="text-gray-900 py-2 px-3 bg-gray-50 rounded-lg">{user.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Adresse email
                </label>
                {isEditing ? (
                  <input
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="votre@email.com"
                  />
                ) : (
                  <p className="text-gray-900 py-2 px-3 bg-gray-50 rounded-lg flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-400" />
                    {user.email}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rôle
                </label>
                <div className="py-2 px-3 bg-gray-50 rounded-lg">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <Shield className="h-3 w-3 mr-1" />
                    Administrateur
                  </span>
                </div>
              </div>
            </div>

            {isEditing && (
              <div className="flex gap-3 mt-6 pt-4 border-t">
                <button
                  onClick={handleSaveProfile}
                  disabled={loading}
                  className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors"
                >
                  {loading ? (
                    <div className="loading-spinner w-4 h-4"></div>
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  Sauvegarder
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Annuler
                </button>
              </div>
            )}
          </div>

          {/* Security Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Key className="h-5 w-5" />
                Sécurité
              </h2>
              <button
                onClick={() => setShowPasswordForm(!showPasswordForm)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-orange-600 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
              >
                <Key className="h-4 w-4" />
                {showPasswordForm ? 'Annuler' : 'Changer le mot de passe'}
              </button>
            </div>

            {!showPasswordForm ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mot de passe
                  </label>
                  <p className="text-gray-500 py-2 px-3 bg-gray-50 rounded-lg">
                    ••••••••••••
                  </p>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <Shield className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-blue-900">Sécurité du compte</p>
                      <p className="text-sm text-blue-700 mt-1">
                        Votre mot de passe est sécurisé. Il est recommandé de le changer régulièrement.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mot de passe actuel *
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? 'text' : 'password'}
                      value={profileData.currentPassword}
                      onChange={(e) => setProfileData(prev => ({ ...prev, currentPassword: e.target.value }))}
                      className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Votre mot de passe actuel"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nouveau mot de passe *
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={profileData.newPassword}
                      onChange={(e) => setProfileData(prev => ({ ...prev, newPassword: e.target.value }))}
                      className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Nouveau mot de passe"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Au moins 6 caractères
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirmer le nouveau mot de passe *
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={profileData.confirmPassword}
                      onChange={(e) => setProfileData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Confirmer le nouveau mot de passe"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleChangePassword}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 transition-colors"
                  >
                    {loading ? (
                      <div className="loading-spinner w-4 h-4"></div>
                    ) : (
                      <Key className="h-4 w-4" />
                    )}
                    Changer le mot de passe
                  </button>
                  <button
                    onClick={() => setShowPasswordForm(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Account Summary */}
        <div className="space-y-6">
          {/* Account Overview */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Résumé du compte
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-lg font-semibold">
                    {user.name?.charAt(0) || 'A'}
                  </span>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{user.name}</p>
                  <p className="text-sm text-gray-500">ID: {user.id.slice(0, 8)}...</p>
                </div>
              </div>
              
              <div className="space-y-3 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Statut du compte</span>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Actif
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Type</span>
                  <span className="text-sm font-medium text-gray-900">Administrateur</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Dernière connexion</span>
                  <span className="text-sm text-gray-900">Aujourd'hui</span>
                </div>
              </div>
            </div>
          </div>

          {/* Security Tips */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-yellow-900 mb-3 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Conseils de sécurité
            </h3>
            
            <ul className="space-y-2 text-sm text-yellow-800">
              <li className="flex items-start gap-2">
                <span className="block w-1 h-1 bg-yellow-600 rounded-full mt-2 flex-shrink-0"></span>
                Utilisez un mot de passe fort et unique
              </li>
              <li className="flex items-start gap-2">
                <span className="block w-1 h-1 bg-yellow-600 rounded-full mt-2 flex-shrink-0"></span>
                Changez votre mot de passe régulièrement
              </li>
              <li className="flex items-start gap-2">
                <span className="block w-1 h-1 bg-yellow-600 rounded-full mt-2 flex-shrink-0"></span>
                Ne partagez jamais vos identifiants
              </li>
              <li className="flex items-start gap-2">
                <span className="block w-1 h-1 bg-yellow-600 rounded-full mt-2 flex-shrink-0"></span>
                Déconnectez-vous toujours après utilisation
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}