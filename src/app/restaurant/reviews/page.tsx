'use client'

import { useEffect, useState } from 'react'
import { useAuthStore } from '@/stores/auth'
import { formatPrice } from '@/lib/utils'
import {
  MessageSquare,
  Star,
  User,
  Calendar,
  Filter,
  TrendingUp,
  Award,
  AlertTriangle,
  Search,
  Eye,
  MessageCircle,
  ThumbsUp,
  Package
} from 'lucide-react'
import Image from 'next/image'

interface Review {
  id: string
  rating: number
  comment?: string
  customerName: string
  createdAt: string
  order: {
    id: string
    orderNumber: string
    total: number
  }
  product?: {
    id: string
    name: string
    image?: string
  }
}

interface ReviewStats {
  totalReviews: number
  averageRating: number
  ratingDistribution: {
    5: number
    4: number
    3: number
    2: number
    1: number
  }
  recentReviews: Review[]
}

export default function RestaurantReviews() {
  const { user } = useAuthStore()
  const [stats, setStats] = useState<ReviewStats | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRating, setSelectedRating] = useState<number | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedPeriod, setSelectedPeriod] = useState('30')

  useEffect(() => {
    if (user?.restaurantId) {
      fetchReviews()
    }
  }, [user, selectedRating, selectedPeriod])

  const fetchReviews = async () => {
    setLoading(true)
    try {
      let url = `/api/restaurant/${user?.restaurantId}/reviews?period=${selectedPeriod}`
      
      if (selectedRating) {
        url += `&rating=${selectedRating}`
      }

      const response = await fetch(url)
      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          setStats(result.data.stats)
          setReviews(result.data.reviews)
        }
      }
    } catch (error) {
      console.error('Erreur lors du chargement des avis:', error)
    } finally {
      setLoading(false)
    }
  }

  const getRatingStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`h-4 w-4 ${
          index < rating
            ? 'text-yellow-400 fill-yellow-400'
            : 'text-gray-300'
        }`}
      />
    ))
  }

  const getRatingBadge = (rating: number) => {
    if (rating >= 4.5) return { color: 'bg-green-100 text-green-800', label: 'Excellent' }
    if (rating >= 4) return { color: 'bg-blue-100 text-blue-800', label: 'Très bien' }
    if (rating >= 3) return { color: 'bg-yellow-100 text-yellow-800', label: 'Bien' }
    if (rating >= 2) return { color: 'bg-orange-100 text-orange-800', label: 'Moyen' }
    return { color: 'bg-red-100 text-red-800', label: 'Faible' }
  }

  const filteredReviews = reviews.filter(review => {
    const matchesSearch = review.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         review.comment?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         review.order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="loading-spinner w-8 h-8"></div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Aucun avis disponible
        </h3>
        <p className="text-gray-600">
          Les avis clients apparaîtront ici une fois que vous aurez des commandes livrées.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <MessageSquare className="h-6 w-6" />
            Reviews & Ratings
          </h1>
          <p className="text-gray-600 mt-1">
            Gérez les avis et notes de vos clients
          </p>
        </div>

        {/* Filtres */}
        <div className="flex flex-wrap gap-2">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white"
          >
            <option value="7">7 derniers jours</option>
            <option value="30">30 derniers jours</option>
            <option value="90">90 derniers jours</option>
            <option value="all">Tous les avis</option>
          </select>
          
          <select
            value={selectedRating || ''}
            onChange={(e) => setSelectedRating(e.target.value ? parseInt(e.target.value) : null)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white"
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

      {/* Statistiques générales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-orange-50 to-red-50 rounded-lg">
              <Star className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Note moyenne</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.averageRating.toFixed(1)}
              </p>
              <div className="flex items-center gap-1 mt-1">
                {getRatingStars(Math.round(stats.averageRating))}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-orange-50 to-red-50 rounded-lg">
              <MessageCircle className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total avis</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.totalReviews}
              </p>
              <p className="text-xs text-gray-500">
                Depuis le début
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-orange-50 to-red-50 rounded-lg">
              <Award className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Avis positifs</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.ratingDistribution[5] + stats.ratingDistribution[4]}
              </p>
              <p className="text-xs text-green-600">
                4-5 étoiles
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-orange-50 to-red-50 rounded-lg">
              <TrendingUp className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Satisfaction</p>
              <p className="text-2xl font-bold text-gray-900">
                {(((stats.ratingDistribution[5] + stats.ratingDistribution[4]) / stats.totalReviews) * 100).toFixed(0)}%
              </p>
              <p className="text-xs text-gray-500">
                Clients satisfaits
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Distribution des notes */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">Distribution des notes</h2>
        </div>
        <div className="p-6">
          <div className="space-y-3">
            {[5, 4, 3, 2, 1].map((rating) => {
              const count = stats.ratingDistribution[rating as keyof typeof stats.ratingDistribution]
              const percentage = stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0
              
              return (
                <div key={rating} className="flex items-center gap-4">
                  <div className="flex items-center gap-1 w-20">
                    <span className="text-sm font-medium">{rating}</span>
                    <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                  </div>
                  <div className="flex-1 bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-orange-500 to-red-500 h-3 rounded-full transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <div className="text-sm text-gray-600 w-16 text-right">
                    {count} ({percentage.toFixed(0)}%)
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Recherche */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher dans les avis..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Liste des avis */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">
            Avis récents ({filteredReviews.length})
          </h2>
        </div>
        
        <div className="divide-y divide-gray-100">
          {filteredReviews.length > 0 ? (
            filteredReviews.map((review) => {
              const badge = getRatingBadge(review.rating)
              
              return (
                <div key={review.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className="w-10 h-10 bg-gradient-to-br from-orange-100 to-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="h-5 w-5 text-orange-600" />
                    </div>
                    
                    {/* Contenu */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {review.customerName}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex items-center gap-1">
                              {getRatingStars(review.rating)}
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${badge.color}`}>
                              {badge.label}
                            </span>
                          </div>
                        </div>
                        
                        <div className="text-right text-sm text-gray-500">
                          <p className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {new Date(review.createdAt).toLocaleDateString('fr-FR')}
                          </p>
                          <p className="mt-1">
                            Commande #{review.order.orderNumber}
                          </p>
                        </div>
                      </div>
                      
                      {review.comment && (
                        <p className="text-gray-700 mb-3 leading-relaxed">
                          "{review.comment}"
                        </p>
                      )}
                      
                      {review.product && (
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <div className="w-8 h-8 relative rounded bg-gray-100">
                            {review.product.image ? (
                              <Image
                                src={review.product.image}
                                alt={review.product.name}
                                fill
                                className="object-cover rounded"
                              />
                            ) : (
                              <Package className="h-4 w-4 text-gray-400 absolute inset-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                            )}
                          </div>
                          <span className="text-sm text-gray-600">
                            Avis sur: <strong>{review.product.name}</strong>
                          </span>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between mt-3 text-sm text-gray-500">
                        <span>Commande: {formatPrice(review.order.total)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })
          ) : (
            <div className="p-12 text-center">
              <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm ? 'Aucun avis trouvé' : 'Aucun avis'}
              </h3>
              <p className="text-gray-600">
                {searchTerm 
                  ? 'Essayez de modifier vos critères de recherche.'
                  : 'Les avis clients apparaîtront ici après les livraisons.'
                }
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}