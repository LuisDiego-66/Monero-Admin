
export interface CartItem {
  variantId: number
  quantity: number
}

export interface CartRequest {
  items: CartItem[]
  token?: string
}

export interface CartResponse {
  cart: CartItem[]
  token: string
}

export interface RepriceItem {
  variantId: number
  quantity: number
  unit_price: number
  discountValue: number
  totalPrice: string
}

export interface RepriceResponse {
  items: RepriceItem[]
  total: string
}

export interface RepriceError {
  message: string
  error: string
  statusCode: number
}

export interface OrderItem {
  id: number
  quantity: number
  unit_price: string
  discountValue: number
  totalPrice: string
  variant: {
    id: number
  }
}

export interface Order {
  id: number
  type: 'in_store' | 'online'
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  enabled: boolean
  totalPrice: string
  expiresAt: string
  items: OrderItem[]
  customer: any | null
  shipment: any | null
  address: any | null
}

export interface CreateOrderRequest {
  token: string
  customerId?: string | number
}

export interface ConfirmOrderRequest {
  paymentMethod: 'efectivo' | 'qr'
  customerId?: string | number
}

export interface ConfirmOrderResponse {
  success: boolean
  orderId: number
  message: string
}
