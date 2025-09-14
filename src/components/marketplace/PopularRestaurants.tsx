'use client'

import { Restaurant } from '@/types'
import { RestaurantCard } from './RestaurantCard'
import { Star, TrendingUp } from 'lucide-react'

interface PopularRestaurantsProps {
  restaurants: Restaurant[]
  loading: boolean
}

export function PopularRestaurants({ restaurants, loading }: PopularRestaurantsProps) {
  if (loading) {
    return (
      <section className="animate-fade-in-up" style={{ animationDelay: '0.8s' }}>
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl flex items-center justify-center shadow-lg">
            <TrendingUp className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-black text-gray-900">Restaurants populaires</h2>
            <p className="text-gray-600 font-medium">Les préférés de nos clients</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-white/60 backdrop-blur-sm rounded-3xl p-6 shadow-xl border border-white/30 animate-pulse">
              <div className="aspect-square bg-gray-200 rounded-2xl mb-4"></div>
              <div className="h-4 bg-gray-200 rounded-full mb-2"></div>
              <div className="h-3 bg-gray-200 rounded-full w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded-full w-1/2"></div>
            </div>
          ))}
        </div>
      </section>
    )
  }

  return (
    <section className="animate-fade-in-up" style={{ animationDelay: '0.8s' }}>
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl flex items-center justify-center shadow-lg">
          <TrendingUp className="h-6 w-6 text-white" />
        </div>
        <div>
          <h2 className="text-3xl font-black text-gray-900">Restaurants populaires</h2>
          <p className="text-gray-600 font-medium">Les préférés de nos clients</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {restaurants.map((restaurant, index) => (
          <RestaurantCard
            key={restaurant.id}
            restaurant={restaurant}
            delay={index * 0.1}
          />
        ))}
      </div>

      {restaurants.length === 0 && (
        <div className="text-center py-12">
          <div className="w-20 h-20 bg-gray-200 rounded-3xl flex items-center justify-center mx-auto mb-4">
            <Star className="h-10 w-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Aucun restaurant disponible</h3>
          <p className="text-gray-600">Les restaurants seront bientôt disponibles.</p>
        </div>
      )}
    </section>
  )
}