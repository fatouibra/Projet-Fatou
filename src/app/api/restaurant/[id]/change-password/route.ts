import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const restaurantId = params.id
    const body = await request.json()

    const { currentPassword, newPassword } = body

    if (!currentPassword || !newPassword) {
      return NextResponse.json({
        success: false,
        message: 'Mot de passe actuel et nouveau mot de passe requis'
      }, { status: 400 })
    }

    if (newPassword.length < 6) {
      return NextResponse.json({
        success: false,
        message: 'Le nouveau mot de passe doit contenir au moins 6 caractères'
      }, { status: 400 })
    }

    // Récupérer le manager
    const manager = await prisma.restaurantManager.findUnique({
      where: { restaurantId },
      select: {
        id: true,
        password: true
      }
    })

    if (!manager) {
      return NextResponse.json({
        success: false,
        message: 'Manager non trouvé'
      }, { status: 404 })
    }

    // Vérifier le mot de passe actuel
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, manager.password)
    if (!isCurrentPasswordValid) {
      return NextResponse.json({
        success: false,
        message: 'Mot de passe actuel incorrect'
      }, { status: 400 })
    }

    // Hasher le nouveau mot de passe
    const hashedNewPassword = await bcrypt.hash(newPassword, 10)

    // Mettre à jour le mot de passe
    await prisma.restaurantManager.update({
      where: { restaurantId },
      data: {
        password: hashedNewPassword,
        mustChangePassword: false, // Le manager a changé son mot de passe
        updatedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Mot de passe mis à jour avec succès'
    })

  } catch (error) {
    console.error('Password change error:', error)
    return NextResponse.json({
      success: false,
      message: 'Erreur lors du changement de mot de passe'
    }, { status: 500 })
  }
}