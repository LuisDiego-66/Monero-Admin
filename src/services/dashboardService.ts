import { apiClient } from '@/libs/axios'
import type { BestsellerItem, LowStockItem } from '@/types/api/dashboard'

class DashboardServiceClass {
  async getBestsellers(): Promise<BestsellerItem[]> {
    const response = await apiClient.get<BestsellerItem[]>('/api/variants/dashboard/bestsellers')

    return response.data
  }

  async getLowStock(): Promise<LowStockItem[]> {
    const response = await apiClient.get<LowStockItem[]>('/api/variants/dashboard/lowStock')

    return response.data
  }
}

export const dashboardService = new DashboardServiceClass()
