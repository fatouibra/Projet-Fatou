'use client'

import { useToastStore } from '@/stores/toast'
import { ToastContainer } from './Toast'

export function ToastProvider() {
  const { toasts, removeToast } = useToastStore()

  return <ToastContainer toasts={toasts} onRemove={removeToast} />
}