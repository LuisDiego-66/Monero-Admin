'use client'

import { useQuery } from '@tanstack/react-query'

import { dashboardService } from '@/services/dashboardService'

export const useBestsellers = () => {
  return useQuery({
    queryKey: ['dashboard', 'bestsellers'],
    queryFn: () => dashboardService.getBestsellers(),
    staleTime: 5 * 60 * 1000
  })
}

export const useLowStock = () => {
  return useQuery({
    queryKey: ['dashboard', 'lowStock'],
    queryFn: () => dashboardService.getLowStock(),
    staleTime: 5 * 60 * 1000
  })
}
