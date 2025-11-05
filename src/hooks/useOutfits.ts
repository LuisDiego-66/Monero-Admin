import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

import { outfitService } from '@/services/outfitService'
import type { CreateOutfitRequest, UpdateOutfitRequest } from '@/types/api/outfits'

export const useOutfits = (params?: { limit?: number; page?: number; search?: string }) => {
  return useQuery({
    queryKey: ['outfits', params],
    queryFn: () => outfitService.getOutfits(params)
  })
}

export const useOutfitById = (id: number) => {
  return useQuery({
    queryKey: ['outfit', id],
    queryFn: () => outfitService.getOutfitById(id),
    enabled: !!id
  })
}

export const useCreateOutfit = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateOutfitRequest) => outfitService.createOutfit(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['outfits'] })
    }
  })
}

export const useUpdateOutfit = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateOutfitRequest }) => outfitService.updateOutfit(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['outfits'] })
    }
  })
}

export const useDeleteOutfit = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => outfitService.deleteOutfit(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['outfits'] })
    }
  })
}

export const useVariants = (params?: { limit?: number; page?: number; search?: string }) => {
  return useQuery({
    queryKey: ['variants', params],
    queryFn: () => outfitService.getVariants(params)
  })
}
