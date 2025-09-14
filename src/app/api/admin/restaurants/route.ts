import { NextRequest, NextResponse } from 'next/server'
import { getUserFromCookies, requireRole } from '@/lib/auth'
import { UserRole } from '@/types/auth'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromCookies(request)
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Non authentifié' },
        { status: 401 }
      )
    }
    
    requireRole(UserRole.ADMIN)(user)

    const restaurants = await db.restaurant.findMany({
      include: {
        _count: {
          select: {
            products: true,
            orders: true,
            reviews: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    console.log(`✅ Admin fetched ${restaurants.length} restaurants`)

    return NextResponse.json({ 
      success: true, 
      data: restaurants 
    })
  } catch (error: any) {
    console.error('❌ Error fetching restaurants:', error)
    
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

export async function PUT(request: NextRequest) {
  try {
    const user = await getUserFromCookies(request)
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Non authentifié' },
        { status: 401 }
      )
    }
    
    requireRole(UserRole.ADMIN)(user)

    const { restaurantId, isActive } = await request.json()

    if (!restaurantId) {
      return NextResponse.json(
        { success: false, message: 'ID de restaurant requis' },
        { status: 400 }
      )
    }

    const existingRestaurant = await db.restaurant.findUnique({
      where: { id: restaurantId }
    })

    if (!existingRestaurant) {
      return NextResponse.json(
        { success: false, message: 'Restaurant non trouvé' },
        { status: 404 }
      )
    }

    const updatedRestaurant = await db.restaurant.update({
      where: { id: restaurantId },
      data: {
        ...(isActive !== undefined && { isActive })
      },
      include: {
        _count: {
          select: {
            products: true,
            orders: true,
            reviews: true
          }
        }
      }
    })

    console.log(`✅ Admin updated restaurant: ${updatedRestaurant.name}`)

    return NextResponse.json({
      success: true,
      data: updatedRestaurant,
      message: 'Restaurant mis à jour avec succès'
    })

  } catch (error: any) {
    console.error('❌ Error updating restaurant:', error)
    
    if (error.name === 'PermissionError') {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 403 }
      )
    }

    return NextResponse.json(
      { success: false, message: 'Erreur lors de la mise à jour du restaurant' },
      { status: 500 }
    )
  }
}