import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const managers = await db.restaurantManager.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        isActive: true,
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
      managers: managers.map(manager => ({
        id: manager.id,
        name: manager.name,
        email: manager.email,
        phone: manager.phone,
        isActive: manager.isActive,
        restaurantName: manager.restaurant?.name || 'Aucun restaurant'
      }))
    })

  } catch (error) {
    console.error('Error fetching restaurant managers:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération des gestionnaires' },
      { status: 500 }
    )
  }
}