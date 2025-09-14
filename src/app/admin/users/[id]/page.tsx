'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Calendar,
  Shield,
  Store,
  Key,
  RefreshCw,
  Save,
  AlertCircle,
  CheckCircle,
  Eye,
  EyeOff,
  RotateCcw
} from 'lucide-react'

interface UserDetail {
  id: string
  name: string
  email: string
  phone?: string
  role: 'ADMIN' | 'RESTAURATOR' | 'CUSTOMER'
  isActive: boolean
  mustChangePassword: boolean
  restaurantId?: string
  restaurant?: {
    id: string
    name: string
  }
  createdAt: string
  updatedAt: string
  _count?: {
    orders: number
  }
}

export default function UserDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [user, setUser] = useState<UserDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [editMode, setEditMode] = useState(false)
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    isActive: true,
    mustChangePassword: false
  })

  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: ''
  })

  useEffect(() => {
    if (params.id) {
      fetchUser()
    }
  }, [params.id])

  const fetchUser = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/users/${params.id}`)
      const result = await response.json()

      if (response.ok && result.success) {
        setUser(result.data)
        setFormData({
          name: result.data.name,
          email: result.data.email,
          phone: result.data.phone || '',
          isActive: result.data.isActive,
          mustChangePassword: result.data.mustChangePassword || false
        })
        setError('')
      } else {
        setError(result.message || 'Utilisateur non trouvé')
      }
    } catch (error) {
      setError('Erreur de connexion')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      const response = await fetch(`/api/admin/users/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const result = await response.json()

      if (response.ok && result.success) {
        setUser(result.data)
        setEditMode(false)
        setSuccess('Utilisateur mis à jour avec succès')
        setTimeout(() => setSuccess(''), 3000)
      } else {
        setError(result.message || 'Erreur lors de la mise à jour')
      }
    } catch (error) {
      setError('Erreur de connexion')
    } finally {
      setSaving(false)
    }
  }

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas')
      return
    }

    if (passwordData.newPassword.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères')
      return
    }

    try {
      setSaving(true)
      const response = await fetch(`/api/admin/users/${params.id}/password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          newPassword: passwordData.newPassword,
          mustChangePassword: true
        })
      })

      const result = await response.json()

      if (response.ok && result.success) {
        setPasswordData({ newPassword: '', confirmPassword: '' })
        setShowPasswordForm(false)
        setSuccess('Mot de passe mis à jour. L\'utilisateur devra le changer à sa prochaine connexion.')
        setTimeout(() => setSuccess(''), 5000)
        fetchUser() // Refresh data
      } else {
        setError(result.message || 'Erreur lors du changement de mot de passe')
      }
    } catch (error) {
      setError('Erreur de connexion')
    } finally {
      setSaving(false)
    }
  }

  const handleResetPassword = async () => {
    if (!confirm('Êtes-vous sûr de vouloir réinitialiser le mot de passe ? Un nouveau mot de passe temporaire sera généré.')) {
      return
    }

    try {
      setSaving(true)
      const response = await fetch(`/api/admin/users/${params.id}/reset-password`, {
        method: 'POST'
      })

      const result = await response.json()

      if (response.ok && result.success) {
        setSuccess(`Mot de passe réinitialisé. Nouveau mot de passe temporaire : ${result.tempPassword}`)
        fetchUser()
      } else {
        setError(result.message || 'Erreur lors de la réinitialisation')
      }
    } catch (error) {
      setError('Erreur de connexion')
    } finally {
      setSaving(false)
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'ADMIN': return <Shield className="h-5 w-5 text-blue-600" />
      case 'RESTAURATOR': return <Store className="h-5 w-5 text-green-600" />
      default: return <User className="h-5 w-5 text-gray-600" />
    }
  }

  const getRoleBadge = (role: string) => {
    const config = {
      ADMIN: 'bg-blue-100 text-blue-800 border-blue-200',
      RESTAURATOR: 'bg-green-100 text-green-800 border-green-200',
      CUSTOMER: 'bg-gray-100 text-gray-800 border-gray-200'
    }
    return config[role as keyof typeof config] || config.CUSTOMER
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="loading-spinner w-8 h-8"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Utilisateur non trouvé</h3>
        <button
          onClick={() => router.back()}
          className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Détails Utilisateur</h1>
            <p className="text-gray-600">Gérer les informations de {user.name}</p>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={fetchUser}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <RefreshCw className="h-4 w-4" />
            Actualiser
          </button>

          {editMode ? (
            <>
              <button
                onClick={() => setEditMode(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                {saving ? 'Enregistrement...' : 'Enregistrer'}
              </button>
            </>
          ) : (
            <button
              onClick={() => setEditMode(true)}
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              <User className="h-4 w-4" />
              Modifier
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-red-600" />
          <p className="text-red-800">{error}</p>
          <button onClick={() => setError('')} className="ml-auto text-red-600 hover:text-red-800">×</button>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <p className="text-green-800">{success}</p>
          <button onClick={() => setSuccess('')} className="ml-auto text-green-600 hover:text-green-800">×</button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Informations personnelles</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nom</label>
                {editMode ? (
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                ) : (
                  <div className="flex items-center gap-2 text-gray-900">
                    <User className="h-4 w-4 text-gray-400" />
                    {user.name}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                {editMode ? (
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                ) : (
                  <div className="flex items-center gap-2 text-gray-900">
                    <Mail className="h-4 w-4 text-gray-400" />
                    {user.email}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Téléphone</label>
                {editMode ? (
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    placeholder="Optionnel"
                  />
                ) : (
                  <div className="flex items-center gap-2 text-gray-900">
                    <Phone className="h-4 w-4 text-gray-400" />
                    {user.phone || 'Non renseigné'}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Rôle</label>
                <div className="flex items-center gap-2">
                  {getRoleIcon(user.role)}
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getRoleBadge(user.role)}`}>
                    {user.role}
                  </span>
                </div>
              </div>
            </div>

            {user.restaurant && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <Store className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-800">Restaurant assigné :</span>
                  <span className="text-sm text-green-700">{user.restaurant.name}</span>
                </div>
              </div>
            )}
          </div>

          {/* Account Settings */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Paramètres du compte</h3>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <label className="text-sm font-medium text-gray-900">Compte actif</label>
                  <p className="text-xs text-gray-600">Autoriser la connexion de cet utilisateur</p>
                </div>
                {editMode ? (
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500"
                  />
                ) : (
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {user.isActive ? 'Actif' : 'Inactif'}
                  </span>
                )}
              </div>

              {user.role !== 'CUSTOMER' && (
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <label className="text-sm font-medium text-gray-900">Doit changer le mot de passe</label>
                    <p className="text-xs text-gray-600">Forcer le changement à la prochaine connexion</p>
                  </div>
                  {editMode ? (
                    <input
                      type="checkbox"
                      checked={formData.mustChangePassword}
                      onChange={(e) => setFormData({ ...formData, mustChangePassword: e.target.checked })}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500"
                    />
                  ) : (
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      user.mustChangePassword ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {user.mustChangePassword ? 'Oui' : 'Non'}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Password Management - Only for ADMIN and RESTAURATOR */}
          {user.role !== 'CUSTOMER' && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Gestion du mot de passe</h3>

              <div className="flex gap-3 mb-4">
                <button
                  onClick={() => setShowPasswordForm(!showPasswordForm)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Key className="h-4 w-4" />
                  Changer mot de passe
                </button>

                <button
                  onClick={handleResetPassword}
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50"
                >
                  <RotateCcw className="h-4 w-4" />
                  {saving ? 'Réinitialisation...' : 'Réinitialiser'}
                </button>
              </div>

              {showPasswordForm && (
                <div className="border-t border-gray-200 pt-4 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nouveau mot de passe</label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                        className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                        placeholder="Minimum 6 caractères"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Confirmer le mot de passe</label>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                      placeholder="Répéter le mot de passe"
                    />
                  </div>

                  <button
                    onClick={handlePasswordChange}
                    disabled={saving || !passwordData.newPassword || !passwordData.confirmPassword}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                  >
                    <Save className="h-4 w-4" />
                    {saving ? 'Modification...' : 'Modifier le mot de passe'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Statistiques</h3>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Commandes</span>
                <span className="font-medium">{user._count?.orders || 0}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Inscription</span>
                <span className="text-sm font-medium">
                  {new Date(user.createdAt).toLocaleDateString('fr-FR')}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Dernière modif.</span>
                <span className="text-sm font-medium">
                  {new Date(user.updatedAt).toLocaleDateString('fr-FR')}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Actions rapides</h3>

            <div className="space-y-2">
              {user.restaurant && (
                <button
                  onClick={() => router.push(`/admin/restaurants/${user.restaurant!.id}`)}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <Store className="h-4 w-4" />
                  Voir le restaurant
                </button>
              )}

              <button
                onClick={() => router.push(`/admin/orders?userId=${user.id}`)}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <Calendar className="h-4 w-4" />
                Voir les commandes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}