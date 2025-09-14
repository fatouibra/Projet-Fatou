import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const from = searchParams.get('from')
    const to = searchParams.get('to')
    const restaurant = searchParams.get('restaurant')
    const status = searchParams.get('status')
    const method = searchParams.get('method')

    // Construire les conditions de filtre
    const where: any = {}
    
    if (from || to) {
      where.createdAt = {}
      if (from) where.createdAt.gte = new Date(from)
      if (to) where.createdAt.lte = new Date(to)
    }
    
    if (restaurant) {
      where.restaurantId = restaurant
    }
    
    if (status) {
      where.paymentStatus = status
    }

    if (method) {
      where.paymentMethod = method
    }

    // Récupérer toutes les commandes avec filtres
    const orders = await db.order.findMany({
      where,
      include: {
        restaurant: {
          select: { name: true }
        },
        items: {
          include: {
            product: {
              select: { name: true }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Calculer les statistiques générales
    const totalRevenue = orders
      .filter(order => order.paymentStatus === 'PAID')
      .reduce((sum, order) => sum + order.total, 0)

    const totalOrders = orders.length

    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

    const deliveryFees = orders
      .filter(order => order.paymentStatus === 'PAID')
      .reduce((sum, order) => sum + order.deliveryFee, 0)

    // Revenus par période (derniers 7 jours)
    const now = new Date()
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(now)
      date.setDate(date.getDate() - i)
      return date.toISOString().split('T')[0]
    }).reverse()

    const revenueByDay = await Promise.all(
      last7Days.map(async (date) => {
        const dayStart = new Date(date)
        const dayEnd = new Date(date)
        dayEnd.setDate(dayEnd.getDate() + 1)

        const dayOrders = await db.order.findMany({
          where: {
            createdAt: {
              gte: dayStart,
              lt: dayEnd
            },
            paymentStatus: 'PAID',
            ...(restaurant && { restaurantId: restaurant })
          }
        })

        return {
          date,
          revenue: dayOrders.reduce((sum, order) => sum + order.total, 0),
          orders: dayOrders.length
        }
      })
    )

    // Calcul de croissance (simulé pour l'exemple)
    const currentMonthRevenue = totalRevenue
    const lastMonthRevenue = currentMonthRevenue * 0.85 // Simulation
    const revenueGrowth = lastMonthRevenue > 0 
      ? ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 
      : 0

    const currentMonthOrders = totalOrders
    const lastMonthOrders = Math.floor(currentMonthOrders * 0.9) // Simulation
    const ordersGrowth = lastMonthOrders > 0 
      ? ((currentMonthOrders - lastMonthOrders) / lastMonthOrders) * 100 
      : 0

    // Méthodes de paiement
    const paymentMethods = [
      {
        method: 'Paiement à la livraison',
        amount: orders
          .filter(order => order.paymentMethod === 'CASH_ON_DELIVERY' && order.paymentStatus === 'PAID')
          .reduce((sum, order) => sum + order.total, 0),
        count: orders.filter(order => order.paymentMethod === 'CASH_ON_DELIVERY').length,
        percentage: 0
      },
      {
        method: 'Paiement en ligne',
        amount: orders
          .filter(order => order.paymentMethod === 'ONLINE' && order.paymentStatus === 'PAID')
          .reduce((sum, order) => sum + order.total, 0),
        count: orders.filter(order => order.paymentMethod === 'ONLINE').length,
        percentage: 0
      }
    ]

    // Calculer les pourcentages
    const totalPaymentAmount = paymentMethods.reduce((sum, method) => sum + method.amount, 0)
    paymentMethods.forEach(method => {
      method.percentage = totalPaymentAmount > 0 
        ? Math.round((method.amount / totalPaymentAmount) * 100) 
        : 0
    })

    // Paiements en attente et complétés
    const pendingPayments = orders
      .filter(order => order.paymentStatus === 'PENDING')
      .reduce((sum, order) => sum + order.total, 0)

    const completedPayments = orders
      .filter(order => order.paymentStatus === 'PAID')
      .reduce((sum, order) => sum + order.total, 0)

    // Revenus par période
    const today = new Date()
    const todayStart = new Date(today.setHours(0, 0, 0, 0))
    const todayEnd = new Date(today.setHours(23, 59, 59, 999))

    const todayRevenue = orders
      .filter(order => 
        order.paymentStatus === 'PAID' &&
        order.createdAt >= todayStart && 
        order.createdAt <= todayEnd
      )
      .reduce((sum, order) => sum + order.total, 0)

    // Semaine courante
    const weekStart = new Date()
    weekStart.setDate(weekStart.getDate() - weekStart.getDay())
    const weekRevenue = orders
      .filter(order => 
        order.paymentStatus === 'PAID' &&
        order.createdAt >= weekStart
      )
      .reduce((sum, order) => sum + order.total, 0)

    // Mois courant
    const monthStart = new Date()
    monthStart.setDate(1)
    const monthRevenue = orders
      .filter(order => 
        order.paymentStatus === 'PAID' &&
        order.createdAt >= monthStart
      )
      .reduce((sum, order) => sum + order.total, 0)

    const stats = {
      totalRevenue,
      totalOrders,
      averageOrderValue,
      deliveryFees,
      todayRevenue,
      weekRevenue,
      monthRevenue,
      pendingPayments,
      completedPayments,
      revenueGrowth: Math.round(revenueGrowth * 100) / 100,
      ordersGrowth: Math.round(ordersGrowth * 100) / 100
    }

    return NextResponse.json({
      success: true,
      data: {
        stats,
        revenueByDay,
        paymentMethods: paymentMethods.filter(method => method.count > 0),
        orders: orders.slice(0, 50) // Limiter pour les performances
      }
    })

  } catch (error) {
    console.error('Error fetching finance data:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors du chargement des données financières' },
      { status: 500 }
    )
  }
}