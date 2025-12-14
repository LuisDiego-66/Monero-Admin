'use client'

import { useState, useEffect, useCallback } from 'react'

import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'
import MenuItem from '@mui/material/MenuItem'
import Card from '@mui/material/Card'
import CardMedia from '@mui/material/CardMedia'
import IconButton from '@mui/material/IconButton'
import Skeleton from '@mui/material/Skeleton'

import CustomTextField from '@core/components/mui/TextField'
import {
  useCategory,
  useCreateCategory,
  useCreateSubcategory,
  useUpdateCategory,
  useUpdateSubcategory,
  useDeleteSubcategory,
  useDeleteMultimedia
} from '@/hooks/useCategory'
import { categoryService } from '@/services/categoryService'
import type { Gender } from '@/types/api/category'

interface CreateEditCategoryModalProps {
  open: boolean
  onClose: () => void
  categoryId?: number | null
  mode?: 'create' | 'edit'
  onSuccess: (message: string) => void
  onError: (message: string) => void
}

type SubcategoryData = {
  id?: number
  name: string
  enabled: boolean
  videos?: string[]
  videoFiles?: File[]
  isNew?: boolean
  isDeleted?: boolean
}

const CreateEditCategoryModal = ({
  open,
  onClose,
  categoryId,
  mode = 'create',
  onSuccess,
  onError
}: CreateEditCategoryModalProps) => {
  const [name, setName] = useState('')
  const [gender, setGender] = useState<Gender>('male')
  const [image, setImage] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>('')
  const [isDragging, setIsDragging] = useState(false)
  const [subcategorias, setSubcategorias] = useState<SubcategoryData[]>([{ name: '', enabled: true, isNew: true }])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isEditMode = mode === 'edit' && categoryId

  const createCategory = useCreateCategory()
  const createSubcategory = useCreateSubcategory()
  const updateCategory = useUpdateCategory()
  const updateSubcategory = useUpdateSubcategory()
  const deleteSubcategory = useDeleteSubcategory()
  const deleteMultimedia = useDeleteMultimedia()

  const {
    data: category,
    isLoading: isLoadingCategory,
    error: categoryError
  } = useCategory(isEditMode ? categoryId : 0)

  useEffect(() => {
    if (open && isEditMode && category) {
      setName(category.name)
      setGender(category.gender)
      setImage(category.image || '')
      setImagePreview(category.image || '')
      setImageFile(null)

      const subcatsWithFlags =
        category.subcategories?.map(sub => ({
          id: sub.id,
          name: sub.name,
          enabled: sub.enabled,
          videos: sub.videos || [],
          isNew: false,
          isDeleted: false
        })) || []

      setSubcategorias(subcatsWithFlags.length > 0 ? subcatsWithFlags : [{ name: '', enabled: true, isNew: true }])
    } else if (open && !isEditMode) {
      setName('')
      setGender('male')
      setImage('')
      setImagePreview('')
      setImageFile(null)
      setSubcategorias([{ name: '', enabled: true, isNew: true }])
    }
  }, [open, isEditMode, category])

  const validateImageFile = useCallback(
    (file: File): boolean => {
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']

      if (!validTypes.includes(file.type.toLowerCase())) {
        onError('Solo se permiten imágenes en formato JPG, JPEG, PNG o WEBP')

        return false
      }

      if (file.size > 2 * 1024 * 1024) {
        onError('La imagen no debe superar los 2MB')

        return false
      }

      return true
    },
    [onError]
  )

  const validateVideoFile = useCallback(
    (file: File): boolean => {
      if (file.type !== 'video/mp4') {
        onError('Solo se permiten videos en formato MP4')

        return false
      }

      if (file.size > 3 * 1024 * 1024) {
        onError('El video no debe superar los 3MB')

        return false
      }

      return true
    },
    [onError]
  )

  const processImageFile = useCallback(
    (file: File) => {
      if (!validateImageFile(file)) return

      setImageFile(file)
      const reader = new FileReader()

      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }

      reader.readAsDataURL(file)
    },
    [validateImageFile]
  )

  const handleImageChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]

      if (file) {
        processImageFile(file)
      }
    },
    [processImageFile]
  )

  const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragging(false)

      const file = e.dataTransfer.files?.[0]

      if (file) {
        processImageFile(file)
      }
    },
    [processImageFile]
  )

  const handleRemoveImage = useCallback(async () => {
    // Si hay una imagen existente (URL), eliminarla del servidor
    if (image && !imageFile) {
      try {
        await deleteMultimedia.mutateAsync([image])
      } catch (error) {
        console.error('Error deleting image:', error)
      }
    }

    setImageFile(null)
    setImagePreview('')
    setImage('')
  }, [image, imageFile, deleteMultimedia])

  const handleVideoChange = useCallback(
    (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]

      if (file && validateVideoFile(file)) {
        const nuevasSubcategorias = [...subcategorias]

        nuevasSubcategorias[index] = {
          ...nuevasSubcategorias[index],
          videoFiles: [file]
        }
        setSubcategorias(nuevasSubcategorias)
      }
    },
    [subcategorias, validateVideoFile]
  )

  const handleRemoveVideo = useCallback(
    async (index: number) => {
      const subcategoria = subcategorias[index]

      // Si hay un video existente (URL), eliminarla del servidor
      if (subcategoria.videos && subcategoria.videos.length > 0 && !subcategoria.videoFiles) {
        try {
          await deleteMultimedia.mutateAsync(subcategoria.videos)
        } catch (error) {
          console.error('Error deleting video:', error)
        }
      }

      const nuevasSubcategorias = [...subcategorias]

      nuevasSubcategorias[index] = {
        ...nuevasSubcategorias[index],
        videoFiles: undefined,
        videos: []
      }
      setSubcategorias(nuevasSubcategorias)
    },
    [subcategorias, deleteMultimedia]
  )

  const añadirSubcategoria = () => {
    setSubcategorias([...subcategorias, { name: '', enabled: true, isNew: true }])
  }

  const actualizarSubcategoria = (index: number, campo: string, valor: string | boolean) => {
    const nuevasSubcategorias = [...subcategorias]

    if (campo === 'name') {
      nuevasSubcategorias[index].name = valor as string
    } else {
      nuevasSubcategorias[index] = { ...nuevasSubcategorias[index], [campo]: valor }
    }

    setSubcategorias(nuevasSubcategorias)
  }

  const eliminarSubcategoria = (index: number) => {
    const subcategoria = subcategorias[index]

    if (subcategoria.isNew) {
      if (subcategorias.filter(sub => !sub.isDeleted).length > 1) {
        const nuevasSubcategorias = subcategorias.filter((_, i) => i !== index)

        setSubcategorias(nuevasSubcategorias)
      }
    } else {
      const nuevasSubcategorias = [...subcategorias]

      nuevasSubcategorias[index] = { ...subcategoria, isDeleted: true }
      setSubcategorias(nuevasSubcategorias)
    }
  }

  const restaurarSubcategoria = (index: number) => {
    const nuevasSubcategorias = [...subcategorias]

    nuevasSubcategorias[index] = { ...nuevasSubcategorias[index], isDeleted: false }
    setSubcategorias(nuevasSubcategorias)
  }

  const handleSubmit = async () => {
    if (!name.trim()) {
      onError('El nombre de la categoría es obligatorio')

      return
    }

    setIsSubmitting(true)

    try {
      let uploadedImageUrl = image

      // Si hay un nuevo archivo de imagen, eliminar el anterior y subir el nuevo
      if (imageFile) {
        if (image) {
          try {
            await deleteMultimedia.mutateAsync([image])
          } catch (error) {
            console.error('Error deleting old image:', error)
          }
        }

        const uploadResult = await categoryService.uploadImage(imageFile)

        uploadedImageUrl = uploadResult.url
      }

      if (isEditMode && categoryId) {
        await updateCategory.mutateAsync({
          id: categoryId,
          data: {
            name,
            gender,
            image: uploadedImageUrl || undefined
          }
        })

        const subcategoriesPromises = []

        for (const subcat of subcategorias) {
          if (subcat.isDeleted && subcat.id) {
            subcategoriesPromises.push(deleteSubcategory.mutateAsync({ id: subcat.id, categoryId }))
          } else if (subcat.isNew && subcat.name.trim()) {
            let videoUrls: string[] = []

            if (subcat.videoFiles && subcat.videoFiles.length > 0) {
              const uploadResult = await categoryService.uploadVideo(subcat.videoFiles[0])

              videoUrls = [uploadResult.url]
            }

            subcategoriesPromises.push(
              createSubcategory.mutateAsync({
                name: subcat.name,
                enabled: subcat.enabled,
                videos: videoUrls.length > 0 ? videoUrls : undefined,
                category: categoryId
              })
            )
          } else if (!subcat.isNew && !subcat.isDeleted && subcat.id && subcat.name.trim()) {
            let videoUrls = subcat.videos || []

            // Si hay un nuevo video, eliminar el anterior
            if (subcat.videoFiles && subcat.videoFiles.length > 0) {
              if (subcat.videos && subcat.videos.length > 0) {
                try {
                  await deleteMultimedia.mutateAsync(subcat.videos)
                } catch (error) {
                  console.error('Error deleting old video:', error)
                }
              }

              const uploadResult = await categoryService.uploadVideo(subcat.videoFiles[0])

              videoUrls = [uploadResult.url]
            }

            subcategoriesPromises.push(
              updateSubcategory.mutateAsync({
                id: subcat.id,
                data: {
                  name: subcat.name,
                  enabled: subcat.enabled,
                  videos: videoUrls.length > 0 ? videoUrls : [],
                  category: categoryId
                }
              })
            )
          }
        }

        await Promise.all(subcategoriesPromises)
        onSuccess('Categoría actualizada exitosamente')
      } else {
        const subcategoriasValidas = subcategorias.filter(sub => sub.name.trim() !== '')

        const newCategory = await createCategory.mutateAsync({
          name,
          gender,
          image: uploadedImageUrl || undefined
        })

        if (subcategoriasValidas.length > 0) {
          const subcategoryPromises = subcategoriasValidas.map(async subcatData => {
            let videoUrls: string[] = []

            if (subcatData.videoFiles && subcatData.videoFiles.length > 0) {
              const uploadResult = await categoryService.uploadVideo(subcatData.videoFiles[0])

              videoUrls = [uploadResult.url]
            }

            return createSubcategory.mutateAsync({
              name: subcatData.name,
              enabled: subcatData.enabled,
              videos: videoUrls.length > 0 ? videoUrls : undefined,
              category: newCategory.id
            })
          })

          await Promise.all(subcategoryPromises)
        }

        onSuccess('Categoría creada exitosamente')
      }

      handleReset()
    } catch (error) {
      console.error('Error creating/updating category:', error)

      let errorMessage = isEditMode ? 'Error al actualizar la categoría' : 'Error al crear la categoría'

      if (error instanceof Error) {
        errorMessage = error.message
      }

      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as any

        if (axiosError.response?.data?.message) {
          errorMessage = axiosError.response.data.message
        } else if (axiosError.response?.data?.error) {
          errorMessage = axiosError.response.data.error
        }
      }

      onError(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReset = () => {
    onClose()
    setName('')
    setGender('male')
    setImage('')
    setImagePreview('')
    setImageFile(null)
    setSubcategorias([{ name: '', enabled: true, isNew: true }])
  }

  return (
    <Dialog open={open} onClose={handleReset} maxWidth='md' fullWidth>
      <DialogTitle>{isEditMode ? 'Editar Categoría' : 'Registrar Categoría'}</DialogTitle>
      <DialogContent>
        {isEditMode && isLoadingCategory ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <Skeleton variant='rectangular' height={56} />
            <Skeleton variant='rectangular' height={56} />
            <Skeleton variant='rectangular' height={200} />
          </Box>
        ) : isEditMode && categoryError ? (
          <Alert severity='error' sx={{ mt: 2 }}>
            Error al cargar la categoría: {categoryError instanceof Error ? categoryError.message : 'Error desconocido'}
          </Alert>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 2 }}>
            <CustomTextField
              select
              fullWidth
              label='Género'
              value={gender}
              onChange={e => setGender(e.target.value as Gender)}
            >
              <MenuItem value='male'>Hombres</MenuItem>
              <MenuItem value='female'>Mujeres</MenuItem>
            </CustomTextField>

            <CustomTextField
              fullWidth
              label='Nombre de la categoría'
              placeholder='Ingrese el nombre de la categoría'
              value={name}
              onChange={e => setName(e.target.value)}
            />

            <Box>
              <Typography variant='subtitle2' sx={{ mb: 1 }}>
                Imagen de la categoría (opcional)
              </Typography>
              <Box
                onDragEnter={handleDragEnter}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                sx={{
                  border: '2px dashed',
                  borderColor: isDragging ? 'primary.main' : 'divider',
                  borderRadius: 1,
                  p: 3,
                  textAlign: 'center',
                  backgroundColor: isDragging ? 'action.hover' : 'background.paper',
                  transition: 'all 0.2s',
                  cursor: 'pointer'
                }}
              >
                {imagePreview ? (
                  <Card sx={{ maxWidth: 300, margin: '0 auto', position: 'relative' }}>
                    <CardMedia component='img' height='200' image={imagePreview} alt='Vista previa' />
                    <IconButton
                      onClick={handleRemoveImage}
                      sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        backgroundColor: 'background.paper'
                      }}
                    >
                      <i className='tabler-x' />
                    </IconButton>
                  </Card>
                ) : (
                  <label htmlFor='category-image-upload' style={{ cursor: 'pointer', display: 'block' }}>
                    <input
                      id='category-image-upload'
                      type='file'
                      accept='image/jpeg,image/jpg,image/png,image/webp'
                      style={{ display: 'none' }}
                      onChange={handleImageChange}
                    />
                    <Box sx={{ py: 4 }}>
                      <i className='tabler-upload' style={{ fontSize: '3rem', opacity: 0.5 }} />
                      <Typography variant='body1' sx={{ mt: 2 }}>
                        Arrastra una imagen aquí o haz clic para seleccionar
                      </Typography>
                      <Typography variant='caption' color='text.secondary'>
                        Máximo 2MB - Formatos: JPG, JPEG, PNG, WEBP
                      </Typography>
                    </Box>
                  </label>
                )}
              </Box>
            </Box>

            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant='h6'>Subcategorías</Typography>
                <Button variant='contained' size='small' onClick={añadirSubcategoria}>
                  Añadir Subcategoría
                </Button>
              </Box>

              {!isEditMode && (
                <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
                  (Las subcategorías vacías no serán añadidas)
                </Typography>
              )}

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {subcategorias
                  .filter(sub => !sub.isDeleted)
                  .map((subcategoria, index) => (
                    <Card key={subcategoria.id || `new-${index}`} variant='outlined' sx={{ p: 2 }}>
                      <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                        <CustomTextField
                          fullWidth
                          label={`Subcategoría ${index + 1}`}
                          placeholder='Nombre de la subcategoría'
                          value={subcategoria.name}
                          onChange={e => actualizarSubcategoria(index, 'name', e.target.value)}
                        />
                        {(subcategorias.filter(sub => !sub.isDeleted).length > 1 || isEditMode) && (
                          <IconButton size='small' onClick={() => eliminarSubcategoria(index)} color='error'>
                            <i className='tabler-trash' />
                          </IconButton>
                        )}
                      </Box>

                      <Box sx={{ mt: 2 }}>
                        <Typography variant='caption' color='text.secondary' sx={{ mb: 1, display: 'block' }}>
                          Video (opcional, máximo 3MB, solo MP4)
                        </Typography>
                        {subcategoria.videoFiles && subcategoria.videoFiles.length > 0 ? (
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1,
                              p: 1.5,
                              bgcolor: 'success.lighter',
                              borderRadius: 1,
                              border: '1px solid',
                              borderColor: 'success.main'
                            }}
                          >
                            <i className='tabler-video' style={{ fontSize: '1.25rem', color: 'green' }} />
                            <Typography variant='body2' sx={{ flex: 1, fontWeight: 500 }}>
                              {subcategoria.videoFiles[0].name}
                            </Typography>
                            <IconButton size='small' onClick={() => handleRemoveVideo(index)} color='error'>
                              <i className='tabler-x' />
                            </IconButton>
                          </Box>
                        ) : subcategoria.videos && subcategoria.videos.length > 0 ? (
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1,
                              p: 1.5,
                              bgcolor: 'primary.lighter',
                              borderRadius: 1,
                              border: '1px solid',
                              borderColor: 'primary.main'
                            }}
                          >
                            <i className='tabler-video' style={{ fontSize: '1.25rem' }} />
                            <Typography variant='body2' sx={{ flex: 1, fontWeight: 500, color: 'primary.main' }}>
                              Video cargado (MP4)
                            </Typography>
                            <IconButton size='small' onClick={() => handleRemoveVideo(index)} color='error'>
                              <i className='tabler-trash' />
                            </IconButton>
                          </Box>
                        ) : (
                          <Button
                            variant='outlined'
                            component='label'
                            size='small'
                            startIcon={<i className='tabler-upload' />}
                          >
                            Seleccionar Video MP4
                            <input type='file' accept='video/mp4' hidden onChange={e => handleVideoChange(index, e)} />
                          </Button>
                        )}
                      </Box>
                    </Card>
                  ))}

                {isEditMode && subcategorias.filter(sub => sub.isDeleted).length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant='subtitle2' color='text.secondary' sx={{ mb: 1 }}>
                      Subcategorías eliminadas (se eliminarán al guardar):
                    </Typography>
                    {subcategorias
                      .filter(sub => sub.isDeleted)
                      .map((subcategoria, index) => (
                        <Box
                          key={subcategoria.id}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            p: 2,
                            bgcolor: 'action.hover',
                            borderRadius: 1,
                            mb: 1
                          }}
                        >
                          <Typography variant='body2' sx={{ textDecoration: 'line-through', color: 'text.disabled' }}>
                            {subcategoria.name}
                          </Typography>
                          <Button
                            size='small'
                            onClick={() => restaurarSubcategoria(subcategorias.findIndex(s => s === subcategoria))}
                          >
                            Restaurar
                          </Button>
                        </Box>
                      ))}
                  </Box>
                )}
              </Box>
            </Box>
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={handleReset} variant='outlined' color='secondary' disabled={isSubmitting}>
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit}
          variant='contained'
          disabled={isSubmitting || !name.trim()}
          startIcon={isSubmitting ? <CircularProgress size={16} /> : undefined}
        >
          {isSubmitting ? (isEditMode ? 'Actualizando...' : 'Registrando...') : isEditMode ? 'Actualizar' : 'Registrar'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default CreateEditCategoryModal
