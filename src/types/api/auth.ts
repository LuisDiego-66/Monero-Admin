export interface Permission {
  resource: string
  permissions: string[]
}

export interface UserRole {
  role: string
  email: string
  permissions?: Permission[]
}

export type StaticRole = 'ADMIN' | 'CASHIER'

export interface UserSession {
  email: string
  role?: StaticRole
  permissions?: Permission[]
}
