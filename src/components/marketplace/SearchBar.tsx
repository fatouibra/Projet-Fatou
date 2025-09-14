'use client'

import { useState } from 'react'
import { Search, MapPin, Filter } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface SearchBarProps {
  onSearch: (query: string) => void
  className?: string
}

export function SearchBar({ onSearch, className = '' }: SearchBarProps) {
  const [query, setQuery] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      onSearch(query.trim())
    }
  }

  return (
    <div className={`max-w-4xl mx-auto ${className}`}>
      <form onSubmit={handleSubmit} className="relative">
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/30 p-2">
          <div className="flex items-center gap-4">
            {/* Search Input */}
            <div className="flex-1 flex items-center gap-3 px-4 py-3">
              <Search className="h-6 w-6 text-primary-600" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Rechercher un plat (ex: pizza, burger, sushi...)"
                className="flex-1 bg-transparent border-none outline-none text-lg placeholder-gray-500 font-medium"
              />
            </div>

            {/* Location (Future feature) */}
            <div className="hidden lg:flex items-center gap-2 px-4 py-3 border-l border-gray-200">
              <MapPin className="h-5 w-5 text-gray-400" />
              <span className="text-gray-600 font-medium">Dakar</span>
            </div>

            {/* Filters (Future feature) */}
            <div className="hidden md:flex items-center px-4 py-3 border-l border-gray-200">
              <Filter className="h-5 w-5 text-gray-400" />
            </div>

            {/* Search Button */}
            <Button
              type="submit"
              className="h-14 px-8 bg-gradient-to-r from-primary-600 via-primary-500 to-pink-500 hover:from-primary-700 hover:via-primary-600 hover:to-pink-600 rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
              size="lg"
            >
              <Search className="h-5 w-5 mr-2" />
              Rechercher
            </Button>
          </div>
        </div>
      </form>

      {/* Popular Searches */}
      <div className="mt-6 text-center">
        <p className="text-gray-600 font-medium mb-3">Recherches populaires :</p>
        <div className="flex flex-wrap justify-center gap-3">
          {['Pizza', 'Burger', 'Sushi', 'Tacos', 'Pâtes', 'Salade'].map((term) => (
            <button
              key={term}
              onClick={() => onSearch(term)}
              className="px-4 py-2 bg-white/60 backdrop-blur-sm rounded-full text-sm font-medium text-gray-700 hover:bg-primary-100 hover:text-primary-700 transition-all duration-300 border border-gray-200 hover:border-primary-300"
            >
              {term}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}