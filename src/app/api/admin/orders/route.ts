import { NextRequest, NextResponse } from 'next/server'
import { getUserFromCookies, requireRole } from '@/lib/auth'
import { UserRole } from '@/types/auth'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    // Vérifier l'authentification admin depuis les cookies
    const user = await getUserFromCookies(request)
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Non authentifié' },
        { status: 401 }
      )
    }
    
    requireRole(UserRole.ADMIN)(user)

    // Récupérer toutes les commandes pour l'admin (vue globale)
    const orders = await db.order.findMany({
      include: {
        items: {
          include: {
            product: {
              select: {
                name: true,
                price: true
              }
            }
          }
        },
        restaurant: {
          select: {
            name: true,
            id: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    console.log(`✅ Admin fetched ${orders.length} orders globally`)

    return NextResponse.json({
      success: true,
      data: orders
    })

  } catch (error: any) {
    console.error('❌ Error fetching admin orders:', error)
    
    if (error.name === 'AuthError' || error.name === 'PermissionError') {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: error.statusCode || 401 }
      )
    }

    return NextResponse.json(
      { success: false, message: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Vérifier l'authentification admin depuis les cookies
    const user = await getUserFromCookies(request)
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Non authentifié' },
        { status: 401 }
      )
    }
    
    requireRole(UserRole.ADMIN)(user)

    const { orderId, status, notes } = await request.json()

    if (!orderId || !status) {
      return NextResponse.json(
        { success: false, message: 'ID de commande et statut requis' },
        { status: 400 }
      )
    }

    // Mettre à jour la commande
    const updatedOrder = await db.order.update({
      where: { id: orderId },
      data: {
        status,
        notes: notes || undefined,
        updatedAt: new Date()
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                name: true,
                price: true
              }
            }
          }
        },
        restaurant: {
          select: {
            name: true,
            id: true
          }
        }
      }
    })

    console.log(`✅ Admin updated order ${orderId} to status: ${status}`)

    return NextResponse.json({
      success: true,
      data: updatedOrder,
      message: 'Commande mise à jour avec succès'
    })

  } catch (error: any) {
    console.error('❌ Error updating admin order:', error)
    
    if (error.name === 'AuthError' || error.name === 'PermissionError') {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: error.statusCode || 401 }
      )
    }

    return NextResponse.json(
      { success: false, message: 'Erreur lors de la mise à jour' },
      { status: 500 }
    )
  }
}