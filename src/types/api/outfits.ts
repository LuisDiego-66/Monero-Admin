export interface ProductColor {
  id: number
  multimedia: string[]
  pdfs: string[]
  color: {
    id: number
    name: string
    code: string
  }
  product: {
    id: number
    name: string
    description: string
    price: string
    enabled: boolean
  }
  variants: Array<{
    id: number
    size: {
      id: number
      name: string
    }
    availableStock: number
  }>
}

export interface ProductColorsResponse {
  data: ProductColor[]
  meta: {
    total: number
    page: number
    lastPage: number
    limit: number
    offset: number
    hasNextPage: boolean
    hasPreviousPage: boolean
  }
}

export type Gender = 'male' | 'female'

export interface CreateOutfitRequest {
  name: string
  productColorIds: number[]
  images?: string[]
  videos?: string[]
  gender: Gender
}

export interface OutfitProductColor {
  id: number
  multimedia: string[]
  pdfs: string[]
}

export interface Outfit {
  id: number
  name: string
  productColors: OutfitProductColor[]
  images?: string[]
  videos?: string[]
  gender: Gender
  createdAt?: string
  updatedAt?: string
}

export interface UpdateOutfitRequest {
  name?: string
  productColorIds?: number[]
  images?: string[]
  videos?: string[]
  gender?: Gender
}
