'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuthStore } from '@/stores/auth'
import { UserRole } from '@/types/auth'
import Link from 'next/link'
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  FolderOpen, 
  Settings, 
  LogOut,
  Menu,
  X,
  AlertCircle,
  Store,
  TrendingUp,
  UserCog,
  Shield,
  Users,
  BarChart3,
  FileText,
  Tag,
  MessageSquare
} from 'lucide-react'
import { useState } from 'react'
import { useAuthActivity } from '@/hooks/useAuthActivity'

const navigation = [
  { name: 'Dashboard', href: '/admin' as const, icon: LayoutDashboard },
  { name: 'Clients', href: '/admin/restaurants' as const, icon: Store },
  { name: 'Produits', href: '/admin/products' as const, icon: Package },
  { name: 'Commandes', href: '/admin/orders' as const, icon: ShoppingCart },
  { name: 'Catégories', href: '/admin/categories' as const, icon: FolderOpen },
  { name: 'Utilisateurs', href: '/admin/users' as const, icon: Users },
  { name: 'Reviews', href: '/admin/reviews' as const, icon: MessageSquare },
  { name: 'Finances', href: '/admin/finances' as const, icon: TrendingUp },
  { name: 'Rôles', href: '/admin/roles' as const, icon: Shield },
  { name: 'Profil', href: '/admin/profile' as const, icon: UserCog },
  { name: 'Paramètres', href: '/admin/settings' as const, icon: Settings },
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const { isAuthenticated, user, logout, initialize, isInitialized } = useAuthStore()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Gérer l'activité utilisateur pour éviter les déconnexions
  useAuthActivity()

  useEffect(() => {
    initialize()
  }, [initialize])

  useEffect(() => {
    if (isInitialized && (!isAuthenticated || user?.role !== UserRole.ADMIN)) {
      router.push('/login')
    }
  }, [isInitialized, isAuthenticated, user, pathname, router])

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="loading-spinner w-8 h-8"></div>
      </div>
    )
  }

  if (!isAuthenticated || user?.role !== UserRole.ADMIN) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="loading-spinner w-8 h-8"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        >
          <div className="absolute inset-0 bg-gray-600 opacity-75"></div>
        </div>
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:fixed ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <Link href="/admin" className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">M</span>
            </div>
            <span className="text-xl font-bold text-gray-900">Admin</span>
          </Link>
          
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 rounded-md hover:bg-gray-100 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="mt-8 px-4">
          <div className="space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center gap-3 py-3 px-4 text-sm font-medium rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-primary-50 text-primary-600 shadow-sm border-l-4 border-primary-600'
                      : 'text-gray-700 hover:bg-primary-50 hover:text-primary-600'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon className={`h-5 w-5 flex-shrink-0 ${
                    isActive ? 'text-primary-600' : 'text-gray-400 group-hover:text-primary-500'
                  }`} />
                  <span className="truncate font-medium">{item.name}</span>
                </Link>
              )
            })}
          </div>
        </nav>

        {/* User info */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gray-50 border-t border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-primary-600 text-sm font-semibold">
                {user?.name?.charAt(0) || 'A'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{user?.name || 'Administrateur'}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email || 'admin@mnufood.com'}</p>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors flex-shrink-0"
              title="Se déconnecter"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:ml-64">
        {/* Top bar */}
        <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2.5 rounded-xl text-gray-400 hover:text-primary-600 hover:bg-primary-50 transition-all duration-200 border border-transparent hover:border-primary-200"
              >
                <Menu className="h-5 w-5" />
              </button>
              
              <div className="lg:hidden">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">M</span>
                  </div>
                  <h1 className="text-lg font-bold text-gray-900">MnuFood</h1>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Notification Badge */}
              <div className="hidden md:flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 bg-gray-100 hover:bg-primary-50 rounded-xl flex items-center justify-center transition-colors cursor-pointer">
                    <AlertCircle className="h-5 w-5 text-gray-500" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-white">!</span>
                  </div>
                </div>
              </div>
              
              <Link 
                href="/" 
                target="_blank"
                className="hidden sm:flex items-center gap-2 text-sm text-gray-600 hover:text-primary-600 transition-all duration-200 px-4 py-2 rounded-xl hover:bg-primary-50 border border-gray-200 hover:border-primary-200 font-medium"
              >
                <span>Voir le site</span>
                <span className="text-primary-500">→</span>
              </Link>
              
              <div className="hidden sm:block w-px h-6 bg-gray-200"></div>
              
              {/* User Profile */}
              <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer">
                <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center shadow-sm">
                  <span className="text-white text-sm font-semibold">
                    {user?.name?.charAt(0) || 'A'}
                  </span>
                </div>
                <div className="hidden lg:block">
                  <p className="text-sm font-semibold text-gray-900">
                    {user?.name || 'Administrateur'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {user?.email || 'admin@mnufood.com'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="p-4 sm:p-6 lg:p-8 min-h-screen bg-gray-50">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}