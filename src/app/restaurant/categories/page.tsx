'use client'

import { useEffect, useState } from 'react'
import { useAuthStore } from '@/stores/auth'
import { Category } from '@/types'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { ImageUpload } from '@/components/ui/ImageUpload'
import { toast } from '@/stores/toast'
import { 
  Plus, 
  Edit3, 
  Trash2,
  FolderOpen,
  Eye,
  EyeOff,
  ArrowUp,
  ArrowDown,
  Tag
} from 'lucide-react'
import Image from 'next/image'
import Pagination from '@/components/Pagination'

interface CategoryFormData {
  name: string
  description: string
  image: string
  order: string
}

const initialFormData: CategoryFormData = {
  name: '',
  description: '',
  image: '',
  order: '0',
}

export default function RestaurantCategoriesPage() {
  const { user } = useAuthStore()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [formData, setFormData] = useState<CategoryFormData>(initialFormData)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(8)

  useEffect(() => {
    if (user?.restaurantId) {
      fetchCategories()
    }
  }, [user])

  const fetchCategories = async () => {
    try {
      // Utiliser l'API spécifique au restaurant
      const response = await fetch(`/api/restaurant/${user?.restaurantId}/categories`)
      const data = await response.json()
      
      if (data.success) {
        setCategories(data.data.sort((a: Category, b: Category) => a.order - b.order))
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    } finally {
      setLoading(false)
    }
  }

  const totalItems = categories.length
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedCategories = categories.slice(startIndex, endIndex)

  const openCreateModal = () => {
    setEditingCategory(null)
    setFormData({
      ...initialFormData,
      order: (Math.max(...categories.map(c => c.order), -1) + 1).toString()
    })
    setIsModalOpen(true)
  }

  const openEditModal = (category: Category) => {
    setEditingCategory(category)
    setFormData({
      name: category.name,
      description: category.description || '',
      image: category.image || '',
      order: category.order.toString(),
    })
    setIsModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user?.restaurantId) return

    setIsSubmitting(true)
    try {
      const categoryData = {
        ...formData,
        order: parseInt(formData.order)
      }

      const url = editingCategory 
        ? `/api/categories/${editingCategory.id}` 
        : `/api/restaurant/${user.restaurantId}/categories`
      const method = editingCategory ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(categoryData),
      })

      const data = await response.json()
      if (data.success) {
        await fetchCategories()
        setIsModalOpen(false)
        setFormData(initialFormData)
        setEditingCategory(null)
        toast.success(
          editingCategory ? 'Catégorie modifiée' : 'Catégorie créée',
          editingCategory ? 'La catégorie a été modifiée avec succès' : 'La catégorie a été créée avec succès'
        )
      } else {
        toast.error('Erreur', data.message || 'Erreur lors de la sauvegarde')
      }
    } catch (error) {
      console.error('Error saving category:', error)
      toast.error('Erreur', 'Une erreur est survenue lors de la sauvegarde')
    } finally {
      setIsSubmitting(false)
    }
  }

  const toggleCategoryStatus = async (categoryId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/categories/${categoryId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !currentStatus }),
      })

      if (response.ok) {
        fetchCategories()
        toast.success(
          'Statut modifié',
          `Catégorie ${!currentStatus ? 'activée' : 'désactivée'} avec succès`
        )
      }
    } catch (error) {
      console.error('Error toggling category status:', error)
      toast.error('Erreur', 'Impossible de modifier le statut')
    }
  }

  const updateCategoryOrder = async (categoryId: string, newOrder: number) => {
    try {
      const response = await fetch(`/api/categories/${categoryId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order: newOrder }),
      })

      if (response.ok) {
        fetchCategories()
      }
    } catch (error) {
      console.error('Error updating category order:', error)
    }
  }

  const deleteCategory = async (categoryId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette catégorie ? Tous les produits associés devront être reclassifiés.')) return

    try {
      const response = await fetch(`/api/categories/${categoryId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        fetchCategories()
        toast.success('Catégorie supprimée', 'La catégorie a été supprimée avec succès')
      } else {
        toast.error('Erreur', 'Impossible de supprimer la catégorie')
      }
    } catch (error) {
      console.error('Error deleting category:', error)
      toast.error('Erreur', 'Une erreur est survenue lors de la suppression')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="loading-spinner w-8 h-8"></div>
        <span className="ml-2 text-gray-600">Chargement des catégories...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Tag className="h-6 w-6" />
            Gestion des catégories
          </h1>
          <p className="text-gray-600 mt-1">
            Organisez vos produits en catégories pour faciliter la navigation
          </p>
        </div>
        
        <Button onClick={openCreateModal} className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600">
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle catégorie
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-orange-50 rounded-lg">
              <Tag className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total catégories</p>
              <p className="text-2xl font-bold text-gray-900">{categories.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-50 rounded-lg">
              <Eye className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Actives</p>
              <p className="text-2xl font-bold text-gray-900">
                {categories.filter(c => c.active).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-50 rounded-lg">
              <FolderOpen className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total produits</p>
              <p className="text-2xl font-bold text-gray-900">
                {categories.reduce((sum, c) => sum + (c.products?.length || 0), 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {paginatedCategories.map((category, index) => (
          <div key={category.id} className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
            <div className="relative h-40">
              {category.image ? (
                <Image
                  src={category.image}
                  alt={category.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-orange-100 to-red-100 flex items-center justify-center">
                  <FolderOpen className="h-12 w-12 text-orange-600" />
                </div>
              )}
              
              {/* Status overlay */}
              <div className="absolute top-3 left-3">
                <button
                  onClick={() => toggleCategoryStatus(category.id, category.active)}
                  className={`p-1.5 rounded-full transition-colors ${
                    category.active 
                      ? 'bg-green-100 text-green-600 hover:bg-green-200' 
                      : 'bg-red-100 text-red-600 hover:bg-red-200'
                  }`}
                >
                  {category.active ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                </button>
              </div>

              {/* Order controls */}
              <div className="absolute top-3 right-3 flex flex-col gap-1">
                {index > 0 && (
                  <button
                    onClick={() => updateCategoryOrder(category.id, category.order - 1)}
                    className="p-1 bg-white/90 rounded-full hover:bg-white transition-colors"
                  >
                    <ArrowUp className="h-3 w-3 text-gray-600" />
                  </button>
                )}
                {index < categories.length - 1 && (
                  <button
                    onClick={() => updateCategoryOrder(category.id, category.order + 1)}
                    className="p-1 bg-white/90 rounded-full hover:bg-white transition-colors"
                  >
                    <ArrowDown className="h-3 w-3 text-gray-600" />
                  </button>
                )}
              </div>

              {/* Products count */}
              <div className="absolute bottom-3 left-3">
                <div className="bg-black/60 text-white px-2 py-1 rounded-full text-xs font-medium">
                  {category.products?.length || 0} produit{(category.products?.length || 0) > 1 ? 's' : ''}
                </div>
              </div>
            </div>

            <div className="p-4">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-gray-900 text-lg">
                  {category.name}
                </h3>
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                  #{category.order + 1}
                </span>
              </div>

              {category.description && (
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {category.description}
                </p>
              )}

              <div className="flex items-center justify-between">
                <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  category.active 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {category.active ? 'Active' : 'Inactive'}
                </div>
                
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openEditModal(category)}
                    className="p-2"
                  >
                    <Edit3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteCategory(category.id)}
                    className="p-2 text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {categories.length === 0 && (
          <div className="col-span-full text-center py-12">
            <Tag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune catégorie</h3>
            <p className="text-gray-500 mb-6">
              Commencez par créer votre première catégorie pour organiser vos produits.
            </p>
            <Button onClick={openCreateModal}>
              <Plus className="h-4 w-4 mr-2" />
              Créer une catégorie
            </Button>
          </div>
        )}
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

      {/* Category Form Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCategory ? 'Modifier la catégorie' : 'Nouvelle catégorie'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nom de la catégorie *"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            placeholder="Ex: Entrées, Plats principaux..."
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="input-field h-20"
              placeholder="Description de la catégorie..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Image de la catégorie
            </label>
            <ImageUpload
              value={formData.image}
              onChange={(url) => setFormData({ ...formData, image: url })}
              onRemove={() => setFormData({ ...formData, image: '' })}
              placeholder="Télécharger l'image de la catégorie"
            />
          </div>

          <Input
            label="Ordre d'affichage *"
            type="number"
            min="0"
            value={formData.order}
            onChange={(e) => setFormData({ ...formData, order: e.target.value })}
            required
          />

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsModalOpen(false)}
              className="flex-1"
            >
              Annuler
            </Button>
            <Button
              type="submit"
              isLoading={isSubmitting}
              className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
            >
              {editingCategory ? 'Mettre à jour' : 'Créer'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}