

import { useMutation } from '@tanstack/react-query'
import { cartService } from '@/services/salesService'
import type {
  CartRequest,
  CreateOrderRequest,
  ConfirmOrderRequest
} from '@/types/api/sales'

export const useAddToCart = () => {
  return useMutation({
    mutationFn: (data: CartRequest) => cartService.addToCart(data),
    onError: (error: any) => {
      console.error('Error adding to cart:', error)
    }
  })
}

export const useRepriceCart = () => {
  return useMutation({
    mutationFn: (token: string) => cartService.repriceCart(token),
    onError: (error: any) => {
      console.error('Error repricing cart:', error)
      throw error 
    }
  })
}

export const useCreateOrder = () => {
  return useMutation({
    mutationFn: (data: CreateOrderRequest) => cartService.createOrder(data),
    onError: (error: any) => {
      console.error('Error creating order:', error)
      throw error
    }
  })
}

export const useConfirmOrder = () => {
  return useMutation({
    mutationFn: ({ orderId, data }: { orderId: number; data: ConfirmOrderRequest }) => 
      cartService.confirmOrder(orderId, data),
    onError: (error: any) => {
      console.error('Error confirming order:', error)
      throw error
    }
  })
}
