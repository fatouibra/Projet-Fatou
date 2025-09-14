import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const restaurantId = params.id

    const restaurant = await prisma.restaurant.findUnique({
      where: { id: restaurantId },
      select: {
        id: true,
        name: true,
        description: true,
        address: true,
        phone: true,
        email: true,
        image: true,
        rating: true,
        likesCount: true,
        cuisine: true,
        deliveryFee: true,
        minOrderAmount: true,
        openingHours: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      }
    })

    if (!restaurant) {
      return NextResponse.json({
        success: false,
        message: 'Restaurant non trouvé'
      }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: restaurant
    })

  } catch (error) {
    console.error('Restaurant profile fetch error:', error)
    return NextResponse.json({
      success: false,
      message: 'Erreur interne du serveur'
    }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const restaurantId = params.id
    const body = await request.json()

    const {
      name,
      description,
      address,
      phone,
      email,
      image,
      cuisine,
      deliveryFee,
      minOrderAmount,
      openingHours
    } = body

    const updatedRestaurant = await prisma.restaurant.update({
      where: { id: restaurantId },
      data: {
        name,
        description,
        address,
        phone,
        email,
        image,
        cuisine,
        deliveryFee,
        minOrderAmount,
        openingHours,
        updatedAt: new Date()
      },
      select: {
        id: true,
        name: true,
        description: true,
        address: true,
        phone: true,
        email: true,
        image: true,
        rating: true,
        likesCount: true,
        cuisine: true,
        deliveryFee: true,
        minOrderAmount: true,
        openingHours: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Profil restaurant mis à jour avec succès',
      data: updatedRestaurant
    })

  } catch (error) {
    console.error('Restaurant profile update error:', error)
    return NextResponse.json({
      success: false,
      message: 'Erreur lors de la mise à jour du profil'
    }, { status: 500 })
  }
}