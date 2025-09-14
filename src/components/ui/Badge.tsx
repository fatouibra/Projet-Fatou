'use client'

import { cn } from '@/lib/utils'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'new' | 'popular' | 'vegetarian' | 'status'
  status?: 'received' | 'preparing' | 'ready' | 'delivering' | 'delivered' | 'cancelled'
  className?: string
}

export function Badge({ children, variant = 'new', status, className }: BadgeProps) {
  const baseClasses = 'text-xs font-semibold px-2.5 py-0.5 rounded-full'
  
  const variants = {
    new: 'badge-new',
    popular: 'badge-popular',
    vegetarian: 'badge-vegetarian',
    status: status ? `status-${status}` : 'badge-new'
  }

  return (
    <span className={cn(baseClasses, variants[variant], className)}>
      {children}
    </span>
  )
}