import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'

const reviewSchema = z.object({
  rating: z.number().min(1).max(5),
  comment: z.string().optional(),
  customerName: z.string().min(1),
  customerEmail: z.string().email().optional(),
  restaurantId: z.string().optional(),
  productId: z.string().optional(),
}).refine((data) => data.restaurantId || data.productId, {
  message: "Either restaurantId or productId must be provided"
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const validation = reviewSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid data', details: validation.error.issues },
        { status: 400 }
      )
    }

    const { rating, comment, customerName, customerEmail, restaurantId, productId } = validation.data

    // Create review
    const review = await db.review.create({
      data: {
        rating,
        comment,
        customerName,
        customerEmail,
        restaurantId,
        productId,
      },
      include: {
        restaurant: true,
        product: true,
      }
    })

    // Update average rating for restaurant or product
    if (restaurantId) {
      const avgRating = await db.review.aggregate({
        where: { restaurantId },
        _avg: { rating: true },
      })

      await db.restaurant.update({
        where: { id: restaurantId },
        data: { rating: avgRating._avg.rating || 0 },
      })
    }

    if (productId) {
      const avgRating = await db.review.aggregate({
        where: { productId },
        _avg: { rating: true },
      })

      await db.product.update({
        where: { id: productId },
        data: { rating: avgRating._avg.rating || 0 },
      })
    }

    return NextResponse.json({
      success: true,
      data: review,
      message: 'Avis ajouté avec succès'
    })
  } catch (error) {
    console.error('Error creating review:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de l\'ajout de l\'avis' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const restaurantId = searchParams.get('restaurantId')
    const productId = searchParams.get('productId')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    const where: any = {}
    if (restaurantId) where.restaurantId = restaurantId
    if (productId) where.productId = productId

    const reviews = await db.review.findMany({
      where,
      include: {
        restaurant: true,
        product: true,
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    })

    const total = await db.review.count({ where })

    return NextResponse.json({
      success: true,
      data: {
        reviews,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        }
      }
    })
  } catch (error) {
    console.error('Error fetching reviews:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors du chargement des avis' },
      { status: 500 }
    )
  }
}