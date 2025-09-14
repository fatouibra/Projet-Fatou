import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, requireRole, requirePermission, requireRestaurantAccess, AuthError, PermissionError } from './auth'
import { UserRole, AuthUser } from '@/types/auth'

// Types pour la configuration des middlewares
export interface RouteConfig {
  roles?: UserRole[]
  permissions?: string[]
  requireRestaurant?: boolean
  allowPublic?: boolean
}

// Wrapper pour créer des handlers API sécurisés
export function createSecureHandler(
  config: RouteConfig,
  handler: (request: NextRequest, user?: AuthUser) => Promise<NextResponse>
) {
  return async (request: NextRequest) => {
    try {
      let user: AuthUser | undefined

      // Si la route est publique, pas d'authentification requise
      if (!config.allowPublic) {
        user = await requireAuth(request)

        // Vérifier les rôles requis
        if (config.roles && config.roles.length > 0) {
          requireRole(...config.roles)(user)
        }

        // Vérifier les permissions requises
        if (config.permissions) {
          for (const permission of config.permissions) {
            requirePermission(permission)(user)
          }
        }

        // Vérifier l'accès restaurant si requis
        if (config.requireRestaurant && user.role === UserRole.RESTAURATOR) {
          const url = new URL(request.url)
          const restaurantId = url.searchParams.get('restaurantId') || 
                              url.pathname.split('/')[3] // Assume /api/restaurants/{id}/...
          
          if (restaurantId) {
            requireRestaurantAccess(restaurantId)(user)
          }
        }
      }

      return await handler(request, user)

    } catch (error) {
      console.error('API Error:', error)

      if (error instanceof AuthError || error instanceof PermissionError) {
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
}

// Middlewares pré-configurés pour les cas courants
export const middlewares = {
  // Authentification requise seulement
  authenticated: (handler: (req: NextRequest, user: AuthUser) => Promise<NextResponse>) =>
    createSecureHandler({}, handler),

  // Admin seulement
  adminOnly: (handler: (req: NextRequest, user: AuthUser) => Promise<NextResponse>) =>
    createSecureHandler({ roles: [UserRole.ADMIN] }, handler),

  // Restaurateur seulement
  restauratorOnly: (handler: (req: NextRequest, user: AuthUser) => Promise<NextResponse>) =>
    createSecureHandler({ roles: [UserRole.RESTAURATOR] }, handler),

  // Admin ou Restaurateur
  adminOrRestaurator: (handler: (req: NextRequest, user: AuthUser) => Promise<NextResponse>) =>
    createSecureHandler({ roles: [UserRole.ADMIN, UserRole.RESTAURATOR] }, handler),

  // Restaurateur avec accès à son restaurant seulement
  restauratorOwnData: (handler: (req: NextRequest, user: AuthUser) => Promise<NextResponse>) =>
    createSecureHandler({ 
      roles: [UserRole.RESTAURATOR], 
      requireRestaurant: true 
    }, handler),

  // Route publique
  public: (handler: (req: NextRequest, user?: AuthUser) => Promise<NextResponse>) =>
    createSecureHandler({ allowPublic: true }, handler),
}

// Helper pour extraire l'ID de restaurant depuis l'URL
export function extractRestaurantId(request: NextRequest): string | null {
  const url = new URL(request.url)
  
  // Essayer plusieurs formats d'URL
  const patterns = [
    /\/api\/restaurants\/([^\/]+)/,     // /api/restaurants/{id}
    /\/restaurant\/([^\/]+)/,           // /restaurant/{id}
    /restaurantId=([^&]+)/,             // ?restaurantId={id}
  ]

  for (const pattern of patterns) {
    const match = url.pathname.match(pattern) || url.search.match(pattern)
    if (match) {
      return match[1]
    }
  }

  return url.searchParams.get('restaurantId')
}

// Helper pour filtrer les données selon le rôle de l'utilisateur
export function filterDataByRole<T extends Record<string, any>>(
  user: AuthUser,
  data: T[],
  restaurantIdField = 'restaurantId'
): T[] {
  if (user.role === UserRole.ADMIN) {
    return data // Admin voit tout
  }

  if (user.role === UserRole.RESTAURATOR && user.restaurantId) {
    return data.filter(item => item[restaurantIdField] === user.restaurantId)
  }

  return [] // Customer ne voit rien par défaut
}

// Helper pour valider les permissions pour une action spécifique
export function validatePermissions(user: AuthUser, action: string): boolean {
  if (user.role === UserRole.ADMIN) {
    return true // Admin peut tout faire
  }

  if (user.role === UserRole.RESTAURATOR) {
    const permissions = user.permissions || []
    
    // Map des actions vers les permissions
    const actionPermissionMap: Record<string, string> = {
      'view_dashboard': 'dashboard',
      'manage_products': 'products',
      'view_products': 'products',
      'manage_orders': 'orders',
      'view_orders': 'orders',
      'manage_categories': 'categories',
      'view_finances': 'finances',
      'view_reviews': 'reviews',
      'edit_profile': 'profile'
    }

    const requiredPermission = actionPermissionMap[action]
    return requiredPermission ? permissions.includes(requiredPermission) : false
  }

  return false
}

// Helper pour créer des réponses d'erreur standardisées
export const errorResponses = {
  unauthorized: () => NextResponse.json(
    { success: false, message: 'Authentification requise' },
    { status: 401 }
  ),

  forbidden: (message = 'Accès non autorisé') => NextResponse.json(
    { success: false, message },
    { status: 403 }
  ),

  notFound: (resource = 'Ressource') => NextResponse.json(
    { success: false, message: `${resource} non trouvée` },
    { status: 404 }
  ),

  badRequest: (message = 'Requête invalide') => NextResponse.json(
    { success: false, message },
    { status: 400 }
  ),

  serverError: (message = 'Erreur serveur') => NextResponse.json(
    { success: false, message },
    { status: 500 }
  )
}