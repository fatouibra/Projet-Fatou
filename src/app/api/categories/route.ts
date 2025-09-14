import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const categories = await db.category.findMany({
      include: {
        products: {
          where: { active: true },
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
    console.error('Error fetching categories:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch categories' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, image, order, restaurantId } = body

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
        restaurantId: restaurantId || null // null for global categories
      }
    })

    return NextResponse.json({ success: true, data: category })
  } catch (error) {
    console.error('Error creating category:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create category' },
      { status: 500 }
    )
  }
}