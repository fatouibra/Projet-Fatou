'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Plus, Edit, Trash2, Users, Shield, Store, User, AlertCircle, RefreshCw, Phone, CheckCircle, MapPin, FileText } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import Pagination from '@/components/Pagination'

interface User {
  id: string
  name: string
  email: string
  role: 'ADMIN' | 'RESTAURATOR' | 'CUSTOMER'
  phone?: string
  isActive: boolean
  restaurantId?: string
  restaurant?: {
    id: string
    name: string
  }
  createdAt: string
}

export default function UsersPage() {
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRole, setFilterRole] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'CUSTOMER',
    phone: '',
    password: '',
    isActive: true,
    // Champs restaurant (seulement pour RESTAURATOR)
    restaurantName: '',
    restaurantAddress: '',
    restaurantPhone: '',
    restaurantDescription: ''
  })

  useEffect(() => {
    fetchUsers()
  }, [])

  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, filterRole])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/users')
      const result = await response.json()
      
      if (response.ok && result.success) {
        setUsers(result.data)
        setError('')
      } else {
        setError(result.message || 'Erreur lors du chargement des utilisateurs')
      }
    } catch (error) {
      setError('Erreur de connexion')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation pour les restaurateurs
    if (formData.role === 'RESTAURATOR' && (!formData.restaurantName || !formData.restaurantAddress)) {
      setError('Veuillez remplir les informations du restaurant obligatoires')
      return
    }

    try {
      const url = editingUser ? '/api/admin/users' : '/api/admin/users'
      const method = editingUser ? 'PUT' : 'POST'

      // Séparer les données utilisateur et restaurant
      const { restaurantName, restaurantAddress, restaurantPhone, restaurantDescription, ...userData } = formData

      const body = editingUser
        ? { userId: editingUser.id, ...userData }
        : {
            ...userData,
            // Ajouter les données restaurant si c'est un RESTAURATOR
            restaurant: formData.role === 'RESTAURATOR' ? {
              name: restaurantName,
              address: restaurantAddress,
              phone: restaurantPhone,
              description: restaurantDescription
            } : null
          }

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })

      const result = await response.json()
      
      if (response.ok && result.success) {
        await fetchUsers()
        handleCloseModal()
      } else {
        setError(result.message || 'Erreur lors de l\'opération')
      }
    } catch (error) {
      setError('Erreur de connexion')
    }
  }

  const handleDelete = async (userId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) return
    
    try {
      const response = await fetch(`/api/admin/users?userId=${userId}`, {
        method: 'DELETE'
      })

      const result = await response.json()
      
      if (response.ok && result.success) {
        await fetchUsers()
      } else {
        setError(result.message || 'Erreur lors de la suppression')
      }
    } catch (error) {
      setError('Erreur de connexion')
    }
  }

  const handleEdit = (user: User) => {
    setEditingUser(user)
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone || '',
      password: '',
      isActive: user.isActive,
      restaurantName: '',
      restaurantAddress: '',
      restaurantPhone: '',
      restaurantDescription: ''
    })
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingUser(null)
    setFormData({
      name: '',
      email: '',
      role: 'CUSTOMER',
      phone: '',
      password: '',
      isActive: true,
      restaurantName: '',
      restaurantAddress: '',
      restaurantPhone: '',
      restaurantDescription: ''
    })
    setError('')
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = filterRole === '' || user.role === filterRole
    return matchesSearch && matchesRole
  })

  const totalItems = filteredUsers.length
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex)

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'ADMIN': return <Shield className="h-4 w-4 text-blue-600" />
      case 'RESTAURATOR': return <Store className="h-4 w-4 text-green-600" />
      default: return <User className="h-4 w-4 text-gray-600" />
    }
  }

  const getRoleBadge = (role: string) => {
    const config = {
      ADMIN: 'bg-blue-100 text-blue-800',
      RESTAURATOR: 'bg-green-100 text-green-800',
      CUSTOMER: 'bg-gray-100 text-gray-800'
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion des Utilisateurs</h1>
          <p className="text-gray-600">Gérer tous les comptes utilisateur de la plateforme</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={fetchUsers}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <RefreshCw className="h-4 w-4" />
            Actualiser
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            <Plus className="h-4 w-4" />
            Nouvel utilisateur
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-red-600" />
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <Users className="h-8 w-8 text-gray-600" />
            <div>
              <p className="text-sm text-gray-600">Total</p>
              <p className="text-xl font-bold">{users.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <Shield className="h-8 w-8 text-blue-600" />
            <div>
              <p className="text-sm text-gray-600">Admins</p>
              <p className="text-xl font-bold">{users.filter(u => u.role === 'ADMIN').length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <Store className="h-8 w-8 text-green-600" />
            <div>
              <p className="text-sm text-gray-600">Restaurateurs</p>
              <p className="text-xl font-bold">{users.filter(u => u.role === 'RESTAURATOR').length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <User className="h-8 w-8 text-gray-600" />
            <div>
              <p className="text-sm text-gray-600">Clients</p>
              <p className="text-xl font-bold">{users.filter(u => u.role === 'CUSTOMER').length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Rechercher</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                placeholder="Nom ou email..."
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Rôle</label>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Tous les rôles</option>
              <option value="ADMIN">Admin</option>
              <option value="RESTAURATOR">Restaurateur</option>
              <option value="CUSTOMER">Client</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Utilisateur</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rôle</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Restaurant</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Inscription</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                        {getRoleIcon(user.role)}
                      </div>
                      <div className="ml-4">
                        <button
                          onClick={() => router.push(`/admin/users/${user.id}`)}
                          className="text-left hover:text-primary-600 transition-colors"
                        >
                          <div className="text-sm font-medium text-gray-900 hover:text-primary-600">{user.name}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </button>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadge(user.role)}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.restaurant?.name || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {user.isActive ? 'Actif' : 'Inactif'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleEdit(user)}
                      className="text-primary-600 hover:text-primary-900 mr-3"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(user.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {paginatedUsers.length === 0 && (
            <div className="text-center py-8">
              <Users className="mx-auto h-12 w-12 text-gray-300" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun utilisateur trouvé</h3>
            </div>
          )}
        </div>

        {totalItems > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
          />
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-8 py-6 rounded-t-xl">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {editingUser ? 'Modifier l\'utilisateur' : 'Créer un nouvel utilisateur'}
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    {editingUser ? 'Modifiez les informations de l\'utilisateur' : 'Ajoutez un nouveau membre à votre équipe'}
                  </p>
                </div>
                <button
                  onClick={handleCloseModal}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="px-8 py-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Nom */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Nom complet <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                      placeholder="Ex: Jean Dupont"
                      required
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Adresse email <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                    </svg>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                      placeholder="ex@example.com"
                      required
                    />
                  </div>
                </div>

                {/* Téléphone */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Numéro de téléphone
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                      placeholder="+221 77 123 45 67"
                    />
                  </div>
                </div>

                {/* Rôle */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Rôle <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all appearance-none bg-white"
                    >
                      <option value="CUSTOMER">👤 Client</option>
                      <option value="RESTAURATOR">🍽️ Restaurateur</option>
                      <option value="ADMIN">🔐 Administrateur</option>
                    </select>
                    <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>

                {/* Mot de passe pour création uniquement */}
                {!editingUser && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Mot de passe temporaire <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      <input
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                        placeholder="Min. 6 caractères"
                        required={!editingUser}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      L'utilisateur devra changer ce mot de passe à sa première connexion
                    </p>
                  </div>
                )}
              </div>

              {/* Section Restaurant - Visible uniquement pour les RESTAURATOR */}
              {formData.role === 'RESTAURATOR' && (
                <div className="mt-8 p-6 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <Store className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-green-900">Informations du restaurant</h3>
                      <p className="text-sm text-green-600">Configurez le restaurant associé à cet utilisateur</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Nom du restaurant */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Nom du restaurant <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Store className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type="text"
                          value={formData.restaurantName}
                          onChange={(e) => setFormData({ ...formData, restaurantName: e.target.value })}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                          placeholder="Ex: Chez Fatou Restaurant"
                          required={formData.role === 'RESTAURATOR'}
                        />
                      </div>
                    </div>

                    {/* Adresse du restaurant */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Adresse <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type="text"
                          value={formData.restaurantAddress}
                          onChange={(e) => setFormData({ ...formData, restaurantAddress: e.target.value })}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                          placeholder="123 Avenue de la République, Dakar"
                          required={formData.role === 'RESTAURATOR'}
                        />
                      </div>
                    </div>

                    {/* Téléphone restaurant */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Téléphone du restaurant
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type="tel"
                          value={formData.restaurantPhone}
                          onChange={(e) => setFormData({ ...formData, restaurantPhone: e.target.value })}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                          placeholder="+221 33 123 45 67"
                        />
                      </div>
                    </div>

                    {/* Description restaurant */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Description du restaurant
                      </label>
                      <div className="relative">
                        <FileText className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <textarea
                          value={formData.restaurantDescription}
                          onChange={(e) => setFormData({ ...formData, restaurantDescription: e.target.value })}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all resize-none"
                          placeholder="Décrivez votre restaurant, son ambiance, sa spécialité..."
                          rows={3}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Section Admin - Information spéciale */}
              {formData.role === 'ADMIN' && (
                <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Shield className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-blue-900">Privilèges d'administrateur</h3>
                      <p className="text-sm text-blue-600">Cet utilisateur aura accès à toutes les fonctionnalités d'administration</p>
                    </div>
                  </div>
                  <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                    <div className="flex items-center gap-2 text-blue-700">
                      <CheckCircle className="w-3 h-3" />
                      Gestion des utilisateurs
                    </div>
                    <div className="flex items-center gap-2 text-blue-700">
                      <CheckCircle className="w-3 h-3" />
                      Gestion des restaurants
                    </div>
                    <div className="flex items-center gap-2 text-blue-700">
                      <CheckCircle className="w-3 h-3" />
                      Analytics & Finances
                    </div>
                    <div className="flex items-center gap-2 text-blue-700">
                      <CheckCircle className="w-3 h-3" />
                      Configuration système
                    </div>
                  </div>
                </div>
              )}

              {/* Section Client - Information basique */}
              {formData.role === 'CUSTOMER' && (
                <div className="mt-8 p-6 bg-gradient-to-r from-gray-50 to-slate-50 border border-gray-200 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                      <User className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Compte client</h3>
                      <p className="text-sm text-gray-600">Cet utilisateur pourra passer des commandes sur la plateforme</p>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-2 text-xs text-gray-600">
                    <CheckCircle className="w-3 h-3" />
                    Accès à la marketplace et commandes
                  </div>
                </div>
              )}

              {/* Options */}
              <div className="mt-8 p-4 bg-gray-50 rounded-xl">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Options du compte</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Compte actif</p>
                        <p className="text-xs text-gray-600">L'utilisateur peut se connecter</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.isActive}
                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-4 pt-8 mt-8 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-8 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl hover:from-primary-700 hover:to-primary-800 font-medium transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  {editingUser ? '✏️ Modifier' : '🚀 Créer l\'utilisateur'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}