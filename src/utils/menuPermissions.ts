import type { VerticalMenuDataType } from '@/types/menuTypes'
import type { StaticRole } from '@/types/api/auth'

export const filterMenuByRole = (
  menuItems: VerticalMenuDataType[],
  userEmail: string | null,
  userRole?: StaticRole
): VerticalMenuDataType[] => {
  const role = userRole || getRoleFromEmail(userEmail)

  if (role === 'CASHIER') {
    const excludedMenus = ['PRINCIPAL', 'Inicio']

    return menuItems.filter((item: any) => !excludedMenus.includes(item.label))
  }

  if (role === 'ADMIN') {
    return menuItems
  }

  return []
}

export const getRoleFromEmail = (email: string | null): StaticRole => {
  if (email === 'rilberadmin@moneroget.com') {
    return 'CASHIER'
  }

  return 'ADMIN'
}

export const getHomeRouteByRole = (userEmail: string | null, userRole?: StaticRole): string => {
  const role = userRole || getRoleFromEmail(userEmail)

  if (role === 'CASHIER') {
    return '/sales/instore'
  }

  return '/home'
}
