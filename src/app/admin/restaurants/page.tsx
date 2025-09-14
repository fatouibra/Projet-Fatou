'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { 
  Store,
  Search,
  Filter,
  MapPin,
  Phone,
  Star,
  Users,
  Edit,
  Eye,
  ToggleLeft,
  ToggleRight,
  Plus,
  Utensils,
  Clock,
  Euro
} from 'lucide-react'
import { Restaurant } from '@/types'
import { formatPrice } from '@/lib/utils'
import Pagination from '@/components/Pagination'

export default function RestaurantsManagementPage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCuisine, setSelectedCuisine] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(9)

  useEffect(() => {
    fetchRestaurants()
  }, [])

  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, selectedCuisine])

  const fetchRestaurants = async () => {
    try {
      const response = await fetch('/api/restaurants')
      const data = await response.json()
      
      if (data.success) {
        setRestaurants(data.data)
      }
    } catch (error) {
      console.error('Error fetching restaurants:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleRestaurantStatus = async (restaurantId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/restaurants/${restaurantId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus })
      })

      if (response.ok) {
        // Refresh the restaurants list
        fetchRestaurants()
      }
    } catch (error) {
      console.error('Error updating restaurant status:', error)
    }
  }

  const filteredRestaurants = restaurants.filter(restaurant => {
    const matchesSearch = restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         restaurant.cuisine.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCuisine = selectedCuisine === '' || restaurant.cuisine === selectedCuisine
    return matchesSearch && matchesCuisine
  })

  const totalItems = filteredRestaurants.length
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedRestaurants = filteredRestaurants.slice(startIndex, endIndex)

  const cuisines = Array.from(new Set(restaurants.map(r => r.cuisine)))

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="loading-spinner w-8 h-8"></div>
        <span className="ml-2 text-gray-600">Chargement des restaurants...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
              <Store className="h-6 w-6 text-primary-600" />
            </div>
Gestion des Clients
          </h1>
          <p className="text-gray-600 mt-1">Gérez tous les clients restaurants de la marketplace</p>
        </div>
        
        <Link
          href="/admin/restaurants/new"
          className="inline-flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-xl hover:bg-primary-700 transition-colors font-medium"
        >
          <Plus className="h-4 w-4" />
Nouveau client
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total restaurants</p>
              <p className="text-2xl font-bold text-gray-900">{restaurants.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Store className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Restaurants actifs</p>
              <p className="text-2xl font-bold text-gray-900">
                {restaurants.filter(r => r.isActive).length}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <ToggleRight className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Note moyenne</p>
              <p className="text-2xl font-bold text-gray-900">
                {restaurants.length > 0 
                  ? (restaurants.reduce((sum, r) => sum + r.rating, 0) / restaurants.length).toFixed(1)
                  : '0.0'
                }
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Star className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Cuisines</p>
              <p className="text-2xl font-bold text-gray-900">{cuisines.length}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Utensils className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher un restaurant..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>
          
          <div className="sm:w-48">
            <select
              value={selectedCuisine}
              onChange={(e) => setSelectedCuisine(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">Toutes les cuisines</option>
              {cuisines.map(cuisine => (
                <option key={cuisine} value={cuisine}>{cuisine}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Restaurants List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        {paginatedRestaurants.length === 0 && totalItems === 0 ? (
          <div className="text-center py-12">
            <Store className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {restaurants.length === 0 ? 'Aucun restaurant' : 'Aucun résultat'}
            </h3>
            <p className="text-gray-500">
              {restaurants.length === 0 
                ? 'Commencez par ajouter votre premier restaurant'
                : 'Essayez de modifier vos critères de recherche'
              }
            </p>
          </div>
        ) : (
          <>
            {/* Mobile View */}
            <div className="block md:hidden divide-y divide-gray-200">
              {paginatedRestaurants.map((restaurant) => (
                <div key={restaurant.id} className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">{restaurant.name}</h3>
                      <p className="text-sm text-primary-600 font-medium mb-1">{restaurant.cuisine}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span>{restaurant.rating.toFixed(1)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          <span>Dakar</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => toggleRestaurantStatus(restaurant.id, restaurant.isActive)}
                        className={`p-1 rounded-full ${
                          restaurant.isActive 
                            ? 'text-green-600 hover:bg-green-100' 
                            : 'text-gray-400 hover:bg-gray-100'
                        }`}
                      >
                        {restaurant.isActive ? (
                          <ToggleRight className="h-5 w-5" />
                        ) : (
                          <ToggleLeft className="h-5 w-5" />
                        )}
                      </button>
                      
                      <Link
                        href={`/admin/restaurants/${restaurant.id}`}
                        className="p-1 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-full"
                      >
                        <Edit className="h-4 w-4" />
                      </Link>
                      
                      <Link
                        href={`/restaurants/${restaurant.id}`}
                        target="_blank"
                        className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 text-xs text-gray-600">
                    <div className="flex items-center gap-1">
                      <Euro className="h-3 w-3" />
                      <span>Min. {formatPrice(restaurant.minOrderAmount)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>25-40 min</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      <span>{restaurant.products?.length || 0} plats</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Restaurant
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cuisine
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Note
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Produits
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Livraison
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedRestaurants.map((restaurant) => (
                    <tr key={restaurant.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-r from-primary-500 to-primary-600 flex items-center justify-center">
                              <span className="text-sm font-medium text-white">
                                {restaurant.name.charAt(0)}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{restaurant.name}</div>
                            <div className="text-sm text-gray-500 flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              Dakar
                            </div>
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-primary-600 font-medium">{restaurant.cuisine}</div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-medium text-gray-900">
                            {restaurant.rating.toFixed(1)}
                          </span>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {restaurant.products?.length || 0} plats
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {restaurant.deliveryFee === 0 ? 'Gratuite' : formatPrice(restaurant.deliveryFee)}
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => toggleRestaurantStatus(restaurant.id, restaurant.isActive)}
                          className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${
                            restaurant.isActive
                              ? 'bg-green-100 text-green-800 hover:bg-green-200'
                              : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                          }`}
                        >
                          {restaurant.isActive ? (
                            <>
                              <ToggleRight className="h-3 w-3" />
                              Actif
                            </>
                          ) : (
                            <>
                              <ToggleLeft className="h-3 w-3" />
                              Inactif
                            </>
                          )}
                        </button>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/restaurants/${restaurant.id}`}
                            target="_blank"
                            className="text-gray-400 hover:text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition-colors"
                            title="Voir le restaurant"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                          
                          <Link
                            href={`/admin/restaurants/${restaurant.id}`}
                            className="text-gray-400 hover:text-primary-600 hover:bg-primary-50 p-2 rounded-lg transition-colors"
                            title="Modifier"
                          >
                            <Edit className="h-4 w-4" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {totalItems > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
          />
        )}
      </div>
    </div>
  )
}