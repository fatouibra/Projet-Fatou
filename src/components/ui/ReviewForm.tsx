'use client'

import { useState } from 'react'
import { Button } from './Button'
import { Input } from './Input'
import { StarRating } from './StarRating'
import { useToastStore } from '@/stores/toast'
import { MessageCircle, User } from 'lucide-react'

interface ReviewFormProps {
  restaurantId?: string
  productId?: string
  restaurantName?: string
  productName?: string
  onReviewAdded?: () => void
  className?: string
}

export function ReviewForm({
  restaurantId,
  productId,
  restaurantName,
  productName,
  onReviewAdded,
  className = ''
}: ReviewFormProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [customerName, setCustomerName] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const { addToast } = useToastStore()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!rating) {
      addToast('error', 'Veuillez donner une note')
      return
    }

    if (!customerName.trim()) {
      addToast('error', 'Veuillez entrer votre nom')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rating,
          comment: comment.trim() || undefined,
          customerName: customerName.trim(),
          customerEmail: customerEmail.trim() || undefined,
          restaurantId,
          productId,
        }),
      })

      const data = await response.json()

      if (data.success) {
        addToast('success', 'Avis ajouté avec succès !')
        setRating(0)
        setComment('')
        setCustomerName('')
        setCustomerEmail('')
        setIsOpen(false)
        onReviewAdded?.()
      } else {
        addToast('error', data.error || 'Erreur lors de l\'ajout de l\'avis')
      }
    } catch (error) {
      addToast('error', 'Erreur lors de l\'ajout de l\'avis')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        variant="outline"
        className={className}
      >
        <MessageCircle className="h-4 w-4 mr-2" />
        Laisser un avis
      </Button>
    )
  }

  return (
    <div className={`bg-white rounded-xl border border-gray-200 p-6 ${className}`}>
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Évaluer {restaurantName || productName}
        </h3>
        <p className="text-sm text-gray-600">
          Partagez votre expérience avec les autres clients
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Note *
          </label>
          <StarRating
            rating={rating}
            onRatingChange={setRating}
            size="lg"
            className="mb-1"
          />
          {rating > 0 && (
            <p className="text-sm text-gray-600">
              {rating === 1 && "Très décevant"}
              {rating === 2 && "Décevant"}
              {rating === 3 && "Correct"}
              {rating === 4 && "Bien"}
              {rating === 5 && "Excellent"}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Input
              label="Nom *"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Votre nom"
              className="pl-10"
              required
            />
            <User className="absolute left-3 top-9 h-4 w-4 text-gray-400" />
          </div>

          <Input
            label="Email (optionnel)"
            type="email"
            value={customerEmail}
            onChange={(e) => setCustomerEmail(e.target.value)}
            placeholder="votre@email.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Commentaire (optionnel)
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Décrivez votre expérience..."
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <Button
            type="submit"
            isLoading={isLoading}
            disabled={!rating || !customerName.trim()}
            className="flex-1"
          >
            Publier l'avis
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsOpen(false)}
            className="flex-1"
          >
            Annuler
          </Button>
        </div>
      </form>
    </div>
  )
}