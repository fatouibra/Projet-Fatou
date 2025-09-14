import { NextRequest, NextResponse } from 'next/server'
import { getUserFromCookies, requireRole } from '@/lib/auth'
import { UserRole } from '@/types/auth'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromCookies(request)
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Non authentifié' },
        { status: 401 }
      )
    }
    
    requireRole(UserRole.ADMIN)(user)

    const reviews = await db.review.findMany({
      include: {
        restaurant: {
          select: {
            id: true,
            name: true
          }
        },
        product: {
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

    console.log(`✅ Admin fetched ${reviews.length} reviews`)

    return NextResponse.json({
      success: true,
      data: reviews
    })

  } catch (error: any) {
    console.error('❌ Error fetching reviews:', error)
    
    if (error.name === 'PermissionError') {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 403 }
      )
    }

    return NextResponse.json(
      { success: false, message: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getUserFromCookies(request)
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Non authentifié' },
        { status: 401 }
      )
    }
    
    requireRole(UserRole.ADMIN)(user)

    const { reviewId, comment } = await request.json()

    if (!reviewId) {
      return NextResponse.json(
        { success: false, message: 'ID d\'avis requis' },
        { status: 400 }
      )
    }

    const existingReview = await db.review.findUnique({
      where: { id: reviewId }
    })

    if (!existingReview) {
      return NextResponse.json(
        { success: false, message: 'Avis non trouvé' },
        { status: 404 }
      )
    }

    const updatedReview = await db.review.update({
      where: { id: reviewId },
      data: {
        ...(comment !== undefined && { comment })
      },
      include: {
        restaurant: {
          select: {
            id: true,
            name: true
          }
        },
        product: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    console.log(`✅ Admin updated review: ${updatedReview.id}`)

    return NextResponse.json({
      success: true,
      data: updatedReview,
      message: 'Avis mis à jour avec succès'
    })

  } catch (error: any) {
    console.error('❌ Error updating review:', error)
    
    if (error.name === 'PermissionError') {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 403 }
      )
    }

    return NextResponse.json(
      { success: false, message: 'Erreur lors de la mise à jour de l\'avis' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getUserFromCookies(request)
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Non authentifié' },
        { status: 401 }
      )
    }
    
    requireRole(UserRole.ADMIN)(user)

    const url = new URL(request.url)
    const reviewId = url.searchParams.get('reviewId')

    if (!reviewId) {
      return NextResponse.json(
        { success: false, message: 'ID d\'avis requis' },
        { status: 400 }
      )
    }

    const existingReview = await db.review.findUnique({
      where: { id: reviewId }
    })

    if (!existingReview) {
      return NextResponse.json(
        { success: false, message: 'Avis non trouvé' },
        { status: 404 }
      )
    }

    await db.review.delete({
      where: { id: reviewId }
    })

    console.log(`✅ Admin deleted review: ${reviewId}`)

    return NextResponse.json({
      success: true,
      message: 'Avis supprimé avec succès'
    })

  } catch (error: any) {
    console.error('❌ Error deleting review:', error)
    
    if (error.name === 'PermissionError') {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 403 }
      )
    }

    return NextResponse.json(
      { success: false, message: 'Erreur lors de la suppression de l\'avis' },
      { status: 500 }
    )
  }
}