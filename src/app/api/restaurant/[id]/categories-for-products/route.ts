import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const restaurantId = params.id

    // Pour les produits, récupérer les catégories du restaurant + les catégories globales
    const categories = await db.category.findMany({
      where: {
        AND: [
          { active: true }, // Seulement les catégories actives
          {
            OR: [
              { restaurantId: restaurantId }, // Catégories du restaurant
              { restaurantId: null }          // Catégories globales
            ]
          }
        ]
      },
      orderBy: { order: 'asc' }
    })

    return NextResponse.json({ success: true, data: categories })
  } catch (error) {
    console.error('Error fetching categories for products:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch categories for products' },
      { status: 500 }
    )
  }
}