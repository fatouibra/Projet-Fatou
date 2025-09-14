'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/auth'
import { UserRole } from '@/types/auth'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  Shield, 
  Store,
  AlertCircle 
} from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const { login, isAuthenticated, user, isLoading, initialize } = useAuthStore()
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [error, setError] = useState('')

  useEffect(() => {
    initialize()
    
    // Gérer les paramètres d'URL
    const params = new URLSearchParams(window.location.search)
    const errorParam = params.get('error')
    
    if (errorParam === 'session-expired') {
      setError('Votre session a expiré, veuillez vous reconnecter')
    } else if (errorParam === 'unauthorized') {
      setError('Accès non autorisé')
    }
  }, [initialize])

  useEffect(() => {
    if (isAuthenticated && user) {
      // Vérifier s'il y a une redirection demandée
      const params = new URLSearchParams(window.location.search)
      const redirect = params.get('redirect')
      
      if (redirect) {
        router.push(redirect)
      } else {
        // Rediriger selon le rôle
        if (user.role === UserRole.ADMIN) {
          router.push('/admin')
        } else if (user.role === UserRole.RESTAURATOR) {
          router.push('/restaurant')
        }
      }
    }
  }, [isAuthenticated, user, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    console.log('🎯 Frontend - Form submitted')
    console.log('📧 Frontend - Email:', formData.email)
    console.log('🔒 Frontend - Password length:', formData.password?.length)

    if (!formData.email || !formData.password) {
      console.log('❌ Frontend - Missing fields')
      setError('Veuillez remplir tous les champs')
      return
    }

    console.log('🚀 Frontend - Calling login function...')
    const result = await login(formData)
    console.log('📤 Frontend - Login result:', result)
    
    if (!result.success) {
      console.log('❌ Frontend - Login failed:', result.message)
      setError(result.message || 'Erreur de connexion')
    } else {
      console.log('✅ Frontend - Login successful')
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  if (isAuthenticated && user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="loading-spinner w-8 h-8"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-2xl font-bold">M</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Connexion à MnuFood
            </h1>
            <p className="text-gray-600">
              Accédez à votre espace de gestion
            </p>
          </div>

          {/* Types d'utilisateurs */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg text-center">
              <Shield className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-blue-900">Administrateur</p>
              <p className="text-xs text-blue-600">Gestion complète</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg text-center">
              <Store className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-green-900">Restaurateur</p>
              <p className="text-xs text-green-600">Gestion restaurant</p>
            </div>
          </div>

          {/* Formulaire */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-red-800 text-sm font-medium">Erreur de connexion</p>
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Adresse email
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
                    className="pl-10 pr-4 py-3 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                    placeholder="votre@email.com"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Mot de passe
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
                    className="pl-10 pr-12 py-3 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
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
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white py-3 text-lg font-semibold"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Connexion...
                </div>
              ) : (
                'Se connecter'
              )}
            </Button>
          </form>

          {/* Informations par défaut */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-center text-sm text-gray-600 mb-4">
              Comptes par défaut pour les tests :
            </p>
            <div className="grid grid-cols-1 gap-3 text-xs">
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="font-medium text-blue-900">👤 Admin:</p>
                <p className="text-blue-700">admin@mnufood.com / admin123</p>
              </div>
              <div className="bg-green-50 p-3 rounded-lg">
                <p className="font-medium text-green-900">🏪 Restaurateur:</p>
                <p className="text-green-700">fatou@chezfatou.sn / fatou123</p>
                <p className="text-green-700">demo@restaurant.com / demo123</p>
              </div>
            </div>
          </div>

          {/* Liens */}
          <div className="mt-6 text-center space-y-4">
            <p className="text-sm text-gray-600">
              Vous n'avez pas encore de compte ?{' '}
              <button
                onClick={() => router.push('/signup')}
                className="text-orange-600 hover:text-orange-700 font-medium"
              >
                Créer un compte
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