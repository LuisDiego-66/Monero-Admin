import { apiClient } from '@/libs/axios'
import type { Customer, CustomersResponse, CustomersParams } from '@/types/api/customer'

class CustomerServiceClass {
  async getCustomers(params: CustomersParams = {}): Promise<CustomersResponse> {
    const { limit = 10, page = 1, search, type } = params

    const searchParams = new URLSearchParams({
      limit: limit.toString(),
      page: page.toString()
    })

    if (search) {
      searchParams.append('search', search)
    }

    if (type && type !== 'all') {
      searchParams.append('type', type)
    }

    const response = await apiClient.get<{
      data: Customer[]
      meta: {
        total: number
        page: number
        lastPage: number
        limit: number
        offset: number
        hasNextPage: boolean
        hasPreviousPage: boolean
      }
    }>(`/api/customers?${searchParams.toString()}`)

    return {
      customers: response.data.data,
      total: response.data.meta.total,
      hasMore: response.data.meta.hasNextPage
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
