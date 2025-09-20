'use client'

import { useQuery } from '@tanstack/react-query'

import { customerService } from '@/services/customerService'
import type { CustomersParams } from '@/types/api/customer'

export const useCustomers = (params: CustomersParams = {}) => {
  return useQuery({
    queryKey: ['customers', params],
    queryFn: () => customerService.getCustomers(params),
    placeholderData: previousData => previousData,
    staleTime: 5 * 60 * 1000
  })
}

// export const useEmailCustomers = () => {
//   const queryClient = useQueryClient()

//   return useMutation({
//     mutationFn: (data: {
//       subject: string
//       message: string
//       recipients: string
//       selectedClients?: number[]
//       filterType?: string
//     }) => customerService.sendEmails(data),
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ['customers'] })
//     },
//   })
// }
