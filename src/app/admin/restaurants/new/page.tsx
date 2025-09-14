'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { ImageUpload } from '@/components/ui/ImageUpload'
import { toast } from '@/stores/toast'
import { ArrowLeft, Store, User, Mail, Phone, MapPin, Euro, Clock } from 'lucide-react'
import Link from 'next/link'

interface RestaurantFormData {
  name: string
  description: string
  address: string
  phone: string
  email: string
  image: string
  cuisine: string
  deliveryFee: string
  minOrderAmount: string
  openingHours: string
  managerName: string
  managerEmail: string
  managerPhone: string
}

const initialFormData: RestaurantFormData = {
  name: '',
  description: '',
  address: '',
  phone: '',
  email: '',
  image: '',
  cuisine: '',
  deliveryFee: '0',
  minOrderAmount: '3000',
  openingHours: '9h00 - 22h00',
  managerName: '',
  managerEmail: '',
  managerPhone: '',
}

const cuisineTypes = [
  'Sénégalaise',
  'Française',
  'Italienne',
  'Chinoise',
  'Indienne',
  'Japonaise',
  'Mexicaine',
  'Libanaise',
  'Marocaine',
  'Américaine',
  'Thaï',
  'Autre'
]

export default function NewRestaurantPage() {
  const router = useRouter()
  const [formData, setFormData] = useState<RestaurantFormData>(initialFormData)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/restaurants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          deliveryFee: parseFloat(formData.deliveryFee),
          minOrderAmount: parseFloat(formData.minOrderAmount),
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Restaurant créé', 'Le restaurant et le compte du gestionnaire ont été créés avec succès')
        router.push('/admin/restaurants')
      } else {
        toast.error('Erreur', data.error || 'Une erreur est survenue')
      }
    } catch (error) {
      console.error('Error creating restaurant:', error)
      toast.error('Erreur', 'Une erreur est survenue lors de la création')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: keyof RestaurantFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/restaurants"
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
              <Store className="h-6 w-6 text-primary-600" />
            </div>
            Nouveau Restaurant
          </h1>
          <p className="text-gray-600 mt-1">Créer un nouveau restaurant et son compte gestionnaire</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Restaurant Information */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <Store className="h-5 w-5 text-blue-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Informations du restaurant</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Nom du restaurant *"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              required
              placeholder="Ex: Chez Fatou"
            />
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type de cuisine *
              </label>
              <select
                value={formData.cuisine}
                onChange={(e) => handleInputChange('cuisine', e.target.value)}
                className="input-field"
                required
              >
                <option value="">Sélectionner le type de cuisine</option>
                {cuisineTypes.map(cuisine => (
                  <option key={cuisine} value={cuisine}>
                    {cuisine}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Description du restaurant..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>

            <Input
              label="Adresse *"
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              required
              placeholder="Ex: Plateau, Dakar"
            />

            <Input
              label="Téléphone *"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              required
              placeholder="Ex: +221 77 123 45 67"
            />

            <Input
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="contact@restaurant.com"
            />

            <Input
              label="Heures d'ouverture"
              value={formData.openingHours}
              onChange={(e) => handleInputChange('openingHours', e.target.value)}
              placeholder="Ex: 9h00 - 22h00"
            />

            <Input
              label="Frais de livraison (F CFA)"
              type="number"
              step="0.01"
              min="0"
              value={formData.deliveryFee}
              onChange={(e) => handleInputChange('deliveryFee', e.target.value)}
              placeholder="0"
            />

            <Input
              label="Montant minimum de commande (F CFA)"
              type="number"
              step="0.01"
              min="0"
              value={formData.minOrderAmount}
              onChange={(e) => handleInputChange('minOrderAmount', e.target.value)}
              placeholder="3000"
            />
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Image du restaurant
            </label>
            <ImageUpload
              value={formData.image}
              onChange={(url) => handleInputChange('image', url)}
              onRemove={() => handleInputChange('image', '')}
              placeholder="Télécharger l'image du restaurant"
            />
          </div>
        </div>

        {/* Manager Information */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <User className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Gestionnaire du restaurant</h2>
              <p className="text-sm text-gray-600">Un compte sera automatiquement créé pour le gestionnaire</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Nom complet *"
              value={formData.managerName}
              onChange={(e) => handleInputChange('managerName', e.target.value)}
              required
              placeholder="Ex: Fatou Diop"
            />

            <Input
              label="Email *"
              type="email"
              value={formData.managerEmail}
              onChange={(e) => handleInputChange('managerEmail', e.target.value)}
              required
              placeholder="manager@restaurant.com"
            />

            <Input
              label="Téléphone"
              value={formData.managerPhone}
              onChange={(e) => handleInputChange('managerPhone', e.target.value)}
              placeholder="Ex: +221 77 123 45 67"
            />
          </div>

          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  Information importante
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Un mot de passe par défaut sera généré pour le gestionnaire</li>
                    <li>Il sera obligé de le changer lors de sa première connexion</li>
                    <li>Un email avec les informations de connexion sera envoyé au gestionnaire</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4 pt-6">
          <Button
            type="button"
            variant="secondary"
            onClick={() => router.push('/admin/restaurants')}
            className="flex-1"
          >
            Annuler
          </Button>
          <Button
            type="submit"
            isLoading={isSubmitting}
            className="flex-1"
          >
            Créer le restaurant
          </Button>
        </div>
      </form>
    </div>
  )
}