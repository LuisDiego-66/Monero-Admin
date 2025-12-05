'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

import { advertisementService } from '@/services/advertisementService'
import type { UpdateAdvertisementPayload } from '@/types/api/advertisement'

export const useAdvertisement = () => {
  return useQuery({
    queryKey: ['advertisement'],
    queryFn: () => advertisementService.getAdvertisement(),
    staleTime: 5 * 60 * 1000
  })
}

export const useUpdateAdvertisement = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: UpdateAdvertisementPayload) => advertisementService.updateAdvertisement(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['advertisement'] })
    }
  })
}
