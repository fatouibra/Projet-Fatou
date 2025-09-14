import { NextRequest, NextResponse } from 'next/server'
import { getUserFromCookies, requireRole } from '@/lib/auth'
import { UserRole } from '@/types/auth'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    // Vérifier l'authentification admin
    const user = await getUserFromCookies(request)
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Non authentifié' },
        { status: 401 }
      )
    }
    
    requireRole(UserRole.ADMIN)(user)

    // Calculer les statistiques en parallèle
    const [
      totalRestaurants,
      activeRestaurants,
      totalUsers,
      usersByRole,
      totalProducts,
      totalOrders,
      totalRevenue,
      ordersByStatus,
      recentOrders
    ] = await Promise.all([
      // Restaurants
      db.restaurant.count(),
      db.restaurant.count({ where: { isActive: true } }),
      
      // Utilisateurs
      db.user.count(),
      db.user.groupBy({
        by: ['role'],
        _count: true
      }),
      
      // Produits
      db.product.count(),
      
      // Commandes
      db.order.count(),
      db.order.aggregate({
        _sum: { total: true }
      }),
      db.order.groupBy({
        by: ['status'],
        _count: true
      }),
      
      // Commandes récentes (pour activité)
      db.order.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          restaurant: { select: { name: true } }
        }
      })
    ])

    // Organiser les données par rôle
    const roleStats = {
      ADMIN: 0,
      RESTAURATOR: 0,
      CUSTOMER: 0
    }
    
    usersByRole.forEach(role => {
      roleStats[role.role as keyof typeof roleStats] = role._count
    })

    // Organiser les données par statut de commande
    const statusStats = {
      pending: 0,
      received: 0,
      preparing: 0,
      ready: 0,
      delivering: 0,
      delivered: 0,
      cancelled: 0
    }
    
    ordersByStatus.forEach(status => {
      statusStats[status.status as keyof typeof statusStats] = status._count
    })

    // Calculer les métriques dérivées
    const pendingOrders = statusStats.received + statusStats.preparing + statusStats.ready + statusStats.delivering
    const completedOrders = statusStats.delivered
    const averageOrderValue = totalOrders > 0 ? (totalRevenue._sum.total || 0) / totalOrders : 0

    // Activité récente
    const recentActivity = recentOrders.map(order => ({
      id: order.id,
      type: 'order',
      description: `Nouvelle commande de ${order.customerName} chez ${order.restaurant.name}`,
      amount: order.total,
      time: order.createdAt
    }))

    const stats = {
      restaurants: {
        total: totalRestaurants,
        active: activeRestaurants,
        inactive: totalRestaurants - activeRestaurants
      },
      users: {
        total: totalUsers,
        admins: roleStats.ADMIN,
        restaurateurs: roleStats.RESTAURATOR,
        customers: roleStats.CUSTOMER
      },
      products: {
        total: totalProducts
      },
      orders: {
        total: totalOrders,
        pending: pendingOrders,
        completed: completedOrders,
        cancelled: statusStats.cancelled
      },
      revenue: {
        total: totalRevenue._sum.total || 0,
        averageOrderValue: Math.round(averageOrderValue * 100) / 100
      },
      activity: recentActivity
    }

    console.log(`✅ Admin dashboard stats calculated:`, {
      restaurants: stats.restaurants.total,
      users: stats.users.total,
      orders: stats.orders.total,
      revenue: stats.revenue.total
    })

    return NextResponse.json({
      success: true,
      data: stats
    })

  } catch (error: any) {
    console.error('❌ Error fetching dashboard stats:', error)
    
    if (error.name === 'PermissionError') {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 403 }
      )
    }

    return NextResponse.json(
      { success: false, message: 'Erreur serveur' },
      { status: 500 }
    )
  }
}