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

    const categories = await db.category.findMany({
      include: {
        restaurant: {
          select: {
            id: true,
            name: true
          }
        },
        _count: {
          select: {
            products: true
          }
        }
      },
      orderBy: [
        { restaurantId: 'asc' },
        { name: 'asc' }
      ]
    })

    console.log(`✅ Admin fetched ${categories.length} categories`)

    return NextResponse.json({
      success: true,
      data: categories
    })

  } catch (error: any) {
    console.error('❌ Error fetching categories:', error)
    
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

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromCookies(request)
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Non authentifié' },
        { status: 401 }
      )
    }
    
    requireRole(UserRole.ADMIN)(user)

    const { name, description, restaurantId } = await request.json()

    if (!name) {
      return NextResponse.json(
        { success: false, message: 'Le nom de la catégorie est requis' },
        { status: 400 }
      )
    }

    const existingCategory = await db.category.findFirst({
      where: { 
        name: {
          equals: name,
          mode: 'insensitive'
        },
        restaurantId: restaurantId || null
      }
    })

    if (existingCategory) {
      return NextResponse.json(
        { success: false, message: 'Une catégorie avec ce nom existe déjà pour ce restaurant' },
        { status: 400 }
      )
    }

    const newCategory = await db.category.create({
      data: {
        name,
        description: description || null,
        restaurantId: restaurantId || null,
        active: true
      },
      include: {
        restaurant: {
          select: {
            id: true,
            name: true
          }
        },
        _count: {
          select: {
            products: true
          }
        }
      }
    })

    console.log(`✅ Admin created category: ${newCategory.name}`)

    return NextResponse.json({
      success: true,
      data: newCategory,
      message: 'Catégorie créée avec succès'
    })

  } catch (error: any) {
    console.error('❌ Error creating category:', error)
    
    if (error.name === 'PermissionError') {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 403 }
      )
    }

    return NextResponse.json(
      { success: false, message: 'Erreur lors de la création de la catégorie' },
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

    const { categoryId, name, description, restaurantId, active } = await request.json()

    if (!categoryId) {
      return NextResponse.json(
        { success: false, message: 'ID de catégorie requis' },
        { status: 400 }
      )
    }

    const existingCategory = await db.category.findUnique({
      where: { id: categoryId }
    })

    if (!existingCategory) {
      return NextResponse.json(
        { success: false, message: 'Catégorie non trouvée' },
        { status: 404 }
      )
    }

    if (name && name !== existingCategory.name) {
      const nameExists = await db.category.findFirst({
        where: {
          name: {
            equals: name,
            mode: 'insensitive'
          },
          restaurantId: restaurantId !== undefined ? restaurantId : existingCategory.restaurantId,
          id: { not: categoryId }
        }
      })

      if (nameExists) {
        return NextResponse.json(
          { success: false, message: 'Ce nom de catégorie est déjà utilisé pour ce restaurant' },
          { status: 400 }
        )
      }
    }

    const updatedCategory = await db.category.update({
      where: { id: categoryId },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description: description || null }),
        ...(restaurantId !== undefined && { restaurantId: restaurantId || null }),
        ...(active !== undefined && { active })
      },
      include: {
        restaurant: {
          select: {
            id: true,
            name: true
          }
        },
        _count: {
          select: {
            products: true
          }
        }
      }
    })

    console.log(`✅ Admin updated category: ${updatedCategory.name}`)

    return NextResponse.json({
      success: true,
      data: updatedCategory,
      message: 'Catégorie mise à jour avec succès'
    })

  } catch (error: any) {
    console.error('❌ Error updating category:', error)
    
    if (error.name === 'PermissionError') {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 403 }
      )
    }

    return NextResponse.json(
      { success: false, message: 'Erreur lors de la mise à jour de la catégorie' },
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
    const categoryId = url.searchParams.get('categoryId')

    if (!categoryId) {
      return NextResponse.json(
        { success: false, message: 'ID de catégorie requis' },
        { status: 400 }
      )
    }

    const existingCategory = await db.category.findUnique({
      where: { id: categoryId },
      include: {
        _count: {
          select: {
            products: true
          }
        }
      }
    })

    if (!existingCategory) {
      return NextResponse.json(
        { success: false, message: 'Catégorie non trouvée' },
        { status: 404 }
      )
    }

    if (existingCategory._count.products > 0) {
      return NextResponse.json(
        { success: false, message: 'Impossible de supprimer une catégorie contenant des produits' },
        { status: 400 }
      )
    }

    await db.category.delete({
      where: { id: categoryId }
    })

    console.log(`✅ Admin deleted category: ${existingCategory.name}`)

    return NextResponse.json({
      success: true,
      message: 'Catégorie supprimée avec succès'
    })

  } catch (error: any) {
    console.error('❌ Error deleting category:', error)
    
    if (error.name === 'PermissionError') {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 403 }
      )
    }

    return NextResponse.json(
      { success: false, message: 'Erreur lors de la suppression de la catégorie' },
      { status: 500 }
    )
  }
}