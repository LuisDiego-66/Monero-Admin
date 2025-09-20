import { apiClient } from '@/libs/axios'
import type { Customer, CustomersResponse, CustomersParams } from '@/types/api/customer'

class CustomerServiceClass {
  async getCustomers(params: CustomersParams = {}): Promise<CustomersResponse> {
    const { limit = 10, offset = 0, search, type } = params

    const searchParams = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString()
    })

    if (search) {
      searchParams.append('search', search)
    }

    if (type && type !== 'all') {
      searchParams.append('type', type)
    }

    const response = await apiClient.get<Customer[]>(`/api/customers?${searchParams.toString()}`)

    const customers = response.data

    return {
      customers,
      total: customers.length,
      hasMore: customers.length === limit
    }
  }

  // async sendEmails(data: {
  //   subject: string
  //   message: string
  //   recipients: string
  //   selectedClients?: number[]
  //   filterType?: string
  // }): Promise<void> {
  //   await apiClient.post('/api/send-emails', data)
  // }
}

export const customerService = new CustomerServiceClass()
