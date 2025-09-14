'use client'

import React from 'react'
import { Order } from '@/types'
import { formatPrice, formatDate } from '@/lib/utils'
import { 
  Clock, 
  CheckCircle, 
  Truck, 
  Package, 
  Utensils, 
  MapPin,
  Phone,
  Mail
} from 'lucide-react'

interface OrderTrackerProps {
  order: Order
}

const statusSteps = [
  {
    key: 'RECEIVED',
    title: 'Commande reçue',
    description: 'Votre commande a été confirmée',
    icon: CheckCircle
  },
  {
    key: 'PREPARING',
    title: 'En préparation',
    description: 'Le restaurant prépare votre commande',
    icon: Utensils
  },
  {
    key: 'READY',
    title: 'Prête',
    description: 'Votre commande est prête',
    icon: Package
  },
  {
    key: 'DELIVERING',
    title: 'En livraison',
    description: 'Le livreur est en route',
    icon: Truck
  },
  {
    key: 'DELIVERED',
    title: 'Livrée',
    description: 'Commande livrée avec succès',
    icon: CheckCircle
  }
]

export function OrderTracker({ order }: OrderTrackerProps) {
  const getCurrentStepIndex = () => {
    return statusSteps.findIndex(step => step.key === order.status)
  }

  const currentStepIndex = getCurrentStepIndex()
  const isCancelled = order.status === 'CANCELLED'

  if (isCancelled) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-600 text-2xl">❌</span>
          </div>
          <h3 className="text-lg font-semibold text-red-800 mb-2">Commande annulée</h3>
          <p className="text-red-600">Cette commande a été annulée</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Statut actuel */}
      <div className="bg-gradient-to-r from-primary-50 to-blue-50 border border-primary-200 rounded-xl p-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center">
            {React.createElement(statusSteps[currentStepIndex]?.icon || Clock, {
              className: "h-6 w-6 text-white"
            })}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {statusSteps[currentStepIndex]?.title || 'Statut inconnu'}
            </h3>
            <p className="text-gray-600">
              {statusSteps[currentStepIndex]?.description || 'Vérification en cours'}
            </p>
            {order.estimatedTime && (
              <p className="text-sm text-primary-600 mt-1">
                Temps estimé : {order.estimatedTime} min
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-6">Suivi de votre commande</h4>
        
        <div className="relative">
          {statusSteps.map((step, index) => {
            const isCompleted = index <= currentStepIndex
            const isCurrent = index === currentStepIndex
            const Icon = step.icon

            return (
              <div key={step.key} className="relative flex items-center pb-8 last:pb-0">
                {/* Line */}
                {index < statusSteps.length - 1 && (
                  <div 
                    className={`absolute left-6 top-12 w-0.5 h-8 ${
                      isCompleted ? 'bg-primary-500' : 'bg-gray-200'
                    }`} 
                  />
                )}
                
                {/* Icon */}
                <div className={`
                  relative z-10 flex items-center justify-center w-12 h-12 rounded-full border-2
                  ${isCompleted 
                    ? 'bg-primary-500 border-primary-500' 
                    : isCurrent
                      ? 'bg-white border-primary-500'
                      : 'bg-gray-100 border-gray-300'
                  }
                `}>
                  <Icon className={`h-5 w-5 ${
                    isCompleted 
                      ? 'text-white' 
                      : isCurrent 
                        ? 'text-primary-500' 
                        : 'text-gray-400'
                  }`} />
                </div>
                
                {/* Content */}
                <div className="ml-4 flex-1">
                  <h5 className={`text-sm font-medium ${
                    isCompleted ? 'text-gray-900' : 'text-gray-500'
                  }`}>
                    {step.title}
                  </h5>
                  <p className="text-sm text-gray-500 mt-1">
                    {step.description}
                  </p>
                  {isCurrent && (
                    <p className="text-xs text-primary-600 mt-1 font-medium">
                      En cours...
                    </p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Informations de livraison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Informations de livraison</h4>
          
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-900">Adresse</p>
                <p className="text-sm text-gray-600">{order.address}</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <Phone className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-900">Téléphone</p>
                <p className="text-sm text-gray-600">{order.customerPhone}</p>
              </div>
            </div>
            
            {order.customerEmail && (
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Email</p>
                  <p className="text-sm text-gray-600">{order.customerEmail}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Détails de la commande</h4>
          
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Numéro de commande</span>
              <span className="text-sm font-medium text-gray-900">{order.orderNumber}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Date de commande</span>
              <span className="text-sm font-medium text-gray-900">
                {formatDate(order.createdAt)}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Type de livraison</span>
              <span className="text-sm font-medium text-gray-900">
                {order.deliveryType === 'DELIVERY' ? 'Livraison' : 'À emporter'}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Mode de paiement</span>
              <span className="text-sm font-medium text-gray-900">
                {order.paymentMethod === 'CASH_ON_DELIVERY' ? 'Paiement à la livraison' : 'En ligne'}
              </span>
            </div>
            
            <div className="border-t pt-3">
              <div className="flex justify-between">
                <span className="text-base font-semibold text-gray-900">Total</span>
                <span className="text-base font-semibold text-gray-900">
                  {formatPrice(order.total)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}