import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const restaurantId = params.id

    const manager = await prisma.user.findFirst({
      where: { 
        restaurantId,
        role: 'RESTAURATOR'
      },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        isActive: true,
        permissions: true,
        mustChangePassword: true,
        createdAt: true,
        updatedAt: true
      }
    })

    if (!manager) {
      return NextResponse.json({
        success: false,
        message: 'Manager non trouvé'
      }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: manager
    })

  } catch (error) {
    console.error('Manager profile fetch error:', error)
    return NextResponse.json({
      success: false,
      message: 'Erreur interne du serveur'
    }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const restaurantId = params.id
    const body = await request.json()

    const { name, email, phone } = body

    const updatedManager = await prisma.user.updateMany({
      where: { 
        restaurantId,
        role: 'RESTAURATOR'
      },
      data: {
        name,
        email,
        phone
      }
    })

    // Récupérer le manager mis à jour
    const manager = await prisma.user.findFirst({
      where: { 
        restaurantId,
        role: 'RESTAURATOR'
      },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        isActive: true,
        permissions: true,
        mustChangePassword: true,
        createdAt: true,
        updatedAt: true
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Profil manager mis à jour avec succès',
      data: manager
    })

  } catch (error) {
    console.error('Manager profile update error:', error)
    return NextResponse.json({
      success: false,
      message: 'Erreur lors de la mise à jour du profil manager'
    }, { status: 500 })
  }
}