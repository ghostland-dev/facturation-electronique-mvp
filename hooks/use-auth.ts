'use client'

import useSWR from 'swr'
import { useRouter } from 'next/navigation'
import { useCallback } from 'react'

interface User {
  id: string
  email: string
  firstName: string | null
  lastName: string | null
  role: 'owner' | 'admin' | 'member' | 'viewer'
  locale: string
  organizationId: string | null
}

interface AuthState {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  error: Error | null
}

const fetcher = (url: string) => fetch(url).then(res => res.json())

export function useAuth(): AuthState & {
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  register: (data: RegisterData) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  refresh: () => Promise<void>
} {
  const router = useRouter()
  const { data, error, isLoading, mutate } = useSWR<{ user: User | null }>('/api/auth/session', fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  })

  const login = useCallback(async (email: string, password: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const result = await res.json()

      if (!res.ok) {
        return { success: false, error: result.error }
      }

      await mutate({ user: result.user })
      return { success: true }
    } catch {
      return { success: false, error: 'Network error' }
    }
  }, [mutate])

  const register = useCallback(async (registerData: RegisterData) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registerData),
      })

      const result = await res.json()

      if (!res.ok) {
        return { success: false, error: result.error }
      }

      await mutate({ user: result.user })
      return { success: true }
    } catch {
      return { success: false, error: 'Network error' }
    }
  }, [mutate])

  const logout = useCallback(async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    await mutate({ user: null })
    router.push('/login')
  }, [mutate, router])

  const refresh = useCallback(async () => {
    await mutate()
  }, [mutate])

  return {
    user: data?.user ?? null,
    isLoading,
    isAuthenticated: !!data?.user,
    error: error ?? null,
    login,
    register,
    logout,
    refresh,
  }
}

interface RegisterData {
  email: string
  password: string
  firstName?: string
  lastName?: string
  companyName?: string
  locale?: string
}
