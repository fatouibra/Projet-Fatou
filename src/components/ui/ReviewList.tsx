'use client'

import { useEffect, useState } from 'react'
import { StarRating } from './StarRating'
import { Button } from './Button'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'
import type { Review } from '@/types'

interface ReviewListProps {
  restaurantId?: string
  productId?: string
  limit?: number
  className?: string
  refreshTrigger?: number
}

export function ReviewList({
  restaurantId,
  productId,
  limit = 10,
  className = '',
  refreshTrigger = 0
}: ReviewListProps) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)

  const loadReviews = async (pageNum = 1, append = false) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: pageNum.toString(),
        limit: limit.toString(),
      })
      
      if (restaurantId) params.append('restaurantId', restaurantId)
      if (productId) params.append('productId', productId)

      const response = await fetch(`/api/reviews?${params}`)
      const data = await response.json()

      if (data.success) {
        const newReviews = append ? [...reviews, ...data.data.reviews] : data.data.reviews
        setReviews(newReviews)
        setHasMore(data.data.pagination.page < data.data.pagination.pages)
      }
    } catch (error) {
      console.error('Error loading reviews:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadReviews()
  }, [restaurantId, productId, refreshTrigger])

  const handleLoadMore = () => {
    const nextPage = page + 1
    setPage(nextPage)
    loadReviews(nextPage, true)
  }

  if (loading && reviews.length === 0) {
    return (
      <div className={`animate-pulse space-y-4 ${className}`}>
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-gray-100 rounded-lg p-4 h-24"></div>
        ))}
      </div>
    )
  }

  if (reviews.length === 0) {
    return (
      <div className={`text-center py-8 text-gray-500 ${className}`}>
        <p>Aucun avis pour le moment</p>
        <p className="text-sm">Soyez le premier à laisser votre avis !</p>
      </div>
    )
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {reviews.map((review) => (
        <div
          key={review.id}
          className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-sm transition-shadow"
        >
          <div className="flex items-start justify-between mb-2">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-medium text-gray-900">{review.customerName}</h4>
                <StarRating rating={review.rating} readonly size="sm" />
              </div>
              <p className="text-xs text-gray-500">
                {formatDistanceToNow(new Date(review.createdAt), {
                  addSuffix: true,
                  locale: fr,
                })}
              </p>
            </div>
          </div>

          {review.comment && (
            <p className="text-gray-700 text-sm leading-relaxed mt-2">
              {review.comment}
            </p>
          )}
        </div>
      ))}

      {hasMore && (
        <div className="text-center pt-4">
          <Button
            onClick={handleLoadMore}
            variant="outline"
            isLoading={loading}
          >
            Voir plus d'avis
          </Button>
        </div>
      )}
    </div>
  )
}