import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getUserFromCookies, requireRole, hashPassword } from '@/lib/auth'
import { UserRole } from '@/types/auth'

// Fonction pour générer un mot de passe temporaire
function generateRandomPassword(length: number = 12): string {
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*"
  let password = ""
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length))
  }
  return password
}

// POST - Réinitialiser le mot de passe d'un utilisateur
export async function POST(
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

    // Les clients ne peuvent pas avoir de mot de passe
    if (existingUser.role === 'CUSTOMER') {
      return NextResponse.json(
        { success: false, message: 'Les clients ne peuvent pas avoir de mot de passe' },
        { status: 400 }
      )
    }

    // Générer un nouveau mot de passe temporaire
    const tempPassword = generateRandomPassword()
    const hashedPassword = await hashPassword(tempPassword)

    // Mettre à jour le mot de passe
    await db.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
        mustChangePassword: true
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Mot de passe réinitialisé avec succès',
      tempPassword // En production, envoyer par email au lieu de retourner
    })
  } catch (error: any) {
    console.error('Error resetting password:', error)
    return NextResponse.json(
      { success: false, message: error.message || 'Erreur serveur' },
      { status: error.statusCode || 500 }
    )
  }
}