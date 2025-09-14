import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    // Pour une marketplace, les settings globaux incluent les stats générales
    const [restaurantCount, productCount, orderCount] = await Promise.all([
      db.restaurant.count({ where: { isActive: true } }),
      db.product.count({ where: { active: true } }),
      db.order.count()
    ])

    const settings = {
      marketplaceName: 'MnuFood Dakar',
      description: 'Marketplace de livraison de restaurants à Dakar',
      address: 'Dakar, Sénégal',
      phone: '+221 77 000 00 00',
      email: 'contact@mnufood.com',
      supportEmail: 'support@mnufood.com',
      currency: 'F CFA',
      defaultDeliveryFee: 1500,
      minOrderAmount: 3000,
      operatingHours: '08h00 - 02h00',
      stats: {
        totalRestaurants: restaurantCount,
        totalProducts: productCount,
        totalOrders: orderCount
      }
    }

    return NextResponse.json({ success: true, data: settings })
  } catch (error) {
    console.error('Error fetching settings:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch settings' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Pour une marketplace, on peut stocker les settings dans un fichier JSON 
    // ou créer un modèle MarketplaceSettings si nécessaire
    // Pour l'instant, on retourne les settings par défaut mis à jour
    const settings = {
      marketplaceName: body.marketplaceName || 'MnuFood Dakar',
      description: body.description || 'Marketplace de livraison de restaurants à Dakar',
      address: body.address || 'Dakar, Sénégal',
      phone: body.phone || '+221 77 000 00 00',
      email: body.email || 'contact@mnufood.com',
      supportEmail: body.supportEmail || 'support@mnufood.com',
      currency: body.currency || 'F CFA',
      defaultDeliveryFee: body.defaultDeliveryFee || 1500,
      minOrderAmount: body.minOrderAmount || 3000,
      operatingHours: body.operatingHours || '08h00 - 02h00',
      updatedAt: new Date().toISOString()
    }

    return NextResponse.json({ 
      success: true, 
      data: settings,
      message: 'Settings updated successfully'
    })
  } catch (error) {
    console.error('Error updating settings:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update settings' },
      { status: 500 }
    )
  }
}