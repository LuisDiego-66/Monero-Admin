import { apiClient } from '@/libs/axios'
import type { Slider, CreateSliderRequest, UpdateSliderRequest } from '@/types/api/sliders'

class SliderServiceClass {
  async getSliders(params?: { limit?: number; page?: number; search?: string }): Promise<Slider[]> {
    const response = await apiClient.get<Slider[]>('/api/sliders', { params })

    return response.data
  }

  async getSliderById(id: number): Promise<Slider> {
    const response = await apiClient.get<Slider>(`/api/sliders/${id}`)

    return response.data
  }

  async createSlider(data: CreateSliderRequest): Promise<Slider> {
    const response = await apiClient.post<Slider>('/api/sliders', data)

    return response.data
  }

  async updateSlider(id: number, data: UpdateSliderRequest): Promise<Slider> {
    const response = await apiClient.patch<Slider>(`/api/sliders/${id}`, data)

    return response.data
  }

  async deleteSlider(id: number): Promise<void> {
    await apiClient.delete(`/api/sliders/${id}`)
  }

  async uploadImage(file: File): Promise<{ url: string }> {
    const formData = new FormData()

    formData.append('files', file)

    const response = await apiClient.post<string[]>('/api/multimedia', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })

    return { url: response.data[0] }
  }
}

export const sliderService = new SliderServiceClass()
