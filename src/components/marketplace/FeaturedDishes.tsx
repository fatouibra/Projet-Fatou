'use client'

import { useState, useEffect } from 'react'
import { Product } from '@/types'
import { Sparkles, Star, Leaf } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { formatPrice } from '@/lib/utils'
import { LikeButton } from '@/components/ui/LikeButton'

export function FeaturedDishes() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchFeaturedProducts()
  }, [])

  const fetchFeaturedProducts = async () => {
    try {
      const response = await fetch('/api/products?featured=true&limit=4')
      const data = await response.json()
      
      if (data.success && data.data.length > 0) {
        setFeaturedProducts(data.data)
      } else {
        // Si pas de produits en vedette, prendre des produits populaires
        const popularResponse = await fetch('/api/products?limit=4')
        const popularData = await popularResponse.json()
        if (popularData.success) {
          setFeaturedProducts(popularData.data)
        }
      }
    } catch (error) {
      console.error('Error fetching featured products:', error)
    } finally {
      setLoading(false)
    }
  }


  return (
    <section className="animate-fade-in-up" style={{ animationDelay: '1s' }}>
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
          <Sparkles className="h-6 w-6 text-white" />
        </div>
        <div>
          <h2 className="text-3xl font-black text-gray-900">Plats en vedette</h2>
          <p className="text-gray-600 font-medium">Les créations favorites de nos chefs partenaires</p>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="bg-gray-200 rounded-3xl h-48 mb-4"></div>
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.length > 0 ? featuredProducts.map((product, index) => (
          <div
            key={product.id}
            className="group bg-white/80 backdrop-blur-sm rounded-3xl overflow-hidden shadow-xl border border-white/30 hover:shadow-2xl hover:scale-105 transition-all duration-500 animate-fade-in-scale"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            {/* Product Image */}
            <div className="relative h-48 overflow-hidden">
              <Image
                src={product.image || '/placeholder-food.svg'}
                alt={product.name}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-500"
              />
              
              {/* Featured Badge */}
              {product.featured && (
                <div className="absolute top-3 left-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                  <Sparkles className="h-3 w-3" />
                  Vedette
                </div>
              )}

              {/* Vegetarian Badge */}
              {product.isVegetarian && (
                <div className="absolute top-3 left-12 bg-green-500 text-white p-1.5 rounded-full">
                  <Leaf className="h-3 w-3" />
                </div>
              )}

              {/* Like Button */}
              <div className="absolute top-3 right-3 z-10">
                <LikeButton
                  targetType="PRODUCT"
                  targetId={product.id}
                  size="sm"
                  variant="filled"
                />
              </div>

              {/* Price */}
              <div className="absolute bottom-3 right-3 bg-black/60 text-white px-3 py-1 rounded-full font-bold text-sm">
                {formatPrice(product.price)}
              </div>
            </div>

            {/* Product Info */}
            <div className="p-6">
              <div className="mb-4">
                <h3 className="font-black text-lg text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
                  {product.name}
                </h3>
                <p className="text-sm text-gray-600 line-clamp-2">
                  {product.description || 'Délicieux produit de qualité'}
                </p>
              </div>

              {/* Restaurant Info */}
              <div className="flex items-center justify-between text-sm">
                <div>
                  <p className="font-bold text-gray-900">{product.restaurant?.name || 'Restaurant'}</p>
                  <p className="text-primary-600 font-medium">{product.category?.name || 'Plat'}</p>
                </div>
                
                <div className="flex items-center gap-1 bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                  <Star className="h-3 w-3 fill-current" />
                  <span className="text-xs font-bold">4.8</span>
                </div>
              </div>

              {/* Action Button */}
              <Link href={`/product/${product.id}`} className="block mt-4">
                <button className="w-full py-3 bg-gradient-to-r from-primary-600 to-pink-500 hover:from-primary-700 hover:to-pink-600 text-white font-bold rounded-2xl transition-all duration-300 hover:shadow-lg transform hover:scale-105">
                  Découvrir
                </button>
              </Link>
            </div>
          </div>
          )) : (
            <div className="col-span-full text-center py-12">
              <Sparkles className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun plat en vedette</h3>
              <p className="text-gray-500">
                Les chefs préparent de nouveaux plats exceptionnels pour vous !
              </p>
            </div>
          )}
        </div>
      )}
    </section>
  )
}