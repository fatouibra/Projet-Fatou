import { SignJWT, jwtVerify } from 'jose'
import { AuthUser } from '@/types/auth'

const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret'

// Convertir la clé secrète en format compatible avec jose
const getJwtSecretKey = () => {
  return new TextEncoder().encode(JWT_SECRET)
}

export class EdgeAuthError extends Error {
  constructor(message: string, public statusCode: number = 401) {
    super(message)
    this.name = 'EdgeAuthError'
  }
}

// Génération du token JWT compatible Edge Runtime
export async function generateTokenEdge(user: AuthUser): Promise<string> {
  const payload = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    restaurantId: user.restaurantId,
    permissions: user.permissions
  }
  
  const secret = getJwtSecretKey()
  
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret)
  
  return token
}

// Vérification du token JWT compatible Edge Runtime
export async function verifyTokenEdge(token: string): Promise<AuthUser> {
  try {
    const secret = getJwtSecretKey()
    const { payload } = await jwtVerify(token, secret)
    
    return {
      id: payload.id as string,
      email: payload.email as string,
      name: payload.name as string || '',
      role: payload.role as any,
      restaurantId: payload.restaurantId as string | null,
      permissions: payload.permissions as string[]
    }
  } catch (error) {
    console.log('❌ verifyTokenEdge - error:', error)
    throw new EdgeAuthError('Token invalide')
  }
}