'use client'

import { useState, useEffect } from 'react'
import { Plus, Search, Edit, Trash2, FolderOpen, Tag, Eye, Image as ImageIcon } from 'lucide-react'
import Pagination from '@/components/Pagination'

interface Category {
  id: string
  name: string
  description?: string
  restaurantId?: string
  restaurant?: {
    id: string
    name: string
  }
  active: boolean
  _count: {
    products: number
  }
  createdAt: string
  updatedAt: string
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    restaurantId: '',
    active: true
  })
  const [restaurants, setRestaurants] = useState<{id: string, name: string}[]>([])
  const [submitting, setSubmitting] = useState(false)

  const fetchCategories = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/categories')
      const result = await response.json()
      
      if (response.ok && result.success) {
        setCategories(result.data)
        setError('')
      } else {
        setError(result.message || 'Erreur lors du chargement')
      }
    } catch (error) {
      console.error('Erreur:', error)
      setError('Erreur de connexion')
    } finally {
      setLoading(false)
    }
  }

  const fetchRestaurants = async () => {
    try {
      const response = await fetch('/api/admin/restaurants')
      const result = await response.json()
      
      if (response.ok && result.success) {
        setRestaurants(result.data)
      }
    } catch (error) {
      console.error('Erreur restaurants:', error)
    }
  }

  useEffect(() => {
    fetchCategories()
    fetchRestaurants()
  }, [])

  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm])

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (category.description && category.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (category.restaurant?.name && category.restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const totalItems = filteredCategories.length
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedCategories = filteredCategories.slice(startIndex, endIndex)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    
    try {
      const url = editingCategory 
        ? '/api/admin/categories'
        : '/api/admin/categories'
      
      const method = editingCategory ? 'PUT' : 'POST'
      const body = editingCategory 
        ? { categoryId: editingCategory.id, ...formData, restaurantId: formData.restaurantId || null }
        : { ...formData, restaurantId: formData.restaurantId || null }

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
      
      const result = await response.json()
      
      if (response.ok && result.success) {
        await fetchCategories()
        setShowModal(false)
        setEditingCategory(null)
        setFormData({ name: '', description: '', restaurantId: '', active: true })
      } else {
        alert(result.message || 'Erreur lors de la sauvegarde')
      }
    } catch (error) {
      console.error('Erreur:', error)
      alert('Erreur de connexion')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (category: Category) => {
    setEditingCategory(category)
    setFormData({
      name: category.name,
      description: category.description || '',
      restaurantId: category.restaurantId || '',
      active: category.active
    })
    setShowModal(true)
  }

  const handleDelete = async (id: string) => {
    const category = categories.find(c => c.id === id)
    if (category && category._count.products > 0) {
      alert(`Impossible de supprimer cette catégorie car elle contient ${category._count.products} produit(s).`)
      return
    }
    
    if (confirm('Êtes-vous sûr de vouloir supprimer cette catégorie ?')) {
      try {
        const response = await fetch(`/api/admin/categories?categoryId=${id}`, {
          method: 'DELETE'
        })
        
        const result = await response.json()
        
        if (response.ok && result.success) {
          await fetchCategories()
        } else {
          alert(result.message || 'Erreur lors de la suppression')
        }
      } catch (error) {
        console.error('Erreur:', error)
        alert('Erreur de connexion')
      }
    }
  }

  const toggleActive = async (id: string) => {
    const category = categories.find(c => c.id === id)
    if (!category) return

    try {
      const response = await fetch('/api/admin/categories', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          categoryId: id,
          active: !category.active
        })
      })
      
      const result = await response.json()
      
      if (response.ok && result.success) {
        await fetchCategories()
      } else {
        alert(result.message || 'Erreur lors de la modification')
      }
    } catch (error) {
      console.error('Erreur:', error)
      alert('Erreur de connexion')
    }
  }


  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="loading-spinner w-8 h-8"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
          <button
            onClick={fetchCategories}
            className="mt-2 text-red-600 hover:text-red-800"
          >
            Réessayer
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FolderOpen className="h-7 w-7 text-primary-600" />
            Gestion des Catégories
          </h1>
          <p className="text-gray-600">Organisez vos produits par catégories</p>
        </div>
        
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Plus className="h-5 w-5" />
          Nouvelle Catégorie
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Catégories</p>
              <p className="text-2xl font-bold text-gray-900">{categories.length}</p>
            </div>
            <FolderOpen className="h-8 w-8 text-primary-600" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Actives</p>
              <p className="text-2xl font-bold text-green-600">
                {categories.filter(c => c.active).length}
              </p>
            </div>
            <Eye className="h-8 w-8 text-green-600" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Inactives</p>
              <p className="text-2xl font-bold text-red-600">
                {categories.filter(c => !c.active).length}
              </p>
            </div>
            <Eye className="h-8 w-8 text-red-600" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Produits</p>
              <p className="text-2xl font-bold text-blue-600">
                {categories.reduce((sum, c) => sum + c._count.products, 0)}
              </p>
            </div>
            <Tag className="h-8 w-8 text-blue-600" />
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Rechercher une catégorie..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {paginatedCategories.map((category) => (
          <div key={category.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
            {/* Category Header */}
            <div className="h-32 relative bg-gradient-to-r from-primary-100 to-primary-200">
              <div className="w-full h-full flex items-center justify-center">
                <FolderOpen className="h-16 w-16 text-primary-600" />
              </div>
              
              {/* Status Badge */}
              <div className="absolute top-3 right-3">
                <button
                  onClick={() => toggleActive(category.id)}
                  className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    category.active
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {category.active ? 'Active' : 'Inactive'}
                </button>
              </div>
            </div>

            {/* Category Content */}
            <div className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {category.name}
                  </h3>
                  {category.description && (
                    <p className="text-sm text-gray-600 mt-1">{category.description}</p>
                  )}
                  
                  <div className="flex items-center gap-4 mt-3">
                    {category.restaurant && (
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                        {category.restaurant.name}
                      </span>
                    )}
                    {!category.restaurant && (
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                        Globale
                      </span>
                    )}
                    <span className="text-sm font-medium text-gray-700">
                      {category._count.products} produit{category._count.products !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-2 mt-4 pt-4 border-t border-gray-100">
                <button
                  onClick={() => handleEdit(category)}
                  className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                  title="Modifier"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(category.id)}
                  className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                  title="Supprimer"
                  disabled={category._count.products > 0}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {totalItems > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 mt-6">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingCategory ? 'Modifier la catégorie' : 'Nouvelle catégorie'}
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom de la catégorie
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description (optionnel)
                  </label>
                  <textarea
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Restaurant (optionnel - laisser vide pour catégorie globale)
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    value={formData.restaurantId}
                    onChange={(e) => setFormData(prev => ({ ...prev, restaurantId: e.target.value }))}
                  >
                    <option value="">Catégorie globale</option>
                    {restaurants.map(restaurant => (
                      <option key={restaurant.id} value={restaurant.id}>
                        {restaurant.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="active"
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    checked={formData.active}
                    onChange={(e) => setFormData(prev => ({ ...prev, active: e.target.checked }))}
                  />
                  <label htmlFor="active" className="ml-2 block text-sm text-gray-900">
                    Catégorie active
                  </label>
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false)
                      setEditingCategory(null)
                      setFormData({
                        name: '',
                        description: '',
                        restaurantId: '',
                        active: true
                      })
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
                  >
                    {submitting ? 'En cours...' : editingCategory ? 'Modifier' : 'Créer'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}