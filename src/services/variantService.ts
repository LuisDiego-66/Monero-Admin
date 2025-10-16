import { apiClient } from '@/libs/axios'
import type {
  Variant,
  CreateVariantDto,
  UpdateVariantDto,
  Color,
  Brand,
  CreateBrandDto,
  MultimediaUploadResponse,
  VariantsResponse,
  BrandsResponse,
  AddStockRequest,
  AddStockResponse
} from '@/types/api/variants'

class VariantServiceClass {
  async getVariantsByProduct(productId: number): Promise<VariantsResponse> {
    const response = await apiClient.get(`/api/products/${productId}`)

    const productColors = response.data.productColors || []

    return {
      variants: productColors,
      total: productColors.length
    }
  }
  async getVariantById(variantId: number): Promise<Variant> {
    const response = await apiClient.get(`/api/variants/${variantId}`)

    return response.data
  }
  async getColorById(colorId: number): Promise<Color> {
    const response = await apiClient.get<Color>(`/api/colors/${colorId}`)

    return response.data
  }

  async createVariant(data: CreateVariantDto): Promise<Variant> {
    const response = await apiClient.post<Variant>('/api/variants', data)

    return response.data
  }
  async addStock(data: AddStockRequest): Promise<AddStockResponse> {
    const response = await apiClient.post<AddStockResponse>('/api/variants/addstock', data)

    return response.data
  }

  async updateVariant(id: number, data: UpdateVariantDto): Promise<Variant> {
    const response = await apiClient.patch<Variant>(`/api/variants/${id}`, data)

    return response.data
  }

  async deleteVariant(id: number): Promise<void> {
    await apiClient.delete(`/api/variants/${id}`)
  }

  async uploadMultimedia(files: File[]): Promise<MultimediaUploadResponse[]> {
    const formData = new FormData()

    files.forEach(file => {
      formData.append('files', file)
    })

    const response = await apiClient.post<MultimediaUploadResponse[]>('/api/multimedia', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })

    return response.data
  }

  async getColors(): Promise<Color[]> {
    const response = await apiClient.get<Color[]>('/api/colors')

    return response.data
  }

  async getBrands(): Promise<BrandsResponse> {
    const response = await apiClient.get<Brand[]>('/api/brands')

    return {
      brands: response.data,
      total: response.data.length
    }
  }

  async createBrand(data: CreateBrandDto): Promise<Brand> {
    const response = await apiClient.post<Brand>('/api/brands', data)

    return response.data
  }
}

export const variantService = new VariantServiceClass()
