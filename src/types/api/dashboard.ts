export interface Color {
  id: number
  name: string
  code: string
}

export interface ProductColorDetails {
  id: number
  multimedia: string[]
  pdfs: string[]
  color: Color
  product: {
    id: number
    name: string
    description: string
    price: string
    enabled: boolean
    createdAt: string
  }
}

export interface BestsellerItem {
  id: number
  size: {
    id: number
    name: string
  }
  sale: number
  productColor: ProductColorDetails
}

export interface LowStockItem {
  id: number
  size: {
    id: number
    name: string
  }
  stock: number
  productColor: ProductColorDetails
}
