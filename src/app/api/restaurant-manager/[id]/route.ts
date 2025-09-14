import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const managerId = params.id
    const data = await request.json()

    const { name, email, phone } = data

    if (!name || !email) {
      return NextResponse.json({
        error: 'Nom et email requis'
      }, { status: 400 })
    }

    // Vérifier que le manager existe
    const existingManager = await prisma.restaurantManager.findUnique({
      where: { id: managerId }
    })

    if (!existingManager) {
      return NextResponse.json({
        error: 'Gestionnaire non trouvé'
      }, { status: 404 })
    }

    // Vérifier l'unicité de l'email si changé
    if (email !== existingManager.email) {
      const emailExists = await prisma.restaurantManager.findUnique({
        where: { email }
      })

      if (emailExists) {
        return NextResponse.json({
          error: 'Cette adresse email est déjà utilisée'
        }, { status: 400 })
      }
    }

    // Mettre à jour le manager
    const updatedManager = await prisma.restaurantManager.update({
      where: { id: managerId },
      data: {
        name,
        email,
        phone
      },
      include: {
        restaurant: true
      }
    })

    // Retourner les données sans le mot de passe
    const { password: _, ...managerData } = updatedManager

    return NextResponse.json({
      success: true,
      manager: {
        ...managerData,
        createdAt: managerData.createdAt.toISOString(),
        updatedAt: managerData.updatedAt.toISOString()
      }
    })

  } catch (error) {
    console.error('Update restaurant manager error:', error)
    return NextResponse.json({
      error: 'Erreur interne du serveur'
    }, { status: 500 })
  }
}