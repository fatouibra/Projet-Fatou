import { NextRequest, NextResponse } from 'next/server'
import { getUserFromCookies, requireRole } from '@/lib/auth'
import { UserRole } from '@/types/auth'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function GET(request: NextRequest) {
  try {
    // Vérifier l'authentification admin
    const user = await getUserFromCookies(request)
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Non authentifié' },
        { status: 401 }
      )
    }
    
    requireRole(UserRole.ADMIN)(user)

    // Récupérer tous les utilisateurs avec leurs restaurants
    const users = await db.user.findMany({
      include: {
        restaurant: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    console.log(`✅ Admin fetched ${users.length} users`)

    // Retirer les mots de passe des résultats
    const usersWithoutPasswords = users.map(({ password, ...user }) => user)

    return NextResponse.json({
      success: true,
      data: usersWithoutPasswords
    })

  } catch (error: any) {
    console.error('❌ Error fetching users:', error)
    
    if (error.name === 'PermissionError') {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 403 }
      )
    }

    return NextResponse.json(
      { success: false, message: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Vérifier l'authentification admin
    const user = await getUserFromCookies(request)
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Non authentifié' },
        { status: 401 }
      )
    }
    
    requireRole(UserRole.ADMIN)(user)

    const { name, email, role, password, phone, restaurantId } = await request.json()

    // Validation
    if (!name || !email || !role || !password) {
      return NextResponse.json(
        { success: false, message: 'Nom, email, rôle et mot de passe sont requis' },
        { status: 400 }
      )
    }

    // Vérifier si l'email existe déjà
    const existingUser = await db.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { success: false, message: 'Un utilisateur avec cet email existe déjà' },
        { status: 400 }
      )
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10)

    // Créer l'utilisateur
    const newUser = await db.user.create({
      data: {
        name,
        email,
        role: role as UserRole,
        password: hashedPassword,
        phone: phone || null,
        restaurantId: restaurantId || null,
        isActive: true
      },
      include: {
        restaurant: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    console.log(`✅ Admin created user: ${newUser.email} (${newUser.role})`)

    // Retirer le mot de passe du résultat
    const { password: _, ...userWithoutPassword } = newUser

    return NextResponse.json({
      success: true,
      data: userWithoutPassword,
      message: 'Utilisateur créé avec succès'
    })

  } catch (error: any) {
    console.error('❌ Error creating user:', error)
    
    if (error.name === 'PermissionError') {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 403 }
      )
    }

    return NextResponse.json(
      { success: false, message: 'Erreur lors de la création de l\'utilisateur' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Vérifier l'authentification admin
    const user = await getUserFromCookies(request)
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Non authentifié' },
        { status: 401 }
      )
    }
    
    requireRole(UserRole.ADMIN)(user)

    const { userId, name, email, role, phone, restaurantId, isActive } = await request.json()

    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'ID utilisateur requis' },
        { status: 400 }
      )
    }

    // Vérifier si l'utilisateur existe
    const existingUser = await db.user.findUnique({
      where: { id: userId }
    })

    if (!existingUser) {
      return NextResponse.json(
        { success: false, message: 'Utilisateur non trouvé' },
        { status: 404 }
      )
    }

    // Vérifier si le nouvel email existe déjà (sauf pour cet utilisateur)
    if (email && email !== existingUser.email) {
      const emailExists = await db.user.findFirst({
        where: {
          email,
          id: { not: userId }
        }
      })

      if (emailExists) {
        return NextResponse.json(
          { success: false, message: 'Cet email est déjà utilisé' },
          { status: 400 }
        )
      }
    }

    // Mettre à jour l'utilisateur
    const updatedUser = await db.user.update({
      where: { id: userId },
      data: {
        ...(name && { name }),
        ...(email && { email }),
        ...(role && { role: role as UserRole }),
        ...(phone !== undefined && { phone: phone || null }),
        ...(restaurantId !== undefined && { restaurantId: restaurantId || null }),
        ...(isActive !== undefined && { isActive })
      },
      include: {
        restaurant: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    console.log(`✅ Admin updated user: ${updatedUser.email}`)

    // Retirer le mot de passe du résultat
    const { password: _, ...userWithoutPassword } = updatedUser

    return NextResponse.json({
      success: true,
      data: userWithoutPassword,
      message: 'Utilisateur mis à jour avec succès'
    })

  } catch (error: any) {
    console.error('❌ Error updating user:', error)
    
    if (error.name === 'PermissionError') {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 403 }
      )
    }

    return NextResponse.json(
      { success: false, message: 'Erreur lors de la mise à jour de l\'utilisateur' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Vérifier l'authentification admin
    const user = await getUserFromCookies(request)
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Non authentifié' },
        { status: 401 }
      )
    }
    
    requireRole(UserRole.ADMIN)(user)

    const url = new URL(request.url)
    const userId = url.searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'ID utilisateur requis' },
        { status: 400 }
      )
    }

    // Vérifier si l'utilisateur existe
    const existingUser = await db.user.findUnique({
      where: { id: userId }
    })

    if (!existingUser) {
      return NextResponse.json(
        { success: false, message: 'Utilisateur non trouvé' },
        { status: 404 }
      )
    }

    // Ne pas permettre la suppression du compte admin actuel
    if (existingUser.id === user.id) {
      return NextResponse.json(
        { success: false, message: 'Impossible de supprimer votre propre compte' },
        { status: 400 }
      )
    }

    // Supprimer l'utilisateur
    await db.user.delete({
      where: { id: userId }
    })

    console.log(`✅ Admin deleted user: ${existingUser.email}`)

    return NextResponse.json({
      success: true,
      message: 'Utilisateur supprimé avec succès'
    })

  } catch (error: any) {
    console.error('❌ Error deleting user:', error)
    
    if (error.name === 'PermissionError') {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 403 }
      )
    }

    return NextResponse.json(
      { success: false, message: 'Erreur lors de la suppression de l\'utilisateur' },
      { status: 500 }
    )
  }
}