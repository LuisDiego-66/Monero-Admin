import { apiClient } from '@/libs/axios'
import type { CreateOutfitRequest, Outfit, UpdateOutfitRequest, ProductColorsResponse } from '@/types/api/outfits'

class OutfitServiceClass {
  async getOutfits(params?: { limit?: number; page?: number; search?: string }): Promise<Outfit[]> {
    const response = await apiClient.get<Outfit[]>('/api/outfits', { params })

    return response.data
  }

  async getOutfitById(id: number): Promise<Outfit> {
    const response = await apiClient.get<Outfit>(`/api/outfits/${id}`)

    return response.data
  }

  async createOutfit(data: CreateOutfitRequest): Promise<Outfit> {
    const response = await apiClient.post<Outfit>('/api/outfits', data)

    return response.data
  }

  async updateOutfit(id: number, data: UpdateOutfitRequest): Promise<Outfit> {
    const response = await apiClient.patch<Outfit>(`/api/outfits/${id}`, data)

    return response.data
  }

  async deleteOutfit(id: number): Promise<void> {
    await apiClient.delete(`/api/outfits/${id}`)
  }

  async getVariants(params?: { limit?: number; page?: number; search?: string }): Promise<ProductColorsResponse> {
    const response = await apiClient.get<ProductColorsResponse>('/api/variants', { params })

    return response.data
  }
}

export const outfitService = new OutfitServiceClass()
