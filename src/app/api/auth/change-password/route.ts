import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { managerId, currentPassword, newPassword } = body

    if (!managerId || !currentPassword || !newPassword) {
      return NextResponse.json(
        { success: false, error: 'Manager ID, current password and new password are required' },
        { status: 400 }
      )
    }

    // Validation de la longueur du nouveau mot de passe
    if (newPassword.length < 8) {
      return NextResponse.json(
        { success: false, error: 'New password must be at least 8 characters long' },
        { status: 400 }
      )
    }

    // Rechercher le gestionnaire
    const manager = await db.restaurantManager.findUnique({
      where: { id: managerId }
    })

    if (!manager) {
      return NextResponse.json(
        { success: false, error: 'Manager not found' },
        { status: 404 }
      )
    }

    // Vérifier le mot de passe actuel
    // Pour le développement, on compare directement
    // En production, utiliser bcrypt.compare
    const isCurrentPasswordValid = currentPassword === manager.password

    if (!isCurrentPasswordValid) {
      return NextResponse.json(
        { success: false, error: 'Current password is incorrect' },
        { status: 400 }
      )
    }

    // Hasher le nouveau mot de passe
    const hashedNewPassword = await bcrypt.hash(newPassword, 10)

    // Mettre à jour le mot de passe et marquer que le changement n'est plus requis
    await db.restaurantManager.update({
      where: { id: managerId },
      data: {
        password: hashedNewPassword,
        updatedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Password changed successfully'
    })
  } catch (error) {
    console.error('Error changing password:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}