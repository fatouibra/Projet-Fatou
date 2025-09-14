import { NextRequest, NextResponse } from 'next/server'
import { AuthError, PermissionError } from '@/lib/auth'
import { verifyTokenEdge, EdgeAuthError } from '@/lib/jwt-edge'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value
    
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Non authentifié' },
        { status: 401 }
      )
    }

    const user = await verifyTokenEdge(token)
    
    const dbUser = await db.user.findUnique({
      where: { id: user.id },
      include: {
        restaurant: {
          select: { id: true, name: true, image: true }
        }
      }
    })

    if (!dbUser || !dbUser.isActive) {
      return NextResponse.json(
        { success: false, message: 'Utilisateur non trouvé ou désactivé' },
        { status: 401 }
      )
    }

    return NextResponse.json({
      success: true,
      user: {
        id: dbUser.id,
        email: dbUser.email,
        name: dbUser.name,
        role: dbUser.role,
        restaurantId: dbUser.restaurantId,
        restaurant: dbUser.restaurant,
        permissions: user.permissions
      }
    })

  } catch (error) {
    console.error('Erreur de vérification utilisateur:', error)

    if (error instanceof AuthError || error instanceof PermissionError || error instanceof EdgeAuthError) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: error.statusCode }
      )
    }

    return NextResponse.json(
      { success: false, message: 'Erreur serveur' },
      { status: 500 }
    )
  }
}