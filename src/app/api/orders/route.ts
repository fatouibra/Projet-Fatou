import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { generateOrderNumber } from '@/lib/utils'
import { orderSchema } from '@/lib/validations'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const orderNumber = searchParams.get('orderNumber')
    const phone = searchParams.get('phone')
    const status = searchParams.get('status')
    const customerType = searchParams.get('customerType')

    let where: any = {}

    if (orderNumber) {
      where.orderNumber = orderNumber
    }

    if (phone) {
      where.customerPhone = phone
    }

    if (status) {
      where.status = status
    }

    if (customerType === 'guest') {
      where.userId = null
    } else if (customerType === 'registered') {
      where.userId = { not: null }
    }

    const orders = await db.order.findMany({
      where,
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
        user: {
          select: {
            name: true,
            email: true
          }
        },
        restaurant: {
          select: {
            name: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ success: true, data: orders })
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch orders' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validation avec Zod (sans restaurantId car calculé depuis les items)
    const validation = orderSchema.omit({ restaurantId: true }).safeParse({
      customerName: body.customerName,
      customerPhone: body.customerPhone, 
      customerEmail: body.customerEmail,
      address: body.address,
      deliveryType: body.deliveryType,
      paymentMethod: body.paymentMethod || 'CASH_ON_DELIVERY',
      notes: body.notes
    })
    
    if (!validation.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Données invalides',
          details: validation.error.issues 
        },
        { status: 400 }
      )
    }

    const { items } = body

    if (!items || items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Aucun produit dans la commande' },
        { status: 400 }
      )
    }

    const { 
      customerName,
      customerPhone, 
      customerEmail,
      address,
      deliveryType,
      paymentMethod,
      notes
    } = validation.data

    // Calculate total
    let total = 0
    for (const item of items) {
      const product = await db.product.findUnique({
        where: { id: item.productId }
      })
      if (product) {
        total += product.price * item.quantity
      }
    }

    const orderNumber = generateOrderNumber()

    // Déterminer le restaurant depuis les items
    const firstProduct = await db.product.findUnique({
      where: { id: items[0].productId },
      select: { restaurantId: true }
    })
    
    if (!firstProduct) {
      return NextResponse.json(
        { success: false, error: 'Produit non trouvé' },
        { status: 400 }
      )
    }

    const order = await db.order.create({
      data: {
        orderNumber,
        restaurantId: firstProduct.restaurantId,
        userId: body.userId || null,
        customerName,
        customerPhone,
        customerEmail,
        address,
        deliveryType,
        paymentMethod,
        paymentStatus: 'PENDING',
        total,
        deliveryFee: deliveryType === 'DELIVERY' ? 2.5 : 0,
        notes,
        items: {
          create: items.map((item: any) => ({
            quantity: item.quantity,
            price: item.price,
            productId: item.productId
          }))
        }
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
    console.error('Error creating order:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create order' },
      { status: 500 }
    )
  }
}