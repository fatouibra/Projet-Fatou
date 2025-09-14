'use client'

import { useEffect, useState } from 'react'
import { useAuthStore } from '@/stores/auth'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { ImageUpload } from '@/components/ui/ImageUpload'
import { toast } from '@/stores/toast'
import {
  User,
  Building2,
  Mail,
  Phone,
  MapPin,
  Clock,
  Star,
  Heart,
  Edit3,
  Save,
  X,
  ShieldCheck,
  CreditCard,
  Truck,
  ChefHat,
  Camera,
  Key,
  Eye,
  EyeOff
} from 'lucide-react'
import Image from 'next/image'

interface RestaurantData {
  id: string
  name: string
  description?: string
  address: string
  phone: string
  email: string
  image?: string
  rating: number
  likesCount: number
  cuisine: string
  deliveryFee: number
  minOrderAmount: number
  openingHours: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

interface ManagerData {
  id: string
  email: string
  name: string
  phone?: string
  isActive: boolean
  permissions: string
  mustChangePassword: boolean
  createdAt: string
  updatedAt: string
}

export default function RestaurantProfile() {
  const { user } = useAuthStore()
  const [restaurantData, setRestaurantData] = useState<RestaurantData | null>(null)
  const [managerData, setManagerData] = useState<ManagerData | null>(null)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  
  const [formData, setFormData] = useState({
    // Restaurant data
    name: '',
    description: '',
    address: '',
    phone: '',
    email: '',
    image: '',
    cuisine: '',
    deliveryFee: '',
    minOrderAmount: '',
    openingHours: '',
    // Manager data
    managerName: '',
    managerEmail: '',
    managerPhone: ''
  })

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (user?.restaurantId) {
      fetchProfileData()
    }
  }, [user])

  const fetchProfileData = async () => {
    try {
      const [restaurantResponse, managerResponse] = await Promise.all([
        fetch(`/api/restaurant/${user?.restaurantId}/profile`),
        fetch(`/api/restaurant/${user?.restaurantId}/manager`)
      ])

      if (restaurantResponse.ok) {
        const restaurantResult = await restaurantResponse.json()
        if (restaurantResult.success) {
          setRestaurantData(restaurantResult.data)
        }
      }

      if (managerResponse.ok) {
        const managerResult = await managerResponse.json()
        if (managerResult.success) {
          setManagerData(managerResult.data)
        }
      }
    } catch (error) {
      console.error('Erreur lors du chargement du profil:', error)
      toast.error('Erreur', 'Impossible de charger les données du profil')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = () => {
    if (restaurantData && managerData) {
      setFormData({
        name: restaurantData.name,
        description: restaurantData.description || '',
        address: restaurantData.address,
        phone: restaurantData.phone,
        email: restaurantData.email,
        image: restaurantData.image || '',
        cuisine: restaurantData.cuisine,
        deliveryFee: restaurantData.deliveryFee.toString(),
        minOrderAmount: restaurantData.minOrderAmount.toString(),
        openingHours: restaurantData.openingHours,
        managerName: managerData.name,
        managerEmail: managerData.email,
        managerPhone: managerData.phone || ''
      })
      setIsEditing(true)
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
    setFormData({
      name: '',
      description: '',
      address: '',
      phone: '',
      email: '',
      image: '',
      cuisine: '',
      deliveryFee: '',
      minOrderAmount: '',
      openingHours: '',
      managerName: '',
      managerEmail: '',
      managerPhone: ''
    })
  }

  const handleSave = async () => {
    if (!user?.restaurantId) return

    setIsSubmitting(true)
    try {
      const restaurantUpdateData = {
        name: formData.name,
        description: formData.description,
        address: formData.address,
        phone: formData.phone,
        email: formData.email,
        image: formData.image || null,
        cuisine: formData.cuisine,
        deliveryFee: parseFloat(formData.deliveryFee),
        minOrderAmount: parseFloat(formData.minOrderAmount),
        openingHours: formData.openingHours
      }

      const managerUpdateData = {
        name: formData.managerName,
        email: formData.managerEmail,
        phone: formData.managerPhone || null
      }

      const [restaurantResponse, managerResponse] = await Promise.all([
        fetch(`/api/restaurant/${user.restaurantId}/profile`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(restaurantUpdateData)
        }),
        fetch(`/api/restaurant/${user.restaurantId}/manager`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(managerUpdateData)
        })
      ])

      if (restaurantResponse.ok && managerResponse.ok) {
        const [restaurantResult, managerResult] = await Promise.all([
          restaurantResponse.json(),
          managerResponse.json()
        ])

        if (restaurantResult.success && managerResult.success) {
          setRestaurantData(restaurantResult.data)
          setManagerData(managerResult.data)
          setIsEditing(false)
          toast.success('Profil mis à jour', 'Vos informations ont été mises à jour avec succès')
        }
      } else {
        throw new Error('Erreur lors de la mise à jour')
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error)
      toast.error('Erreur', 'Impossible de mettre à jour le profil')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Erreur', 'Les mots de passe ne correspondent pas')
      return
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('Erreur', 'Le mot de passe doit contenir au moins 6 caractères')
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/restaurant/${user?.restaurantId}/change-password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      })

      const result = await response.json()
      if (result.success) {
        setShowPasswordModal(false)
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
        toast.success('Mot de passe modifié', 'Votre mot de passe a été mis à jour avec succès')
      } else {
        toast.error('Erreur', result.message || 'Impossible de changer le mot de passe')
      }
    } catch (error) {
      console.error('Erreur lors du changement de mot de passe:', error)
      toast.error('Erreur', 'Une erreur est survenue')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="loading-spinner w-8 h-8"></div>
      </div>
    )
  }

  if (!restaurantData || !managerData) {
    return (
      <div className="text-center py-12">
        <User className="h-12 w-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Impossible de charger le profil
        </h3>
        <p className="text-gray-600">
          Une erreur est survenue lors du chargement de vos informations.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <User className="h-6 w-6" />
            Profil Restaurant
          </h1>
          <p className="text-gray-600 mt-1">
            Gérez les informations de votre restaurant et de votre compte
          </p>
        </div>
        
        {!isEditing ? (
          <Button 
            onClick={handleEdit}
            className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
          >
            <Edit3 className="h-4 w-4 mr-2" />
            Modifier
          </Button>
        ) : (
          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={handleCancel}
            >
              <X className="h-4 w-4 mr-2" />
              Annuler
            </Button>
            <Button
              onClick={handleSave}
              isLoading={isSubmitting}
              className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
            >
              <Save className="h-4 w-4 mr-2" />
              Enregistrer
            </Button>
          </div>
        )}
      </div>

      {/* Informations du restaurant */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Building2 className="h-5 w-5 text-orange-600" />
            Informations du restaurant
          </h2>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Image du restaurant */}
            <div className="lg:col-span-1">
              <div className="text-center">
                <div className="relative w-48 h-48 mx-auto mb-4">
                  {(isEditing ? formData.image : restaurantData.image) ? (
                    <Image
                      src={isEditing ? formData.image : restaurantData.image!}
                      alt="Restaurant"
                      fill
                      className="object-cover rounded-xl"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-100 rounded-xl flex items-center justify-center">
                      <ChefHat className="h-16 w-16 text-gray-400" />
                    </div>
                  )}
                  {isEditing && (
                    <div className="absolute inset-0 bg-black/50 rounded-xl flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <Camera className="h-8 w-8 text-white" />
                    </div>
                  )}
                </div>

                {isEditing && (
                  <ImageUpload
                    value={formData.image}
                    onChange={(url) => setFormData({ ...formData, image: url })}
                    onRemove={() => setFormData({ ...formData, image: '' })}
                    placeholder="Image du restaurant"
                  />
                )}

                {/* Statistiques */}
                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-red-50 rounded-lg">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      <span className="font-bold text-lg text-gray-900">
                        {restaurantData.rating.toFixed(1)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600">Note moyenne</p>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-red-50 rounded-lg">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Heart className="h-4 w-4 text-red-500" />
                      <span className="font-bold text-lg text-gray-900">
                        {restaurantData.likesCount}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600">J'aimes</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Formulaire restaurant */}
            <div className="lg:col-span-2 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Nom du restaurant *"
                  value={isEditing ? formData.name : restaurantData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  disabled={!isEditing}
                  icon={Building2}
                />
                
                <Input
                  label="Type de cuisine *"
                  value={isEditing ? formData.cuisine : restaurantData.cuisine}
                  onChange={(e) => setFormData({ ...formData, cuisine: e.target.value })}
                  disabled={!isEditing}
                  icon={ChefHat}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={isEditing ? formData.description : restaurantData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  disabled={!isEditing}
                  className="input-field h-20"
                  placeholder="Décrivez votre restaurant..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Email *"
                  type="email"
                  value={isEditing ? formData.email : restaurantData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  disabled={!isEditing}
                  icon={Mail}
                />
                
                <Input
                  label="Téléphone *"
                  value={isEditing ? formData.phone : restaurantData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  disabled={!isEditing}
                  icon={Phone}
                />
              </div>

              <Input
                label="Adresse complète *"
                value={isEditing ? formData.address : restaurantData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                disabled={!isEditing}
                icon={MapPin}
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  label="Horaires d'ouverture"
                  value={isEditing ? formData.openingHours : restaurantData.openingHours}
                  onChange={(e) => setFormData({ ...formData, openingHours: e.target.value })}
                  disabled={!isEditing}
                  icon={Clock}
                />
                
                <Input
                  label="Frais de livraison (F CFA)"
                  type="number"
                  step="0.01"
                  min="0"
                  value={isEditing ? formData.deliveryFee : restaurantData.deliveryFee.toString()}
                  onChange={(e) => setFormData({ ...formData, deliveryFee: e.target.value })}
                  disabled={!isEditing}
                  icon={Truck}
                />
                
                <Input
                  label="Commande minimum (F CFA)"
                  type="number"
                  step="0.01"
                  min="0"
                  value={isEditing ? formData.minOrderAmount : restaurantData.minOrderAmount.toString()}
                  onChange={(e) => setFormData({ ...formData, minOrderAmount: e.target.value })}
                  disabled={!isEditing}
                  icon={CreditCard}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Informations du manager */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-orange-600" />
              Compte manager
            </h2>
            <Button
              variant="secondary"
              onClick={() => setShowPasswordModal(true)}
            >
              <Key className="h-4 w-4 mr-2" />
              Changer le mot de passe
            </Button>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Nom complet *"
              value={isEditing ? formData.managerName : managerData.name}
              onChange={(e) => setFormData({ ...formData, managerName: e.target.value })}
              disabled={!isEditing}
              icon={User}
            />
            
            <Input
              label="Email *"
              type="email"
              value={isEditing ? formData.managerEmail : managerData.email}
              onChange={(e) => setFormData({ ...formData, managerEmail: e.target.value })}
              disabled={!isEditing}
              icon={Mail}
            />
          </div>

          <div className="mt-4">
            <Input
              label="Téléphone"
              value={isEditing ? formData.managerPhone : managerData.phone || ''}
              onChange={(e) => setFormData({ ...formData, managerPhone: e.target.value })}
              disabled={!isEditing}
              icon={Phone}
            />
          </div>

          {/* Informations du compte */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-3">Informations du compte</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Statut:</span>
                <span className={`ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  managerData.isActive 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {managerData.isActive ? 'Actif' : 'Inactif'}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Permissions:</span>
                <span className="ml-2 text-gray-900 capitalize">
                  {managerData.permissions.split(',').length} permissions
                </span>
              </div>
              <div>
                <span className="text-gray-600">Membre depuis:</span>
                <span className="ml-2 text-gray-900">
                  {new Date(managerData.createdAt).toLocaleDateString('fr-FR')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal changement mot de passe */}
      <Modal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        title="Changer le mot de passe"
      >
        <form onSubmit={(e) => { e.preventDefault(); handlePasswordChange(); }} className="space-y-4">
          <div className="relative">
            <Input
              label="Mot de passe actuel *"
              type={showCurrentPassword ? "text" : "password"}
              value={passwordData.currentPassword}
              onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
              required
            />
            <button
              type="button"
              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
            >
              {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          <div className="relative">
            <Input
              label="Nouveau mot de passe *"
              type={showNewPassword ? "text" : "password"}
              value={passwordData.newPassword}
              onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
              placeholder="Au moins 6 caractères"
              required
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
            >
              {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          <div className="relative">
            <Input
              label="Confirmer le nouveau mot de passe *"
              type={showConfirmPassword ? "text" : "password"}
              value={passwordData.confirmPassword}
              onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
            >
              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowPasswordModal(false)}
              className="flex-1"
            >
              Annuler
            </Button>
            <Button
              type="submit"
              isLoading={isSubmitting}
              className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
            >
              Changer le mot de passe
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}