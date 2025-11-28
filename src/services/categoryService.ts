import { apiClient } from '@/libs/axios'
import type {
  Category,
  Subcategory,
  CreateCategoryDto,
  UpdateCategoryDto,
  CreateSubcategoryDto,
  UpdateSubcategoryDto,
  CategoriesParams,
  SubcategoriesParams
} from '@/types/api/category'

class CategoryServiceClass {
  async getCategories(params: CategoriesParams = {}): Promise<Category[]> {
    const { gender, enabled, search } = params

    const searchParams = new URLSearchParams()

    if (gender && gender !== 'all') {
      searchParams.append('gender', gender)
    }

    if (enabled !== undefined) {
      searchParams.append('enabled', enabled.toString())
    }

    if (search) {
      searchParams.append('search', search)
    }

    const queryString = searchParams.toString()
    const url = queryString ? `/api/categories?${queryString}` : '/api/categories'

    const response = await apiClient.get<Category[]>(url)

    return response.data
  }

  async getCategoryById(id: number): Promise<Category> {
    const response = await apiClient.get<Category>(`/api/categories/${id}`)

    return response.data
  }

  async createCategory(data: CreateCategoryDto): Promise<Category> {
    const response = await apiClient.post<Category>('/api/categories', data)

    return response.data
  }

  async updateCategory(id: number, data: UpdateCategoryDto): Promise<Category> {
    const response = await apiClient.patch<Category>(`/api/categories/${id}`, data)

    return response.data
  }

  async updateCategoryOrder(id: number, newOrder: number): Promise<Category> {
    const response = await apiClient.put<Category>(`/api/categories/${id}`, { newOrder })

    return response.data
  }

  async deleteCategory(id: number): Promise<void> {
    await apiClient.delete(`/api/categories/${id}`)
  }

  async getSubcategories(params: SubcategoriesParams = {}): Promise<Subcategory[]> {
    const { categoryId, enabled, search } = params

    const searchParams = new URLSearchParams()

    if (categoryId) {
      searchParams.append('categoryId', categoryId.toString())
    }

    if (enabled !== undefined) {
      searchParams.append('enabled', enabled.toString())
    }

    if (search) {
      searchParams.append('search', search)
    }

    const queryString = searchParams.toString()
    const url = queryString ? `/api/subcategories?${queryString}` : '/api/subcategories'

    const response = await apiClient.get<Subcategory[]>(url)

    return response.data
  }

  async getSubcategoryById(id: number): Promise<Subcategory> {
    const response = await apiClient.get<Subcategory>(`/api/subcategories/${id}`)

    return response.data
  }

  async createSubcategory(data: CreateSubcategoryDto): Promise<Subcategory> {
    const response = await apiClient.post<Subcategory>('/api/subcategories', data)

    return response.data
  }

  async updateSubcategory(id: number, data: UpdateSubcategoryDto): Promise<Subcategory> {
    const response = await apiClient.patch<Subcategory>(`/api/subcategories/${id}`, data)

    return response.data
  }

  async deleteSubcategory(id: number): Promise<void> {
    await apiClient.delete(`/api/subcategories/${id}`)
  }

  async getSubcategoriesByCategory(categoryId: number): Promise<Subcategory[]> {
    const response = await apiClient.get<Subcategory[]>(`/api/categories/${categoryId}/subcategories`)

    return response.data
  }

  async uploadImage(file: File): Promise<{ url: string }> {
    const formData = new FormData()

    formData.append('files', file)

    const response = await apiClient.post<string[]>('/api/multimedia', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })

    return { url: response.data[0] }
  }

  async uploadVideo(file: File): Promise<{ url: string }> {
    const formData = new FormData()

    formData.append('files', file)

    const response = await apiClient.post<string[]>('/api/multimedia', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })

    return { url: response.data[0] }
  }

  async deleteMultimedia(urls: string[]): Promise<void> {
    await apiClient.delete('/api/multimedia', {
      data: urls
    })
  }
}

export const categoryService = new CategoryServiceClass()
