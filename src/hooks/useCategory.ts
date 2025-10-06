'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

import { categoryService } from '@/services/categoryService'
import type {
  CategoriesParams,
  SubcategoriesParams,
  CreateCategoryDto,
  UpdateCategoryDto,
  CreateSubcategoryDto,
  UpdateSubcategoryDto
} from '@/types/api/category'

export const useCategories = (params: CategoriesParams = {}) => {
  return useQuery({
    queryKey: ['categories', params],
    queryFn: () => categoryService.getCategories(params),

    staleTime: 5 * 60 * 1000,
    retry: (failureCount, error) => {
      if (error instanceof Error && error.message.includes('401')) {
        return false
      }

      return failureCount < 2
    }
  })
}

export const useCategory = (id: number) => {
  return useQuery({
    queryKey: ['category', id],
    queryFn: () => categoryService.getCategoryById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000
  })
}

export const useCreateCategory = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateCategoryDto) => categoryService.createCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
    },
    onError: error => {
      console.error('Error creating category:', error)
    }
  })
}

export const useUpdateCategory = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateCategoryDto }) => categoryService.updateCategory(id, data),
    onSuccess: updatedCategory => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      queryClient.invalidateQueries({ queryKey: ['category', updatedCategory.id] })
    },
    onError: error => {
      console.error('Error updating category:', error)
    }
  })
}

export const useUpdateCategoryOrder = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, newOrder }: { id: number; newOrder: number }) =>
      categoryService.updateCategoryOrder(id, newOrder),
    onSuccess: updatedCategory => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      queryClient.invalidateQueries({ queryKey: ['category', updatedCategory.id] })
    },
    onError: error => {
      console.error('Error updating category order:', error)
    }
  })
}

export const useDeleteCategory = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => categoryService.deleteCategory(id),
    onSuccess: (_, deletedId) => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      queryClient.removeQueries({ queryKey: ['category', deletedId] })
    },
    onError: error => {
      console.error('Error deleting category:', error)
    }
  })
}

export const useSubcategories = (params: SubcategoriesParams = {}) => {
  return useQuery({
    queryKey: ['subcategories', params],
    queryFn: () => categoryService.getSubcategories(params),
    placeholderData: previousData => previousData,
    staleTime: 5 * 60 * 1000,
    retry: (failureCount, error) => {
      if (error instanceof Error && error.message.includes('401')) {
        return false
      }

      return failureCount < 2
    }
  })
}

export const useSubcategoriesByCategory = (categoryId: number) => {
  return useQuery({
    queryKey: ['subcategories', 'category', categoryId],
    queryFn: () => categoryService.getSubcategoriesByCategory(categoryId),
    enabled: !!categoryId,
    staleTime: 5 * 60 * 1000
  })
}

export const useSubcategory = (id: number) => {
  return useQuery({
    queryKey: ['subcategory', id],
    queryFn: () => categoryService.getSubcategoryById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000
  })
}

export const useCreateSubcategory = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateSubcategoryDto) => categoryService.createSubcategory(data),
    onSuccess: newSubcategory => {
      queryClient.invalidateQueries({ queryKey: ['subcategories'] })
      queryClient.invalidateQueries({ queryKey: ['subcategories', 'category', newSubcategory.categoryId] })
      queryClient.invalidateQueries({ queryKey: ['categories'] })
    },
    onError: error => {
      console.error('Error creating subcategory:', error)
    }
  })
}

export const useUpdateSubcategory = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateSubcategoryDto }) =>
      categoryService.updateSubcategory(id, data),
    onSuccess: updatedSubcategory => {
      queryClient.invalidateQueries({ queryKey: ['subcategories'] })
      queryClient.invalidateQueries({ queryKey: ['subcategory', updatedSubcategory.id] })
      queryClient.invalidateQueries({ queryKey: ['subcategories', 'category', updatedSubcategory.categoryId] })
    },
    onError: error => {
      console.error('Error updating subcategory:', error)
    }
  })
}

export const useDeleteSubcategory = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => categoryService.deleteSubcategory(id),
    onSuccess: (_, deletedId) => {
      queryClient.invalidateQueries({ queryKey: ['subcategories'] })
      queryClient.removeQueries({ queryKey: ['subcategory', deletedId] })
      queryClient.invalidateQueries({ queryKey: ['categories'] })
    },
    onError: error => {
      console.error('Error deleting subcategory:', error)
    }
  })
}
