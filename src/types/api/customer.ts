// types/customer.ts
export interface Customer {
  id: number
  name: string
  email: string
  phone: string | null
  type: 'registered' | 'subscriber'
  provider: string
  idProvider: string
  enabled: boolean
}

export interface CustomersResponse {
  customers: Customer[]
  total: number
  hasMore: boolean
}

export interface CustomersParams {
  limit?: number
  offset?: number
  search?: string
  type?: 'all' | 'registered' | 'subscriber'
}

// export interface EmailForm {
//   subject: string
//   message: string
//   recipients: 'all' | 'registered' | 'subscriber' | 'selected'
// }

// export type SendingStatus = 'idle' | 'sending' | 'success' | 'error'
