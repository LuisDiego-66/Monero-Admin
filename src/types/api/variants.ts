export interface VariantSize {
  id?: number
  size:
    | {
        id: number
        name: string
      }
    | string
  availableStock?: number
  quantity?: number
}

export interface Color {
  id: number
  name: string
  code: string
  enabled?: boolean
}

export interface Variant {
  id?: number
  multimedia: string[]
  pdfs: string[]
  color: Color
  colorName?: string
  colorCode?: string
  variants: VariantSize[]
  product?: any
  productId?: number
  createdAt?: string
  updatedAt?: string
}

export interface CreateVariantDto {
  multimedia: string[]
  pdfs: string[]
  variants: {
    size: string
    quantity: number
  }[]
  colorName: string
  colorCode: string
  productId: number
}

export interface UpdateVariantDto extends Partial<CreateVariantDto> {}

export interface Brand {
  id: number
  name: string
  description: string
  enabled?: boolean
}

export interface CreateBrandDto {
  name: string
  description: string
}

export interface MultimediaUploadResponse {
  url: string
  filename?: string
  originalName?: string
}

export interface VariantsResponse {
  variants: Variant[]
  total?: number
}

export interface BrandsResponse {
  brands: Brand[]
  total?: number
}
