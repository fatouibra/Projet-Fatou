'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAdminStore } from '@/stores/admin'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Lock, User, UserPlus, Mail, Eye, EyeOff } from 'lucide-react'

export default function AdminLoginPage() {
  const router = useRouter()
  const { login, isLoading } = useAdminStore()
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    confirmPassword: ''
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [signupLoading, setSignupLoading] = useState(false)

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!formData.email || !formData.password) {
      setError('Tous les champs sont requis')
      return
    }

    const success = await login(formData.email, formData.password)
    
    if (success) {
      router.push('/admin')
    } else {
      setError('Email ou mot de passe incorrect')
    }
  }

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('Tous les champs sont requis')
      return
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
      const response = await fetch('/api/auth/admin-signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess('Compte administrateur créé avec succès ! Vous pouvez maintenant vous connecter.')
        setMode('login')
        setFormData({ email: formData.email, password: '', name: '', confirmPassword: '' })
      } else {
        setError(data.error || 'Erreur lors de la création du compte')
      }
    } catch (error) {
      setError('Erreur lors de la création du compte')
    } finally {
      setSignupLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (error) setError('')
    if (success) setSuccess('')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
              mode === 'login' 
                ? 'bg-gradient-to-r from-primary-500 to-primary-600' 
                : 'bg-gradient-to-r from-green-500 to-green-600'
            }`}>
              {mode === 'login' ? (
                <Lock className="h-8 w-8 text-white" />
              ) : (
                <UserPlus className="h-8 w-8 text-white" />
              )}
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {mode === 'login' ? 'Administration' : 'Créer un compte Admin'}
            </h1>
            <p className="text-gray-600">
              {mode === 'login' 
                ? 'Connectez-vous pour accéder au backoffice'
                : 'Créez votre compte administrateur'
              }
            </p>
          </div>

          {/* Success Message */}
          {success && (
            <div className="mb-6 bg-green-50 border border-green-200 rounded-xl p-3">
              <p className="text-green-700 text-sm">{success}</p>
            </div>
          )}

          {/* Login Form */}
          {mode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-6">
              <div className="relative">
                <Input
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="admin@mnufood.com"
                  className="pl-10"
                />
                <Mail className="absolute left-3 top-9 h-5 w-5 text-gray-400" />
              </div>

              <div className="relative">
                <Input
                  label="Mot de passe"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  placeholder="••••••••"
                  className="pl-10 pr-10"
                />
                <Lock className="absolute left-3 top-9 h-5 w-5 text-gray-400" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              <Button
                type="submit"
                isLoading={isLoading}
                className="w-full"
                size="lg"
              >
                Se connecter
              </Button>
            </form>
          )}

          {/* Signup Form */}
          {mode === 'signup' && (
            <form onSubmit={handleSignupSubmit} className="space-y-6">
              <div className="relative">
                <Input
                  label="Nom complet"
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Votre nom complet"
                  className="pl-10"
                />
                <User className="absolute left-3 top-9 h-5 w-5 text-gray-400" />
              </div>

              <div className="relative">
                <Input
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="admin@mnufood.com"
                  className="pl-10"
                />
                <Mail className="absolute left-3 top-9 h-5 w-5 text-gray-400" />
              </div>

              <div className="relative">
                <Input
                  label="Mot de passe"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  placeholder="••••••••"
                  className="pl-10 pr-10"
                />
                <Lock className="absolute left-3 top-9 h-5 w-5 text-gray-400" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>

              <div className="relative">
                <Input
                  label="Confirmer le mot de passe"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  placeholder="••••••••"
                  className="pl-10"
                />
                <Lock className="absolute left-3 top-9 h-5 w-5 text-gray-400" />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              <Button
                type="submit"
                isLoading={signupLoading}
                className="w-full bg-green-600 hover:bg-green-700"
                size="lg"
              >
                Créer le compte
              </Button>
            </form>
          )}

          {/* Toggle Mode */}
          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setMode(mode === 'login' ? 'signup' : 'login')
                setError('')
                setSuccess('')
                setFormData({ email: '', password: '', name: '', confirmPassword: '' })
              }}
              className="text-primary-600 hover:text-primary-700 text-sm font-medium"
            >
              {mode === 'login' 
                ? "Pas encore d'compte ? Créer un compte admin" 
                : 'Déjà un compte ? Se connecter'
              }
            </button>
          </div>

          {/* Demo credentials - Only show in login mode */}
          {mode === 'login' && (
            <div className="mt-8 p-4 bg-gray-50 rounded-xl">
              <h3 className="font-medium text-gray-900 mb-2">Identifiants de démonstration:</h3>
              <div className="text-sm text-gray-600 space-y-1">
                <p><strong>Email:</strong> admin@mnufood.com</p>
                <p><strong>Mot de passe:</strong> admin123</p>
              </div>
            </div>
          )}
        </div>

        {/* Back to site */}
        <div className="text-center mt-6">
          <a 
            href="/" 
            className="text-primary-600 hover:text-primary-700 text-sm font-medium"
          >
            ← Retour au site
          </a>
        </div>
      </div>
    </div>
  )
}