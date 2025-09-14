import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const restaurantId = params.id

    // Vérifier que le restaurant existe
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: restaurantId }
    })

    if (!restaurant) {
      return NextResponse.json({
        error: 'Restaurant non trouvé'
      }, { status: 404 })
    }

    // Récupérer les produits du restaurant avec leurs catégories
    const products = await prisma.product.findMany({
      where: { restaurantId },
      include: {
        category: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: [
        { featured: 'desc' },
        { createdAt: 'desc' }
      ]
    })

    return NextResponse.json({
      products: products.map(product => ({
        ...product,
        createdAt: product.createdAt.toISOString(),
        updatedAt: product.updatedAt.toISOString()
      }))
    })

  } catch (error) {
    console.error('Get restaurant products error:', error)
    return NextResponse.json({
      error: 'Erreur interne du serveur'
    }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const restaurantId = params.id
    const data = await request.json()

    const {
      name,
      description,
      price,
      image,
      categoryId,
      featured = false,
      isNew = true,
      isPopular = false,
      isVegetarian = false
    } = data

    if (!name || !price || !categoryId) {
      return NextResponse.json({
        error: 'Nom, prix et catégorie requis'
      }, { status: 400 })
    }

    // Vérifier que le restaurant existe
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: restaurantId }
    })

    if (!restaurant) {
      return NextResponse.json({
        error: 'Restaurant non trouvé'
      }, { status: 404 })
    }

    // Vérifier que la catégorie existe
    const category = await prisma.category.findUnique({
      where: { id: categoryId }
    })

    if (!category) {
      return NextResponse.json({
        error: 'Catégorie non trouvée'
      }, { status: 404 })
    }

    // Créer le produit
    const product = await prisma.product.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        image,
        restaurantId,
        categoryId,
        featured,
        isNew,
        isPopular,
        isVegetarian,
        active: true
      },
      include: {
        category: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      product: {
        ...product,
        createdAt: product.createdAt.toISOString(),
        updatedAt: product.updatedAt.toISOString()
      }
    }, { status: 201 })

  } catch (error) {
    console.error('Create product error:', error)
    return NextResponse.json({
      error: 'Erreur interne du serveur'
    }, { status: 500 })
  }
}