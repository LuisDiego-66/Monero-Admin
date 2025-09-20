'use client'

import { useRouter, useSearchParams } from 'next/navigation'

import { useMutation, useQueryClient } from '@tanstack/react-query'

import { authService, type LoginCredentials } from '@/services/authService'

export const useAuth = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const queryClient = useQueryClient()

  const loginMutation = useMutation({
    mutationFn: (credentials: LoginCredentials) => authService.login(credentials),
    onSuccess: data => {
      authService.setToken(data.token)
      const redirectTo = searchParams?.get('redirect') || '/home'

      router.push(redirectTo)
    }
  })

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await authService.logout()
    },
    onSuccess: () => {
      queryClient.clear()
      router.push('/login')
    }
  })

  return {
    isAuthenticated: authService.isAuthenticated(),
    isValidating: false,
    login: loginMutation.mutate,
    isLoggingIn: loginMutation.isPending,
    loginError: loginMutation.error,
    logout: logoutMutation.mutate,
    isLoggingOut: logoutMutation.isPending
  }
}
