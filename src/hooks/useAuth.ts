import { useRouter } from 'next/navigation'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { authService, type LoginCredentials } from '@/services/authService'

export const useAuth = () => {
  const router = useRouter()
  const queryClient = useQueryClient()

  // Query validar autenticación
  const authQuery = useQuery({
    queryKey: ['auth', 'validate'],
    queryFn: () => authService.validateToken(),
    staleTime: 2 * 60 * 1000,
    refetchOnWindowFocus: true,
    enabled: authService.isAuthenticated()
  })

  // Mutation para login
  const loginMutation = useMutation({
    mutationFn: (credentials: LoginCredentials) => authService.login(credentials),
    onSuccess: data => {
      authService.setToken(data.token)
      queryClient.invalidateQueries({ queryKey: ['auth'] })
      router.push('/home')
    }
  })

  const logout = () => {
    authService.removeToken()
    queryClient.clear()
    router.push('/login')
  }

  return {
    login: loginMutation.mutate,
    isLoggingIn: loginMutation.isPending,
    loginError: loginMutation.error,
    isAuthenticated: authQuery.data ?? false,
    isValidating: authQuery.isLoading,
    logout
  }
}
