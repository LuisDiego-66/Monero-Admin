'use client'

import { authService } from '@/services/authService'
import { getRoleFromEmail, getHomeRouteByRole } from '@/utils/menuPermissions'

export const useUserRole = () => {
  const userEmail = authService.getUserEmail()
  const role = getRoleFromEmail(userEmail)
  const homeRoute = getHomeRouteByRole(userEmail)

  return {
    userEmail,
    role,
    homeRoute,
    isCashier: role === 'CASHIER',
    isAdmin: role === 'ADMIN'
  }
}
