import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getUserFromCookies, requireRole, hashPassword } from '@/lib/auth'
import { UserRole } from '@/types/auth'

// PUT - Changer le mot de passe d'un utilisateur
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
    const { newPassword, mustChangePassword = true } = body

    // Validation
    if (!newPassword || newPassword.length < 6) {
      return NextResponse.json(
        { success: false, message: 'Le mot de passe doit contenir au moins 6 caractères' },
        { status: 400 }
      )
    }

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

    // Les clients ne peuvent pas avoir de mot de passe
    if (existingUser.role === 'CUSTOMER') {
      return NextResponse.json(
        { success: false, message: 'Les clients ne peuvent pas avoir de mot de passe' },
        { status: 400 }
      )
    }

    // Hasher le nouveau mot de passe
    const hashedPassword = await hashPassword(newPassword)

    // Mettre à jour le mot de passe
    await db.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
        mustChangePassword
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Mot de passe mis à jour avec succès'
    })
  } catch (error: any) {
    console.error('Error changing password:', error)
    return NextResponse.json(
      { success: false, message: error.message || 'Erreur serveur' },
      { status: error.statusCode || 500 }
    )
  }
}