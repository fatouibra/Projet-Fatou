'use client'

import { Plus, Minus } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { Product } from '@/types'
import { formatPrice } from '@/lib/utils'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { StarRating } from '@/components/ui/StarRating'
import { useCartStore } from '@/stores/cart'
import { LikeButton } from '@/components/ui/LikeButton'

interface ProductCardProps {
  product: Product
  restaurant?: any // Restaurant from the context
}

export function ProductCard({ product, restaurant }: ProductCardProps) {
  const { addItem, updateQuantity, getItemQuantity } = useCartStore()
  const quantity = getItemQuantity(product.id)

  // Get restaurant from product relationship or prop
  const restaurantInfo = restaurant || product.restaurant

  const handleAddToCart = () => {
    if (!restaurantInfo) {
      console.error('Restaurant information missing for product:', product.name)
      alert('Erreur: Informations du restaurant manquantes')
      return
    }
    
    addItem(product, restaurantInfo, 1)
  }

  const handleUpdateQuantity = (newQuantity: number) => {
    // Pour l'update, nous devons trouver l'item dans le panier par son uniqueId
    // Pour simplifier, on peut juste re-ajouter/retirer
    if (newQuantity === 0) {
      // Pour l'instant, on utilisera l'ancien système pour la compatibilité
      updateQuantity(product.id + '_*', newQuantity)
    } else {
      const currentQuantity = getItemQuantity(product.id)
      if (newQuantity > currentQuantity) {
        handleAddToCart()
      }
    }
  }

  return (
    <div className="card group hover:scale-105 animate-fade-in">
      {/* Product Image - Clickable */}
      <Link href={`/product/${product.id}`} className="block">
        <div className="relative h-48 mb-4 overflow-hidden rounded-xl cursor-pointer">
          <Image
            src={product.image || '/placeholder-food.jpg'}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-300"
          />
          
          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1">
            {product.isNew && <Badge variant="new">Nouveau</Badge>}
            {product.isPopular && <Badge variant="popular">Populaire</Badge>}
            {product.isVegetarian && <Badge variant="vegetarian">Végétarien</Badge>}
          </div>

          {/* Like Button */}
          <div className="absolute top-3 right-3 z-10">
            <LikeButton
              targetType="PRODUCT"
              targetId={product.id}
              size="sm"
              variant="filled"
            />
          </div>
        </div>
      </Link>

      {/* Product Info - Clickable */}
      <Link href={`/product/${product.id}`} className="block flex-1">
        <h3 className="font-semibold text-lg text-gray-900 mb-2 group-hover:text-primary-600 transition-colors cursor-pointer">
          {product.name}
        </h3>
        
        {product.description && (
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {product.description}
          </p>
        )}

        <div className="flex items-center justify-between mb-2">
          <span className="text-primary-600 font-bold text-lg">
            {formatPrice(product.price)}
          </span>
        </div>

        {/* Rating */}
        {product.rating > 0 && (
          <div className="flex items-center gap-1">
            <StarRating rating={product.rating} readonly size="sm" showValue />
          </div>
        )}
      </Link>

      {/* Add to Cart Section */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        {quantity === 0 ? (
          <Button 
            onClick={handleAddToCart}
            className="w-full"
            size="sm"
          >
            <Plus className="h-4 w-4 mr-1" />
            Ajouter
          </Button>
        ) : (
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleUpdateQuantity(quantity - 1)}
              className="px-3"
            >
              <Minus className="h-4 w-4" />
            </Button>
            
            <span className="font-semibold px-4">
              {quantity}
            </span>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleUpdateQuantity(quantity + 1)}
              className="px-3"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}