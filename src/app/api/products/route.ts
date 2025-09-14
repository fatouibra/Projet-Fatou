import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const categoryId = searchParams.get('categoryId')
    const featured = searchParams.get('featured') === 'true'
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined

    const where: any = { active: true }
    
    if (categoryId) {
      where.categoryId = categoryId
    }
    
    if (featured) {
      where.featured = true
    }

    const products = await db.product.findMany({
      where,
      include: {
        category: {
          select: { name: true }
        },
        restaurant: {
          select: { name: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      ...(limit && { take: limit })
    })

    return NextResponse.json({ success: true, data: products })
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch products' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      name,
      description,
      price,
      image,
      categoryId,
      restaurantId,
      featured,
      isNew,
      isPopular,
      isVegetarian
    } = body

    if (!name || !price || !categoryId || !restaurantId) {
      return NextResponse.json(
        { success: false, error: 'Name, price, category and restaurant are required' },
        { status: 400 }
      )
    }

    const product = await db.product.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        image,
        categoryId,
        restaurantId,
        featured: featured || false,
        isNew: isNew || false,
        isPopular: isPopular || false,
        isVegetarian: isVegetarian || false,
      },
      include: {
        category: {
          select: { name: true }
        }
      }
    })

    return NextResponse.json({ success: true, data: product })
  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create product' },
      { status: 500 }
    )
  }
}