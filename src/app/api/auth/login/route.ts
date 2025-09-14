import { NextRequest, NextResponse } from 'next/server'
import { authenticateUser, AuthError } from '@/lib/auth'
import { generateTokenEdge } from '@/lib/jwt-edge'
import { UserRole } from '@/types/auth'

export async function POST(request: NextRequest) {
  try {
    console.log('🔑 Login attempt started')
    const { email, password } = await request.json()
    console.log('📧 Email:', email)

    if (!email || !password) {
      console.log('❌ Missing credentials')
      return NextResponse.json(
        { success: false, message: 'Email et mot de passe requis' },
        { status: 400 }
      )
    }

    // Authentifier l'utilisateur
    console.log('🔍 Authenticating user...')
    const user = await authenticateUser(email, password)
    console.log('✅ User authenticated:', user.email, user.role)

    // Vérifier que l'utilisateur peut se connecter
    if (user.role === UserRole.CUSTOMER) {
      return NextResponse.json(
        { success: false, message: 'Les clients ne peuvent pas se connecter' },
        { status: 403 }
      )
    }

    // Générer le token JWT
    const token = await generateTokenEdge(user)

    // Créer la réponse avec le cookie
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        restaurantId: user.restaurantId,
        restaurant: user.restaurant
      },
      token
    })

    // Définir le cookie httpOnly pour la sécurité
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 // 7 jours
    })

    return response

  } catch (error) {
    console.error('Erreur de connexion:', error)

    if (error instanceof AuthError) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: error.statusCode }
      )
    }

    return NextResponse.json(
      { success: false, message: 'Erreur serveur' },
      { status: 500 }
    )
  }
}