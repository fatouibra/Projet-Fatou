import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') || ''
    const cuisine = searchParams.get('cuisine')
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    const minRating = searchParams.get('minRating')
    const vegetarian = searchParams.get('vegetarian')

    if (!query.trim()) {
      return NextResponse.json({
        success: true,
        data: {
          restaurants: [],
          products: [],
          totalRestaurants: 0,
          totalProducts: 0
        }
      })
    }

    // Recherche dans les produits
    const productWhere: any = {
      active: true,
      name: { contains: query }
    }

    if (minPrice) productWhere.price = { gte: parseFloat(minPrice) }
    if (maxPrice) {
      productWhere.price = { 
        ...productWhere.price, 
        lte: parseFloat(maxPrice) 
      }
    }
    if (vegetarian === 'true') productWhere.isVegetarian = true

    const products = await db.product.findMany({
      where: productWhere,
      include: {
        restaurant: {
          select: {
            id: true,
            name: true,
            cuisine: true,
            rating: true,
            deliveryFee: true,
            image: true,
            isActive: true
          }
        },
        category: true
      },
      take: 50
    })

    // Filtrer les produits dont le restaurant correspond aux critères
    const filteredProducts = products.filter(product => {
      if (!product.restaurant.isActive) return false
      if (cuisine && !product.restaurant.cuisine.toLowerCase().includes(cuisine.toLowerCase())) return false
      if (minRating && product.restaurant.rating < parseFloat(minRating)) return false
      return true
    })

    // Extraire les restaurants uniques des produits trouvés
    const restaurantIds = Array.from(new Set(filteredProducts.map(p => p.restaurant.id)))
    
    const restaurants = await db.restaurant.findMany({
      where: {
        id: { in: restaurantIds },
        isActive: true
      },
      include: {
        products: {
          where: { active: true },
          take: 6,
          include: { category: true }
        },
        _count: {
          select: {
            products: { where: { active: true } }
          }
        }
      }
    })

    // Recherche aussi dans les noms de restaurants
    const restaurantsByName = await db.restaurant.findMany({
      where: {
        isActive: true,
        name: { contains: query }
      },
      include: {
        products: {
          where: { active: true },
          take: 6,
          include: { category: true }
        },
        _count: {
          select: {
            products: { where: { active: true } }
          }
        }
      }
    })

    // Combiner et dédupliquer les restaurants
    const allRestaurants = [...restaurants, ...restaurantsByName]
    const uniqueRestaurants = allRestaurants.filter((restaurant, index, self) =>
      index === self.findIndex(r => r.id === restaurant.id)
    )

    // Appliquer les filtres aux restaurants
    const filteredRestaurants = uniqueRestaurants.filter(restaurant => {
      if (cuisine && !restaurant.cuisine.toLowerCase().includes(cuisine.toLowerCase())) return false
      if (minRating && restaurant.rating < parseFloat(minRating)) return false
      return true
    })

    return NextResponse.json({
      success: true,
      data: {
        restaurants: filteredRestaurants,
        products: filteredProducts,
        totalRestaurants: filteredRestaurants.length,
        totalProducts: filteredProducts.length
      }
    })
  } catch (error) {
    console.error('Error searching:', error)
    return NextResponse.json(
      { success: false, error: 'Search failed' },
      { status: 500 }
    )
  }
}