'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { X, Save, Calendar, Tag, Percent, DollarSign } from 'lucide-react'

interface Restaurant {
  id: string
  name: string
}

interface PromotionFormProps {
  promotion?: any
  onClose: () => void
  onSave: () => void
}

export default function PromotionForm({ promotion, onClose, onSave }: PromotionFormProps) {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    type: 'PERCENTAGE',
    value: '',
    minimumOrder: '',
    maximumUse: '',
    startDate: '',
    endDate: '',
    restaurantId: ''
  })

  useEffect(() => {
    fetchRestaurants()
    if (promotion) {
      setFormData({
        code: promotion.code || '',
        name: promotion.name || '',
        description: promotion.description || '',
        type: promotion.type || 'PERCENTAGE',
        value: promotion.value?.toString() || '',
        minimumOrder: promotion.minimumOrder?.toString() || '',
        maximumUse: promotion.maximumUse?.toString() || '',
        startDate: promotion.startDate ? new Date(promotion.startDate).toISOString().split('T')[0] : '',
        endDate: promotion.endDate ? new Date(promotion.endDate).toISOString().split('T')[0] : '',
        restaurantId: promotion.restaurantId || ''
      })
    }
  }, [promotion])

  const fetchRestaurants = async () => {
    try {
      const response = await fetch('/api/restaurants')
      if (response.ok) {
        const data = await response.json()
        setRestaurants(data.restaurants || [])
      }
    } catch (error) {
      console.error('Erreur lors du chargement des restaurants:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = promotion 
        ? `/api/admin/promotions/${promotion.id}`
        : '/api/admin/promotions'
      const method = promotion ? 'PATCH' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          value: parseFloat(formData.value),
          minimumOrder: formData.minimumOrder ? parseFloat(formData.minimumOrder) : null,
          maximumUse: formData.maximumUse ? parseInt(formData.maximumUse) : null,
          startDate: new Date(formData.startDate).toISOString(),
          endDate: new Date(formData.endDate).toISOString(),
          restaurantId: formData.restaurantId || null
        })
      })

      if (response.ok) {
        onSave()
        onClose()
      } else {
        const errorData = await response.json()
        alert(errorData.error || 'Erreur lors de la sauvegarde')
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error)
      alert('Erreur lors de la sauvegarde')
    } finally {
      setLoading(false)
    }
  }

  const generateCode = () => {
    const code = 'PROMO' + Math.random().toString(36).substr(2, 6).toUpperCase()
    setFormData(prev => ({ ...prev, code }))
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden">
        {/* En-tête */}
        <div className="flex items-center justify-between p-6 bg-gradient-to-r from-orange-500 to-orange-600 text-white">
          <div className="flex items-center gap-3">
            <Tag className="h-6 w-6" />
            <h2 className="text-xl font-bold">
              {promotion ? 'Modifier la promotion' : 'Créer une promotion'}
            </h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Corps du formulaire */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Informations de base */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
                <Tag className="h-4 w-4" />
                Informations de base
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Code promo *
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={formData.code}
                      onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                      required
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 font-mono"
                      placeholder="PROMO2024"
                    />
                    <Button 
                      type="button" 
                      onClick={generateCode}
                      variant="outline"
                      className="px-3"
                    >
                      Générer
                    </Button>
                  </div>
                </div>

                <Input
                  label="Nom de la promotion *"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                  placeholder="Réduction de rentrée"
                />
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Description de la promotion..."
                />
              </div>
            </div>

            {/* Configuration de la réduction */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
                <Percent className="h-4 w-4" />
                Configuration de la réduction
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type de réduction *
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  >
                    <option value="PERCENTAGE">Pourcentage</option>
                    <option value="FIXED_AMOUNT">Montant fixe</option>
                    <option value="FREE_SHIPPING">Livraison gratuite</option>
                  </select>
                </div>

                {formData.type !== 'FREE_SHIPPING' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Valeur *
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={formData.value}
                        onChange={(e) => setFormData(prev => ({ ...prev, value: e.target.value }))}
                        required
                        min="0"
                        step={formData.type === 'PERCENTAGE' ? '1' : '0.01'}
                        max={formData.type === 'PERCENTAGE' ? '100' : undefined}
                        className="w-full px-3 py-2 pl-8 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        placeholder={formData.type === 'PERCENTAGE' ? '10' : '5000'}
                      />
                      <div className="absolute left-2 top-1/2 transform -translate-y-1/2">
                        {formData.type === 'PERCENTAGE' ? (
                          <Percent className="h-4 w-4 text-gray-400" />
                        ) : (
                          <DollarSign className="h-4 w-4 text-gray-400" />
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Conditions d'utilisation */}
            <div className="bg-yellow-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Conditions d'utilisation
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Montant minimum (FCFA)"
                  type="number"
                  value={formData.minimumOrder}
                  onChange={(e) => setFormData(prev => ({ ...prev, minimumOrder: e.target.value }))}
                  placeholder="15000"
                  min="0"
                />

                <Input
                  label="Nombre d'utilisations max"
                  type="number"
                  value={formData.maximumUse}
                  onChange={(e) => setFormData(prev => ({ ...prev, maximumUse: e.target.value }))}
                  placeholder="100"
                  min="1"
                />
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Restaurant (optionnel)
                </label>
                <select
                  value={formData.restaurantId}
                  onChange={(e) => setFormData(prev => ({ ...prev, restaurantId: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value="">Tous les restaurants</option>
                  {restaurants.map((restaurant) => (
                    <option key={restaurant.id} value={restaurant.id}>
                      {restaurant.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Période de validité */}
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Période de validité
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Date de début *"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                  required
                />

                <Input
                  label="Date de fin *"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                  required
                  min={formData.startDate}
                />
              </div>
            </div>

            {/* Boutons d'action */}
            <div className="flex items-center gap-4 pt-6 border-t">
              <Button 
                type="button"
                onClick={onClose}
                variant="outline"
                className="flex-1"
              >
                Annuler
              </Button>
              <Button 
                type="submit"
                disabled={loading}
                className="flex-1 bg-orange-600 hover:bg-orange-700"
              >
                <Save className="h-4 w-4 mr-2" />
                {loading ? 'Enregistrement...' : promotion ? 'Modifier' : 'Créer'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}