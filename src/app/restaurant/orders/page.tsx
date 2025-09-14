'use client'

import { useEffect, useState } from 'react'
import { useAuthStore } from '@/stores/auth'
import {
  ShoppingCart,
  Clock,
  CheckCircle,
  Ban,
  Timer,
  Phone,
  Mail,
  MapPin,
  Search,
  Filter,
  MoreHorizontal,
  AlertCircle,
  Package,
  Truck,
  Eye,
  X,
  User,
  CreditCard
} from 'lucide-react'
import { Modal } from '@/components/ui/Modal'

interface OrderItem {
  id: string
  quantity: number
  price: number
  product: {
    id: string
    name: string
    image?: string
  }
}

interface Order {
  id: string
  orderNumber: string
  customerName: string
  customerPhone: string
  customerEmail?: string
  address: string
  deliveryType: string
  paymentMethod: string
  paymentStatus: string
  status: string
  total: number
  deliveryFee: number
  items: OrderItem[]
  notes?: string
  estimatedTime?: number
  createdAt: string
  updatedAt: string
}

export default function RestaurantOrders() {
  const { user } = useAuthStore()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [showOrderModal, setShowOrderModal] = useState(false)
  const [orderDetails, setOrderDetails] = useState<Order | null>(null)
  const ordersPerPage = 10

  useEffect(() => {
    if (user?.restaurantId) {
      fetchOrders()
    }
  }, [user])

  const fetchOrders = async () => {
    try {
      const response = await fetch(`/api/restaurant/${user?.restaurantId}/orders`)
      if (response.ok) {
        const data = await response.json()
        setOrders(data.orders)
      }
    } catch (error) {
      console.error('Erreur lors du chargement des commandes:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        setOrders(orders.map(order => 
          order.id === orderId 
            ? { ...order, status: newStatus, updatedAt: new Date().toISOString() }
            : order
        ))
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la commande:', error)
    }
  }

  const openOrderDetails = (order: Order) => {
    setOrderDetails(order)
    setShowOrderModal(true)
  }

  const closeOrderModal = () => {
    setShowOrderModal(false)
    setOrderDetails(null)
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'RECEIVED': { color: 'bg-orange-100 text-orange-800', icon: Clock, label: 'Reçue' },
      'PREPARING': { color: 'bg-yellow-100 text-yellow-800', icon: Timer, label: 'En préparation' },
      'READY': { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Prête' },
      'DELIVERED': { color: 'bg-gray-100 text-gray-800', icon: CheckCircle, label: 'Livrée' },
      'CANCELLED': { color: 'bg-red-100 text-red-800', icon: Ban, label: 'Annulée' },
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig['RECEIVED']
    const Icon = config.icon

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${config.color}`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </span>
    )
  }

  const getStatusActions = (order: Order) => {
    const actions = []
    
    if (order.status === 'RECEIVED') {
      actions.push({
        label: 'Commencer la préparation',
        status: 'PREPARING',
        color: 'bg-yellow-500 hover:bg-yellow-600'
      })
    }
    
    if (order.status === 'PREPARING') {
      actions.push({
        label: 'Marquer comme prête',
        status: 'READY',
        color: 'bg-green-500 hover:bg-green-600'
      })
    }
    
    if (order.status === 'READY') {
      actions.push({
        label: 'Marquer comme livrée',
        status: 'DELIVERED',
        color: 'bg-gray-500 hover:bg-gray-600'
      })
    }
    
    if (['RECEIVED', 'PREPARING'].includes(order.status)) {
      actions.push({
        label: 'Annuler',
        status: 'CANCELLED',
        color: 'bg-red-500 hover:bg-red-600'
      })
    }
    
    return actions
  }

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.customerPhone.includes(searchTerm)
    const matchesStatus = selectedStatus === '' || order.status === selectedStatus
    return matchesSearch && matchesStatus
  })

  // Pagination
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage)
  const startIndex = (currentPage - 1) * ordersPerPage
  const endIndex = startIndex + ordersPerPage
  const paginatedOrders = filteredOrders.slice(startIndex, endIndex)

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, selectedStatus])

  const orderStats = {
    total: orders.length,
    pending: orders.filter(o => ['RECEIVED', 'PREPARING', 'READY'].includes(o.status)).length,
    completed: orders.filter(o => o.status === 'DELIVERED').length,
    cancelled: orders.filter(o => o.status === 'CANCELLED').length
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="loading-spinner w-8 h-8"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <ShoppingCart className="h-6 w-6" />
            Gestion des commandes
          </h1>
          <p className="text-gray-600 mt-1">
            Suivez et gérez vos commandes en temps réel
          </p>
        </div>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-orange-50 rounded-lg">
              <ShoppingCart className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total commandes</p>
              <p className="text-2xl font-bold text-gray-900">{orderStats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-orange-50 rounded-lg">
              <Clock className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">En cours</p>
              <p className="text-2xl font-bold text-gray-900">{orderStats.pending}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-50 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Terminées</p>
              <p className="text-2xl font-bold text-gray-900">{orderStats.completed}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-50 rounded-lg">
              <Ban className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Annulées</p>
              <p className="text-2xl font-bold text-gray-900">{orderStats.cancelled}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher par numéro, nom ou téléphone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="sm:w-48">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="">Tous les statuts</option>
              <option value="RECEIVED">Reçues</option>
              <option value="PREPARING">En préparation</option>
              <option value="READY">Prêtes</option>
              <option value="DELIVERED">Livrées</option>
              <option value="CANCELLED">Annulées</option>
            </select>
          </div>
        </div>
      </div>

      {/* Liste des commandes */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">
            Commandes ({filteredOrders.length})
          </h2>
        </div>

        {paginatedOrders.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {paginatedOrders.map((order) => (
              <div key={order.id} className="p-6 hover:bg-gray-50/50 transition-all duration-200 hover:shadow-sm">
                <div className="flex items-start gap-4">
                  {/* Numéro de commande */}
                  <div className="min-w-[90px] h-20 bg-gradient-to-br from-orange-100 to-orange-50 rounded-xl flex flex-col items-center justify-center flex-shrink-0 border border-orange-200 p-2">
                    <span className="text-xs text-orange-500 font-medium">Commande</span>
                    <span className="font-bold text-orange-700 text-xs break-all text-center">
                      #{order.orderNumber.slice(0, 10)}
                    </span>
                  </div>

                  {/* Informations principales */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">
                          {order.customerName}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Phone className="w-4 h-4" />
                            {order.customerPhone}
                          </div>
                          {order.customerEmail && (
                            <div className="flex items-center gap-1">
                              <Mail className="w-4 h-4" />
                              {order.customerEmail}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="font-bold text-xl text-gray-900 mb-1">
                          {order.total.toFixed(0)} F CFA
                        </p>
                        {getStatusBadge(order.status)}
                      </div>
                    </div>

                    {/* Adresse et type de livraison */}
                    <div className="flex items-center gap-4 mb-3 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        <span className="line-clamp-1">{order.address}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {order.deliveryType === 'DELIVERY' ? (
                          <>
                            <Truck className="w-4 h-4" />
                            <span>Livraison</span>
                          </>
                        ) : (
                          <>
                            <Package className="w-4 h-4" />
                            <span>À emporter</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Articles */}
                    <div className="mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Package className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-700">
                          Articles ({order.items.length})
                        </span>
                      </div>
                      <div className="space-y-1">
                        {order.items.map((item) => (
                          <div key={item.id} className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">
                              {item.quantity}x {item.product.name}
                            </span>
                            <span className="font-medium text-gray-900">
                              {(item.price * item.quantity).toFixed(0)} F
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Notes */}
                    {order.notes && (
                      <div className="mb-4">
                        <div className="flex items-center gap-2 mb-1">
                          <AlertCircle className="w-4 h-4 text-orange-500" />
                          <span className="text-sm font-medium text-gray-700">Notes</span>
                        </div>
                        <p className="text-sm text-gray-600 bg-orange-50 p-2 rounded-lg">
                          {order.notes}
                        </p>
                      </div>
                    )}

                    {/* Actions et temps */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="text-sm text-gray-600">
                          <Clock className="inline w-3 h-3 mr-1" />
                          {new Date(order.createdAt).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                        {order.estimatedTime && (
                          <div className="text-sm text-orange-600 font-medium">
                            <Timer className="inline w-3 h-3 mr-1" />
                            ~{order.estimatedTime} min
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openOrderDetails(order)}
                          className="px-3 py-1 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors flex items-center gap-1"
                        >
                          <Eye className="h-3 w-3" />
                          Détails
                        </button>
                        {getStatusActions(order).map((action) => (
                          <button
                            key={action.status}
                            onClick={() => updateOrderStatus(order.id, action.status)}
                            className={`px-3 py-1 text-sm font-medium text-white rounded-lg transition-colors ${action.color}`}
                          >
                            {action.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center">
            <ShoppingCart className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm || selectedStatus ? 'Aucune commande trouvée' : 'Aucune commande'}
            </h3>
            <p className="text-gray-600">
              {searchTerm || selectedStatus 
                ? 'Essayez de modifier vos filtres de recherche.'
                : 'Les nouvelles commandes apparaîtront ici.'
              }
            </p>
          </div>
        )}

        {/* Pagination */}
        {filteredOrders.length > ordersPerPage && (
          <div className="px-6 py-4 border-t border-gray-100">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-gray-700 text-center sm:text-left">
                Affichage de <span className="font-medium">{startIndex + 1}</span> à <span className="font-medium">{Math.min(endIndex, filteredOrders.length)}</span> sur <span className="font-medium">{filteredOrders.length}</span> commandes
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Précédent
                </button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => {
                    if (
                      page === 1 ||
                      page === totalPages ||
                      (page >= currentPage - 1 && page <= currentPage + 1)
                    ) {
                      return (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`px-3 py-1 text-sm font-medium rounded-lg ${
                            currentPage === page
                              ? 'bg-orange-500 text-white'
                              : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </button>
                      )
                    } else if (page === currentPage - 2 || page === currentPage + 2) {
                      return <span key={page} className="px-1 text-gray-400">...</span>
                    }
                    return null
                  })}
                </div>
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Suivant
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal détails commande */}
      <Modal
        isOpen={showOrderModal}
        onClose={closeOrderModal}
        title={`Commande #${orderDetails?.orderNumber || ''}`}
        size="lg"
      >
        {orderDetails && (
          <div className="space-y-6">
            {/* En-tête avec statut */}
            <div className="flex items-center justify-between pb-4 border-b">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Commande #{orderDetails.orderNumber}
                </h3>
                <p className="text-sm text-gray-600">
                  <Clock className="inline w-4 h-4 mr-1" />
                  {new Date(orderDetails.createdAt).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
              <div>
                {getStatusBadge(orderDetails.status)}
              </div>
            </div>

            {/* Informations client */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-md font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <User className="h-4 w-4" />
                Informations client
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Nom</p>
                  <p className="font-medium">{orderDetails.customerName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Téléphone</p>
                  <p className="font-medium">{orderDetails.customerPhone}</p>
                </div>
                {orderDetails.customerEmail && (
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium">{orderDetails.customerEmail}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-600">Type de commande</p>
                  <p className="font-medium flex items-center gap-1">
                    {orderDetails.deliveryType === 'DELIVERY' ? (
                      <>
                        <Truck className="h-4 w-4" />
                        Livraison
                      </>
                    ) : (
                      <>
                        <Package className="h-4 w-4" />
                        À emporter
                      </>
                    )}
                  </p>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-sm text-gray-600">Adresse</p>
                <p className="font-medium flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {orderDetails.address}
                </p>
              </div>
            </div>

            {/* Articles commandés */}
            <div>
              <h4 className="text-md font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Package className="h-4 w-4" />
                Articles commandés
              </h4>
              <div className="bg-white border rounded-lg overflow-hidden">
                <div className="divide-y divide-gray-100">
                  {orderDetails.items.map((item, index) => (
                    <div key={item.id} className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {item.product.image ? (
                          <img
                            src={item.product.image}
                            alt={item.product.name}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                            <Package className="h-6 w-6 text-gray-400" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-gray-900">{item.product.name}</p>
                          <p className="text-sm text-gray-600">Quantité: {item.quantity}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">
                          {(item.price * item.quantity).toFixed(0)} F CFA
                        </p>
                        <p className="text-sm text-gray-600">
                          {item.price.toFixed(0)} F × {item.quantity}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Notes spéciales */}
            {orderDetails.notes && (
              <div>
                <h4 className="text-md font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  Notes spéciales
                </h4>
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <p className="text-gray-700">{orderDetails.notes}</p>
                </div>
              </div>
            )}

            {/* Récapitulatif des prix */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-md font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Récapitulatif
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Sous-total</span>
                  <span className="font-medium">{(orderDetails.total - orderDetails.deliveryFee).toFixed(0)} F CFA</span>
                </div>
                {orderDetails.deliveryFee > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Frais de livraison</span>
                    <span className="font-medium">{orderDetails.deliveryFee.toFixed(0)} F CFA</span>
                  </div>
                )}
                <div className="border-t border-gray-200 pt-2">
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-900">Total</span>
                    <span className="font-bold text-lg text-gray-900">{orderDetails.total.toFixed(0)} F CFA</span>
                  </div>
                </div>
                <div className="text-sm text-gray-600">
                  <span>Mode de paiement: </span>
                  <span className="font-medium">{orderDetails.paymentMethod}</span>
                  <span className="ml-2">
                    ({orderDetails.paymentStatus === 'PAID' ? 'Payé' : 'Non payé'})
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-2 pt-4 border-t">
              {getStatusActions(orderDetails).map((action) => (
                <button
                  key={action.status}
                  onClick={() => {
                    updateOrderStatus(orderDetails.id, action.status)
                    setOrderDetails({...orderDetails, status: action.status})
                  }}
                  className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors ${action.color}`}
                >
                  {action.label}
                </button>
              ))}
              <button
                onClick={closeOrderModal}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}