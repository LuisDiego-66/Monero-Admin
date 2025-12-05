import { apiClient } from '@/libs/axios'
import type { Advertisement, UpdateAdvertisementPayload } from '@/types/api/advertisement'

class AdvertisementServiceClass {
  async getAdvertisement(): Promise<Advertisement> {
    const response = await apiClient.get<Advertisement>('/api/advertisements')

    return response.data
  }

  async updateAdvertisement(data: UpdateAdvertisementPayload): Promise<Advertisement> {
    const response = await apiClient.patch<Advertisement>('/api/advertisements', data)

    return response.data
  }
}

export const advertisementService = new AdvertisementServiceClass()
