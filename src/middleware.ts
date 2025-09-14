import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyTokenEdge } from '@/lib/jwt-edge'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Routes qui nécessitent une authentification
  const protectedRoutes = ['/admin', '/restaurant']
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))
  
  if (!isProtectedRoute) {
    return NextResponse.next()
  }

  const token = request.cookies.get('auth-token')?.value

  console.log('🔍 Middleware - pathname:', pathname)
  console.log('🔍 Middleware - token exists:', !!token)

  if (!token) {
    console.log('❌ No token found, redirecting to login')
    // Rediriger vers login si pas de token
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  try {
    const user = await verifyTokenEdge(token)
    console.log('✅ Token verified, user role:', user.role)
    
    // Vérifier l'accès basé sur le rôle
    if (pathname.startsWith('/admin') && user.role !== 'ADMIN') {
      console.log('❌ Admin access denied for role:', user.role)
      return NextResponse.redirect(new URL('/login?error=unauthorized', request.url))
    }
    
    if (pathname.startsWith('/restaurant') && user.role !== 'RESTAURATOR') {
      console.log('❌ Restaurant access denied for role:', user.role)
      return NextResponse.redirect(new URL('/login?error=unauthorized', request.url))
    }

    console.log('✅ Access granted')
    return NextResponse.next()
  } catch (error) {
    console.log('❌ Token verification failed:', error)
    // Token invalide, rediriger vers login
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    loginUrl.searchParams.set('error', 'session-expired')
    return NextResponse.redirect(loginUrl)
  }
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/restaurant/:path*'
  ]
}