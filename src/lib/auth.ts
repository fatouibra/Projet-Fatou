import { NextRequest } from 'next/server'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { db } from './db'
import { UserRole, AuthUser, hasPermission, canAccessRestaurant } from '@/types/auth'

const SALT_ROUNDS = 12
const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret'

export class AuthError extends Error {
  constructor(message: string, public statusCode: number = 401) {
    super(message)
    this.name = 'AuthError'
  }
}

export class PermissionError extends Error {
  constructor(message: string, public statusCode: number = 403) {
    super(message)
    this.name = 'PermissionError'
  }
}

export class AuthUtils {
  static async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, SALT_ROUNDS)
  }

  static async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword)
  }

  static generateSecureToken(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36)
  }
}

// Génération du token JWT
export function generateToken(user: AuthUser): string {
  const payload = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    restaurantId: user.restaurantId,
    permissions: user.permissions
  }
  
  console.log('🔑 generateToken - payload:', payload)
  console.log('🔑 generateToken - JWT_SECRET exists:', !!JWT_SECRET)
  
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
  console.log('🔑 generateToken - token created, length:', token.length)
  console.log('🔑 generateToken - token preview:', token.substring(0, 20) + '...')
  
  return token
}

// Vérification du token JWT
export function verifyToken(token: string): AuthUser {
  try {
    console.log('🔍 verifyToken - JWT_SECRET exists:', !!JWT_SECRET)
    console.log('🔍 verifyToken - token length:', token?.length)
    console.log('🔍 verifyToken - token preview:', token?.substring(0, 20) + '...')
    
    const decoded = jwt.verify(token, JWT_SECRET) as any
    console.log('✅ verifyToken - decoded payload:', decoded)
    
    return {
      id: decoded.id,
      email: decoded.email,
      name: decoded.name || '',
      role: decoded.role,
      restaurantId: decoded.restaurantId,
      permissions: decoded.permissions
    }
  } catch (error) {
    console.log('❌ verifyToken - error details:', error)
    throw new AuthError('Token invalide')
  }
}

// Authentification par email/password
export async function authenticateUser(email: string, password: string): Promise<AuthUser> {
  const user = await db.user.findUnique({
    where: { email },
    include: {
      restaurant: {
        select: { id: true, name: true }
      },
      customRole: {
        include: { permissions: true }
      }
    }
  })

  if (!user) {
    throw new AuthError('Utilisateur non trouvé')
  }

  if (!user.password) {
    throw new AuthError('Cet utilisateur ne peut pas se connecter')
  }

  if (!user.isActive) {
    throw new AuthError('Compte désactivé')
  }

  // Vérification du mot de passe
  const isPasswordValid = await bcrypt.compare(password, user.password)
  if (!isPasswordValid) {
    throw new AuthError('Mot de passe incorrect')
  }

  // Construction des permissions
  let permissions: string[] = []
  if (user.role === UserRole.ADMIN) {
    permissions = ['admin.all']
  } else if (user.role === UserRole.RESTAURATOR && user.permissions) {
    permissions = user.permissions.split(',')
  }

  // Si l'utilisateur a un rôle personnalisé, ajouter ses permissions
  if (user.customRole?.permissions) {
    permissions.push(...user.customRole.permissions.map(p => p.name))
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    restaurantId: user.restaurantId,
    restaurant: user.restaurant,
    permissions
  }
}

// Middleware d'authentification pour les API routes
export async function requireAuth(request: NextRequest): Promise<AuthUser> {
  const authHeader = request.headers.get('authorization')
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new AuthError('Token d\'authentification manquant')
  }

  const token = authHeader.substring(7)
  const user = verifyToken(token)
  
  // Vérifier que l'utilisateur existe toujours en base
  const dbUser = await db.user.findUnique({
    where: { id: user.id },
    include: {
      restaurant: { select: { id: true, name: true } }
    }
  })

  if (!dbUser || !dbUser.isActive) {
    throw new AuthError('Utilisateur non trouvé ou désactivé')
  }

  return user
}

// Middleware de vérification des permissions
export function requirePermission(permission: string) {
  return (user: AuthUser) => {
    if (!hasPermission(user, permission)) {
      throw new PermissionError(`Permission requise: ${permission}`)
    }
  }
}

// Middleware de vérification d'accès au restaurant
export function requireRestaurantAccess(restaurantId: string) {
  return (user: AuthUser) => {
    if (!canAccessRestaurant(user, restaurantId)) {
      throw new PermissionError('Accès non autorisé à ce restaurant')
    }
  }
}

// Middleware combiné pour les rôles
export function requireRole(...allowedRoles: UserRole[]) {
  return (user: AuthUser) => {
    if (!allowedRoles.includes(user.role)) {
      throw new PermissionError(`Rôle requis: ${allowedRoles.join(' ou ')}`)
    }
  }
}

// Helper pour extraire l'utilisateur depuis les cookies (pour les pages)
export async function getUserFromCookies(request: NextRequest): Promise<AuthUser | null> {
  try {
    const token = request.cookies.get('auth-token')?.value
    
    if (!token) {
      return null
    }

    return verifyToken(token)
  } catch {
    return null
  }
}

// Helper pour créer un utilisateur admin par défaut
export async function createDefaultAdmin() {
  const adminExists = await db.user.findFirst({
    where: { role: UserRole.ADMIN }
  })

  if (!adminExists) {
    const hashedPassword = await AuthUtils.hashPassword('admin123')
    
    await db.user.create({
      data: {
        email: 'admin@mnufood.com',
        name: 'Administrateur',
        password: hashedPassword,
        role: UserRole.ADMIN,
        isActive: true
      }
    })
    
    console.log('Administrateur par défaut créé: admin@mnufood.com / admin123')
  }
}

export const hashPassword = AuthUtils.hashPassword
export const verifyPassword = AuthUtils.verifyPassword
export const generateSecureToken = AuthUtils.generateSecureToken