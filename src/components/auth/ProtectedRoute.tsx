'use client'

import { useEffect } from 'react'

import { useRouter } from 'next/navigation'

import { CircularProgress, Box } from '@mui/material'

import { useAuth } from '@/hooks/useAuth'

interface ProtectedRouteProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

const ProtectedRoute = ({ children, fallback }: ProtectedRouteProps) => {
  const router = useRouter()
  const { isAuthenticated, isValidating } = useAuth()

  useEffect(() => {
    if (!isValidating && !isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, isValidating, router])

  // Mostrar loading mientras valida
  if (isValidating) {
    return (
      fallback || (
        <Box display='flex' justifyContent='center' alignItems='center' minHeight='100vh'>
          <CircularProgress />
        </Box>
      )
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return <>{children}</>
}

export default ProtectedRoute
