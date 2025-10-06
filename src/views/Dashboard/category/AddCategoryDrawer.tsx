'use client'

import { useState, useEffect } from 'react'

import Button from '@mui/material/Button'
import Drawer from '@mui/material/Drawer'
import IconButton from '@mui/material/IconButton'
import MenuItem from '@mui/material/MenuItem'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import Box from '@mui/material/Box'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'
import Skeleton from '@mui/material/Skeleton'
import { useForm, Controller } from 'react-hook-form'

import CustomTextField from '@core/components/mui/TextField'
import {
  useCategory,
  useCreateCategory,
  useCreateSubcategory,
  useUpdateCategory,
  useUpdateSubcategory,
  useDeleteSubcategory
} from '@/hooks/useCategory'
import type { Gender } from '@/types/api/category'

type Props = {
  open: boolean
  handleClose: () => void
  categoryId?: number | null
  mode?: 'create' | 'edit'
}

type FormValues = {
  gender: Gender
  name: string
  enabled?: boolean
  subcategories: string[]
}

type SubcategoryData = {
  id?: number
  name: string
  enabled: boolean
  isNew?: boolean
  isDeleted?: boolean
}

const AddCategoryDrawer = ({ open, handleClose, categoryId, mode = 'create' }: Props) => {
  const [subcategorias, setSubcategorias] = useState<SubcategoryData[]>([{ name: '', enabled: true, isNew: true }])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const isEditMode = mode === 'edit' && categoryId

  const createCategory = useCreateCategory()
  const createSubcategory = useCreateSubcategory()
  const updateCategory = useUpdateCategory()
  const updateSubcategory = useUpdateSubcategory()
  const deleteSubcategory = useDeleteSubcategory()

  const {
    data: category,
    isLoading: isLoadingCategory,
    error: categoryError
  } = useCategory(isEditMode ? categoryId : 0)

  const {
    control,
    reset: resetForm,
    handleSubmit,
    formState: { errors }
  } = useForm<FormValues>({
    defaultValues: {
      gender: 'male',
      name: '',
      enabled: true,
      subcategories: ['']
    }
  })

  useEffect(() => {
    if (isEditMode && category && open) {
      resetForm({
        gender: category.gender,
        name: category.name,
        enabled: category.enabled,
        subcategories: ['']
      })

      const subcatsWithFlags =
        category.subcategories?.map(sub => ({
          id: sub.id,
          name: sub.name,
          enabled: sub.enabled,
          isNew: false,
          isDeleted: false
        })) || []

      setSubcategorias(subcatsWithFlags.length > 0 ? subcatsWithFlags : [{ name: '', enabled: true, isNew: true }])
    } else if (!isEditMode && open) {
      resetForm({
        gender: 'male',
        name: '',
        enabled: true,
        subcategories: ['']
      })
      setSubcategorias([{ name: '', enabled: true, isNew: true }])
    }
  }, [category, open, isEditMode, resetForm])

  const handleFormSubmit = async (data: FormValues) => {
    setIsSubmitting(true)
    setSubmitError(null)

    try {
      if (isEditMode && categoryId) {
        await updateCategory.mutateAsync({
          id: categoryId,
          data: {
            name: data.name,
            gender: data.gender
          }
        })

        const subcategoriesPromises = []

        for (const subcat of subcategorias) {
          if (subcat.isDeleted && subcat.id) {
            subcategoriesPromises.push(deleteSubcategory.mutateAsync(subcat.id))
          } else if (subcat.isNew && subcat.name.trim()) {
            subcategoriesPromises.push(
              createSubcategory.mutateAsync({
                name: subcat.name,
                enabled: subcat.enabled,
                category: categoryId
              })
            )
          } else if (!subcat.isNew && !subcat.isDeleted && subcat.id && subcat.name.trim()) {
            subcategoriesPromises.push(
              updateSubcategory.mutateAsync({
                id: subcat.id,
                data: {
                  name: subcat.name,
                  enabled: subcat.enabled,
                  category: categoryId
                }
              })
            )
          }
        }

        await Promise.all(subcategoriesPromises)
      } else {
        const subcategoriasValidas = subcategorias.filter(sub => sub.name.trim() !== '')

        const newCategory = await createCategory.mutateAsync({
          name: data.name,
          gender: data.gender
        })

        if (subcategoriasValidas.length > 0) {
          const subcategoryPromises = subcategoriasValidas.map(subcatData =>
            createSubcategory.mutateAsync({
              name: subcatData.name,
              enabled: subcatData.enabled,
              category: newCategory.id
            })
          )

          await Promise.all(subcategoryPromises)
        }
      }

      handleReset()
    } catch (error) {
      console.error('Error creating category:', error)

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
        } else if (axiosError.response?.status === 400) {
          errorMessage = 'Datos inválidos. Verifique que todos los campos sean correctos.'
        }
      }

      setSubmitError(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReset = () => {
    handleClose()
    resetForm({
      gender: 'male',
      name: '',
      enabled: true,
      subcategories: ['']
    })
    setSubcategorias([{ name: '', enabled: true, isNew: true }])
    setSubmitError(null)
  }

  const añadirSubcategoria = () => {
    setSubcategorias([...subcategorias, { name: '', enabled: true, isNew: true }])
  }

  const actualizarSubcategoria = (index: number, campo: keyof SubcategoryData | 'valor', valor: string | boolean) => {
    const nuevasSubcategorias = [...subcategorias]

    if (campo === 'valor') {
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

  return (
    <Drawer
      open={open}
      anchor='right'
      variant='temporary'
      onClose={handleReset}
      ModalProps={{ keepMounted: true }}
      sx={{ '& .MuiDrawer-paper': { width: { xs: 300, sm: 400 } } }}
    >
      <div className='flex items-center justify-between pli-6 plb-5'>
        <Typography variant='h5'>{isEditMode ? 'Editar Categoría' : 'Registrar Categoría'}</Typography>
        <IconButton size='small' onClick={handleReset}>
          <i className='tabler-x text-textSecondary text-2xl' />
        </IconButton>
      </div>
      <Divider />

      <div className='p-6'>
        {isEditMode && isLoadingCategory ? (
          <div className='flex flex-col gap-4'>
            <Skeleton variant='rectangular' height={56} />
            <Skeleton variant='rectangular' height={56} />
            <Skeleton variant='rectangular' height={56} />
          </div>
        ) : isEditMode && categoryError ? (
          <Alert severity='error'>
            Error al cargar la categoría: {categoryError instanceof Error ? categoryError.message : 'Error desconocido'}
          </Alert>
        ) : (
          <form onSubmit={handleSubmit(handleFormSubmit)} className='flex flex-col gap-5'>
            <Controller
              name='gender'
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <CustomTextField
                  {...field}
                  select
                  fullWidth
                  label='Género'
                  {...(errors.gender && { error: true, helperText: 'Este campo es obligatorio.' })}
                >
                  <MenuItem value='male'>Hombres</MenuItem>
                  <MenuItem value='female'>Mujeres</MenuItem>
                </CustomTextField>
              )}
            />

            <Controller
              name='name'
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <CustomTextField
                  {...field}
                  fullWidth
                  label='Nombre de la categoría'
                  placeholder='Ingrese el nombre de la categoría'
                  {...(errors.name && { error: true, helperText: 'Este campo es obligatorio.' })}
                />
              )}
            />

            {/*     {isEditMode && (
              <Controller
                name='enabled'
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    select
                    fullWidth
                    label='Estado'
                    value={field.value ? 'true' : 'false'}
                    onChange={e => field.onChange(e.target.value === 'true')}
                  >
                    <MenuItem value='true'>Activo</MenuItem>
                    <MenuItem value='false'>Inactivo</MenuItem>
                  </CustomTextField>
                )}
              />
            )} */}

            <div>
              <div className='flex items-center justify-between mb-3'>
                <Typography variant='h6' className='text-base font-medium'>
                  Subcategorías
                </Typography>
                <Button variant='contained' size='small' onClick={añadirSubcategoria} className='min-w-fit'>
                  Añadir Subcategoría
                </Button>
              </div>

              {!isEditMode && (
                <Typography variant='body2' className='text-textSecondary mb-3'>
                  (Las subcategorías vacías no serán añadidas)
                </Typography>
              )}

              <Box className='flex flex-col gap-3'>
                {subcategorias
                  .filter(sub => !sub.isDeleted)
                  .map((subcategoria, index) => (
                    <div key={subcategoria.id || `new-${index}`} className='flex items-center gap-2'>
                      <div className='flex-1 flex gap-2'>
                        <CustomTextField
                          fullWidth
                          label={isEditMode ? 'Nombre' : `Subcategoría ${index + 1}`}
                          placeholder='Nombre de la subcategoría'
                          value={subcategoria.name}
                          onChange={e => actualizarSubcategoria(index, 'valor', e.target.value)}
                        />
                        {/* {isEditMode && (
                          <CustomTextField
                            select
                            label='Estado'
                            value={subcategoria.enabled ? 'true' : 'false'}
                            onChange={e => actualizarSubcategoria(index, 'enabled', e.target.value === 'true')}
                            sx={{ minWidth: 100 }}
                          >
                            <MenuItem value='true'>Activo</MenuItem>
                            <MenuItem value='false'>Inactivo</MenuItem>
                          </CustomTextField>
                        )} */}
                      </div>
                      {(subcategorias.filter(sub => !sub.isDeleted).length > 1 || isEditMode) && (
                        <IconButton size='small' onClick={() => eliminarSubcategoria(index)} className='text-error'>
                          <i className={isEditMode ? 'tabler-trash' : 'tabler-x'} />
                        </IconButton>
                      )}
                    </div>
                  ))}

                {isEditMode && subcategorias.filter(sub => sub.isDeleted).length > 0 && (
                  <div className='mt-4'>
                    <Typography variant='subtitle2' color='text.secondary' className='mb-2'>
                      Subcategorías eliminadas (se eliminarán al guardar):
                    </Typography>
                    {subcategorias
                      .filter(sub => sub.isDeleted)
                      .map((subcategoria, index) => (
                        <div
                          key={subcategoria.id}
                          className='flex items-center justify-between p-2 bg-gray-50 rounded mb-2'
                        >
                          <Typography variant='body2' className='line-through text-gray-500'>
                            {subcategoria.name}
                          </Typography>
                          <Button
                            size='small'
                            onClick={() => restaurarSubcategoria(subcategorias.findIndex(s => s === subcategoria))}
                          >
                            Restaurar
                          </Button>
                        </div>
                      ))}
                  </div>
                )}
              </Box>
            </div>

            {submitError && (
              <Alert severity='error' sx={{ mt: 2 }}>
                <Typography variant='body2'>{submitError}</Typography>
              </Alert>
            )}

            <div className='flex items-center gap-4 mt-4'>
              <Button
                variant='contained'
                type='submit'
                fullWidth
                disabled={isSubmitting}
                startIcon={isSubmitting ? <CircularProgress size={16} /> : undefined}
              >
                {isSubmitting
                  ? isEditMode
                    ? 'Actualizando...'
                    : 'Registrando...'
                  : isEditMode
                    ? 'Actualizar'
                    : 'Registrar'}
              </Button>
              <Button variant='outlined' color='error' type='reset' onClick={handleReset} disabled={isSubmitting}>
                Cancelar
              </Button>
            </div>
          </form>
        )}
      </div>
    </Drawer>
  )
}

export default AddCategoryDrawer
