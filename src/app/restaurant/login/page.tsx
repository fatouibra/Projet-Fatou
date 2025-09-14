'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useRestaurantStore } from '@/stores/restaurant'
import { Eye, EyeOff, ChefHat, Mail, Lock, AlertCircle, UserPlus, User, Phone, MapPin, DollarSign } from 'lucide-react'

export default function RestaurantLogin() {
  const router = useRouter()
  const { login } = useRestaurantStore()
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    // Manager info
    managerName: '',
    managerPhone: '',
    // Restaurant info
    restaurantName: '',
    restaurantAddress: '',
    restaurantPhone: '',
    restaurantEmail: '',
    cuisine: '',
    deliveryFee: '',
    minOrderAmount: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [signupLoading, setSignupLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const result = await login(formData.email, formData.password)
      
      if (result.success) {
        router.push('/restaurant')
      } else {
        setError(result.error || 'Erreur de connexion')
      }
    } catch (error) {
      setError('Une erreur est survenue')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    // Validation des champs obligatoires
    const requiredFields = [
      'email', 'password', 'confirmPassword', 'managerName', 
      'restaurantName', 'restaurantAddress', 'restaurantPhone', 
      'restaurantEmail', 'cuisine'
    ]

    for (const field of requiredFields) {
      if (!formData[field as keyof typeof formData]) {
        setError('Tous les champs obligatoires doivent être remplis')
        return
      }
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas')
      return
    }

    if (formData.password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères')
      return
    }

    setSignupLoading(true)

    try {
      const response = await fetch('/api/auth/restaurant-signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          // Manager data
          managerName: formData.managerName,
          managerEmail: formData.email,
          managerPassword: formData.password,
          managerPhone: formData.managerPhone,
          // Restaurant data
          restaurantName: formData.restaurantName,
          restaurantAddress: formData.restaurantAddress,
          restaurantPhone: formData.restaurantPhone,
          restaurantEmail: formData.restaurantEmail,
          cuisine: formData.cuisine,
          deliveryFee: parseFloat(formData.deliveryFee) || 0,
          minOrderAmount: parseFloat(formData.minOrderAmount) || 15
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess('Restaurant et gestionnaire créés avec succès ! Vous pouvez maintenant vous connecter.')
        setMode('login')
        setFormData({
          email: formData.email,
          password: '',
          confirmPassword: '',
          managerName: '',
          managerPhone: '',
          restaurantName: '',
          restaurantAddress: '',
          restaurantPhone: '',
          restaurantEmail: '',
          cuisine: '',
          deliveryFee: '',
          minOrderAmount: ''
        })
      } else {
        setError(data.error || 'Erreur lors de la création du compte')
      }
    } catch (error) {
      setError('Erreur lors de la création du compte')
    } finally {
      setSignupLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Logo et titre */}
        <div className="text-center mb-8">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg ${
            mode === 'login' 
              ? 'bg-gradient-to-r from-orange-500 to-red-500' 
              : 'bg-gradient-to-r from-green-500 to-green-600'
          }`}>
            {mode === 'login' ? (
              <ChefHat className="h-8 w-8 text-white" />
            ) : (
              <UserPlus className="h-8 w-8 text-white" />
            )}
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {mode === 'login' ? 'Espace Restaurateur' : 'Créer votre Restaurant'}
          </h1>
          <p className="text-gray-600">
            {mode === 'login' 
              ? 'Connectez-vous à votre tableau de bord'
              : 'Rejoignez la marketplace MnuFood'
            }
          </p>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
              <p className="text-green-700 text-sm">{success}</p>
            </div>
          </div>
        )}

        {/* Formulaires */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          {/* Login Form */}
          {mode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                  Adresse email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    id="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                    placeholder="votre@email.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                  Mot de passe
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                    placeholder="Votre mot de passe"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
                  <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                  <span className="text-sm text-red-700">{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold py-3 px-6 rounded-xl hover:from-orange-600 hover:to-red-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Connexion...</span>
                  </div>
                ) : (
                  'Se connecter'
                )}
              </button>

              {/* Lien de récupération des accès */}
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => router.push('/restaurant/recover')}
                  className="text-orange-600 hover:text-orange-700 text-sm font-medium transition-colors"
                >
                  Mot de passe oublié ? Récupérer mes accès
                </button>
              </div>
            </form>
          )}

          {/* Signup Form */}
          {mode === 'signup' && (
            <form onSubmit={handleSignupSubmit} className="space-y-6">
              {/* Informations du gestionnaire */}
              <div className="border-b border-gray-200 pb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Informations du gestionnaire
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Nom complet *
                    </label>
                    <input
                      type="text"
                      value={formData.managerName}
                      onChange={(e) => setFormData({ ...formData, managerName: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-gray-50 focus:bg-white"
                      placeholder="Votre nom complet"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Téléphone
                    </label>
                    <input
                      type="tel"
                      value={formData.managerPhone}
                      onChange={(e) => setFormData({ ...formData, managerPhone: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-gray-50 focus:bg-white"
                      placeholder="+221 77 123 45 67"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Email de connexion *
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-gray-50 focus:bg-white"
                      placeholder="votre@email.com"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Mot de passe *
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-gray-50 focus:bg-white"
                        placeholder="••••••••"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Confirmer le mot de passe *
                    </label>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-gray-50 focus:bg-white"
                      placeholder="••••••••"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Informations du restaurant */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <ChefHat className="h-5 w-5" />
                  Informations du restaurant
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Nom du restaurant *
                    </label>
                    <input
                      type="text"
                      value={formData.restaurantName}
                      onChange={(e) => setFormData({ ...formData, restaurantName: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-gray-50 focus:bg-white"
                      placeholder="Le nom de votre restaurant"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Type de cuisine *
                    </label>
                    <input
                      type="text"
                      value={formData.cuisine}
                      onChange={(e) => setFormData({ ...formData, cuisine: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-gray-50 focus:bg-white"
                      placeholder="Ex: Sénégalaise, Italienne, Fast-food..."
                      required
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Adresse *
                    </label>
                    <input
                      type="text"
                      value={formData.restaurantAddress}
                      onChange={(e) => setFormData({ ...formData, restaurantAddress: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-gray-50 focus:bg-white"
                      placeholder="Adresse complète de votre restaurant"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Téléphone du restaurant *
                    </label>
                    <input
                      type="tel"
                      value={formData.restaurantPhone}
                      onChange={(e) => setFormData({ ...formData, restaurantPhone: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-gray-50 focus:bg-white"
                      placeholder="+221 33 123 45 67"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Email du restaurant *
                    </label>
                    <input
                      type="email"
                      value={formData.restaurantEmail}
                      onChange={(e) => setFormData({ ...formData, restaurantEmail: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-gray-50 focus:bg-white"
                      placeholder="contact@restaurant.com"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Frais de livraison (F CFA)
                    </label>
                    <input
                      type="number"
                      value={formData.deliveryFee}
                      onChange={(e) => setFormData({ ...formData, deliveryFee: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-gray-50 focus:bg-white"
                      placeholder="1500"
                      min="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Commande minimum (F CFA)
                    </label>
                    <input
                      type="number"
                      value={formData.minOrderAmount}
                      onChange={(e) => setFormData({ ...formData, minOrderAmount: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-gray-50 focus:bg-white"
                      placeholder="3000"
                      min="0"
                    />
                  </div>
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
                  <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                  <span className="text-sm text-red-700">{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={signupLoading}
                className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold py-3 px-6 rounded-xl hover:from-green-600 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {signupLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Création en cours...</span>
                  </div>
                ) : (
                  'Créer mon restaurant'
                )}
              </button>
            </form>
          )}

          {/* Toggle Mode */}
          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setMode(mode === 'login' ? 'signup' : 'login')
                setError('')
                setSuccess('')
                setFormData({
                  email: '',
                  password: '',
                  confirmPassword: '',
                  managerName: '',
                  managerPhone: '',
                  restaurantName: '',
                  restaurantAddress: '',
                  restaurantPhone: '',
                  restaurantEmail: '',
                  cuisine: '',
                  deliveryFee: '',
                  minOrderAmount: ''
                })
              }}
              className="text-orange-600 hover:text-orange-700 text-sm font-medium transition-colors"
            >
              {mode === 'login' 
                ? "Pas encore de restaurant ? Créer mon restaurant" 
                : 'Déjà un compte ? Se connecter'
              }
            </button>
          </div>

          {/* Lien vers l'administration - Only show in login mode */}
          {mode === 'login' && (
            <div className="mt-6 pt-6 border-t border-gray-100 text-center">
              <p className="text-sm text-gray-600">
                Vous êtes un administrateur ?{' '}
                <button
                  onClick={() => router.push('/admin/login')}
                  className="text-orange-600 hover:text-orange-700 font-medium transition-colors"
                >
                  Connectez-vous ici
                </button>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}