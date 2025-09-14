'use client'

import { useEffect, useState } from 'react'
import { useAuthStore } from '@/stores/auth'
import { formatPrice } from '@/lib/utils'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { ImageUpload } from '@/components/ui/ImageUpload'
import { toast } from '@/stores/toast'
import {
  Package,
  Plus,
  Edit3,
  Trash2,
  Eye,
  EyeOff,
  Star,
  Heart,
  Search,
  Filter,
  ChefHat,
  Leaf,
  Zap,
  Image as ImageIcon
} from 'lucide-react'
import Image from 'next/image'
import Pagination from '@/components/Pagination'

interface Product {
  id: string
  name: string
  description?: string
  price: number
  image?: string
  rating: number
  likesCount: number
  active: boolean
  featured: boolean
  isNew: boolean
  isPopular: boolean
  isVegetarian: boolean
  category: {
    id: string
    name: string
  }
  createdAt: string
  updatedAt: string
}

interface Category {
  id: string
  name: string
  active: boolean
}

export default function RestaurantProducts() {
  const { user } = useAuthStore()
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(12)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    categoryId: '',
    image: '',
    featured: false,
    isNew: false,
    isPopular: false,
    isVegetarian: false
  })
  
  console.log('Current formData state:', formData)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (user?.restaurantId) {
      fetchProducts()
      fetchCategories()
    }
  }, [user])

  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, selectedCategory])

  const fetchProducts = async () => {
    try {
      const response = await fetch(`/api/restaurant/${user?.restaurantId}/products`)
      if (response.ok) {
        const data = await response.json()
        setProducts(data.products || [])
      }
    } catch (error) {
      console.error('Erreur lors du chargement des produits:', error)
    }
  }

  const fetchCategories = async () => {
    try {
      // Utiliser l'API spécialisée pour les catégories disponibles pour les produits
      const response = await fetch(`/api/restaurant/${user?.restaurantId}/categories-for-products`)
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setCategories(data.data)
        }
      }
    } catch (error) {
      console.error('Erreur lors du chargement des catégories:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleProductStatus = async (productId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ active: !currentStatus }),
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          setProducts(products.map(product => 
            product.id === productId 
              ? { ...product, active: !currentStatus }
              : product
          ))
        }
      }
    } catch (error) {
      console.error('Erreur lors de la modification du produit:', error)
    }
  }

  const deleteProduct = async (productId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
      return
    }

    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          setProducts(products.filter(product => product.id !== productId))
        }
      }
    } catch (error) {
      console.error('Erreur lors de la suppression du produit:', error)
    }
  }

  const handleSubmitProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user?.restaurantId) return

    setIsSubmitting(true)
    try {
      const productData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        categoryId: formData.categoryId,
        image: formData.image || null,
        featured: formData.featured,
        isNew: formData.isNew,
        isPopular: formData.isPopular,
        isVegetarian: formData.isVegetarian,
        restaurantId: user.restaurantId
      }

      const response = await fetch(
        editingProduct 
          ? `/api/products/${editingProduct.id}`
          : `/api/restaurant/${user.restaurantId}/products`,
        {
          method: editingProduct ? 'PUT' : 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(productData),
        }
      )

      const result = await response.json()
      if (result.success) {
        const productData = result.data || result.product
        if (editingProduct) {
          setProducts(products.map(p => p.id === editingProduct.id ? productData : p))
          toast.success('Produit modifié', 'Le produit a été modifié avec succès')
        } else {
          setProducts([...products, productData])
          toast.success('Produit créé', 'Le produit a été créé avec succès')
        }
        handleCloseModal()
      } else {
        toast.error('Erreur', result.message || 'Erreur lors de la sauvegarde du produit')
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du produit:', error)
      toast.error('Erreur', 'Une erreur est survenue lors de la sauvegarde')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      description: product.description || '',
      price: product.price.toString(),
      categoryId: product.category.id,
      image: product.image || '',
      featured: product.featured,
      isNew: product.isNew,
      isPopular: product.isPopular,
      isVegetarian: product.isVegetarian
    })
    setShowAddModal(true)
  }

  const handleCloseModal = () => {
    setShowAddModal(false)
    setEditingProduct(null)
    setFormData({
      name: '',
      description: '',
      price: '',
      categoryId: '',
      image: '',
      featured: false,
      isNew: false,
      isPopular: false,
      isVegetarian: false
    })
  }

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === '' || product.category.id === selectedCategory
    return matchesSearch && matchesCategory
  })

  const totalItems = filteredProducts.length
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex)

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
            <Package className="h-6 w-6" />
            Gestion des produits
          </h1>
          <p className="text-gray-600 mt-1">
            Gérez vos plats et boissons
          </p>
        </div>
        
        <Button onClick={() => setShowAddModal(true)} className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600">
          <Plus className="h-4 w-4 mr-2" />
          Nouveau produit
        </Button>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher un produit..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="sm:w-48">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="">Toutes les catégories</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-orange-50 rounded-lg">
              <Package className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total produits</p>
              <p className="text-2xl font-bold text-gray-900">{products.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-50 rounded-lg">
              <Eye className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Actifs</p>
              <p className="text-2xl font-bold text-gray-900">
                {products.filter(p => p.active).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-50 rounded-lg">
              <Star className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Mis en avant</p>
              <p className="text-2xl font-bold text-gray-900">
                {products.filter(p => p.featured).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-orange-50 rounded-lg">
              <Heart className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total likes</p>
              <p className="text-2xl font-bold text-gray-900">
                {products.reduce((sum, p) => sum + p.likesCount, 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Product Form Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">{editingProduct ? 'Modifier le produit' : 'Nouveau produit'}</h2>
              <button
                onClick={handleCloseModal}
                className="rounded-full p-1 hover:bg-gray-100 transition-colors"
              >
                <span className="sr-only">Fermer</span>
                ✕
              </button>
            </div>
        <form onSubmit={handleSubmitProduct} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Nom du produit *"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ex: Thieboudienne au poisson"
              required
            />
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Catégorie *
              </label>
              <select
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                className="input-field"
                required
              >
                <option value="">Sélectionner une catégorie</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <Input
            label="Prix (F CFA) *"
            type="number"
            step="0.01"
            min="0"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            placeholder="Ex: 2500"
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="input-field h-20"
              placeholder="Décrivez votre plat..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Image du produit
            </label>
            <ImageUpload
              value={formData.image}
              onChange={(url) => setFormData({ ...formData, image: url })}
              onRemove={() => setFormData({ ...formData, image: '' })}
              placeholder="Télécharger l'image du produit"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Options
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.featured}
                  onChange={(e) => {
                    console.log('Checkbox clicked!', e.target.checked);
                    console.log('Current formData.featured:', formData.featured);
                    setFormData({ ...formData, featured: e.target.checked });
                    console.log('After setFormData call');
                  }}
                />
                <span className="ml-2 text-sm text-gray-600">Mis en avant TEST</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.isNew}
                  onChange={(e) => setFormData({ ...formData, isNew: e.target.checked })}
                  className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                />
                <span className="ml-2 text-sm text-gray-600">Nouveau</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.isPopular}
                  onChange={(e) => setFormData({ ...formData, isPopular: e.target.checked })}
                  className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                />
                <span className="ml-2 text-sm text-gray-600">Populaire</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.isVegetarian}
                  onChange={(e) => setFormData({ ...formData, isVegetarian: e.target.checked })}
                  className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                />
                <span className="ml-2 text-sm text-gray-600">Végétarien</span>
              </label>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={handleCloseModal}
              className="flex-1"
            >
              Annuler
            </Button>
            <Button
              type="submit"
              isLoading={isSubmitting}
              className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
            >
              {editingProduct ? 'Mettre à jour' : 'Créer'}
            </Button>
          </div>
        </form>
          </div>
        </div>
      )}

      {/* Liste des produits */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">
            Produits ({totalItems})
          </h2>
        </div>

      {/* Close the white container and start Products Grid */}
      </div>

      {/* Products Grid */}
      {paginatedProducts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {paginatedProducts.map((product) => (
            <div key={product.id} className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
              <div className="relative h-48">
                {product.image ? (
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                    <ImageIcon className="h-12 w-12 text-gray-400" />
                  </div>
                )}
                
                {/* Status overlay */}
                <div className="absolute top-3 left-3">
                  <button
                    onClick={() => toggleProductStatus(product.id, product.active)}
                    className={`p-1.5 rounded-full transition-colors ${
                      product.active 
                        ? 'bg-green-100 text-green-600 hover:bg-green-200' 
                        : 'bg-red-100 text-red-600 hover:bg-red-200'
                    }`}
                  >
                    {product.active ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </button>
                </div>

                {/* Badges */}
                <div className="absolute top-3 right-3 flex flex-col gap-1">
                  {product.featured && <Star className="h-4 w-4 text-yellow-500" />}
                  {product.isNew && <Zap className="h-4 w-4 text-orange-500" />}
                  {product.isPopular && <div className="w-2 h-2 bg-orange-500 rounded-full" />}
                  {product.isVegetarian && <Leaf className="h-4 w-4 text-green-500" />}
                </div>

                {/* Stats overlay */}
                <div className="absolute bottom-3 left-3 flex items-center gap-2">
                  <div className="bg-black/60 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    {product.rating.toFixed(1)}
                  </div>
                  <div className="bg-black/60 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                    <Heart className="h-3 w-3 text-red-400" />
                    {product.likesCount}
                  </div>
                </div>
              </div>

              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-medium text-gray-900 truncate flex-1">
                    {product.name}
                  </h3>
                  <span className="text-lg font-bold text-orange-600 ml-2">
                    {formatPrice(product.price)}
                  </span>
                </div>

                {product.description && (
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {product.description}
                  </p>
                )}

                <div className="flex flex-col gap-1 mb-3">
                  <span className="text-xs text-gray-500">
                    📂 {product.category?.name}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    product.active 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {product.active ? 'Actif' : 'Inactif'}
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditProduct(product)}
                      className="p-2"
                    >
                      <Edit3 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteProduct(product.id)}
                      className="p-2 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-12 text-center">
          <div className="p-12 text-center">
            <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm || selectedCategory ? 'Aucun produit trouvé' : 'Aucun produit'}
            </h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || selectedCategory
                ? 'Essayez de modifier vos filtres de recherche.'
                : 'Commencez par ajouter vos premiers produits.'
              }
            </p>
            {!searchTerm && !selectedCategory && (
              <Button onClick={() => setShowAddModal(true)} className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600">
                <Plus className="h-4 w-4 mr-2" />
                Ajouter un produit
              </Button>
            )}
          </div>
        </div>
      )}

      {totalItems > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
          />
        </div>
      )}
    </div>
  )
}