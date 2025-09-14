'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/client/Header'
import { Restaurant } from '@/types'
import { SearchBar } from '@/components/marketplace/SearchBar'
import { PopularRestaurants } from '@/components/marketplace/PopularRestaurants'
import { FeaturedDishes } from '@/components/marketplace/FeaturedDishes'
import { CuisineCategories } from '@/components/marketplace/CuisineCategories'
import { useAuthStore } from '@/stores/auth'
import {
  Search,
  MapPin,
  Star,
  Clock,
  Utensils,
  TrendingUp,
  Award,
  Heart
} from 'lucide-react'

export default function MarketplacePage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchPopularRestaurants()
  }, [user])

  const fetchPopularRestaurants = async () => {
    try {
      // Debug info
      console.log('🔍 Debug - User:', user)
      console.log('🔍 Debug - User role:', user?.role)
      console.log('🔍 Debug - Is admin?', user?.role === 'ADMIN')

      // Si l'utilisateur est admin, utiliser l'API admin (qui montre tous les restaurants)
      // Sinon, utiliser l'API publique (qui ne montre que les restaurants actifs)
      const apiUrl = user?.role === 'ADMIN' ? '/api/admin/restaurants' : '/api/restaurants?active=true'

      console.log('🔍 Debug - API URL:', apiUrl)

      const response = await fetch(apiUrl, {
        credentials: 'include' // Important: inclure les cookies d'authentification
      })
      const data = await response.json()

      console.log('🔍 Debug - API Response:', data)

      if (data.success) {
        // Prendre les 8 restaurants les mieux notés
        setRestaurants(data.data.slice(0, 8))
        console.log('🔍 Debug - Restaurants loaded:', data.data.length)
      } else {
        setError('Impossible de charger les restaurants')
      }
    } catch (error) {
      console.error('🔍 Debug - Error:', error)
      setError('Erreur de connexion')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (query: string) => {
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}`)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary-50/20">
      <Header />
      
      {/* Hero Section avec Recherche */}
      <section className="relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 via-transparent to-primary-600/10"></div>
        
        <div className="relative container mx-auto px-4 py-16 lg:py-24">
          <div className="text-center max-w-4xl mx-auto">
            {/* Main Title */}
            <h1 className="text-5xl lg:text-7xl font-black mb-6 animate-fade-in-up">
              <span className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">
                Trouvez votre 
              </span>
              <br />
              <span className="bg-gradient-to-r from-primary-600 via-primary-500 to-pink-500 bg-clip-text text-transparent">
                plat préféré
              </span>
            </h1>
            
            <p className="text-xl lg:text-2xl text-gray-600 mb-12 font-medium animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              Les meilleurs restaurants, un service royal pour vos envies gourmandes.
            </p>

            {/* Search Bar */}
            <div className="animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
              <SearchBar onSearch={handleSearch} />
            </div>


            {/* Quick Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mt-16 animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
              <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-6 shadow-xl border border-white/30">
                <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <Utensils className="h-6 w-6 text-white" />
                </div>
                <div className="text-3xl font-black text-gray-900 mb-1">{restaurants.length}+</div>
                <div className="text-sm text-gray-600 font-medium">Restaurants</div>
              </div>
              
              <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-6 shadow-xl border border-white/30">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <div className="text-3xl font-black text-gray-900 mb-1">1000+</div>
                <div className="text-sm text-gray-600 font-medium">Plats</div>
              </div>
              
              <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-6 shadow-xl border border-white/30">
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <Award className="h-6 w-6 text-white" />
                </div>
                <div className="text-3xl font-black text-gray-900 mb-1">4.8★</div>
                <div className="text-sm text-gray-600 font-medium">Note moyenne</div>
              </div>
              
              <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-6 shadow-xl border border-white/30">
                <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <Heart className="h-6 w-6 text-white" />
                </div>
                <div className="text-3xl font-black text-gray-900 mb-1">50k+</div>
                <div className="text-sm text-gray-600 font-medium">Clients</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-16 space-y-16">
        {/* Cuisine Categories */}
        <CuisineCategories />

        {/* Popular Restaurants */}
        <PopularRestaurants restaurants={restaurants} loading={loading} />

        {/* Featured Dishes */}
        <FeaturedDishes />
      </main>

      {/* Footer */}
      <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center">
                  <span className="text-white font-bold text-lg">M</span>
                </div>
                <h3 className="font-black text-2xl">MnuFood</h3>
              </div>
              <p className="text-gray-400 text-lg leading-relaxed mb-6">
                La marketplace qui connecte les gourmands aux meilleurs restaurants. 
                Découvrez, commandez et savourez !
              </p>
              <div className="flex space-x-4">
                <div className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center cursor-pointer transition-colors">
                  <span className="text-white">📱</span>
                </div>
                <div className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center cursor-pointer transition-colors">
                  <span className="text-white">📧</span>
                </div>
                <div className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center cursor-pointer transition-colors">
                  <span className="text-white">🌐</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-bold text-lg mb-6">Découvrir</h4>
              <div className="space-y-3 text-gray-400">
                <div className="hover:text-white cursor-pointer transition-colors">Restaurants</div>
                <div className="hover:text-white cursor-pointer transition-colors">Cuisines</div>
                <div className="hover:text-white cursor-pointer transition-colors">Plats populaires</div>
                <div className="hover:text-white cursor-pointer transition-colors">Nouveautés</div>
              </div>
            </div>
            
            <div>
              <h4 className="font-bold text-lg mb-6">Support</h4>
              <div className="space-y-3 text-gray-400">
                <div className="hover:text-white cursor-pointer transition-colors">Centre d'aide</div>
                <div className="hover:text-white cursor-pointer transition-colors">Contact</div>
                <div className="hover:text-white cursor-pointer transition-colors">Livraison</div>
                <div className="hover:text-white cursor-pointer transition-colors">Retours</div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-700 pt-8 flex flex-col md:flex-row items-center justify-between">
            <div className="text-gray-400 mb-4 md:mb-0">
              &copy; 2024 MnuFood Marketplace. Tous droits réservés.
            </div>
            <div className="flex items-center space-x-6 text-gray-400 text-sm">
              <span className="hover:text-white cursor-pointer transition-colors">Confidentialité</span>
              <span className="hover:text-white cursor-pointer transition-colors">Conditions</span>
              <span className="hover:text-white cursor-pointer transition-colors">Cookies</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}