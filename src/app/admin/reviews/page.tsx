'use client'

import { useEffect, useState } from 'react'
import {
  MessageSquare,
  Star,
  User,
  Calendar,
  Filter,
  TrendingUp,
  Store,
  Search,
  Eye,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react'
import Pagination from '@/components/Pagination'

interface Review {
  id: string
  rating: number
  comment?: string
  customerName: string
  customerEmail?: string
  restaurant?: {
    id: string
    name: string
  }
  product?: {
    id: string
    name: string
  }
  createdAt: string
  updatedAt: string
}


export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRating, setFilterRating] = useState('')
  const [editingReview, setEditingReview] = useState<Review | null>(null)
  const [editedComment, setEditedComment] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)

  const fetchReviews = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/reviews')
      const result = await response.json()
      
      if (response.ok && result.success) {
        setReviews(result.data)
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

  useEffect(() => {
    fetchReviews()
  }, [])

  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, filterRating])

  const filteredReviews = reviews.filter(review => {
    return (
      (review.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
       review.restaurant?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
       review.product?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
       review.comment?.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (filterRating === '' || review.rating.toString() === filterRating)
    )
  })

  const totalItems = filteredReviews.length
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedReviews = filteredReviews.slice(startIndex, endIndex)

  const updateReviewComment = async (reviewId: string, comment: string) => {
    try {
      const response = await fetch('/api/admin/reviews', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewId, comment })
      })

      const result = await response.json()

      if (response.ok && result.success) {
        await fetchReviews()
        setEditingReview(null)
        setEditedComment('')
      } else {
        alert(result.message || 'Erreur lors de la mise à jour')
      }
    } catch (error) {
      console.error('Erreur:', error)
      alert('Erreur de connexion')
    }
  }

  const deleteReview = async (reviewId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet avis ?')) return
    
    try {
      const response = await fetch(`/api/admin/reviews?reviewId=${reviewId}`, {
        method: 'DELETE'
      })
      
      const result = await response.json()
      
      if (response.ok && result.success) {
        await fetchReviews()
      } else {
        alert(result.message || 'Erreur lors de la suppression')
      }
    } catch (error) {
      console.error('Erreur:', error)
      alert('Erreur de connexion')
    }
  }

  const getStats = () => {
    const totalReviews = reviews.length
    const restaurantReviews = reviews.filter(r => r.restaurant).length
    const productReviews = reviews.filter(r => r.product).length
    const averageRating = totalReviews > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
      : 0

    return {
      totalReviews,
      restaurantReviews,
      productReviews,
      averageRating
    }
  }

  const stats = getStats()

  const getRatingStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
          <button
            onClick={fetchReviews}
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <MessageSquare className="h-7 w-7 text-primary-600" />
            Gestion des Avis
          </h1>
          <p className="text-gray-600">Modération et analyse des avis clients</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Avis</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalReviews}</p>
            </div>
            <MessageSquare className="h-8 w-8 text-primary-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Note Moyenne</p>
              <p className="text-2xl font-bold text-gray-900">{stats.averageRating.toFixed(1)}/5</p>
            </div>
            <Star className="h-8 w-8 text-yellow-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Restaurants</p>
              <p className="text-2xl font-bold text-green-600">{stats.restaurantReviews}</p>
            </div>
            <Store className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Produits</p>
              <p className="text-2xl font-bold text-blue-600">{stats.productReviews}</p>
            </div>
            <MessageSquare className="h-8 w-8 text-blue-600" />
          </div>
        </div>
      </div>


      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Rechercher dans les avis..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            value={filterRating}
            onChange={(e) => setFilterRating(e.target.value)}
          >
            <option value="">Toutes les notes</option>
            <option value="5">5 étoiles</option>
            <option value="4">4 étoiles</option>
            <option value="3">3 étoiles</option>
            <option value="2">2 étoiles</option>
            <option value="1">1 étoile</option>
          </select>
          
        </div>
      </div>

      {/* Reviews List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">
            Avis ({totalItems})
          </h2>
        </div>

        <div className="divide-y divide-gray-100">
          {paginatedReviews.map((review) => (
            <div key={review.id} className="p-6 hover:bg-gray-50">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-primary-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{review.customerName}</h4>
                    <p className="text-sm text-gray-500">
                      {review.restaurant?.name || review.product?.name || 'Produit inconnu'}
                      {review.customerEmail && ` • ${review.customerEmail}`}
                    </p>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="flex items-center gap-1 mb-1">
                    {getRatingStars(review.rating)}
                  </div>
                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                    {new Date(review.createdAt).toLocaleDateString('fr-FR')}
                  </span>
                </div>
              </div>

              {review.comment && (
                <div className="mb-3">
                  <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                    "{review.comment}"
                  </p>
                </div>
              )}
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {new Date(review.createdAt).toLocaleDateString('fr-FR')}
                  </div>
                  {review.customerEmail && (
                    <div>
                      Email: {review.customerEmail}
                    </div>
                  )}
                  <div>
                    Type: {review.restaurant ? 'Restaurant' : 'Produit'}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setEditingReview(review)
                      setEditedComment(review.comment || '')
                    }}
                    className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                  >
                    Modifier
                  </button>

                  <button
                    onClick={() => deleteReview(review.id)}
                    className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            </div>
          ))}
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

      {/* Modal pour répondre */}
      {editingReview && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Modifier l'avis de {editingReview.customerName}
              </h3>

              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-1 mb-2">
                  {getRatingStars(editingReview.rating)}
                </div>
                <p className="text-sm text-gray-600">
                  Restaurant/Produit: {editingReview.restaurant?.name || editingReview.product?.name}
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Commentaire
                  </label>
                  <textarea
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    value={editedComment}
                    onChange={(e) => setEditedComment(e.target.value)}
                    placeholder="Commentaire de l'avis..."
                  />
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingReview(null)
                      setEditedComment('')
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                  >
                    Annuler
                  </button>
                  <button
                    type="button"
                    onClick={() => updateReviewComment(editingReview.id, editedComment)}
                    className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700"
                  >
                    Enregistrer
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}