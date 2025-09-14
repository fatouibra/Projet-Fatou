import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  console.log('🚀 Restaurant login API called')
  
  try {
    const body = await request.json()
    const { email, password } = body
    console.log('📧 Login attempt for:', email)

    if (!email || !password) {
      console.log('❌ Missing credentials')
      return NextResponse.json({
        success: false,
        error: 'Email et mot de passe requis'
      }, { status: 400 })
    }

    console.log('🔍 Searching for manager in database...')

    // Chercher le manager avec des requêtes brutes
    let managerRaw
    try {
      managerRaw = await prisma.$queryRaw`
        SELECT 
          m.*,
          r.id as restaurant_id,
          r.name as restaurant_name,
          r.description as restaurant_description,
          r.address as restaurant_address,
          r.phone as restaurant_phone,
          r.email as restaurant_email,
          r.image as restaurant_image,
          r.rating as restaurant_rating,
          r.likesCount as restaurant_likesCount,
          r.isActive as restaurant_isActive,
          r.cuisine as restaurant_cuisine,
          r.deliveryFee as restaurant_deliveryFee,
          r.minOrderAmount as restaurant_minOrderAmount,
          r.openingHours as restaurant_openingHours
        FROM "RestaurantManager" m
        JOIN "Restaurant" r ON m."restaurantId" = r.id
        WHERE m.email = ${email} AND m."isActive" = true
        LIMIT 1
      `
      console.log('📊 Query result:', Array.isArray(managerRaw) ? managerRaw.length : 0, 'records found')
    } catch (queryError) {
      console.error('❌ Database query error:', queryError)
      return NextResponse.json({
        success: false,
        error: 'Erreur de base de données'
      }, { status: 500 })
    }

    if (!managerRaw || !Array.isArray(managerRaw) || managerRaw.length === 0) {
      console.log('❌ No manager found with this email')
      return NextResponse.json({
        success: false,
        error: 'Identifiants invalides'
      }, { status: 401 })
    }

    const manager = managerRaw[0]
    console.log('✅ Manager found:', manager.id)

    // Pour le développement, on compare directement les mots de passe
    const isValidPassword = password === manager.password

    if (!isValidPassword) {
      console.log('❌ Invalid password')
      return NextResponse.json({
        success: false,
        error: 'Identifiants invalides'
      }, { status: 401 })
    }

    console.log('✅ Password valid, preparing response...')

    // Construire l'objet manager avec restaurant
    const managerData = {
      id: manager.id,
      email: manager.email,
      name: manager.name,
      phone: manager.phone,
      restaurantId: manager.restaurantId,
      isActive: Boolean(manager.isActive),
      mustChangePassword: Boolean(manager.mustChangePassword),
      permissions: manager.permissions,
      createdAt: new Date(manager.createdAt).toISOString(),
      updatedAt: new Date(manager.updatedAt).toISOString(),
      restaurant: {
        id: manager.restaurant_id,
        name: manager.restaurant_name,
        description: manager.restaurant_description,
        address: manager.restaurant_address,
        phone: manager.restaurant_phone,
        email: manager.restaurant_email,
        image: manager.restaurant_image,
        rating: manager.restaurant_rating,
        likesCount: manager.restaurant_likesCount,
        isActive: Boolean(manager.restaurant_isActive),
        cuisine: manager.restaurant_cuisine,
        deliveryFee: manager.restaurant_deliveryFee,
        minOrderAmount: manager.restaurant_minOrderAmount,
        openingHours: manager.restaurant_openingHours
      }
    }

    console.log('✅ Login successful for:', manager.email)

    // Si l'utilisateur doit changer son mot de passe, retourner un statut spécial
    if (manager.mustChangePassword) {
      return NextResponse.json({
        success: true,
        requiresPasswordChange: true,
        manager: managerData,
        message: 'Mot de passe temporaire détecté. Changement obligatoire.'
      })
    }

    return NextResponse.json({
      success: true,
      manager: managerData
    })

  } catch (error) {
    console.error('❌ Restaurant login error:', error)
    return NextResponse.json({
      success: false,
      error: 'Erreur interne du serveur'
    }, { status: 500 })
  }
}