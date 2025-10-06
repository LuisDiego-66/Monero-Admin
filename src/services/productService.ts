import { apiClient } from '@/libs/axios'
import type { Product, CreateProductDto, UpdateProductDto } from '@/types/api/product'

class ProductServiceClass {
  async getProducts(): Promise<Product[]> {
    const response = await apiClient.get<Product[]>('/api/products')

    console.log('Fetched products:', response.data)

    return response.data
  }

  async getProductById(id: number): Promise<Product> {
    const response = await apiClient.get<Product>(`/api/products/${id}`)

    return response.data
  }

  async createProduct(data: CreateProductDto): Promise<Product> {
    const response = await apiClient.post<Product>('/api/products', data)

    return response.data
  }

  async updateProduct(id: number, data: UpdateProductDto): Promise<Product> {
    const response = await apiClient.patch<Product>(`/api/products/${id}`, data)

    return response.data
  }

  async deleteProduct(id: number): Promise<void> {
    await apiClient.delete(`/api/products/${id}`)
  }
}

export const productService = new ProductServiceClass()
