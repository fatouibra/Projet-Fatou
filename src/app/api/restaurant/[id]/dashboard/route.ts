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

    // Récupérer les statistiques
    const [
      totalOrders,
      totalProducts,
      orders,
      recentOrders,
      ordersWithItems
    ] = await Promise.all([
      // Total des commandes
      prisma.order.count({
        where: { restaurantId }
      }),

      // Total des produits actifs
      prisma.product.count({
        where: { 
          restaurantId,
          active: true 
        }
      }),

      // Toutes les commandes pour calculer les revenus
      prisma.order.findMany({
        where: { restaurantId },
        select: {
          total: true,
          status: true
        }
      }),

      // Commandes récentes
      prisma.order.findMany({
        where: { restaurantId },
        take: 10,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          orderNumber: true,
          customerName: true,
          total: true,
          status: true,
          createdAt: true
        }
      }),

      // Commandes avec items pour calculer les produits populaires
      prisma.order.findMany({
        where: { restaurantId },
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  image: true,
                  price: true
                }
              }
            }
          }
        }
      })
    ])

    // Calculer les statistiques dérivées
    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0)
    
    const pendingOrders = orders.filter(order => 
      ['RECEIVED', 'PREPARING', 'READY'].includes(order.status)
    ).length

    const completedOrders = orders.filter(order => 
      order.status === 'DELIVERED'
    ).length

    const cancelledOrders = orders.filter(order => 
      order.status === 'CANCELLED'
    ).length

    // Note moyenne (pour l'instant on utilise la note du restaurant)
    const averageRating = restaurant.rating

    // Calculer les produits populaires
    const productSales: { [key: string]: { name: string; totalSold: number; revenue: number; image?: string; price: number } } = {}
    ordersWithItems.forEach(order => {
      order.items?.forEach(item => {
        const productId = item.product?.id
        const productName = item.product?.name || 'Produit inconnu'
        const productImage = item.product?.image
        const productPrice = item.product?.price || 0
        if (productId) {
          if (!productSales[productId]) {
            productSales[productId] = { 
              name: productName, 
              totalSold: 0, 
              revenue: 0, 
              image: productImage || undefined,
              price: productPrice
            }
          }
          productSales[productId].totalSold += item.quantity
          productSales[productId].revenue += item.price * item.quantity
        }
      })
    })
    
    const topSellingProducts = Object.entries(productSales)
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => b.totalSold - a.totalSold)
      .slice(0, 6)

    const stats = {
      totalOrders,
      totalRevenue,
      totalProducts,
      averageRating,
      pendingOrders,
      completedOrders,
      cancelledOrders,
      recentOrders: recentOrders.map(order => ({
        ...order,
        createdAt: order.createdAt.toISOString()
      })),
      topSellingProducts
    }

    return NextResponse.json(stats)

  } catch (error) {
    console.error('Dashboard stats error:', error)
    return NextResponse.json({
      error: 'Erreur interne du serveur'
    }, { status: 500 })
  }
}