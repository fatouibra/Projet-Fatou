import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const roles = await db.role.findMany({
      include: {
        permissions: true,
        _count: {
          select: {
            users: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    const rolesWithFormattedData = roles.map(role => ({
      ...role,
      createdAt: role.createdAt.toISOString(),
      updatedAt: role.updatedAt.toISOString()
    }))

    return NextResponse.json({
      success: true,
      roles: rolesWithFormattedData
    })

  } catch (error) {
    console.error('Error fetching roles:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération des rôles' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, permissions } = body

    const role = await db.role.create({
      data: {
        name,
        description,
        isActive: true,
        permissions: {
          connect: permissions.map((id: string) => ({ id }))
        }
      },
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
      message: 'Rôle créé avec succès',
      role: {
        ...role,
        createdAt: role.createdAt.toISOString(),
        updatedAt: role.updatedAt.toISOString()
      }
    })

  } catch (error) {
    console.error('Error creating role:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la création du rôle' },
      { status: 500 }
    )
  }
}