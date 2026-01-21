'use client'

import { useRouter } from 'next/navigation'
import { useCallback } from 'react'

export function useAuth() {
  const router = useRouter()

  const logout = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      router.push('/login')
      router.refresh()
    } catch (error) {
      console.error('Logout error:', error)
    }
  }, [router])

  return { logout }
}
