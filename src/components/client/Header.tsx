'use client'

import { ShoppingCart, Phone, MapPin } from 'lucide-react'
import Link from 'next/link'
import { useCartStore } from '@/stores/cart'
import { Button } from '@/components/ui/Button'

export function Header() {
  const { itemCount } = useCartStore()

  return (
    <header className="sticky top-0 z-40 bg-white shadow-soft">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">L</span>
            </div>
            <span className="text-xl font-bold text-gray-900">Linguere's Eats</span>
          </Link>

          {/* Navigation Desktop */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link 
              href="/" 
              className="text-gray-700 hover:text-primary-500 font-medium transition-colors"
            >
              Accueil
            </Link>
            <Link 
              href="/my-orders" 
              className="text-gray-700 hover:text-primary-500 font-medium transition-colors"
            >
              Mes commandes
            </Link>
          </nav>

          {/* Contact Info */}
          <div className="hidden lg:flex items-center space-x-4 text-sm text-gray-600">
            <div className="flex items-center space-x-1">
              <Phone className="h-4 w-4" />
              <span>33 856 25 14</span>
            </div>
            <div className="flex items-center space-x-1">
              <MapPin className="h-4 w-4" />
              <span>Dakar</span>
            </div>
          </div>

          {/* Cart Button */}
          <Link href="/cart">
            <Button variant="primary" className="relative">
              <ShoppingCart className="h-5 w-5 mr-2" />
              <span className="hidden sm:inline">Panier</span>
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-bounce-gentle">
                  {itemCount}
                </span>
              )}
            </Button>
          </Link>
        </div>
      </div>
    </header>
  )
}