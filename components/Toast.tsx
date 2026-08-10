'use client'

import toast, { Toaster } from 'react-hot-toast'

export type ToastTone = 'success' | 'error' | 'info'

export function pushToast({ tone, message }: { tone: ToastTone; message: string }): void {
  switch (tone) {
    case 'success':
      toast.success(message)
      break
    case 'error':
      toast.error(message)
      break
    default:
      toast(message)
  }
}

export function ToastRegion() {
  return (
    <Toaster
      position="bottom-center"
      toastOptions={{
        duration: 6000,
        style: { background: '#1b2140', color: '#f4f6fb', border: '1px solid #3d4a7a' },
      }}
    />
  )
}
