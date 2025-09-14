import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const restaurantId = params.id

    // Récupérer uniquement les catégories créées par ce restaurant
    const categories = await db.category.findMany({
      where: {
        restaurantId: restaurantId // Seulement les catégories du restaurant
      },
      include: {
        products: {
          where: { 
            active: true,
            restaurantId: restaurantId
          },
          select: {
            id: true,
            name: true,
            price: true,
            image: true,
            featured: true,
            isNew: true,
            isPopular: true,
            isVegetarian: true,
          }
        }
      },
      orderBy: { order: 'asc' }
    })

    return NextResponse.json({ success: true, data: categories })
  } catch (error) {
    console.error('Error fetching restaurant categories:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch restaurant categories' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const restaurantId = params.id
    const body = await request.json()
    const { name, description, image, order } = body

    if (!name) {
      return NextResponse.json(
        { success: false, error: 'Name is required' },
        { status: 400 }
      )
    }

    const category = await db.category.create({
      data: {
        name,
        description,
        image,
        order: order || 0,
        restaurantId: restaurantId
      },
      include: {
        products: {
          where: { 
            active: true,
            restaurantId: restaurantId
          }
        }
      }
    })

    return NextResponse.json({ success: true, data: category })
  } catch (error) {
    console.error('Error creating restaurant category:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create category' },
      { status: 500 }
    )
  }
}