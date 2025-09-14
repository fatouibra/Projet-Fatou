'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { 
  Shield, 
  Search, 
  Plus,
  Edit,
  Trash2,
  Eye,
  Users,
  Lock,
  Unlock,
  Settings,
  CheckCircle,
  XCircle,
  Key
} from 'lucide-react'

interface Permission {
  id: string
  name: string
  description: string
  category: string
}

interface Role {
  id: string
  name: string
  description?: string
  permissions: Permission[]
  isActive: boolean
  createdAt: string
  updatedAt: string
  _count: {
    users: number
  }
}

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([])
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [filteredRoles, setFilteredRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingRole, setEditingRole] = useState<Role | null>(null)
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  
  const [newRole, setNewRole] = useState({
    name: '',
    description: '',
    permissions: [] as string[]
  })

  useEffect(() => {
    fetchRoles()
    fetchPermissions()
  }, [])

  useEffect(() => {
    filterRoles()
  }, [roles, searchTerm, statusFilter])

  const fetchRoles = async () => {
    try {
      const response = await fetch('/api/admin/roles')
      if (response.ok) {
        const data = await response.json()
        setRoles(data.roles)
      }
    } catch (error) {
      console.error('Erreur lors du chargement des rôles:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchPermissions = async () => {
    try {
      const response = await fetch('/api/admin/permissions')
      if (response.ok) {
        const data = await response.json()
        setPermissions(data.permissions)
      }
    } catch (error) {
      console.error('Erreur lors du chargement des permissions:', error)
    }
  }

  const filterRoles = () => {
    let filtered = [...roles]

    if (searchTerm) {
      filtered = filtered.filter(role =>
        role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (role.description && role.description.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    if (statusFilter !== 'all') {
      if (statusFilter === 'active') filtered = filtered.filter(r => r.isActive)
      if (statusFilter === 'inactive') filtered = filtered.filter(r => !r.isActive)
    }

    setFilteredRoles(filtered)
  }

  const createRole = async () => {
    try {
      const response = await fetch('/api/admin/roles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRole)
      })
      
      if (response.ok) {
        fetchRoles()
        setShowCreateModal(false)
        setNewRole({ name: '', description: '', permissions: [] })
      }
    } catch (error) {
      console.error('Erreur lors de la création du rôle:', error)
    }
  }

  const toggleRoleStatus = async (roleId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/roles/${roleId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus })
      })
      
      if (response.ok) {
        fetchRoles()
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error)
    }
  }

  const deleteRole = async (roleId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce rôle ?')) return
    
    try {
      const response = await fetch(`/api/admin/roles/${roleId}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        fetchRoles()
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
    }
  }

  const togglePermission = (permissionId: string) => {
    setNewRole(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permissionId)
        ? prev.permissions.filter(id => id !== permissionId)
        : [...prev.permissions, permissionId]
    }))
  }

  const permissionsByCategory = permissions.reduce((acc, permission) => {
    if (!acc[permission.category]) {
      acc[permission.category] = []
    }
    acc[permission.category].push(permission)
    return acc
  }, {} as Record<string, Permission[]>)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="loading-spinner w-8 h-8"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Shield className="h-6 w-6" />
            Gestion des rôles
          </h1>
          <p className="text-gray-600 mt-1">
            Gérez les rôles et permissions des utilisateurs
          </p>
        </div>
        <Button 
          onClick={() => setShowCreateModal(true)}
          className="bg-orange-600 hover:bg-orange-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nouveau rôle
        </Button>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total rôles</p>
              <p className="text-2xl font-bold text-gray-900">{roles.length}</p>
            </div>
            <Shield className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Actifs</p>
              <p className="text-2xl font-bold text-green-600">
                {roles.filter(r => r.isActive).length}
              </p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Permissions</p>
              <p className="text-2xl font-bold text-purple-600">{permissions.length}</p>
            </div>
            <Key className="h-8 w-8 text-purple-600" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Utilisateurs avec rôles</p>
              <p className="text-2xl font-bold text-orange-600">
                {roles.reduce((sum, r) => sum + r._count.users, 0)}
              </p>
            </div>
            <Users className="h-8 w-8 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Filtres et recherche */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Rechercher par nom..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          >
            <option value="all">Tous les statuts</option>
            <option value="active">Actif</option>
            <option value="inactive">Inactif</option>
          </select>
        </div>
      </div>

      {/* Liste des rôles */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRoles.map((role) => (
          <div key={role.id} className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-orange-600" />
                <h3 className="font-semibold text-gray-900">{role.name}</h3>
              </div>
              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                role.isActive 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {role.isActive ? 'Actif' : 'Inactif'}
              </span>
            </div>

            {role.description && (
              <p className="text-gray-600 text-sm mb-4">{role.description}</p>
            )}

            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Permissions</span>
                <span className="font-medium text-orange-600">
                  {role.permissions.length}
                </span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Utilisateurs</span>
                <span className="font-medium">{role._count.users}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 mt-6 pt-4 border-t">
              <button
                onClick={() => setSelectedRole(role)}
                className="text-blue-600 hover:text-blue-900 p-1"
                title="Voir détails"
              >
                <Eye className="h-4 w-4" />
              </button>
              <button
                onClick={() => setEditingRole(role)}
                className="text-orange-600 hover:text-orange-900 p-1"
                title="Modifier"
              >
                <Edit className="h-4 w-4" />
              </button>
              <button
                onClick={() => toggleRoleStatus(role.id, role.isActive)}
                className="text-yellow-600 hover:text-yellow-900 p-1"
                title={role.isActive ? 'Désactiver' : 'Activer'}
              >
                {role.isActive ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
              </button>
              <button
                onClick={() => deleteRole(role.id)}
                className="text-red-600 hover:text-red-900 p-1"
                title="Supprimer"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal de création */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-4xl w-full mx-4 max-h-96 overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Créer un nouveau rôle</h2>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Nom du rôle"
                  value={newRole.name}
                  onChange={(e) => setNewRole(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ex: Gestionnaire restaurant"
                />
                <Input
                  label="Description"
                  value={newRole.description}
                  onChange={(e) => setNewRole(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Description du rôle..."
                />
              </div>

              <div>
                <h3 className="font-medium text-gray-900 mb-4">Permissions</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Object.entries(permissionsByCategory).map(([category, categoryPermissions]) => (
                    <div key={category} className="border rounded-lg p-4">
                      <h4 className="font-medium text-gray-700 mb-3 capitalize">
                        {category}
                      </h4>
                      <div className="space-y-2">
                        {categoryPermissions.map((permission) => (
                          <label key={permission.id} className="flex items-start gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={newRole.permissions.includes(permission.id)}
                              onChange={() => togglePermission(permission.id)}
                              className="mt-0.5 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                            />
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {permission.name}
                              </div>
                              <div className="text-xs text-gray-600">
                                {permission.description}
                              </div>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-4 pt-4 border-t">
                <Button 
                  onClick={() => setShowCreateModal(false)}
                  variant="outline"
                >
                  Annuler
                </Button>
                <Button 
                  onClick={createRole}
                  className="bg-orange-600 hover:bg-orange-700"
                  disabled={!newRole.name || newRole.permissions.length === 0}
                >
                  Créer le rôle
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de détails */}
      {selectedRole && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-3xl w-full mx-4 max-h-96 overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Détails du rôle</h2>
              <button 
                onClick={() => setSelectedRole(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-900">{selectedRole.name}</h3>
                {selectedRole.description && (
                  <p className="text-gray-600 mt-1">{selectedRole.description}</p>
                )}
              </div>

              <div>
                <h4 className="font-medium text-gray-700 mb-2">Permissions ({selectedRole.permissions.length})</h4>
                <div className="grid grid-cols-2 gap-2">
                  {selectedRole.permissions.map((permission) => (
                    <div key={permission.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm">{permission.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t">
                <div>
                  <span className="text-sm text-gray-600">Utilisateurs avec ce rôle</span>
                  <p className="text-xl font-bold text-orange-600">{selectedRole._count.users}</p>
                </div>
              </div>

              <div className="flex gap-4 pt-4 border-t">
                <Button 
                  onClick={() => setSelectedRole(null)}
                  variant="outline"
                >
                  Fermer
                </Button>
                <Button 
                  onClick={() => {
                    setEditingRole(selectedRole)
                    setSelectedRole(null)
                  }}
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  Modifier
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}