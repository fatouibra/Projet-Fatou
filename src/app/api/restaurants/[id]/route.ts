import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const restaurant = await db.restaurant.findUnique({
      where: { id: params.id },
      include: {
        products: {
          where: { active: true },
          include: {
            category: true
          },
          orderBy: [
            { featured: 'desc' },
            { name: 'asc' }
          ]
        },
        _count: {
          select: {
            products: { where: { active: true } },
            orders: true
          }
        }
      }
    })

    if (!restaurant) {
      return NextResponse.json(
        { success: false, error: 'Restaurant not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data: restaurant })
  } catch (error) {
    console.error('Error fetching restaurant:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch restaurant' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const {
      name,
      description,
      address,
      phone,
      email,
      image,
      rating,
      isActive,
      cuisine,
      deliveryFee,
      minOrderAmount,
      openingHours
    } = body

    const restaurant = await db.restaurant.update({
      where: { id: params.id },
      data: {
        name,
        description,
        address,
        phone,
        email,
        image,
        rating,
        isActive,
        cuisine,
        deliveryFee,
        minOrderAmount,
        openingHours
      }
    })

    return NextResponse.json({ success: true, data: restaurant })
  } catch (error) {
    console.error('Error updating restaurant:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update restaurant' },
      { status: 500 }
    )
  }
}

// PATCH - Partial update (for admin status toggles, etc.)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    
    const restaurant = await db.restaurant.update({
      where: { id: params.id },
      data: body
    })

    return NextResponse.json({ 
      success: true, 
      data: restaurant,
      message: 'Restaurant updated successfully'
    })
  } catch (error) {
    console.error('Error updating restaurant:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update restaurant' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if restaurant exists
    const restaurant = await db.restaurant.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            orders: true,
            products: true
          }
        }
      }
    })

    if (!restaurant) {
      return NextResponse.json(
        { success: false, error: 'Restaurant not found' },
        { status: 404 }
      )
    }

    // If restaurant has orders, just deactivate it instead of deleting
    if (restaurant._count.orders > 0) {
      await db.restaurant.update({
        where: { id: params.id },
        data: { isActive: false }
      })
      
      return NextResponse.json({
        success: true,
        message: 'Restaurant deactivated (has existing orders)',
        action: 'deactivated'
      })
    }

    // Delete all products first (cascade delete)
    if (restaurant._count.products > 0) {
      await db.product.deleteMany({
        where: { restaurantId: params.id }
      })
    }

    // Now safe to delete restaurant
    await db.restaurant.delete({
      where: { id: params.id }
    })

    return NextResponse.json({
      success: true,
      message: 'Restaurant deleted successfully',
      action: 'deleted'
    })
  } catch (error) {
    console.error('Error deleting restaurant:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete restaurant' },
      { status: 500 }
    )
  }
}