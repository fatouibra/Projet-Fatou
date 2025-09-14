'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Header } from '@/components/client/Header'
import { Restaurant, Category, Product } from '@/types'
import { ProductCard } from '@/components/client/ProductCard'
import { ReviewForm } from '@/components/ui/ReviewForm'
import { ReviewList } from '@/components/ui/ReviewList'
import { StarRating } from '@/components/ui/StarRating'
import { 
  ArrowLeft, 
  Star, 
  Clock, 
  Truck, 
  MapPin, 
  Phone,
  Mail,
  Heart,
  Share2,
  Award,
  Users,
  MessageCircle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { formatPrice } from '@/lib/utils'
import { LikeButton } from '@/components/ui/LikeButton'

export default function RestaurantPage() {
  const params = useParams()
  const restaurantId = params.id as string
  
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [refreshReviews, setRefreshReviews] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [productsPerPage] = useState(12)

  useEffect(() => {
    if (restaurantId) {
      fetchRestaurant()
    }
  }, [restaurantId])

  // Reset to first page when category changes
  useEffect(() => {
    setCurrentPage(1)
  }, [selectedCategory])

  const fetchRestaurant = async () => {
    try {
      const response = await fetch(`/api/restaurants/${restaurantId}`)
      const data = await response.json()
      
      if (data.success) {
        setRestaurant(data.data)
      } else {
        setError('Restaurant non trouvé')
      }
    } catch (error) {
      setError('Erreur lors du chargement du restaurant')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary-50/20">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center py-16">
            <div className="loading-spinner w-12 h-12"></div>
            <span className="ml-4 text-xl text-gray-600 font-medium">Chargement du restaurant...</span>
          </div>
        </div>
      </div>
    )
  }

  if (error || !restaurant) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary-50/20">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-16">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">{error}</h1>
            <Link 
              href="/" 
              className="inline-flex items-center gap-2 bg-primary-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-primary-700 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour à l'accueil
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Group products by category
  const categorizedProducts = restaurant.products?.reduce((acc, product) => {
    const categoryName = product.category?.name || 'Autre'
    if (!acc[categoryName]) {
      acc[categoryName] = []
    }
    acc[categoryName].push(product)
    return acc
  }, {} as Record<string, Product[]>) || {}

  const categories = Object.keys(categorizedProducts)
  const filteredProducts = selectedCategory
    ? categorizedProducts[selectedCategory] || []
    : restaurant.products || []

  // Calculate pagination
  const totalProducts = filteredProducts.length
  const totalPages = Math.ceil(totalProducts / productsPerPage)
  const startIndex = (currentPage - 1) * productsPerPage
  const endIndex = startIndex + productsPerPage
  const currentProducts = filteredProducts.slice(startIndex, endIndex)

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    // Scroll to menu section
    document.getElementById('menu-section')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary-50/20">
      <Header />
      
      {/* Restaurant Hero */}
      <section className="relative overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src={restaurant.image || '/placeholder-restaurant.jpg'}
            alt={restaurant.name}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
        </div>
        
        <div className="relative container mx-auto px-4 py-16 lg:py-24">
          {/* Back Button */}
          <div className="mb-8">
            <Link 
              href="/" 
              className="inline-flex items-center gap-3 text-white hover:text-primary-200 transition-all duration-300 font-semibold bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg hover:shadow-xl hover:scale-105"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour à la recherche
            </Link>
          </div>

          <div className="max-w-4xl">
            {/* Restaurant Header */}
            <div className="flex flex-col lg:flex-row lg:items-end gap-8 mb-8">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <span className="bg-primary-500 text-white px-4 py-2 rounded-full text-sm font-bold">
                    {restaurant.cuisine}
                  </span>
                  <div className="flex items-center gap-1 bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full">
                    <Star className="h-4 w-4 fill-current" />
                    <span className="font-bold text-sm">{restaurant.rating.toFixed(1)}</span>
                  </div>
                </div>
                
                <h1 className="text-4xl lg:text-6xl font-black text-white mb-4 leading-tight">
                  {restaurant.name}
                </h1>
                
                {restaurant.description && (
                  <p className="text-xl text-white/90 font-medium leading-relaxed mb-6">
                    {restaurant.description}
                  </p>
                )}

                {/* Restaurant Stats */}
                <div className="flex flex-wrap gap-6 text-white/80">
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    <span className="font-medium">25-40 min</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Truck className="h-5 w-5" />
                    <span className="font-medium">
                      {restaurant.deliveryFee === 0 ? 'Livraison gratuite' : `Livraison ${formatPrice(restaurant.deliveryFee)}`}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    <span className="font-medium">Min. {formatPrice(restaurant.minOrderAmount)}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-4">
                <LikeButton
                  targetType="RESTAURANT"
                  targetId={restaurant.id}
                  size="lg"
                  variant="minimal"
                  className="bg-white/20 hover:bg-white/30 backdrop-blur-sm"
                />
                <button className="w-14 h-14 bg-white/20 hover:bg-white/30 rounded-2xl flex items-center justify-center transition-colors backdrop-blur-sm">
                  <Share2 className="h-6 w-6 text-white" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Restaurant Info Cards */}
      <section className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 -mt-16 relative z-10">
          {/* Contact Info */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-xl border border-white/30">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center">
                <Phone className="h-5 w-5 text-white" />
              </div>
              <h3 className="font-bold text-gray-900">Contact</h3>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-gray-400" />
                <span className="text-gray-700">{restaurant.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-gray-400" />
                <span className="text-gray-700">{restaurant.email}</span>
              </div>
            </div>
          </div>

          {/* Address */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-xl border border-white/30">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center">
                <MapPin className="h-5 w-5 text-white" />
              </div>
              <h3 className="font-bold text-gray-900">Adresse</h3>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed">
              {restaurant.address}
            </p>
          </div>

          {/* Hours */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-xl border border-white/30">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center">
                <Clock className="h-5 w-5 text-white" />
              </div>
              <h3 className="font-bold text-gray-900">Horaires</h3>
            </div>
            <p className="text-sm text-gray-700">
              {restaurant.openingHours}
            </p>
            <p className="text-xs text-green-600 font-medium mt-2">
              • Ouvert maintenant
            </p>
          </div>
        </div>
      </section>

      {/* Menu Section */}
      <section id="menu-section" className="container mx-auto px-4 pb-16">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center shadow-lg">
            <Award className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-black text-gray-900">Notre Menu</h2>
            <p className="text-gray-600 font-medium">
              {totalProducts > 0 && (
                <>
                  {selectedCategory 
                    ? `${totalProducts} plats dans "${selectedCategory}"` 
                    : `${restaurant.products?.length || 0} plats disponibles`}
                  {totalPages > 1 && (
                    <span className="ml-2">• Page {currentPage} sur {totalPages}</span>
                  )}
                </>
              )}
            </p>
          </div>
        </div>

        {/* Category Filters */}
        {categories.length > 1 && (
          <div className="mb-8">
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setSelectedCategory('')}
                className={`px-6 py-3 rounded-2xl font-bold text-sm transition-all duration-300 ${
                  selectedCategory === '' 
                    ? 'bg-primary-600 text-white shadow-lg' 
                    : 'bg-white/80 text-gray-700 hover:bg-primary-100 border border-gray-200'
                }`}
              >
                Tout voir ({restaurant.products?.length || 0})
              </button>
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-6 py-3 rounded-2xl font-bold text-sm transition-all duration-300 ${
                    selectedCategory === category 
                      ? 'bg-primary-600 text-white shadow-lg' 
                      : 'bg-white/80 text-gray-700 hover:bg-primary-100 border border-gray-200'
                  }`}
                >
                  {category} ({categorizedProducts[category]?.length || 0})
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Products Grid */}
        {currentProducts.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {currentProducts.map((product) => (
                <ProductCard key={product.id} product={product} restaurant={restaurant} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-12">
                <button
                  onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Précédent
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                    // Show first, last, current, and pages around current
                    const showPage = page === 1 || 
                                   page === totalPages || 
                                   (page >= currentPage - 1 && page <= currentPage + 1)
                    
                    if (!showPage) {
                      // Show ellipsis
                      if (page === currentPage - 2 || page === currentPage + 2) {
                        return <span key={page} className="px-2 text-gray-500">...</span>
                      }
                      return null
                    }

                    return (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                          page === currentPage
                            ? 'bg-primary-600 text-white'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {page}
                      </button>
                    )
                  })}
                </div>

                <button
                  onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Suivant
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-gray-200 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <Award className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Aucun plat disponible</h3>
            <p className="text-gray-600">Ce restaurant travaille actuellement sur son menu.</p>
          </div>
        )}
      </section>

      {/* Reviews Section */}
      <section className="container mx-auto px-4 pb-16">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center shadow-lg">
            <MessageCircle className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-black text-gray-900">Avis clients</h2>
            <div className="flex items-center gap-2 mt-1">
              <StarRating rating={restaurant.rating} readonly showValue />
              <span className="text-gray-600">•</span>
              <span className="text-gray-600">Partagez votre expérience</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <ReviewForm
              restaurantId={restaurant.id}
              restaurantName={restaurant.name}
              onReviewAdded={() => setRefreshReviews(prev => prev + 1)}
              className="sticky top-4"
            />
          </div>
          
          <div className="lg:col-span-2">
            <ReviewList
              restaurantId={restaurant.id}
              refreshTrigger={refreshReviews}
            />
          </div>
        </div>
      </section>
    </div>
  )
}