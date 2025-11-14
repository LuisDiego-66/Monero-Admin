import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

import { sliderService } from '@/services/sliderService'
import type { CreateSliderRequest, UpdateSliderRequest } from '@/types/api/sliders'

export const useSliders = (params?: { limit?: number; page?: number; search?: string }) => {
  return useQuery({
    queryKey: ['sliders', params],
    queryFn: () => sliderService.getSliders(params),
    staleTime: 5 * 60 * 1000
  })
}

export const useSliderById = (id: number) => {
  return useQuery({
    queryKey: ['slider', id],
    queryFn: () => sliderService.getSliderById(id),
    enabled: !!id
  })
}

export const useCreateSlider = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateSliderRequest) => sliderService.createSlider(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sliders'] })
    }
  })
}

export const useUpdateSlider = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateSliderRequest }) => sliderService.updateSlider(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sliders'] })
    }
  })
}

export const useDeleteSlider = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => sliderService.deleteSlider(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sliders'] })
    }
  })
}

export const useUploadSliderImage = () => {
  return useMutation({
    mutationFn: (file: File) => sliderService.uploadImage(file)
  })
}
