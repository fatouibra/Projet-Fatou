import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { UserRole } from '@/types/auth'
import { db } from '@/lib/db'

// Types pour la requête
interface SignupRequest {
  type: 'admin' | 'restaurant'
  user: {
    firstName: string
    lastName: string
    email: string
    phone?: string
    password: string
  }
  restaurant?: {
    name: string
    address: string
    phone?: string
    description?: string
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: SignupRequest = await request.json()

    console.log('🎯 Signup request received:', {
      type: body.type,
      email: body.user.email,
      hasRestaurant: !!body.restaurant
    })

    // Validation des données
    if (!body.type || !body.user) {
      return NextResponse.json(
        { success: false, message: 'Données manquantes' },
        { status: 400 }
      )
    }

    const { type, user, restaurant } = body

    // Validation des champs utilisateur
    if (!user.firstName || !user.lastName || !user.email || !user.password) {
      return NextResponse.json(
        { success: false, message: 'Tous les champs utilisateur sont requis' },
        { status: 400 }
      )
    }

    // Validation email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(user.email)) {
      return NextResponse.json(
        { success: false, message: 'Format d\'email invalide' },
        { status: 400 }
      )
    }

    // Vérifier si l'email existe déjà
    const existingUser = await db.user.findUnique({
      where: { email: user.email.toLowerCase() }
    })
    
    if (existingUser) {
      return NextResponse.json(
        { success: false, message: 'Un compte avec cet email existe déjà' },
        { status: 400 }
      )
    }

    // Validation mot de passe
    if (user.password.length < 6) {
      return NextResponse.json(
        { success: false, message: 'Le mot de passe doit contenir au moins 6 caractères' },
        { status: 400 }
      )
    }

    // Validation restaurant (si c'est un restaurateur)
    if (type === 'restaurant') {
      if (!restaurant || !restaurant.name || !restaurant.address) {
        return NextResponse.json(
          { success: false, message: 'Les informations du restaurant sont requises' },
          { status: 400 }
        )
      }
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(user.password, 10)

    // Créer l'utilisateur et le restaurant dans une transaction
    const result = await db.$transaction(async (prisma) => {
      // Créer l'utilisateur
      const newUser = await prisma.user.create({
        data: {
          name: `${user.firstName} ${user.lastName}`,
          email: user.email.toLowerCase(),
          phone: user.phone || null,
          password: hashedPassword,
          role: type === 'admin' ? UserRole.ADMIN : UserRole.RESTAURATOR,
          isActive: true
        }
      })

      let newRestaurant = null

      // Créer le restaurant si nécessaire
      if (type === 'restaurant' && restaurant) {
        newRestaurant = await prisma.restaurant.create({
          data: {
            name: restaurant.name,
            address: restaurant.address,
            phone: restaurant.phone || null,
            description: restaurant.description || null,
            isActive: true,
            ownerId: newUser.id
          }
        })

        // Mettre à jour l'utilisateur avec l'ID du restaurant
        await prisma.user.update({
          where: { id: newUser.id },
          data: { restaurantId: newRestaurant.id }
        })

        console.log('✅ Restaurant created:', {
          id: newRestaurant.id,
          name: restaurant.name,
          ownerId: newUser.id
        })
      }

      return { user: newUser, restaurant: newRestaurant }
    })

    console.log('✅ User created successfully:', {
      id: result.user.id,
      email: user.email,
      role: result.user.role,
      hasRestaurant: !!result.restaurant
    })

    // Réponse de succès (ne pas retourner le mot de passe)
    const { password, ...userWithoutPassword } = result.user

    return NextResponse.json({
      success: true,
      message: 'Compte créé avec succès',
      data: {
        user: userWithoutPassword,
        restaurant: result.restaurant
      }
    })

  } catch (error) {
    console.error('❌ Signup error:', error)
    return NextResponse.json(
      { success: false, message: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}