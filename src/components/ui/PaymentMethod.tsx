'use client'

import { useState } from 'react'
import { PaymentMethod } from '@/types'
import { CreditCard, Banknote, Truck } from 'lucide-react'

interface PaymentMethodSelectorProps {
  value: PaymentMethod
  onChange: (method: PaymentMethod) => void
  className?: string
}

export function PaymentMethodSelector({ 
  value, 
  onChange, 
  className = '' 
}: PaymentMethodSelectorProps) {
  const paymentOptions = [
    {
      id: 'CASH_ON_DELIVERY' as PaymentMethod,
      name: 'Paiement à la livraison',
      description: 'Payez en espèces au livreur',
      icon: Banknote,
      popular: true
    },
    {
      id: 'ONLINE' as PaymentMethod,
      name: 'Paiement en ligne',
      description: 'Carte bancaire (prochainement)',
      icon: CreditCard,
      disabled: true
    }
  ]

  return (
    <div className={`space-y-3 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Mode de paiement</h3>
      
      {paymentOptions.map((option) => {
        const Icon = option.icon
        const isSelected = value === option.id
        
        return (
          <div
            key={option.id}
            className={`
              relative rounded-xl border-2 cursor-pointer transition-all duration-200 p-4
              ${option.disabled 
                ? 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-60' 
                : isSelected
                  ? 'border-primary-500 bg-primary-50 shadow-md ring-2 ring-primary-100'
                  : 'border-gray-200 bg-white hover:border-primary-300 hover:bg-gray-50'
              }
            `}
            onClick={() => {
              if (!option.disabled) {
                onChange(option.id)
              }
            }}
          >
            {option.popular && !option.disabled && (
              <div className="absolute -top-2 left-4 bg-primary-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
                Recommandé
              </div>
            )}
            
            <div className="flex items-start gap-4">
              <div className={`
                w-5 h-5 rounded-full border-2 flex items-center justify-center mt-1 flex-shrink-0
                ${isSelected && !option.disabled
                  ? 'border-primary-500 bg-primary-500'
                  : 'border-gray-300'
                }
              `}>
                {isSelected && !option.disabled && (
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                )}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <Icon className={`h-5 w-5 ${option.disabled ? 'text-gray-400' : 'text-gray-600'}`} />
                  <h4 className={`font-medium ${option.disabled ? 'text-gray-400' : 'text-gray-900'}`}>
                    {option.name}
                  </h4>
                </div>
                <p className={`text-sm ${option.disabled ? 'text-gray-400' : 'text-gray-600'}`}>
                  {option.description}
                </p>
              </div>
            </div>
          </div>
        )
      })}
      
      {/* Informations sur le paiement à la livraison */}
      {value === 'CASH_ON_DELIVERY' && (
        <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-start gap-3">
            <Truck className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-medium text-blue-900 mb-1">
                Paiement à la livraison
              </h4>
              <p className="text-sm text-blue-700">
                Ayez l'appoint prêt. Le livreur vous remettra votre commande contre paiement en espèces.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}