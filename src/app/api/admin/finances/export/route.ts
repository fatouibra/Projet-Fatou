import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const from = searchParams.get('from')
    const to = searchParams.get('to')
    const restaurant = searchParams.get('restaurant')
    const status = searchParams.get('status')
    const method = searchParams.get('method')

    // Construire les conditions de filtre
    const where: any = {}
    
    if (from || to) {
      where.createdAt = {}
      if (from) where.createdAt.gte = new Date(from)
      if (to) where.createdAt.lte = new Date(to)
    }
    
    if (restaurant) {
      where.restaurantId = restaurant
    }
    
    if (status) {
      where.paymentStatus = status
    }

    if (method) {
      where.paymentMethod = method
    }

    // Récupérer toutes les commandes avec filtres
    const orders = await db.order.findMany({
      where,
      include: {
        restaurant: {
          select: { name: true }
        },
        items: {
          include: {
            product: {
              select: { name: true, price: true }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Générer le CSV
    const csvHeaders = [
      'Date',
      'Numéro de commande',
      'Restaurant',
      'Client',
      'Email',
      'Téléphone',
      'Statut commande',
      'Statut paiement',
      'Méthode paiement',
      'Sous-total',
      'Frais livraison',
      'Total',
      'Produits'
    ].join(',')

    const csvRows = orders.map(order => {
      const products = order.items.map(item => 
        `${item.product.name} x${item.quantity} (${(item.price).toFixed(2)} XOF)`
      ).join(' | ')

      return [
        new Date(order.createdAt).toLocaleDateString('fr-FR'),
        order.orderNumber,
        `"${order.restaurant?.name || ''}"`,
        `"${order.customerName}"`,
        `"${order.customerEmail || ''}"`,
        `"${order.customerPhone}"`,
        order.status,
        order.paymentStatus,
        order.paymentMethod,
        (order.total - order.deliveryFee).toFixed(2),
        order.deliveryFee.toFixed(2),
        order.total.toFixed(2),
        `"${products}"`
      ].join(',')
    })

    const csv = [csvHeaders, ...csvRows].join('\n')

    // Retourner le fichier CSV
    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="finances-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    })

  } catch (error) {
    console.error('Error exporting finance data:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de l\'export des données' },
      { status: 500 }
    )
  }
}