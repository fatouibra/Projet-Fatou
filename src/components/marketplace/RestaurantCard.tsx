'use client'

import { Restaurant } from '@/types'
import { Star, Clock, Truck, MapPin } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { formatPrice } from '@/lib/utils'
import { LikeButton } from '@/components/ui/LikeButton'

interface RestaurantCardProps {
  restaurant: Restaurant
  delay?: number
}

export function RestaurantCard({ restaurant, delay = 0 }: RestaurantCardProps) {
  return (
    <Link href={`/restaurants/${restaurant.id}`} className="group">
      <div 
        className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-xl border border-white/30 hover:shadow-2xl hover:scale-105 transition-all duration-500 animate-fade-in-up"
        style={{ animationDelay: `${delay}s` }}
      >
        {/* Restaurant Image */}
        <div className="relative aspect-square rounded-2xl overflow-hidden mb-4 group-hover:scale-105 transition-transform duration-300">
          <Image
            src={restaurant.image || '/placeholder-restaurant.jpg'}
            alt={restaurant.name}
            fill
            className="object-cover"
          />
          
          {/* Rating Badge */}
          <div className="absolute top-3 right-3 bg-black/60 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
            <Star className="h-3 w-3 fill-current text-yellow-400" />
            {restaurant.rating.toFixed(1)}
          </div>

          {/* Like Button */}
          <div className="absolute top-3 left-3 z-10">
            <LikeButton
              targetType="RESTAURANT"
              targetId={restaurant.id}
              size="sm"
              variant="filled"
            />
          </div>

          {/* Cuisine Badge */}
          <div className="absolute bottom-3 left-3 bg-primary-500 text-white px-3 py-1 rounded-full text-xs font-bold">
            {restaurant.cuisine}
          </div>
        </div>

        {/* Restaurant Info */}
        <div className="space-y-3">
          <div>
            <h3 className="font-black text-lg text-gray-900 group-hover:text-primary-600 transition-colors mb-1">
              {restaurant.name}
            </h3>
            {restaurant.description && (
              <p className="text-sm text-gray-600 line-clamp-2">
                {restaurant.description}
              </p>
            )}
          </div>

          {/* Details */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Clock className="h-3 w-3" />
              <span>25-40 min</span>
              <span>•</span>
              <Truck className="h-3 w-3" />
              <span>{restaurant.deliveryFee === 0 ? 'Gratuit' : formatPrice(restaurant.deliveryFee)}</span>
            </div>

            <div className="flex items-center gap-2 text-xs text-gray-500">
              <MapPin className="h-3 w-3" />
              <span className="truncate">{restaurant.address}</span>
            </div>
          </div>

          {/* Products Preview */}
          {restaurant.products && restaurant.products.length > 0 && (
            <div className="pt-3 border-t border-gray-100">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-600 font-medium">
                  {restaurant.products.length} plat{restaurant.products.length > 1 ? 's' : ''}
                </span>
                <span className="text-primary-600 font-bold">
                  À partir de {formatPrice(Math.min(...restaurant.products.map(p => p.price)))}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}