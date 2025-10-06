'use client'

import { useMemo } from 'react'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

import { variantService } from '@/services/variantService'
import type { CreateVariantDto, UpdateVariantDto, CreateBrandDto } from '@/types/api/variants'

export const useVariantsByProduct = (productId: string | number | undefined) => {
  const numericProductId = useMemo(() => {
    if (!productId) return 0

    return typeof productId === 'string' ? parseInt(productId, 10) : productId
  }, [productId])

  return useQuery({
    queryKey: ['variants', 'product', numericProductId],
    queryFn: () => variantService.getVariantsByProduct(numericProductId),
    enabled: !!productId && numericProductId > 0 && !isNaN(numericProductId),
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: 'always'
  })
}

export const useCreateVariant = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateVariantDto) => variantService.createVariant(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['variants', 'product', variables.productId],
        refetchType: 'active'
      })
    }
  })
}

export const useUpdateVariant = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateVariantDto }) => variantService.updateVariant(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['variants', 'product', variables.data.productId],
        refetchType: 'active'
      })
    }
  })
}

export const useDeleteVariant = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => variantService.deleteVariant(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['variants', 'product'],
        refetchType: 'active'
      })
    }
  })
}

export const useUploadMultimedia = () => {
  return useMutation({
    mutationFn: (files: File[]) => variantService.uploadMultimedia(files),
    onError: error => {
      console.error('Error uploading files:', error)
    }
  })
}

export const useColors = () => {
  return useQuery({
    queryKey: ['colors'],
    queryFn: () => variantService.getColors(),
    staleTime: 10 * 60 * 1000
  })
}

export const useBrands = () => {
  return useQuery({
    queryKey: ['brands'],
    queryFn: () => variantService.getBrands(),
    staleTime: 10 * 60 * 1000
  })
}

export const useCreateBrand = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateBrandDto) => variantService.createBrand(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brands'] })
    },
    onError: error => {
      console.error('Error creating brand:', error)
    }
  })
}
