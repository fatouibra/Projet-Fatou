'use client'

import { useState, useEffect } from 'react'
import { Header } from '@/components/client/Header'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Order } from '@/types'
import { toast } from '@/stores/toast'
import { formatPrice, formatDate, getStatusText } from '@/lib/utils'
import { Search, Package, Phone, ChevronLeft, ChevronRight } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

export default function MyOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [recentOrders, setRecentOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingRecent, setLoadingRecent] = useState(false)
  const [searchType, setSearchType] = useState<'orderNumber' | 'phone'>('orderNumber')
  const [searchValue, setSearchValue] = useState('')
  const [hasSearched, setHasSearched] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [recentCurrentPage, setRecentCurrentPage] = useState(1)
  const [ordersPerPage] = useState(5)

  const handleSearch = async () => {
    if (!searchValue.trim()) return

    setLoading(true)
    setHasSearched(true)
    setCurrentPage(1) // Reset to first page on new search
    
    try {
      const params = new URLSearchParams()
      params.set(searchType, searchValue.trim())
      
      const response = await fetch(`/api/orders?${params}`)
      const data = await response.json()
      
      if (data.success) {
        setOrders(data.data)
        if (data.data.length === 0) {
          toast.info('Aucune commande', 'Aucune commande trouvée pour cette recherche')
        } else {
          toast.success('Recherche terminée', `${data.data.length} commande(s) trouvée(s)`)
        }
      } else {
        setOrders([])
        toast.error('Erreur de recherche', 'Impossible de rechercher les commandes')
      }
    } catch (error) {
      setOrders([])
      toast.error('Erreur', 'Une erreur est survenue lors de la recherche')
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  // Load recent orders on mount
  useEffect(() => {
    loadRecentOrders()
  }, [])

  const loadRecentOrders = async () => {
    setLoadingRecent(true)
    try {
      // Get recent orders (simulate with all orders for now)
      const response = await fetch('/api/orders')
      const data = await response.json()
      
      if (data.success) {
        // Take the most recent 20 orders
        setRecentOrders(data.data.slice(0, 20))
      }
    } catch (error) {
      console.error('Error loading recent orders:', error)
    } finally {
      setLoadingRecent(false)
    }
  }

  // Search results pagination logic
  const indexOfLastOrder = currentPage * ordersPerPage
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage
  const currentOrders = orders.slice(indexOfFirstOrder, indexOfLastOrder)
  const totalPages = Math.ceil(orders.length / ordersPerPage)

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  // Recent orders pagination logic
  const recentIndexOfLastOrder = recentCurrentPage * ordersPerPage
  const recentIndexOfFirstOrder = recentIndexOfLastOrder - ordersPerPage
  const currentRecentOrders = recentOrders.slice(recentIndexOfFirstOrder, recentIndexOfLastOrder)
  const recentTotalPages = Math.ceil(recentOrders.length / ordersPerPage)

  const handleRecentPageChange = (page: number) => {
    setRecentCurrentPage(page)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Mes commandes</h1>

          {/* Search Section */}
          <div className="card mb-8">
            <h2 className="text-lg font-semibold mb-4">Rechercher une commande</h2>
            
            {/* Search Type Selection */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              <button
                onClick={() => setSearchType('orderNumber')}
                className={`p-3 border rounded-xl font-medium transition-colors ${
                  searchType === 'orderNumber'
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-gray-300 hover:border-primary-300'
                }`}
              >
                <Package className="h-4 w-4 inline mr-2" />
                Par numéro de commande
              </button>
              <button
                onClick={() => setSearchType('phone')}
                className={`p-3 border rounded-xl font-medium transition-colors ${
                  searchType === 'phone'
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-gray-300 hover:border-primary-300'
                }`}
              >
                <Phone className="h-4 w-4 inline mr-2" />
                Par téléphone
              </button>
            </div>

            {/* Search Input */}
            <div className="flex gap-2">
              <Input
                placeholder={
                  searchType === 'orderNumber' 
                    ? 'Ex: MNU-ABC123DEF' 
                    : 'Ex: 06 12 34 56 78'
                }
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1"
              />
              <Button 
                onClick={handleSearch}
                isLoading={loading}
                disabled={!searchValue.trim()}
              >
                <Search className="h-4 w-4 mr-2" />
                Rechercher
              </Button>
            </div>

            <p className="text-sm text-gray-600 mt-2">
              {searchType === 'orderNumber' 
                ? 'Saisissez votre numéro de commande pour la retrouver'
                : 'Saisissez votre numéro de téléphone pour voir toutes vos commandes'
              }
            </p>
          </div>

          {/* Results Section */}
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="loading-spinner w-8 h-8"></div>
              <span className="ml-2 text-gray-600">Recherche en cours...</span>
            </div>
          )}

          {hasSearched && !loading && orders.length === 0 && (
            <div className="card text-center py-12">
              <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Aucune commande trouvée
              </h3>
              <p className="text-gray-600 mb-6">
                Vérifiez {searchType === 'orderNumber' ? 'votre numéro de commande' : 'votre numéro de téléphone'} et réessayez.
              </p>
              <Link href="/">
                <Button>Passer une commande</Button>
              </Link>
            </div>
          )}

          {!loading && orders.length > 0 && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">
                  {orders.length} commande{orders.length > 1 ? 's' : ''} trouvée{orders.length > 1 ? 's' : ''}
                </h3>
                {totalPages > 1 && (
                  <p className="text-sm text-gray-600">
                    Page {currentPage} sur {totalPages}
                  </p>
                )}
              </div>
              
              {currentOrders.map((order) => (
                <div key={order.id} className="card hover:shadow-hover transition-shadow">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                    <div>
                      <h4 className="font-semibold text-lg">
                        Commande #{order.orderNumber}
                      </h4>
                      <p className="text-gray-600">
                        {formatDate(new Date(order.createdAt))}
                      </p>
                    </div>
                    <div className="mt-2 md:mt-0 flex items-center gap-3">
                      <Badge variant="status" status={order.status.toLowerCase() as any}>
                        {getStatusText(order.status)}
                      </Badge>
                      <span className="font-bold text-primary-600">
                        {formatPrice(order.total)}
                      </span>
                    </div>
                  </div>

                  {/* Order Items Preview */}
                  <div className="mb-4">
                    <div className="flex -space-x-2 mb-2">
                      {order.items.slice(0, 3).map((item) => (
                        <div key={item.id} className="relative w-10 h-10 rounded-lg overflow-hidden border-2 border-white">
                          <Image
                            src={item.product.image || '/placeholder-food.jpg'}
                            alt={item.product.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ))}
                      {order.items.length > 3 && (
                        <div className="w-10 h-10 rounded-lg bg-gray-100 border-2 border-white flex items-center justify-center text-xs font-semibold text-gray-600">
                          +{order.items.length - 3}
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">
                      {order.items.length} article{order.items.length > 1 ? 's' : ''} • {order.customerName}
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <Link href={`/tracking/${order.orderNumber}`} className="flex-1">
                      <Button variant="primary" className="w-full">
                        Suivre la commande
                      </Button>
                    </Link>
                    <Button variant="outline">
                      Recommander
                    </Button>
                  </div>
                </div>
              ))}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-8">
                  <Button
                    variant="outline"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-2"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>

                  <div className="flex gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <Button
                        key={page}
                        variant={page === currentPage ? "primary" : "outline"}
                        onClick={() => handlePageChange(page)}
                        className="px-3 py-2 min-w-[40px]"
                      >
                        {page}
                      </Button>
                    ))}
                  </div>

                  <Button
                    variant="outline"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="p-2"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          )}

          {!hasSearched && (
            <div className="card text-center py-12">
              <Search className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Retrouvez vos commandes
              </h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Utilisez votre numéro de commande ou votre téléphone pour retrouver et suivre vos commandes facilement.
              </p>
            </div>
          )}

          {/* Recent Orders Section - Hide when search has been performed */}
          {!hasSearched && (
            <div className="mt-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Commandes récentes</h2>
              {recentOrders.length > 0 && (
                <p className="text-sm text-gray-600">
                  {recentOrders.length} commande{recentOrders.length > 1 ? 's' : ''} trouvée{recentOrders.length > 1 ? 's' : ''}
                </p>
              )}
            </div>

            {loadingRecent && (
              <div className="flex items-center justify-center py-12">
                <div className="loading-spinner w-8 h-8"></div>
                <span className="ml-2 text-gray-600">Chargement des commandes...</span>
              </div>
            )}

            {!loadingRecent && recentOrders.length === 0 && (
              <div className="card text-center py-12">
                <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Aucune commande trouvée
                </h3>
                <p className="text-gray-600 mb-6">
                  Aucune commande n'a été passée récemment.
                </p>
                <Link href="/">
                  <Button>Passer une commande</Button>
                </Link>
              </div>
            )}

            {!loadingRecent && recentOrders.length > 0 && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  {recentTotalPages > 1 && (
                    <p className="text-sm text-gray-600">
                      Page {recentCurrentPage} sur {recentTotalPages}
                    </p>
                  )}
                </div>
                
                {currentRecentOrders.map((order) => (
                  <div key={order.id} className="card hover:shadow-hover transition-shadow">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                      <div>
                        <h4 className="font-semibold text-lg">
                          Commande #{order.orderNumber}
                        </h4>
                        <p className="text-gray-600">
                          {formatDate(new Date(order.createdAt))}
                        </p>
                      </div>
                      <div className="mt-2 md:mt-0 flex items-center gap-3">
                        <Badge variant="status" status={order.status.toLowerCase() as any}>
                          {getStatusText(order.status)}
                        </Badge>
                        <span className="font-bold text-primary-600">
                          {formatPrice(order.total)}
                        </span>
                      </div>
                    </div>

                    {/* Order Items Preview */}
                    <div className="mb-4">
                      <div className="flex -space-x-2 mb-2">
                        {order.items.slice(0, 3).map((item) => (
                          <div key={item.id} className="relative w-10 h-10 rounded-lg overflow-hidden border-2 border-white">
                            <Image
                              src={item.product.image || '/placeholder-food.jpg'}
                              alt={item.product.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                        ))}
                        {order.items.length > 3 && (
                          <div className="w-10 h-10 rounded-lg bg-gray-100 border-2 border-white flex items-center justify-center text-xs font-semibold text-gray-600">
                            +{order.items.length - 3}
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">
                        {order.items.length} article{order.items.length > 1 ? 's' : ''} • {order.customerName}
                      </p>
                    </div>

                    <div className="flex gap-3">
                      <Link href={`/tracking/${order.orderNumber}`} className="flex-1">
                        <Button variant="primary" className="w-full">
                          Suivre la commande
                        </Button>
                      </Link>
                      <Button variant="outline">
                        Recommander
                      </Button>
                    </div>
                  </div>
                ))}

                {/* Recent Orders Pagination */}
                {recentTotalPages > 1 && (
                  <div className="flex justify-center items-center gap-2 mt-8">
                    <Button
                      variant="outline"
                      onClick={() => handleRecentPageChange(recentCurrentPage - 1)}
                      disabled={recentCurrentPage === 1}
                      className="p-2"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>

                    <div className="flex gap-1">
                      {Array.from({ length: recentTotalPages }, (_, i) => i + 1).map((page) => (
                        <Button
                          key={page}
                          variant={page === recentCurrentPage ? "primary" : "outline"}
                          onClick={() => handleRecentPageChange(page)}
                          className="px-3 py-2 min-w-[40px]"
                        >
                          {page}
                        </Button>
                      ))}
                    </div>

                    <Button
                      variant="outline"
                      onClick={() => handleRecentPageChange(recentCurrentPage + 1)}
                      disabled={recentCurrentPage === recentTotalPages}
                      className="p-2"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
          )}

          {/* Back to recent orders button when search is active */}
          {hasSearched && (
            <div className="mt-8 text-center">
              <Button 
                variant="outline" 
                onClick={() => {
                  setHasSearched(false)
                  setOrders([])
                  setSearchValue('')
                  setCurrentPage(1)
                }}
              >
                ← Retour aux commandes récentes
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}