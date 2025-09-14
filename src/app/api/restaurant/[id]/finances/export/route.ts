import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const restaurantId = params.id
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || 'month'

    // Vérifier que le restaurant existe
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: restaurantId }
    })

    if (!restaurant) {
      return NextResponse.json({
        error: 'Restaurant non trouvé'
      }, { status: 404 })
    }

    // Calculer les dates selon la période
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    let startDate: Date
    let endDate = now

    switch (period) {
      case 'week':
        startDate = new Date(today)
        startDate.setDate(today.getDate() - 7)
        break
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1)
        break
      default: // month
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
    }

    // Récupérer les commandes de la période
    const orders = await prisma.order.findMany({
      where: { 
        restaurantId,
        status: { not: 'CANCELLED' },
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                name: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    // Créer le contenu CSV
    let csvContent = 'Date,Numéro de commande,Client,Téléphone,Email,Adresse,Type de livraison,Mode de paiement,Statut,Total,Frais de livraison,Articles,Notes\n'

    orders.forEach(order => {
      const items = order.items.map(item => 
        `${item.quantity}x ${item.product.name} (${item.price.toFixed(2)} XOF)`
      ).join('; ')

      const row = [
        new Date(order.createdAt).toLocaleDateString('fr-FR'),
        order.orderNumber,
        `"${order.customerName}"`,
        order.customerPhone,
        order.customerEmail || '',
        `"${order.address}"`,
        order.deliveryType === 'DELIVERY' ? 'Livraison' : 'À emporter',
        order.paymentMethod === 'CASH_ON_DELIVERY' ? 'Espèces' : 'En ligne',
        getStatusLabel(order.status),
        order.total.toFixed(2),
        order.deliveryFee.toFixed(2),
        `"${items}"`,
        `"${order.notes || ''}"`
      ].join(',')

      csvContent += row + '\n'
    })

    // Ajouter les statistiques à la fin
    csvContent += '\n--- STATISTIQUES ---\n'
    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0)
    const totalOrders = orders.length
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

    csvContent += `Total des commandes,${totalOrders}\n`
    csvContent += `Chiffre d'affaires,${totalRevenue.toFixed(2)} XOF\n`
    csvContent += `Panier moyen,${averageOrderValue.toFixed(2)} XOF\n`

    // Statistiques par mode de paiement
    const paymentStats = orders.reduce((acc, order) => {
      if (order.paymentMethod === 'CASH_ON_DELIVERY') {
        acc.cash += order.total
      } else {
        acc.online += order.total
      }
      return acc
    }, { cash: 0, online: 0 })

    csvContent += `Revenus espèces,${paymentStats.cash.toFixed(2)} XOF\n`
    csvContent += `Revenus en ligne,${paymentStats.online.toFixed(2)} XOF\n`

    // Retourner le fichier CSV
    const response = new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="finances-${restaurant.name}-${period}.csv"`
      }
    })

    return response

  } catch (error) {
    console.error('Export restaurant finances error:', error)
    return NextResponse.json({
      error: 'Erreur interne du serveur'
    }, { status: 500 })
  }
}

function getStatusLabel(status: string): string {
  const statusLabels: { [key: string]: string } = {
    'RECEIVED': 'Reçue',
    'PREPARING': 'En préparation',
    'READY': 'Prête',
    'DELIVERED': 'Livrée',
    'CANCELLED': 'Annulée'
  }
  return statusLabels[status] || status
}