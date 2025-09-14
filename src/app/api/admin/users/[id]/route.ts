import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getUserFromCookies, requireRole, hashPassword } from '@/lib/auth'
import { UserRole } from '@/types/auth'

// GET - Récupérer un utilisateur par ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUserFromCookies(request)

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Non authentifié' },
        { status: 401 }
      )
    }

    requireRole(UserRole.ADMIN)(user)

    const userId = params.id

    const userData = await db.user.findUnique({
      where: { id: userId },
      include: {
        restaurant: {
          select: {
            id: true,
            name: true
          }
        },
        _count: {
          select: {
            orders: true
          }
        }
      }
    })

    if (!userData) {
      return NextResponse.json(
        { success: false, message: 'Utilisateur non trouvé' },
        { status: 404 }
      )
    }

    // Ne pas retourner le mot de passe
    const { password, ...safeUserData } = userData

    return NextResponse.json({
      success: true,
      data: safeUserData
    })
  } catch (error: any) {
    console.error('Error fetching user:', error)
    return NextResponse.json(
      { success: false, message: error.message || 'Erreur serveur' },
      { status: error.statusCode || 500 }
    )
  }
}

// PUT - Mettre à jour un utilisateur
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUserFromCookies(request)

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Non authentifié' },
        { status: 401 }
      )
    }

    requireRole(UserRole.ADMIN)(user)

    const userId = params.id
    const body = await request.json()
    const { name, email, phone, isActive, mustChangePassword } = body

    // Vérifier que l'utilisateur existe
    const existingUser = await db.user.findUnique({
      where: { id: userId }
    })

    if (!existingUser) {
      return NextResponse.json(
        { success: false, message: 'Utilisateur non trouvé' },
        { status: 404 }
      )
    }

    // Vérifier si l'email est déjà utilisé par un autre utilisateur
    if (email !== existingUser.email) {
      const emailExists = await db.user.findUnique({
        where: { email }
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
        name,
        email,
        phone: phone || null,
        isActive,
        ...(existingUser.role !== 'CUSTOMER' && { mustChangePassword })
      },
      include: {
        restaurant: {
          select: {
            id: true,
            name: true
          }
        },
        _count: {
          select: {
            orders: true
          }
        }
      }
    })

    // Ne pas retourner le mot de passe
    const { password, ...safeUserData } = updatedUser

    return NextResponse.json({
      success: true,
      data: safeUserData,
      message: 'Utilisateur mis à jour avec succès'
    })
  } catch (error: any) {
    console.error('Error updating user:', error)
    return NextResponse.json(
      { success: false, message: error.message || 'Erreur serveur' },
      { status: error.statusCode || 500 }
    )
  }
}

// DELETE - Supprimer un utilisateur
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUserFromCookies(request)

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Non authentifié' },
        { status: 401 }
      )
    }

    requireRole(UserRole.ADMIN)(user)

    const userId = params.id

    // Vérifier que l'utilisateur existe
    const existingUser = await db.user.findUnique({
      where: { id: userId }
    })

    if (!existingUser) {
      return NextResponse.json(
        { success: false, message: 'Utilisateur non trouvé' },
        { status: 404 }
      )
    }

    // Ne pas permettre de supprimer son propre compte
    if (userId === user.id) {
      return NextResponse.json(
        { success: false, message: 'Vous ne pouvez pas supprimer votre propre compte' },
        { status: 400 }
      )
    }

    // Supprimer l'utilisateur
    await db.user.delete({
      where: { id: userId }
    })

    return NextResponse.json({
      success: true,
      message: 'Utilisateur supprimé avec succès'
    })
  } catch (error: any) {
    console.error('Error deleting user:', error)
    return NextResponse.json(
      { success: false, message: error.message || 'Erreur serveur' },
      { status: error.statusCode || 500 }
    )
  }
}