import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    // L'admin voit TOUS les produits de TOUS les restaurants
    const products = await db.product.findMany({
      include: {
        category: {
          select: {
            id: true,
            name: true
          }
        },
        restaurant: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({ 
      success: true, 
      data: products 
    })
  } catch (error) {
    console.error('Error fetching admin products:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch products for admin' },
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
      categoryId,
      restaurantId,
      image,
      featured = false,
      isNew = false,
      isPopular = false,
      isVegetarian = false
    } = body

    // Validation
    if (!name || !price || !categoryId || !restaurantId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Vérifier que la catégorie et le restaurant existent
    const [category, restaurant] = await Promise.all([
      db.category.findUnique({ where: { id: categoryId } }),
      db.restaurant.findUnique({ where: { id: restaurantId } })
    ])

    if (!category) {
      return NextResponse.json(
        { success: false, error: 'Category not found' },
        { status: 404 }
      )
    }

    if (!restaurant) {
      return NextResponse.json(
        { success: false, error: 'Restaurant not found' },
        { status: 404 }
      )
    }

    const product = await db.product.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        categoryId,
        restaurantId,
        image: image || null,
        featured,
        isNew,
        isPopular,
        isVegetarian,
        active: true,
        rating: 0,
        likesCount: 0
      },
      include: {
        category: {
          select: {
            id: true,
            name: true
          }
        },
        restaurant: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: product,
      message: 'Product created successfully'
    })

  } catch (error) {
    console.error('Error creating admin product:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create product' },
      { status: 500 }
    )
  }
}