export interface Subcategory {
  id: number
  name: string
  enabled: boolean
}

export interface Brand {
  id: number
  name: string
  enabled: boolean
}

export interface Product {
  id: number
  name: string
  description: string
  price: string
  enabled: boolean
  subcategory: Subcategory
  brand?: Brand
  discount?: number
  createdAt?: string
  updatedAt?: string
}

export interface CreateProductDto {
  name: string
  description: string
  price: string
  enabled?: boolean
  subcategory: number
  brand?: number
  discount?: number
}

export interface UpdateProductDto extends Partial<CreateProductDto> {}

export interface ProductsResponse {
  products: Product[]
  total: number
  page: number
  limit: number
}

export interface ProductsParams {
  limit?: number
  offset?: number
}
