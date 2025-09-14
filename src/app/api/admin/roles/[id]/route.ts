import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()

    const updatedRole = await db.role.update({
      where: { id },
      data: body,
      include: {
        permissions: true,
        _count: {
          select: {
            users: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Rôle mis à jour avec succès',
      role: {
        ...updatedRole,
        createdAt: updatedRole.createdAt.toISOString(),
        updatedAt: updatedRole.updatedAt.toISOString()
      }
    })

  } catch (error) {
    console.error('Error updating role:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la mise à jour du rôle' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    // Vérifier si le rôle est utilisé
    const roleUsage = await db.role.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            users: true
          }
        }
      }
    })

    if (roleUsage && roleUsage._count.users > 0) {
      return NextResponse.json(
        { success: false, error: 'Ce rôle est encore utilisé par des utilisateurs' },
        { status: 400 }
      )
    }

    await db.role.delete({
      where: { id }
    })

    return NextResponse.json({
      success: true,
      message: 'Rôle supprimé avec succès'
    })

  } catch (error) {
    console.error('Error deleting role:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la suppression du rôle' },
      { status: 500 }
    )
  }
}