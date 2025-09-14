import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const order = await db.order.findUnique({
      where: { id: params.id },
      include: {
        items: {
          include: {
            product: {
              select: {
                name: true,
                image: true
              }
            }
          }
        },
        restaurant: {
          select: {
            id: true,
            name: true,
            phone: true,
            cuisine: true
          }
        }
      }
    })

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      )
    }

    // Format the response for the frontend
    const formattedOrder = {
      ...order,
      items: order.items.map(item => ({
        id: item.id,
        productName: item.product?.name || 'Produit supprimé',
        quantity: item.quantity,
        price: item.price
      }))
    }

    return NextResponse.json({ success: true, data: formattedOrder })
  } catch (error) {
    console.error('Error fetching order:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch order' },
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
    const { status, estimatedTime, notes } = body

    const order = await db.order.update({
      where: { id: params.id },
      data: {
        status,
        estimatedTime,
        notes,
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                name: true,
                image: true
              }
            }
          }
        }
      }
    })

    return NextResponse.json({ success: true, data: order })
  } catch (error) {
    console.error('Error updating order:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update order' },
      { status: 500 }
    )
  }
}