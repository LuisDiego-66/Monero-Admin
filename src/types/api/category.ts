export type Gender = 'male' | 'female' | 'unisex'

export interface Subcategory {
  id: number
  name: string
  enabled: boolean
  videos?: string[]
  categoryId: number
  displayOrder?: number
  createdAt?: string
  updatedAt?: string
}

export interface Category {
  id: number
  name: string
  gender: Gender
  image?: string | null
  displayOrder: number
  enabled: boolean
  subcategories: Subcategory[]
  createdAt?: string
  updatedAt?: string
}

export interface CreateCategoryDto {
  name: string
  gender: Gender
  image?: string
  displayOrder?: number
  enabled?: boolean
}

export interface UpdateCategoryDto extends Partial<CreateCategoryDto> {}

export interface CreateSubcategoryDto {
  name: string
  enabled?: boolean
  videos?: string[]
  category: number
}

export interface UpdateSubcategoryDto extends Partial<CreateSubcategoryDto> {}

export interface CategoriesResponse {
  categories: Category[]
  total?: number
  page?: number
  limit?: number
}

export interface SubcategoriesResponse {
  subcategories: Subcategory[]
  total?: number
  page?: number
  limit?: number
}

export interface CategoriesParams {
  limit?: number
  offset?: number
  gender?: Gender | 'all'
  enabled?: boolean
  search?: string
}

export interface SubcategoriesParams {
  limit?: number
  offset?: number
  categoryId?: number
  enabled?: boolean
  search?: string
}
