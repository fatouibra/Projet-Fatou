'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  Shield, 
  Store,
  AlertCircle,
  User,
  Phone,
  MapPin,
  Check
} from 'lucide-react'

type SignupType = 'admin' | 'restaurant'

export default function SignupPage() {
  const router = useRouter()
  const [signupType, setSignupType] = useState<SignupType>('restaurant')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  const [formData, setFormData] = useState({
    // Données utilisateur
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    
    // Données restaurant (seulement pour les restaurateurs)
    restaurantName: '',
    restaurantAddress: '',
    restaurantPhone: '',
    restaurantDescription: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setIsLoading(true)

    // Validation basique
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
      setError('Veuillez remplir tous les champs obligatoires')
      setIsLoading(false)
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas')
      setIsLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères')
      setIsLoading(false)
      return
    }

    if (signupType === 'restaurant' && (!formData.restaurantName || !formData.restaurantAddress)) {
      setError('Veuillez remplir les informations du restaurant')
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: signupType,
          user: {
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            phone: formData.phone,
            password: formData.password,
          },
          restaurant: signupType === 'restaurant' ? {
            name: formData.restaurantName,
            address: formData.restaurantAddress,
            phone: formData.restaurantPhone,
            description: formData.restaurantDescription,
          } : null
        }),
      })

      const result = await response.json()

      if (response.ok && result.success) {
        setSuccess('Inscription réussie ! Vous pouvez maintenant vous connecter.')
        setTimeout(() => {
          router.push('/login')
        }, 2000)
      } else {
        setError(result.message || 'Erreur lors de l\'inscription')
      }
    } catch (error) {
      setError('Erreur de connexion au serveur')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-2xl font-bold">M</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Inscription à MnuFood
            </h1>
            <p className="text-gray-600">
              Créez votre compte pour commencer
            </p>
          </div>

          {/* Type de compte */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Type de compte</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setSignupType('restaurant')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  signupType === 'restaurant'
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:border-green-300'
                }`}
              >
                <Store className={`h-8 w-8 mx-auto mb-2 ${
                  signupType === 'restaurant' ? 'text-green-600' : 'text-gray-600'
                }`} />
                <p className={`font-medium ${
                  signupType === 'restaurant' ? 'text-green-900' : 'text-gray-700'
                }`}>
                  Restaurateur
                </p>
                <p className={`text-sm ${
                  signupType === 'restaurant' ? 'text-green-600' : 'text-gray-500'
                }`}>
                  Gérer votre restaurant
                </p>
                {signupType === 'restaurant' && (
                  <Check className="h-5 w-5 text-green-600 mx-auto mt-2" />
                )}
              </button>

              <button
                type="button"
                onClick={() => setSignupType('admin')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  signupType === 'admin'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                <Shield className={`h-8 w-8 mx-auto mb-2 ${
                  signupType === 'admin' ? 'text-blue-600' : 'text-gray-600'
                }`} />
                <p className={`font-medium ${
                  signupType === 'admin' ? 'text-blue-900' : 'text-gray-700'
                }`}>
                  Administrateur
                </p>
                <p className={`text-sm ${
                  signupType === 'admin' ? 'text-blue-600' : 'text-gray-500'
                }`}>
                  Gestion complète
                </p>
                {signupType === 'admin' && (
                  <Check className="h-5 w-5 text-blue-600 mx-auto mt-2" />
                )}
              </button>
            </div>
          </div>

          {/* Messages */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-red-800 text-sm font-medium">Erreur</p>
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            </div>
          )}

          {success && (
            <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
              <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-green-800 text-sm font-medium">Succès</p>
                <p className="text-green-700 text-sm">{success}</p>
              </div>
            </div>
          )}

          {/* Formulaire */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Informations personnelles */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Informations personnelles</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                    Prénom *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      id="firstName"
                      name="firstName"
                      type="text"
                      required
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="pl-10 pr-4 py-3 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      placeholder="Votre prénom"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                    Nom *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      id="lastName"
                      name="lastName"
                      type="text"
                      required
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="pl-10 pr-4 py-3 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      placeholder="Votre nom"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      className="pl-10 pr-4 py-3 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      placeholder="votre@email.com"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    Téléphone
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="pl-10 pr-4 py-3 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      placeholder="+221 XX XXX XX XX"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                    Mot de passe *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={formData.password}
                      onChange={handleInputChange}
                      className="pl-10 pr-12 py-3 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                    Confirmer le mot de passe *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className="pl-10 pr-12 py-3 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Informations restaurant (seulement pour les restaurateurs) */}
            {signupType === 'restaurant' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Informations du restaurant</h3>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="restaurantName" className="block text-sm font-medium text-gray-700 mb-2">
                      Nom du restaurant *
                    </label>
                    <div className="relative">
                      <Store className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                      <input
                        id="restaurantName"
                        name="restaurantName"
                        type="text"
                        required={signupType === 'restaurant'}
                        value={formData.restaurantName}
                        onChange={handleInputChange}
                        className="pl-10 pr-4 py-3 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        placeholder="Le nom de votre restaurant"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="restaurantAddress" className="block text-sm font-medium text-gray-700 mb-2">
                      Adresse *
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                      <input
                        id="restaurantAddress"
                        name="restaurantAddress"
                        type="text"
                        required={signupType === 'restaurant'}
                        value={formData.restaurantAddress}
                        onChange={handleInputChange}
                        className="pl-10 pr-4 py-3 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        placeholder="Adresse complète du restaurant"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="restaurantPhone" className="block text-sm font-medium text-gray-700 mb-2">
                      Téléphone du restaurant
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                      <input
                        id="restaurantPhone"
                        name="restaurantPhone"
                        type="tel"
                        value={formData.restaurantPhone}
                        onChange={handleInputChange}
                        className="pl-10 pr-4 py-3 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        placeholder="+221 XX XXX XX XX"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="restaurantDescription" className="block text-sm font-medium text-gray-700 mb-2">
                      Description du restaurant
                    </label>
                    <textarea
                      id="restaurantDescription"
                      name="restaurantDescription"
                      rows={3}
                      value={formData.restaurantDescription}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      placeholder="Décrivez votre restaurant, votre cuisine..."
                    />
                  </div>
                </div>
              </div>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white py-3 text-lg font-semibold"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Inscription en cours...
                </div>
              ) : (
                'Créer mon compte'
              )}
            </Button>
          </form>

          {/* Liens */}
          <div className="mt-8 pt-6 border-t border-gray-200 text-center space-y-4">
            <p className="text-sm text-gray-600">
              Vous avez déjà un compte ?{' '}
              <button
                onClick={() => router.push('/login')}
                className="text-orange-600 hover:text-orange-700 font-medium"
              >
                Se connecter
              </button>
            </p>
            
            <button
              onClick={() => router.push('/')}
              className="text-gray-500 hover:text-gray-700 text-sm"
            >
              ← Retour au site public
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}