// services/cartService.ts

import { apiClient } from '@/libs/axios'
import type {
  CartRequest,
  CartResponse,
  RepriceResponse,
  Order,
  CreateOrderRequest,
  ConfirmOrderRequest,
  ConfirmOrderResponse
} from '@/types/api/sales'

class CartServiceClass {
  //Agregar items al carrito
  async addToCart(data: CartRequest): Promise<CartResponse> {
    const response = await apiClient.post<CartResponse>('/api/cart', data)

    return response.data
  }

  //  Verificar disponibilidad y obtener precios actualizados

  async repriceCart(token: string): Promise<RepriceResponse> {
    const response = await apiClient.post<RepriceResponse>(`/api/orders/reprice/${token}`)

    return response.data
  }

  //Crear orden

  async createOrder(data: CreateOrderRequest): Promise<Order> {
    const response = await apiClient.post<Order>('/api/orders/in-store', data)

    return response.data
  }

  //Confirmar orden y pagar

  async confirmOrder(orderId: number, data: ConfirmOrderRequest): Promise<ConfirmOrderResponse> {
    const response = await apiClient.post<ConfirmOrderResponse>(`/api/orders/confirm/${orderId}`, data)

    return response.data
  }
}

export const cartService = new CartServiceClass()
