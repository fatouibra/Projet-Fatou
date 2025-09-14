import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const restaurantId = params.id
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || '30'
    const rating = searchParams.get('rating')

    // Vérifier que le restaurant existe
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: restaurantId }
    })

    if (!restaurant) {
      return NextResponse.json({
        success: false,
        error: 'Restaurant non trouvé'
      }, { status: 404 })
    }

    // Calculer les dates selon la période
    const now = new Date()
    let startDate: Date | undefined

    if (period !== 'all') {
      const days = parseInt(period)
      startDate = new Date(now.getTime() - (days * 24 * 60 * 60 * 1000))
    }

    // Construire les filtres
    const whereClause: any = {
      restaurantId,
      ...(startDate && { createdAt: { gte: startDate } }),
      ...(rating && { rating: parseInt(rating) })
    }

    // Récupérer les avis
    const reviews = await prisma.review.findMany({
      where: whereClause,
      include: {
        product: {
          select: {
            id: true,
            name: true,
            image: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    // Pour chaque avis, on essaie de trouver la commande correspondante
    const reviewsWithOrders = await Promise.all(
      reviews.map(async (review) => {
        // Chercher une commande qui correspond au client
        const order = await prisma.order.findFirst({
          where: {
            restaurantId,
            OR: [
              { customerName: review.customerName },
              ...(review.customerEmail ? [{ customerEmail: review.customerEmail }] : [])
            ]
          },
          orderBy: { createdAt: 'desc' }
        })

        return {
          ...review,
          order: order ? {
            id: order.id,
            orderNumber: order.orderNumber,
            total: order.total
          } : {
            id: 'unknown',
            orderNumber: 'N/A',
            total: 0
          }
        }
      })
    )

    // Calculer les statistiques
    const totalReviews = reviews.length
    const averageRating = totalReviews > 0 
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews 
      : 0

    // Distribution des notes
    const ratingDistribution = {
      5: reviews.filter(r => r.rating === 5).length,
      4: reviews.filter(r => r.rating === 4).length,
      3: reviews.filter(r => r.rating === 3).length,
      2: reviews.filter(r => r.rating === 2).length,
      1: reviews.filter(r => r.rating === 1).length
    }

    const stats = {
      totalReviews,
      averageRating,
      ratingDistribution,
      recentReviews: reviewsWithOrders.slice(0, 5)
    }

    return NextResponse.json({
      success: true,
      data: {
        stats,
        reviews: reviewsWithOrders
      }
    })

  } catch (error) {
    console.error('Restaurant reviews API error:', error)
    return NextResponse.json({
      success: false,
      error: 'Erreur interne du serveur'
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}