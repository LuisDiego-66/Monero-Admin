export interface VariantSize {
  size: string
  quantity: number
}

export interface Variant {
  id?: string
  multimedia: string[]
  variants: VariantSize[]
  colorName: string
  colorCode: string
  productId: number
  createdAt?: string
  updatedAt?: string
}

export interface CreateVariantDto {
  multimedia: string[]
  variants: VariantSize[]
  colorName: string
  colorCode: string
  productId: number
}

export interface UpdateVariantDto extends Partial<CreateVariantDto> {}

export interface Color {
  id: number
  name: string
  code: string
  enabled?: boolean
}

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
  filename: string
  originalName: string
}

export interface VariantsResponse {
  variants: Variant[]
  total?: number
}

export interface BrandsResponse {
  brands: Brand[]
  total?: number
}
