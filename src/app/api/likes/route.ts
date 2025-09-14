import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      targetType, 
      targetId, 
      userPhone, 
      userEmail, 
      userFingerprint,
      action // "like" ou "unlike"
    } = body

    if (!targetType || !targetId || (!userPhone && !userEmail && !userFingerprint)) {
      return NextResponse.json(
        { success: false, error: 'Paramètres requis manquants' },
        { status: 400 }
      )
    }

    if (!['PRODUCT', 'RESTAURANT'].includes(targetType)) {
      return NextResponse.json(
        { success: false, error: 'Type de cible invalide' },
        { status: 400 }
      )
    }

    const whereUser = {
      ...(userPhone && { userPhone }),
      ...(userEmail && { userEmail }),
      ...(userFingerprint && { userFingerprint }),
      targetType,
      targetId
    }

    // Vérifier si le like existe déjà
    let existingLike = null
    try {
      existingLike = await db.like.findFirst({
        where: whereUser
      })
    } catch (error) {
      console.error('Like model not found, please run: npx prisma db push && npx prisma generate')
      return NextResponse.json(
        { success: false, error: 'Base de données non configurée. Veuillez contacter l\'administrateur.' },
        { status: 500 }
      )
    }

    if (action === 'like') {
      if (existingLike) {
        return NextResponse.json({
          success: true,
          message: 'Déjà liké',
          liked: true
        })
      }

      // Créer le like
      await db.like.create({
        data: {
          userPhone,
          userEmail,
          userFingerprint,
          targetType,
          targetId
        }
      })

      // Incrémenter le compteur
      if (targetType === 'PRODUCT') {
        await db.product.update({
          where: { id: targetId },
          data: { likesCount: { increment: 1 } }
        })
      } else if (targetType === 'RESTAURANT') {
        await db.restaurant.update({
          where: { id: targetId },
          data: { likesCount: { increment: 1 } }
        })
      }

      return NextResponse.json({
        success: true,
        message: 'Like ajouté',
        liked: true
      })

    } else if (action === 'unlike') {
      if (!existingLike) {
        return NextResponse.json({
          success: true,
          message: 'Pas encore liké',
          liked: false
        })
      }

      // Supprimer le like
      await db.like.delete({
        where: { id: existingLike.id }
      })

      // Décrémenter le compteur (avec minimum 0)
      if (targetType === 'PRODUCT') {
        await db.product.update({
          where: { id: targetId },
          data: { 
            likesCount: { 
              decrement: 1 
            } 
          }
        })

        // S'assurer que le compteur ne devient pas négatif
        await db.product.updateMany({
          where: { 
            id: targetId,
            likesCount: { lt: 0 }
          },
          data: { likesCount: 0 }
        })
      } else if (targetType === 'RESTAURANT') {
        await db.restaurant.update({
          where: { id: targetId },
          data: { 
            likesCount: { 
              decrement: 1 
            } 
          }
        })

        // S'assurer que le compteur ne devient pas négatif
        await db.restaurant.updateMany({
          where: { 
            id: targetId,
            likesCount: { lt: 0 }
          },
          data: { likesCount: 0 }
        })
      }

      return NextResponse.json({
        success: true,
        message: 'Like retiré',
        liked: false
      })
    } else {
      return NextResponse.json(
        { success: false, error: 'Action invalide' },
        { status: 400 }
      )
    }

  } catch (error) {
    console.error('Error handling like:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la gestion du like' },
      { status: 500 }
    )
  }
}

// GET pour vérifier si un utilisateur a liké un élément
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const targetType = searchParams.get('targetType')
    const targetId = searchParams.get('targetId')
    const userPhone = searchParams.get('userPhone')
    const userEmail = searchParams.get('userEmail')
    const userFingerprint = searchParams.get('userFingerprint')

    if (!targetType || !targetId || (!userPhone && !userEmail && !userFingerprint)) {
      return NextResponse.json(
        { success: false, error: 'Paramètres requis manquants' },
        { status: 400 }
      )
    }

    const whereUser = {
      ...(userPhone && { userPhone }),
      ...(userEmail && { userEmail }),
      ...(userFingerprint && { userFingerprint }),
      targetType,
      targetId
    }

    const like = await db.like.findFirst({
      where: whereUser
    })

    return NextResponse.json({
      success: true,
      liked: !!like
    })

  } catch (error) {
    console.error('Error checking like status:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la vérification du like' },
      { status: 500 }
    )
  }
}