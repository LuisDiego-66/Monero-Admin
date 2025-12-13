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
    productColor: any
    id: number
  }
}

export interface Order {
  id: number
  type: 'in_store' | 'online'
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'paid' | 'sent' | 'expired'
  payment_type: 'cash' | 'card' | 'qr'
  enabled: boolean
  totalPrice: string
  createdAt: string
  expiresAt: string | null
  items: OrderItem[]
  customer: any | null
  shipment: any | null
  address: any | null
}

export interface CreateOrderRequest {
  token: string
  payment_type: 'cash' | 'card' | 'qr'
  customerId?: string | number
}

export interface ConfirmOrderRequest {
  customerId?: string | number
}

export interface ConfirmOrderResponse {
  success: boolean
  orderId: number
  message: string
}
export interface CancelOrderRequest {
  orderId: number
}

export interface CancelOrderResponse {
  success: boolean
  message: string
}
export interface ProductColor {
  id: number
  multimedia: string[]
  pdfs: string[]
  product: {
    id: number
    name: string
    description: string
    price: string
    enabled: boolean
  }
}

export interface Variant {
  id: number
  productColor: ProductColor
}

export interface OrdersListParams {
  page?: number
  limit?: number
  type?: 'in_store' | 'online' | 'all'
  startDate?: string
  endDate?: string
}

export interface OrdersListMeta {
  total: number
  page: number
  lastPage: number
  limit: number
  offset: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

export interface OrdersListResponse {
  data: Order[]
  meta: OrdersListMeta
}
