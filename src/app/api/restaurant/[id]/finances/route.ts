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
    
    // Paramètres de filtre
    const period = searchParams.get('period') || '30' // 7, 30, 90 jours ou 'all'
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    // Calculer la date de début selon la période
    let dateFilter: any = {}
    
    if (startDate && endDate) {
      // Filtre par dates personnalisées
      dateFilter = {
        createdAt: {
          gte: new Date(startDate),
          lte: new Date(endDate + 'T23:59:59.999Z')
        }
      }
    } else if (period !== 'all') {
      // Filtre par période prédéfinie
      const daysAgo = parseInt(period)
      const startPeriod = new Date()
      startPeriod.setDate(startPeriod.getDate() - daysAgo)
      startPeriod.setHours(0, 0, 0, 0)
      
      dateFilter = {
        createdAt: {
          gte: startPeriod
        }
      }
    }

    // Vérifier que le restaurant existe
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: restaurantId }
    })

    if (!restaurant) {
      return NextResponse.json({
        success: false,
        message: 'Restaurant non trouvé'
      }, { status: 404 })
    }

    // Récupérer toutes les commandes avec filtres
    const orders = await prisma.order.findMany({
      where: {
        restaurantId,
        ...dateFilter,
        status: {
          in: ['DELIVERED', 'RECEIVED', 'PREPARING', 'READY'] // Exclure les annulées
        }
      },
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
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Calculer les statistiques principales
    const totalOrders = orders.length
    const completedOrders = orders.filter(order => order.status === 'DELIVERED').length
    const pendingOrders = orders.filter(order => ['RECEIVED', 'PREPARING', 'READY'].includes(order.status)).length
    
    const totalRevenue = orders.reduce((sum, order) => {
      return order.status === 'DELIVERED' ? sum + order.total : sum
    }, 0)

    const totalPendingRevenue = orders.reduce((sum, order) => {
      return ['RECEIVED', 'PREPARING', 'READY'].includes(order.status) ? sum + order.total : sum
    }, 0)

    // Calculer le panier moyen
    const averageOrderValue = completedOrders > 0 ? totalRevenue / completedOrders : 0

    // Calculer les produits les plus vendus
    const productSales: { [key: string]: { name: string; quantity: number; revenue: number; image?: string } } = {}
    
    orders.forEach(order => {
      if (order.status === 'DELIVERED') {
        order.items?.forEach(item => {
          const productId = item.product?.id
          const productName = item.product?.name || 'Produit inconnu'
          const productImage = item.product?.image
          
          if (productId) {
            if (!productSales[productId]) {
              productSales[productId] = {
                name: productName,
                quantity: 0,
                revenue: 0,
                image: productImage || undefined
              }
            }
            productSales[productId].quantity += item.quantity
            productSales[productId].revenue += item.price * item.quantity
          }
        })
      }
    })

    const topProducts = Object.entries(productSales)
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10)

    // Statistiques par jour pour les graphiques (derniers 30 jours)
    const dailyStats: { [key: string]: { orders: number; revenue: number; date: string } } = {}
    
    // Initialiser les 30 derniers jours
    for (let i = 29; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateKey = date.toISOString().split('T')[0]
      dailyStats[dateKey] = {
        orders: 0,
        revenue: 0,
        date: dateKey
      }
    }

    // Remplir avec les données réelles
    orders.forEach(order => {
      const orderDate = new Date(order.createdAt).toISOString().split('T')[0]
      if (dailyStats[orderDate]) {
        dailyStats[orderDate].orders += 1
        if (order.status === 'DELIVERED') {
          dailyStats[orderDate].revenue += order.total
        }
      }
    })

    const chartData = Object.values(dailyStats)

    // Commandes récentes (10 dernières)
    const recentOrders = orders.slice(0, 10).map(order => ({
      id: order.id,
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      total: order.total,
      status: order.status,
      createdAt: order.createdAt,
      itemsCount: order.items?.reduce((sum, item) => sum + item.quantity, 0) || 0
    }))

    const stats = {
      overview: {
        totalOrders,
        completedOrders,
        pendingOrders,
        totalRevenue,
        totalPendingRevenue,
        averageOrderValue
      },
      topProducts,
      chartData,
      recentOrders
    }

    return NextResponse.json({
      success: true,
      data: stats
    })

  } catch (error) {
    console.error('Restaurant finances error:', error)
    return NextResponse.json({
      success: false,
      message: 'Erreur interne du serveur'
    }, { status: 500 })
  }
}