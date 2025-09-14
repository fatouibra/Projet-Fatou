import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth, requireRole, requirePermission, AuthError, PermissionError, hashPassword } from '@/lib/auth'
import { UserRole } from '@/types/auth'

export async function GET(request: NextRequest) {
  try {
    // Pour la consultation publique des restaurants, pas d'authentification requise
    const { searchParams } = new URL(request.url)
    const cuisine = searchParams.get('cuisine')
    const minRating = searchParams.get('minRating')
    const isActive = searchParams.get('active')
    const adminView = searchParams.get('admin') === 'true'

    let user = null
    try {
      user = await requireAuth(request)
    } catch {
      // Pas d'authentification pour la vue publique
    }

    console.log('🔍 API Debug - User:', user ? { id: user.id, email: user.email, role: user.role } : 'No user')
    console.log('🔍 API Debug - URL params:', { cuisine, minRating, isActive, adminView })

    const where: any = {}

    // Si c'est un utilisateur connecté non-admin, ne montrer que les restaurants actifs
    if (!user || user.role !== UserRole.ADMIN) {
      where.isActive = true
      console.log('🔍 API Debug - Filtering to active only (user is not admin)')
    } else {
      console.log('🔍 API Debug - Admin user detected, showing all restaurants')
    }

    // Si c'est un restaurateur, ne montrer que son restaurant
    if (user?.role === UserRole.RESTAURATOR && user.restaurantId) {
      where.id = user.restaurantId
    }
    
    if (cuisine) {
      where.cuisine = { contains: cuisine }
    }
    
    if (minRating) {
      where.rating = { gte: parseFloat(minRating) }
    }
    
    if (isActive !== null && user?.role === UserRole.ADMIN) {
      where.isActive = isActive === 'true'
    }

    const restaurants = await db.restaurant.findMany({
      where,
      include: {
        products: {
          where: { active: true },
          include: {
            category: true
          }
        },
        managers: user?.role === UserRole.ADMIN ? {
          select: {
            id: true,
            name: true,
            email: true,
            isActive: true
          }
        } : false,
        _count: {
          select: {
            products: { where: { active: true } },
            orders: true
          }
        }
      },
      orderBy: [
        { rating: 'desc' },
        { name: 'asc' }
      ]
    })

    return NextResponse.json({ success: true, data: restaurants })
  } catch (error) {
    console.error('Error fetching restaurants:', error)
    
    if (error instanceof AuthError || error instanceof PermissionError) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: error.statusCode }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Failed to fetch restaurants' },
      { status: 500 }
    )
  }
}

function generateRandomPassword(length: number = 12): string {
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*"
  let password = ""
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length))
  }
  return password
}

export async function POST(request: NextRequest) {
  try {
    // Seuls les admins peuvent créer des restaurants
    const user = await requireAuth(request)
    requireRole(UserRole.ADMIN)(user)

    const body = await request.json()
    const {
      name,
      description,
      address,
      phone,
      email,
      image,
      rating = 4.0,
      isActive = true,
      cuisine,
      deliveryFee = 0,
      minOrderAmount = 3000,
      openingHours = "9h00 - 22h00",
      // Manager data
      managerName,
      managerEmail,
      managerPhone
    } = body

    // Validation
    if (!name || !cuisine) {
      return NextResponse.json(
        { success: false, error: 'Name and cuisine are required' },
        { status: 400 }
      )
    }

    if (!managerName || !managerEmail) {
      return NextResponse.json(
        { success: false, error: 'Manager name and email are required' },
        { status: 400 }
      )
    }

    // Vérifier si l'email du gestionnaire est déjà utilisé
    const existingManager = await db.user.findUnique({
      where: { email: managerEmail }
    })

    if (existingManager) {
      return NextResponse.json(
        { success: false, error: 'Manager email is already in use' },
        { status: 400 }
      )
    }

    // Générer un mot de passe temporaire pour le gestionnaire
    const temporaryPassword = generateRandomPassword()
    const hashedPassword = await hashPassword(temporaryPassword)

    // Créer le restaurant et le gestionnaire dans une transaction
    const result = await db.$transaction(async (tx) => {
      // Créer le restaurant
      const restaurant = await tx.restaurant.create({
        data: {
          name,
          description,
          address,
          phone,
          email,
          image,
          rating,
          isActive,
          cuisine,
          deliveryFee,
          minOrderAmount,
          openingHours
        },
        include: {
          products: {
            where: { active: true },
            include: { category: true }
          },
          _count: {
            select: {
              products: { where: { active: true } },
              orders: true
            }
          }
        }
      })

      // Créer le gestionnaire dans le modèle User unifié
      const manager = await tx.user.create({
        data: {
          name: managerName,
          email: managerEmail,
          phone: managerPhone,
          password: hashedPassword,
          role: UserRole.RESTAURATOR,
          restaurantId: restaurant.id,
          permissions: "dashboard,products,orders,profile,finances,reviews",
          mustChangePassword: true,
          isActive: true
        }
      })

      return { restaurant, manager, temporaryPassword }
    })

    const { restaurant, manager, temporaryPassword: tempPassword } = result

    return NextResponse.json({ 
      success: true, 
      data: restaurant,
      manager: {
        id: manager.id,
        name: manager.name,
        email: manager.email,
        phone: manager.phone,
        role: manager.role
      },
      temporaryPassword: tempPassword, // À retirer en production - utiliser l'email à la place
      message: 'Restaurant and manager created successfully. Temporary password generated.'
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating restaurant:', error)
    
    if (error instanceof AuthError || error instanceof PermissionError) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: error.statusCode }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Failed to create restaurant' },
      { status: 500 }
    )
  }
}