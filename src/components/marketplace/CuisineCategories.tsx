'use client'

import { useState } from 'react'
import { ChefHat } from 'lucide-react'
import { useRouter } from 'next/navigation'

const cuisines = [
  { name: 'Italien', emoji: '🍝', color: 'from-green-500 to-red-500' },
  { name: 'Japonais', emoji: '🍱', color: 'from-red-500 to-pink-500' },
  { name: 'Français', emoji: '🥖', color: 'from-blue-500 to-purple-500' },
  { name: 'Mexicain', emoji: '🌮', color: 'from-yellow-500 to-orange-500' },
  { name: 'Chinois', emoji: '🥢', color: 'from-red-600 to-yellow-500' },
  { name: 'Indien', emoji: '🍛', color: 'from-orange-500 to-red-500' },
  { name: 'Américain', emoji: '🍔', color: 'from-blue-600 to-red-600' },
  { name: 'Thaï', emoji: '🍜', color: 'from-green-500 to-yellow-500' }
]

export function CuisineCategories() {
  const router = useRouter()

  const handleCuisineClick = (cuisine: string) => {
    router.push(`/search?cuisine=${encodeURIComponent(cuisine)}`)
  }

  return (
    <section className="animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center shadow-lg">
          <ChefHat className="h-6 w-6 text-white" />
        </div>
        <div>
          <h2 className="text-3xl font-black text-gray-900">Cuisines du monde</h2>
          <p className="text-gray-600 font-medium">Explorez les saveurs de différents pays</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
        {cuisines.map((cuisine, index) => (
          <button
            key={cuisine.name}
            onClick={() => handleCuisineClick(cuisine.name)}
            className="group bg-white/60 backdrop-blur-sm rounded-3xl p-6 shadow-xl border border-white/30 hover:shadow-2xl hover:scale-105 transition-all duration-300 animate-fade-in-scale"
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <div className={`w-16 h-16 bg-gradient-to-br ${cuisine.color} rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
              <span className="text-3xl">{cuisine.emoji}</span>
            </div>
            <h3 className="font-bold text-gray-900 text-sm group-hover:text-primary-600 transition-colors">
              {cuisine.name}
            </h3>
          </button>
        ))}
      </div>
    </section>
  )
}