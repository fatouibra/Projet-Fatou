'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Header } from '@/components/client/Header'
import { SearchBar } from '@/components/marketplace/SearchBar'
import { RestaurantCard } from '@/components/marketplace/RestaurantCard'
import { SearchResult, Restaurant, Product } from '@/types'
import { 
  Search, 
  Filter, 
  MapPin, 
  Clock, 
  Star,
  Utensils,
  ChefHat,
  ArrowLeft
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { formatPrice } from '@/lib/utils'

export default function SearchPage() {
  const searchParams = useSearchParams()
  const query = searchParams.get('q') || ''
  const cuisine = searchParams.get('cuisine') || ''
  
  const [searchResults, setSearchResults] = useState<SearchResult>({
    restaurants: [],
    products: [],
    totalRestaurants: 0,
    totalProducts: 0
  })
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'restaurants' | 'dishes'>('restaurants')

  useEffect(() => {
    if (query || cuisine) {
      performSearch()
    } else {
      setLoading(false)
    }
  }, [query, cuisine])

  const performSearch = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (query) params.append('q', query)
      if (cuisine) params.append('cuisine', cuisine)
      
      const response = await fetch(`/api/search?${params}`)
      const data = await response.json()
      
      if (data.success) {
        setSearchResults(data.data)
        // Auto-switch to dishes tab if more dishes than restaurants
        if (data.data.totalProducts > data.data.totalRestaurants) {
          setActiveTab('dishes')
        }
      }
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleNewSearch = (newQuery: string) => {
    const url = new URL(window.location.href)
    url.searchParams.set('q', newQuery)
    if (cuisine) url.searchParams.delete('cuisine')
    window.location.href = url.toString()
  }

  const searchTerm = query || cuisine

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary-50/20">
      <Header />
      
      {/* Search Header */}
      <section className="bg-white/60 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-6">
          {/* Back Button */}
          <div className="mb-6">
            <Link 
              href="/" 
              className="inline-flex items-center gap-3 text-primary-600 hover:text-primary-700 transition-all duration-300 font-semibold bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg hover:shadow-xl hover:scale-105"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour à l'accueil
            </Link>
          </div>

          <SearchBar onSearch={handleNewSearch} className="mb-6" />
          
          {/* Search Results Info */}
          {searchTerm && (
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-black text-gray-900 mb-2">
                  Résultats pour "{searchTerm}"
                </h1>
                <p className="text-gray-600 font-medium">
                  {loading ? 'Recherche en cours...' : 
                    `${searchResults.totalRestaurants} restaurant${searchResults.totalRestaurants > 1 ? 's' : ''} • ${searchResults.totalProducts} plat${searchResults.totalProducts > 1 ? 's' : ''}`
                  }
                </p>
              </div>

              {/* Tabs */}
              <div className="flex bg-white/80 rounded-2xl p-1 shadow-lg">
                <button
                  onClick={() => setActiveTab('restaurants')}
                  className={`px-6 py-3 rounded-xl font-bold text-sm transition-all duration-300 ${
                    activeTab === 'restaurants' 
                      ? 'bg-primary-600 text-white shadow-lg' 
                      : 'text-gray-600 hover:text-primary-600'
                  }`}
                >
                  <Utensils className="h-4 w-4 mr-2 inline" />
                  Restaurants ({searchResults.totalRestaurants})
                </button>
                <button
                  onClick={() => setActiveTab('dishes')}
                  className={`px-6 py-3 rounded-xl font-bold text-sm transition-all duration-300 ${
                    activeTab === 'dishes' 
                      ? 'bg-primary-600 text-white shadow-lg' 
                      : 'text-gray-600 hover:text-primary-600'
                  }`}
                >
                  <ChefHat className="h-4 w-4 mr-2 inline" />
                  Plats ({searchResults.totalProducts})
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Results Content */}
      <main className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="loading-spinner w-12 h-12"></div>
            <span className="ml-4 text-xl text-gray-600 font-medium">Recherche en cours...</span>
          </div>
        ) : !searchTerm ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-gray-200 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <Search className="h-10 w-10 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Que recherchez-vous ?</h2>
            <p className="text-gray-600 text-lg">Utilisez la barre de recherche pour trouver vos plats préférés</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Restaurants Tab */}
            {activeTab === 'restaurants' && (
              <section>
                {searchResults.restaurants.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {searchResults.restaurants.map((restaurant, index) => (
                      <RestaurantCard
                        key={restaurant.id}
                        restaurant={restaurant}
                        delay={index * 0.1}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <div className="w-20 h-20 bg-gray-200 rounded-3xl flex items-center justify-center mx-auto mb-6">
                      <Utensils className="h-10 w-10 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Aucun restaurant trouvé</h3>
                    <p className="text-gray-600">Essayez avec d'autres mots-clés ou explorez nos catégories</p>
                  </div>
                )}
              </section>
            )}

            {/* Dishes Tab */}
            {activeTab === 'dishes' && (
              <section>
                {searchResults.products.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {searchResults.products.map((product, index) => (
                      <Link
                        key={product.id}
                        href={`/product/${product.id}`}
                        className="group"
                      >
                        <div 
                          className="bg-white/80 backdrop-blur-sm rounded-3xl overflow-hidden shadow-xl border border-white/30 hover:shadow-2xl hover:scale-105 transition-all duration-500 animate-fade-in-scale"
                          style={{ animationDelay: `${index * 0.05}s` }}
                        >
                          {/* Product Image */}
                          <div className="relative h-48 overflow-hidden">
                            <Image
                              src={product.image || '/placeholder-food.jpg'}
                              alt={product.name}
                              fill
                              className="object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                            
                            {/* Price Badge */}
                            <div className="absolute top-3 right-3 bg-black/60 text-white px-3 py-1 rounded-full font-bold text-sm">
                              {formatPrice(product.price)}
                            </div>

                            {/* Restaurant Badge */}
                            <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-gray-900">
                              {product.restaurant?.name}
                            </div>
                          </div>

                          {/* Product Info */}
                          <div className="p-6">
                            <h3 className="font-black text-lg text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
                              {product.name}
                            </h3>
                            
                            {product.description && (
                              <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                                {product.description}
                              </p>
                            )}

                            {/* Restaurant Info */}
                            <div className="flex items-center justify-between text-sm">
                              <div>
                                <p className="font-bold text-gray-900">{product.restaurant?.name}</p>
                                <p className="text-primary-600 font-medium">{product.restaurant?.cuisine}</p>
                              </div>
                              
                              <div className="flex items-center gap-1 bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                                <Star className="h-3 w-3 fill-current" />
                                <span className="text-xs font-bold">{product.restaurant?.rating.toFixed(1)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <div className="w-20 h-20 bg-gray-200 rounded-3xl flex items-center justify-center mx-auto mb-6">
                      <ChefHat className="h-10 w-10 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Aucun plat trouvé</h3>
                    <p className="text-gray-600">Essayez avec d'autres mots-clés ou explorez nos restaurants</p>
                  </div>
                )}
              </section>
            )}
          </div>
        )}
      </main>
    </div>
  )
}