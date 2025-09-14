'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Product } from '@/types'
import { formatPrice } from '@/lib/utils'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { ReviewForm } from '@/components/ui/ReviewForm'
import { ReviewList } from '@/components/ui/ReviewList'
import { StarRating } from '@/components/ui/StarRating'
import { useCartStore } from '@/stores/cart'
import { 
  ArrowLeft, 
  Plus, 
  Minus, 
  Star, 
  Leaf, 
  Zap, 
  Clock,
  ChefHat,
  Heart,
  Share2,
  MessageCircle
} from 'lucide-react'
import { Header } from '@/components/client/Header'
import { LikeButton } from '@/components/ui/LikeButton'

export default function ProductDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [refreshReviews, setRefreshReviews] = useState(0)
  
  const { addItem, removeItem, getItemQuantity } = useCartStore()
  const quantity = product ? getItemQuantity(product.id) : 0

  useEffect(() => {
    if (params.id) {
      fetchProduct(params.id as string)
    }
  }, [params.id])

  const fetchProduct = async (id: string) => {
    try {
      const response = await fetch(`/api/products/${id}`)
      const data = await response.json()
      
      if (data.success) {
        setProduct(data.data)
      } else {
        setError('Produit non trouvé')
      }
    } catch (error) {
      setError('Erreur lors du chargement du produit')
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = () => {
    if (product && product.restaurant) {
      addItem(product, product.restaurant, 1)
    } else {
      console.error('Product or restaurant information missing')
      alert('Erreur: Informations du restaurant manquantes')
    }
  }

  const handleUpdateQuantity = (newQuantity: number) => {
    if (!product || !product.restaurant) return
    
    const currentQuantity = getItemQuantity(product.id)
    
    if (newQuantity > currentQuantity) {
      // Add more items
      for (let i = 0; i < (newQuantity - currentQuantity); i++) {
        addItem(product, product.restaurant, 1)
      }
    } else if (newQuantity < currentQuantity) {
      // Remove items (for simplicity, we'll remove all and add back what's needed)
      // This is a simplified approach - in production you'd want to remove specific items by uniqueId
      const items = useCartStore.getState().items.filter(item => item.id === product.id)
      items.forEach(item => removeItem(item.uniqueId))
      
      // Add back the needed quantity
      for (let i = 0; i < newQuantity; i++) {
        addItem(product, product.restaurant, 1)
      }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center py-12">
            <div className="loading-spinner w-8 h-8"></div>
            <span className="ml-2 text-gray-600">Chargement...</span>
          </div>
        </div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">{error}</h1>
            <Button onClick={() => router.push('/')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour au menu
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary-50/30">
      <Header />
      
      {/* Hero Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 via-transparent to-primary-600/10 pointer-events-none"></div>
      
      <div className="relative container mx-auto px-4 py-8">
        {/* Back Button */}
        <div className="mb-8">
          <Link 
            href="/#menu" 
            className="inline-flex items-center gap-3 text-primary-600 hover:text-primary-700 transition-all duration-300 font-semibold bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg hover:shadow-xl hover:scale-105"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour au menu
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 max-w-7xl mx-auto">
          {/* Product Image */}
          <div className="space-y-6 animate-fade-in-up">
            <div className="relative aspect-square rounded-3xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 group shadow-2xl animate-float">
              {/* Decorative ring */}
              <div className="absolute -inset-1 bg-gradient-to-r from-primary-500 via-pink-500 to-primary-600 rounded-3xl opacity-20 group-hover:opacity-30 transition-opacity duration-500"></div>
              
              <div className="relative aspect-square rounded-3xl overflow-hidden bg-white">
                <Image
                  src={product.image || '/placeholder-food.jpg'}
                  alt={product.name}
                  fill
                  className={`object-cover transition-all duration-700 group-hover:scale-110 ${
                    imageLoaded ? 'opacity-100' : 'opacity-0'
                  }`}
                  onLoad={() => setImageLoaded(true)}
                  priority
                />
                
                {/* Loading skeleton */}
                {!imageLoaded && (
                  <div className="absolute inset-0 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 animate-pulse flex items-center justify-center">
                    <ChefHat className="h-16 w-16 text-gray-400 animate-bounce" />
                  </div>
                )}

                {/* Badges */}
                <div className="absolute top-6 left-6 flex flex-col gap-3">
                  {product.isNew && (
                    <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-3 py-2 rounded-full text-sm font-bold flex items-center gap-2 shadow-lg animate-pulse">
                      <Zap className="h-4 w-4" />
                      Nouveau
                    </div>
                  )}
                  {product.isPopular && (
                    <div className="bg-gradient-to-r from-red-500 to-red-600 text-white px-3 py-2 rounded-full text-sm font-bold flex items-center gap-2 shadow-lg">
                      <div className="w-2 h-2 bg-white rounded-full animate-ping"></div>
                      Populaire
                    </div>
                  )}
                  {product.featured && (
                    <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-yellow-900 px-3 py-2 rounded-full text-sm font-bold flex items-center gap-2 shadow-lg">
                      <Star className="h-4 w-4 fill-current" />
                      Coup de cœur
                    </div>
                  )}
                </div>

                {/* Action buttons */}
                <div className="absolute top-6 right-6 flex flex-col gap-3">
                  <LikeButton
                    targetType="PRODUCT"
                    targetId={product.id}
                    size="md"
                    variant="filled"
                    className="shadow-xl hover:shadow-2xl"
                  />
                  <button className="w-12 h-12 bg-white/95 hover:bg-white rounded-2xl flex items-center justify-center transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-110">
                    <Share2 className="h-5 w-5 text-gray-600 hover:text-primary-600 transition-colors" />
                  </button>
                </div>

                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </div>
            </div>

            {/* Additional info cards */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300 hover:scale-105">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <Clock className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">Préparation</p>
                    <p className="text-xs text-green-600 font-medium">15-20 min</p>
                  </div>
                </div>
              </div>
              
              {product.isVegetarian && (
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300 hover:scale-105">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-500 rounded-2xl flex items-center justify-center shadow-lg">
                      <Leaf className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">Végétarien</p>
                      <p className="text-xs text-green-600 font-medium">Sans viande</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Product Details */}
          <div className="space-y-8 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/30">
              {/* Category */}
              {product.category && (
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-sm text-primary-700 font-bold bg-gradient-to-r from-primary-100 to-primary-200 px-4 py-2 rounded-full shadow-lg border border-primary-200">
                    {product.category.name}
                  </span>
                  {product.isNew && (
                    <div className="flex items-center gap-2 text-blue-600 text-sm bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                      <Zap className="h-4 w-4" />
                      <span className="font-bold">Nouveauté</span>
                    </div>
                  )}
                </div>
              )}

              {/* Title */}
              <h1 className="text-4xl lg:text-5xl font-black text-gray-900 mb-6 leading-tight bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text">
                {product.name}
              </h1>

              {/* Price and Rating */}
              <div className="flex items-baseline gap-6 mb-8">
                <div className="relative">
                  <span className="text-5xl lg:text-6xl font-black bg-gradient-to-r from-primary-600 via-primary-500 to-pink-500 bg-clip-text text-transparent">
                    {formatPrice(product.price)}
                  </span>
                  <div className="absolute -bottom-1 left-0 w-full h-1 bg-gradient-to-r from-primary-500 to-pink-500 rounded-full opacity-30"></div>
                </div>
                {product.rating > 0 && (
                  <div className="flex items-center gap-2 bg-gradient-to-r from-yellow-50 to-orange-50 px-4 py-2 rounded-2xl border border-yellow-200">
                    <StarRating rating={product.rating} readonly size="sm" showValue />
                  </div>
                )}
              </div>

              {/* Features */}
              <div className="flex flex-wrap gap-4 mb-8">
                {product.isPopular && (
                  <div className="flex items-center gap-3 bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-3 rounded-2xl text-sm font-bold shadow-lg hover:shadow-xl transition-shadow">
                    <div className="w-3 h-3 bg-white rounded-full animate-ping"></div>
                    Plat populaire
                  </div>
                )}
                {product.isVegetarian && (
                  <div className="flex items-center gap-3 bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-3 rounded-2xl text-sm font-bold shadow-lg hover:shadow-xl transition-shadow">
                    <Leaf className="h-4 w-4" />
                    Végétarien
                  </div>
                )}
                {product.featured && (
                  <div className="flex items-center gap-3 bg-gradient-to-r from-yellow-400 to-yellow-500 text-yellow-900 px-4 py-3 rounded-2xl text-sm font-bold shadow-lg hover:shadow-xl transition-shadow">
                    <Star className="h-4 w-4 fill-current" />
                    Recommandé par le chef
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            {product.description && (
              <div className="bg-gradient-to-br from-white/80 to-gray-50/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/30">
                <h3 className="font-bold text-xl text-gray-900 mb-4 flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center">
                    <ChefHat className="h-5 w-5 text-white" />
                  </div>
                  Description
                </h3>
                <p className="text-gray-700 leading-relaxed text-lg">
                  {product.description}
                </p>
              </div>
            )}

            {/* Add to Cart */}
            <div className="bg-gradient-to-br from-white via-white to-primary-50/30 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/50 sticky bottom-6 z-30 animate-glow">
              {quantity === 0 ? (
                <div className="space-y-4">
                  <Button 
                    onClick={handleAddToCart}
                    className="w-full h-16 text-xl font-bold rounded-2xl bg-gradient-to-r from-primary-600 via-primary-500 to-pink-500 hover:from-primary-700 hover:via-primary-600 hover:to-pink-600 shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300"
                    size="lg"
                  >
                    <Plus className="h-6 w-6 mr-3" />
                    Ajouter au panier
                  </Button>
                  <div className="text-center">
                    <p className="text-2xl font-black bg-gradient-to-r from-primary-600 to-pink-500 bg-clip-text text-transparent">
                      {formatPrice(product.price)}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-center justify-between bg-gradient-to-r from-gray-50 via-white to-gray-50 rounded-2xl p-6 border border-gray-100">
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => handleUpdateQuantity(quantity - 1)}
                      className="w-14 h-14 p-0 rounded-2xl border-2 border-primary-200 hover:border-primary-300 hover:bg-primary-50 transition-all duration-200 hover:scale-110"
                    >
                      <Minus className="h-6 w-6 text-primary-600" />
                    </Button>
                    
                    <div className="text-center px-6">
                      <span className="text-4xl font-black bg-gradient-to-r from-primary-600 to-pink-500 bg-clip-text text-transparent">
                        {quantity}
                      </span>
                      <p className="text-sm text-gray-600 font-semibold mt-1">
                        {quantity > 1 ? 'articles' : 'article'}
                      </p>
                    </div>
                    
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => handleUpdateQuantity(quantity + 1)}
                      className="w-14 h-14 p-0 rounded-2xl border-2 border-primary-200 hover:border-primary-300 hover:bg-primary-50 transition-all duration-200 hover:scale-110"
                    >
                      <Plus className="h-6 w-6 text-primary-600" />
                    </Button>
                  </div>
                  
                  <div className="text-center bg-gradient-to-r from-primary-50 via-pink-50 to-primary-50 rounded-2xl p-4 border border-primary-100">
                    <p className="text-sm text-gray-600 font-medium mb-1">Total</p>
                    <p className="text-3xl font-black bg-gradient-to-r from-primary-600 via-primary-500 to-pink-500 bg-clip-text text-transparent">
                      {formatPrice(product.price * quantity)}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Reviews Section */}
            <div className="bg-gradient-to-br from-white/80 to-gray-50/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/30">
              <h3 className="font-bold text-xl text-gray-900 mb-6 flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center">
                  <MessageCircle className="h-5 w-5 text-white" />
                </div>
                Avis clients
                {product.rating > 0 && (
                  <div className="ml-2">
                    <StarRating rating={product.rating} readonly size="sm" showValue />
                  </div>
                )}
              </h3>
              
              <div className="space-y-6">
                <ReviewForm
                  productId={product.id}
                  productName={product.name}
                  onReviewAdded={() => setRefreshReviews(prev => prev + 1)}
                />
                
                <ReviewList
                  productId={product.id}
                  refreshTrigger={refreshReviews}
                  limit={5}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}