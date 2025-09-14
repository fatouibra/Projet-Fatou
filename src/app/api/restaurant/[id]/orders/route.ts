import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const restaurantId = params.id

    // Vérifier que le restaurant existe
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: restaurantId }
    })

    if (!restaurant) {
      return NextResponse.json({
        error: 'Restaurant non trouvé'
      }, { status: 404 })
    }

    // Récupérer les commandes du restaurant avec leurs articles
    const orders = await prisma.order.findMany({
      where: { restaurantId },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                image: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({
      orders: orders.map(order => ({
        ...order,
        createdAt: order.createdAt.toISOString(),
        updatedAt: order.updatedAt.toISOString()
      }))
    })

  } catch (error) {
    console.error('Get restaurant orders error:', error)
    return NextResponse.json({
      error: 'Erreur interne du serveur'
    }, { status: 500 })
  }
}