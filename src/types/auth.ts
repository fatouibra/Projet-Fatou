export const UserRole = {
  ADMIN: 'ADMIN',
  RESTAURATOR: 'RESTAURATOR', 
  CUSTOMER: 'CUSTOMER'
} as const

export type UserRole = typeof UserRole[keyof typeof UserRole]

export interface User {
  id: string
  email: string
  name: string
  phone?: string
  address?: string
  password?: string
  role: UserRole
  isActive: boolean
  restaurantId?: string
  restaurant?: Restaurant
  mustChangePassword: boolean
  permissions?: string
  roleId?: string
  customRole?: Role
  createdAt: Date
  updatedAt: Date
}

export interface Restaurant {
  id: string
  name: string
  description?: string
  address: string
  phone: string
  email: string
  image?: string
  rating: number
  likesCount: number
  isActive: boolean
  cuisine: string
  deliveryFee: number
  minOrderAmount: number
  openingHours: string
  managers: User[]
  createdAt: Date
  updatedAt: Date
}

export interface Role {
  id: string
  name: string
  description?: string
  isActive: boolean
  permissions: Permission[]
  users: User[]
  createdAt: Date
  updatedAt: Date
}

export interface Permission {
  id: string
  name: string
  description: string
  category: string
}

// Types d'authentification
export interface AuthUser {
  id: string
  email: string
  name: string
  role: UserRole
  restaurantId?: string
  restaurant?: {
    id: string
    name: string
  }
  permissions?: string[]
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface AuthResponse {
  success: boolean
  user?: AuthUser
  message?: string
  token?: string
}

// Permissions prédéfinies
export const ADMIN_PERMISSIONS = [
  'admin.all',
  'restaurants.view_all',
  'restaurants.create',
  'restaurants.edit_all',
  'restaurants.delete',
  'users.view_all',
  'users.create',
  'users.edit_all',
  'users.delete',
  'orders.view_all',
  'products.view_all',
  'finances.view_all',
  'roles.manage',
  'system.settings'
] as const

export const RESTAURATOR_PERMISSIONS = [
  'restaurant.dashboard',
  'restaurant.products.view',
  'restaurant.products.create',
  'restaurant.products.edit',
  'restaurant.products.delete',
  'restaurant.orders.view',
  'restaurant.orders.edit',
  'restaurant.categories.manage',
  'restaurant.promotions.manage',
  'restaurant.profile.edit',
  'restaurant.finances.view',
  'restaurant.reviews.view'
] as const

export const CUSTOMER_PERMISSIONS = [] as const

export type AdminPermission = typeof ADMIN_PERMISSIONS[number]
export type RestauratorPermission = typeof RESTAURATOR_PERMISSIONS[number]
export type CustomerPermission = typeof CUSTOMER_PERMISSIONS[number]

export type AllPermissions = AdminPermission | RestauratorPermission | CustomerPermission

// Helpers pour vérifier les permissions
export function hasPermission(user: AuthUser, permission: string): boolean {
  if (user.role === UserRole.ADMIN) {
    return ADMIN_PERMISSIONS.includes(permission as AdminPermission) || permission === 'admin.all'
  }
  
  if (user.role === UserRole.RESTAURATOR) {
    const userPermissions = user.permissions || []
    return userPermissions.includes(permission)
  }
  
  return false
}

export function canAccessRestaurant(user: AuthUser, restaurantId: string): boolean {
  if (user.role === UserRole.ADMIN) {
    return true // Admin peut accéder à tous les restaurants
  }
  
  if (user.role === UserRole.RESTAURATOR) {
    return user.restaurantId === restaurantId
  }
  
  return false
}

export function getUserPermissions(role: UserRole): readonly string[] {
  switch (role) {
    case UserRole.ADMIN:
      return ADMIN_PERMISSIONS
    case UserRole.RESTAURATOR:
      return RESTAURATOR_PERMISSIONS
    case UserRole.CUSTOMER:
      return CUSTOMER_PERMISSIONS
    default:
      return []
  }
}