'use client'

import { useEffect, useState } from 'react'
import { Heart } from 'lucide-react'
import { useLikesStore } from '@/stores/likes'

interface LikeButtonProps {
  targetType: 'PRODUCT' | 'RESTAURANT'
  targetId: string
  userPhone?: string
  userEmail?: string
  className?: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'filled' | 'outline' | 'minimal'
  showCount?: boolean
  initialCount?: number
}

const sizeClasses = {
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-12 h-12'
}

const iconSizes = {
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-6 w-6'
}

export function LikeButton({
  targetType,
  targetId,
  userPhone,
  userEmail,
  className = '',
  size = 'md',
  variant = 'filled',
  showCount = false,
  initialCount = 0
}: LikeButtonProps) {
  const { toggleLike, isLiked, initializeUserFingerprint } = useLikesStore()
  const [isLoading, setIsLoading] = useState(false)
  const [likesCount, setLikesCount] = useState(initialCount)
  const [mounted, setMounted] = useState(false)

  // S'assurer que le composant est monté côté client
  useEffect(() => {
    setMounted(true)
    initializeUserFingerprint()
  }, [initializeUserFingerprint])

  // Mettre à jour le compteur quand le like change
  useEffect(() => {
    if (mounted) {
      const liked = isLiked(targetType, targetId)
      // Ajuster le compteur basé sur l'état actuel vs initial
      // Cette logique est approximative car on ne connaît pas l'état initial exact
    }
  }, [mounted, targetType, targetId, isLiked])

  if (!mounted) {
    // Rendu côté serveur - état neutre
    return (
      <button
        className={`
          ${sizeClasses[size]} rounded-full flex items-center justify-center
          bg-gray-100 text-gray-400 transition-all duration-200
          ${className}
        `}
        disabled
      >
        <Heart className={iconSizes[size]} />
      </button>
    )
  }

  const liked = isLiked(targetType, targetId)

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (isLoading) return

    setIsLoading(true)
    
    try {
      const newLiked = await toggleLike(targetType, targetId, userPhone, userEmail)
      
      // Mise à jour optimiste du compteur
      setLikesCount(prev => {
        if (newLiked && !liked) {
          return prev + 1
        } else if (!newLiked && liked) {
          return Math.max(0, prev - 1)
        }
        return prev
      })
    } catch (error) {
      console.error('Error toggling like:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getButtonClasses = () => {
    const baseClasses = `
      ${sizeClasses[size]} rounded-full flex items-center justify-center
      transition-all duration-300 transform hover:scale-110 active:scale-95
      disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
      ${className}
    `

    switch (variant) {
      case 'filled':
        return `${baseClasses} ${
          liked 
            ? 'bg-red-100 text-red-500 shadow-lg shadow-red-500/25' 
            : 'bg-gray-100 hover:bg-red-50 text-gray-400 hover:text-red-400'
        }`
      
      case 'outline':
        return `${baseClasses} border-2 ${
          liked 
            ? 'border-red-500 bg-red-50 text-red-500' 
            : 'border-gray-300 bg-white hover:border-red-300 text-gray-400 hover:text-red-400'
        }`
      
      case 'minimal':
        return `${baseClasses} ${
          liked 
            ? 'text-red-500' 
            : 'text-gray-400 hover:text-red-400'
        }`
      
      default:
        return baseClasses
    }
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleToggle}
        disabled={isLoading}
        className={getButtonClasses()}
        title={liked ? 'Retirer des favoris' : 'Ajouter aux favoris'}
      >
        <Heart 
          className={`
            ${iconSizes[size]} transition-all duration-300
            ${liked ? 'fill-current' : ''}
            ${isLoading ? 'animate-pulse' : ''}
          `}
        />
      </button>
      
      {showCount && (
        <span className="text-sm font-medium text-gray-600">
          {likesCount}
        </span>
      )}
    </div>
  )
}