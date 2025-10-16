import { useState, useRef, useEffect } from 'react'

import { useRouter } from 'next/navigation'

import Grid from '@mui/material/Grid2'
import Button from '@mui/material/Button'
import MenuItem from '@mui/material/MenuItem'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Alert from '@mui/material/Alert'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import { useQueryClient } from '@tanstack/react-query'

import CircularProgress from '@mui/material/CircularProgress'
import { toast } from 'react-toastify'
import { HexColorPicker } from 'react-colorful'

import { z } from 'zod'

import DirectionalIcon from '@components/DirectionalIcon'
import CustomTextField from '@core/components/mui/TextField'
import {
  useColors,
  useUploadMultimedia,
  useCreateVariant,
  useVariantsByProduct,
  useUpdateVariant,
  useVariantById,
  useColorById
} from '@/hooks/useVariants'
import type { Color, Variant } from '@/types/api/variants'
import { variantFormSchema, newColorSchema } from '@/schemas/variant.schema'
import type { VariantFormData, MediaFile, NewColorForm, VariantSizeForm } from '@/schemas/variant.schema'
import VariantsList from './components/VariantsList'
import VariantMediaUploader from './components/VariantMediaUploader'
import AddStockModal from './components/AddStockModal'

type Props = {
  activeStep: number
  handleNext: () => void
  handlePrev: () => void
  steps: { icon: string; title: string; subtitle: string }[]
  mode: 'create' | 'edit'
  productId?: string
  productName?: string
  productCreated?: boolean
}

const StepVariantDetails = ({ activeStep, handlePrev, steps, mode, productId, productName, productCreated }: Props) => {
  const router = useRouter()
  const queryClient = useQueryClient()

  const [variantForm, setVariantForm] = useState<VariantFormData>({
    colorId: '',
    sizes: [{ size: '', quantity: 1 }],
    mediaFiles: []
  })

  const [isEditing, setIsEditing] = useState(false)
  const [editingVariantId, setEditingVariantId] = useState<number | null>(null)
  const [variantToLoadId, setVariantToLoadId] = useState<number | null>(null)
  const [colorToLoadId, setColorToLoadId] = useState<number | null>(null)
  const [colorError, setColorError] = useState<string | null>(null)
  const [filesError, setFilesError] = useState<string | null>(null)
  const [sizesError, setSizesError] = useState<string | null>(null)
  const [addStockModalOpen, setAddStockModalOpen] = useState(false)

  const [colorModalOpen, setColorModalOpen] = useState(false)

  const [newColor, setNewColor] = useState<NewColorForm>({
    name: '',
    code: '#8B7355'
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  const { data: colors, isLoading: colorsLoading } = useColors()
  const { data: existingVariants, isLoading: variantsLoading } = useVariantsByProduct(productId)
  const uploadMultimedia = useUploadMultimedia()
  const { data: variantToLoad, isLoading: variantLoading } = useVariantById(variantToLoadId)
  const { data: colorToLoad } = useColorById(colorToLoadId)
  const [originalColorId, setOriginalColorId] = useState<number | null>(null)

  const createVariant = useCreateVariant()
  const updateVariant = useUpdateVariant()

  const isCreateMode = mode === 'create'

  const detectFileType = (url: string): 'image' | 'video' | 'document' => {
    const ext = url.split('.').pop()?.toLowerCase() || ''

    if (['jpg', 'jpeg', 'png'].includes(ext)) return 'image'
    if (['mp4'].includes(ext)) return 'video'
    if (ext === 'pdf') return 'document'

    return 'image'
  }

  const handleEditVariant = (variant: Variant) => {
    if (variant.id) {
      setVariantToLoadId(Number(variant.id))
    }
  }

  const handleClearForm = () => {
    variantForm.mediaFiles.forEach(file => {
      if (file.file) {
        URL.revokeObjectURL(file.url)
      }
    })

    setVariantForm({
      colorId: '',
      sizes: [{ size: '', quantity: 1 }],
      mediaFiles: []
    })
    setIsEditing(false)
    setEditingVariantId(null)
    setOriginalColorId(null)
    setColorError(null)
    setFilesError(null)
    setSizesError(null)
  }

  const handleAddSize = () => {
    setVariantForm(prev => ({
      ...prev,
      sizes: [...prev.sizes, { size: '', quantity: 1 }]
    }))
    setSizesError(null)
  }

  const handleSizeChange = (index: number, field: keyof VariantSizeForm, value: any) => {
    setSizesError(null)
    setVariantForm(prev => ({
      ...prev,
      sizes: prev.sizes.map((size, i) => {
        if (i === index) {
          if (field === 'quantity') {
            return { ...size, [field]: value || 0 }
          }

          return { ...size, [field]: value }
        }

        return size
      })
    }))
  }

  const handleRemoveSize = (index: number) => {
    setVariantForm(prev => ({
      ...prev,
      sizes: prev.sizes.filter((_, i) => i !== index)
    }))
  }

  const getSelectedColor = (): Color | null => {
    if (variantForm.colorId === 'custom') {
      return {
        id: 0,
        name: variantForm.customColorName || '',
        code: variantForm.customColorCode || '#000000'
      }
    }

    return colors?.find(c => c.id.toString() === variantForm.colorId) || null
  }

  const handleSaveVariant = async () => {
    try {
      setColorError(null)
      setFilesError(null)
      setSizesError(null)

      const validation = variantFormSchema.safeParse(variantForm)

      if (!validation.success) {
        validation.error.issues.forEach(issue => {
          const field = issue.path[0]

          if (field === 'colorId' || field === 'customColorName' || field === 'customColorCode') {
            setColorError(issue.message)
          }

          if (field === 'mediaFiles') {
            setFilesError(issue.message)
          }

          if (field === 'sizes') {
            setSizesError(issue.message)
          }
        })

        toast.error(validation.error.issues[0].message)

        return
      }

      const validatedData = validation.data

      const selectedColor = getSelectedColor()

      if (!selectedColor || !selectedColor.name) {
        toast.error('Selecciona un color')

        return
      }

      const newMultimediaFiles = validatedData.mediaFiles.filter(f => f.source === 'new' && f.type !== 'document')
      const newPdfFiles = validatedData.mediaFiles.filter(f => f.source === 'new' && f.type === 'document')

      const existingMultimediaUrls = validatedData.mediaFiles
        .filter(f => f.source === 'existing' && f.type !== 'document')
        .map(f => f.url)

      const existingPdfUrls = validatedData.mediaFiles
        .filter(f => f.source === 'existing' && f.type === 'document')
        .map(f => f.url)

      let uploadedMultimediaUrls: string[] = []
      let uploadedPdfUrls: string[] = []

      if (newMultimediaFiles.length > 0) {
        const uploaded = await uploadMultimedia.mutateAsync(newMultimediaFiles.map(f => f.file!))

        uploadedMultimediaUrls = uploaded.map((file: any) => (typeof file === 'string' ? file : file.url))
      }

      if (newPdfFiles.length > 0) {
        const uploaded = await uploadMultimedia.mutateAsync(newPdfFiles.map(f => f.file!))

        uploadedPdfUrls = uploaded.map((file: any) => (typeof file === 'string' ? file : file.url))
      }

      const finalMultimediaUrls = [...existingMultimediaUrls, ...uploadedMultimediaUrls].filter(
        url => typeof url === 'string' && url.startsWith('http')
      )

      const finalPdfUrls = [...existingPdfUrls, ...uploadedPdfUrls].filter(
        url => typeof url === 'string' && url.startsWith('http')
      )

      const normalizedVariants = isEditing
        ? validatedData.sizes
            .filter(s => !s.id)
            .map(s => ({
              size: typeof s.size === 'object' ? (s.size as any).name : s.size,
              quantity: s.quantity || 0
            }))
        : validatedData.sizes.map(s => ({
            size: typeof s.size === 'object' ? (s.size as any).name : s.size,
            quantity: s.quantity || 0
          }))

      if (isEditing && editingVariantId) {
        const updateData = {
          multimedia: finalMultimediaUrls,
          pdfs: finalPdfUrls,
          variants: normalizedVariants,
          colorName: selectedColor.name,
          colorCode: selectedColor.code
        }

        await updateVariant.mutateAsync({
          id: editingVariantId,
          data: updateData
        })
        await queryClient.refetchQueries({
          queryKey: ['variants', 'product', parseInt(productId!)]
        })
        toast.success('Variante actualizada exitosamente')
      } else {
        const createData = {
          multimedia: finalMultimediaUrls,
          pdfs: finalPdfUrls,
          variants: normalizedVariants,
          colorName: selectedColor.name,
          colorCode: selectedColor.code,
          productId: parseInt(productId!)
        }

        await createVariant.mutateAsync(createData)
        toast.success('Variante guardada exitosamente')
      }

      handleClearForm()
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.issues[0]?.message || 'Error de validación')
        console.error('Errores de validación:', error.format())

        return
      }

      const apiError = error as any

      if (apiError?.response?.status === 409) {
        const selectedColor = getSelectedColor()
        const errorMsg = `Ya existe una variante con el color "${selectedColor?.name}". Por favor, selecciona otro color.`

        setColorError(errorMsg)
        toast.error(errorMsg)

        return
      } else if (apiError?.response?.status === 400) {
        const message = apiError?.response?.data?.message

        if (Array.isArray(message)) {
          toast.error(`Error: ${message.join(', ')}`)
        } else if (typeof message === 'string') {
          toast.error(`Error: ${message}`)
        } else {
          toast.error('Datos inválidos. Verifica todos los campos.')
        }
      } else if (apiError?.message?.includes('multimedia')) {
        toast.error('Error al procesar los archivos. Inténtalo de nuevo.')
      } else {
        toast.error(isEditing ? 'Error al actualizar la variante' : 'Error al guardar la variante')
      }

      console.error('Error completo:', error)
    }
  }

  const handleFinish = async () => {
    try {
      if (!existingVariants?.variants || existingVariants.variants.length === 0) {
        toast.error('Debes crear al menos una variante antes de finalizar')

        return
      }

      setIsSubmitting(true)

      if (isCreateMode) {
        toast.success('Producto creado exitosamente con sus variantes')
      } else {
        toast.success('Producto actualizado exitosamente')
      }

      setTimeout(() => {
        router.push('/products/list')
      }, 1500)
    } catch (error) {
      toast.error('Error al finalizar')
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  useEffect(() => {
    return () => {
      variantForm.mediaFiles.forEach(file => {
        if (file.file) {
          URL.revokeObjectURL(file.url)
        }
      })
    }
  }, [])

  useEffect(() => {
    if (variantToLoad && variantToLoadId) {
      const multimediaFiles: MediaFile[] = variantToLoad.multimedia.map((url, idx) => ({
        id: `existing-multimedia-${idx}`,
        file: null,
        url: url,
        type: detectFileType(url),
        name: url.split('/').pop() || `multimedia-${idx}`,
        source: 'existing' as const
      }))

      const pdfFiles: MediaFile[] = (variantToLoad.pdfs || []).map((url, idx) => ({
        id: `existing-pdf-${idx}`,
        file: null,
        url: url,
        type: 'document' as const,
        name: url.split('/').pop() || `document-${idx}.pdf`,
        source: 'existing' as const
      }))

      const normalizedSizes = (variantToLoad.variants || []).map(v => {
        let sizeValue: string

        if (v.size && typeof v.size === 'object' && 'name' in v.size) {
          sizeValue = (v.size as { name: string }).name
        } else if (typeof v.size === 'string') {
          sizeValue = v.size
        } else {
          sizeValue = String(v.size || '')
        }

        return {
          id: v.id,
          size: sizeValue,
          quantity: v.availableStock || v.quantity || 0
        }
      })

      setVariantForm({
        colorId: '',
        sizes: normalizedSizes,
        mediaFiles: [...multimediaFiles, ...pdfFiles]
      })

      setIsEditing(true)
      setEditingVariantId(variantToLoadId)

      if (variantToLoad.color?.id) {
        setOriginalColorId(variantToLoad.color.id)
        setColorToLoadId(variantToLoad.color.id)
      }

      setVariantToLoadId(null)
    }
  }, [variantToLoad, variantToLoadId])
  useEffect(() => {
    if (colorToLoad && colorToLoadId) {
      const colorExistsInList = colors?.some(c => c.id === colorToLoadId)

      if (colorExistsInList) {
        setVariantForm(prev => ({
          ...prev,
          colorId: colorToLoadId.toString()
        }))
      } else {
        setVariantForm(prev => ({
          ...prev,
          colorId: 'custom',
          customColorName: colorToLoad.name,
          customColorCode: colorToLoad.code
        }))
      }

      toast.info(`Color cargado: ${colorToLoad.name}`)
      setColorToLoadId(null)
    }
  }, [colorToLoad, colorToLoadId, colors])

  if (isCreateMode && !productCreated) {
    return (
      <Box>
        <Alert severity='warning' sx={{ mb: 3 }}>
          Primero debes crear el producto antes de agregar variantes.
        </Alert>
        <div className='flex items-center justify-between'>
          <Button
            variant='tonal'
            color='secondary'
            onClick={handlePrev}
            startIcon={<DirectionalIcon ltrIconClass='tabler-arrow-left' rtlIconClass='tabler-arrow-right' />}
          >
            Volver al Producto
          </Button>
        </div>
      </Box>
    )
  }

  return (
    <Grid container spacing={4}>
      {productId && (
        <Grid size={{ xs: 12 }}>
          <CustomTextField
            fullWidth
            label='Producto '
            value={productName || productId}
            disabled
            size='small'
            helperText='Configurando variantes para este producto'
          />
        </Grid>
      )}

      <Grid size={{ xs: 12, lg: 7 }}>
        <Card>
          <CardHeader
            title={isEditing ? 'Editar Variante' : 'Nueva Variante'}
            subheader={isEditing ? 'Modificando variante existente' : 'Configura color, archivos y tallas'}
            titleTypographyProps={{ variant: 'h6' }}
            action={
              isEditing && (
                <Button onClick={handleClearForm} size='small' variant='outlined'>
                  Cancelar Edición
                </Button>
              )
            }
          />
          <CardContent>
            <VariantMediaUploader
              mediaFiles={variantForm.mediaFiles}
              onFilesChange={files => setVariantForm(prev => ({ ...prev, mediaFiles: files }))}
              error={filesError}
              onErrorChange={setFilesError}
            />

            <Box sx={{ mb: 3 }}>
              <Typography variant='subtitle2' gutterBottom>
                Color
              </Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 8 }}>
                  <CustomTextField
                    select
                    fullWidth
                    size='small'
                    label='Seleccionar Color'
                    value={variantForm.colorId}
                    onChange={e => {
                      setVariantForm(prev => ({ ...prev, colorId: e.target.value }))
                      setColorError(null)
                    }}
                    error={!!colorError}
                    helperText={colorError || ''}
                    disabled={colorsLoading}
                    SelectProps={{
                      renderValue: selected => {
                        if (!selected) return 'Selecciona un color'

                        if (selected === 'custom' && variantForm.customColorName) {
                          return (
                            <Box display='flex' alignItems='center' gap={1}>
                              <Box
                                sx={{
                                  width: 16,
                                  height: 16,
                                  borderRadius: '50%',
                                  backgroundColor: variantForm.customColorCode || '#000000',
                                  border: '1px solid #ddd'
                                }}
                              />
                              <Typography variant='body2'>{variantForm.customColorName}</Typography>
                            </Box>
                          )
                        }

                        const selectedColor = colors?.find(c => c.id.toString() === selected)

                        if (selectedColor) {
                          return (
                            <Box display='flex' alignItems='center' gap={1}>
                              <Box
                                sx={{
                                  width: 16,
                                  height: 16,
                                  borderRadius: '50%',
                                  backgroundColor: selectedColor.code,
                                  border: '1px solid #ddd'
                                }}
                              />
                              <Typography variant='body2'>{selectedColor.name}</Typography>
                            </Box>
                          )
                        }

                        return 'Selecciona un color'
                      }
                    }}
                  >
                    <MenuItem value=''>Selecciona un color</MenuItem>
                    {colors?.map(color => (
                      <MenuItem key={color.id} value={color.id.toString()}>
                        <Box display='flex' alignItems='center' gap={1}>
                          <Box
                            sx={{
                              width: 16,
                              height: 16,
                              borderRadius: '50%',
                              backgroundColor: color.code,
                              border: '1px solid #ddd'
                            }}
                          />
                          <Typography variant='body2'>{color.name}</Typography>
                        </Box>
                      </MenuItem>
                    ))}
                    <MenuItem value='custom'>
                      <Box display='flex' alignItems='center' gap={1}>
                        <i className='tabler-plus' style={{ fontSize: '16px' }} />
                        <Typography variant='body2'>Color personalizado</Typography>
                      </Box>
                    </MenuItem>
                  </CustomTextField>
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Button
                    fullWidth
                    variant='outlined'
                    size='small'
                    onClick={() => setColorModalOpen(true)}
                    startIcon={<i className='tabler-palette' />}
                  >
                    Crear Color
                  </Button>
                </Grid>
              </Grid>
            </Box>

            <Box sx={{ mb: 3 }}>
              <Box display='flex' justifyContent='space-between' alignItems='center' sx={{ mb: 2 }}>
                <Typography
                  variant='subtitle2'
                  sx={{
                    color: sizesError ? 'var(--mui-palette-error-main)' : 'inherit'
                  }}
                >
                  Tallas y Stock
                </Typography>

                <Box sx={{ display: 'flex', gap: 1 }}>
                  {isEditing && variantForm.sizes.some(s => s.id) && (
                    <Button
                      variant='contained'
                      size='small'
                      color='success'
                      startIcon={<i className='tabler-plus' />}
                      onClick={() => setAddStockModalOpen(true)}
                    >
                      Agregar Stock
                    </Button>
                  )}
                  <Button
                    variant='outlined'
                    size='small'
                    startIcon={<i className='tabler-plus' />}
                    onClick={handleAddSize}
                  >
                    Añadir Talla
                  </Button>
                </Box>
              </Box>

              {variantForm.sizes.map((size, index) => (
                <Grid container spacing={1} key={index} sx={{ mb: 1, alignItems: 'center' }}>
                  <Grid size={{ xs: 5 }}>
                    <CustomTextField
                      fullWidth
                      size='small'
                      value={size.size}
                      onChange={e => handleSizeChange(index, 'size', e.target.value)}
                      placeholder='Talla (S, M, L ...)'
                      disabled={!!size.id}
                      error={!!sizesError}
                    />
                  </Grid>
                  <Grid size={{ xs: 5 }}>
                    <CustomTextField
                      fullWidth
                      size='small'
                      type='number'
                      placeholder='0'
                      value={size.quantity || ''}
                      onChange={e => {
                        const value = e.target.value

                        handleSizeChange(index, 'quantity', value === '' ? 0 : parseInt(value) || 0)
                      }}
                      disabled={!!size.id}
                      error={!!sizesError}
                      sx={{
                        '& input[type=number]': {
                          MozAppearance: 'textfield'
                        },
                        '& input[type=number]::-webkit-outer-spin-button, & input[type=number]::-webkit-inner-spin-button':
                          {
                            WebkitAppearance: 'none',
                            margin: 0
                          }
                      }}
                    />
                  </Grid>
                  <Grid size={{ xs: 2 }}>
                    {!size.id && (
                      <IconButton
                        size='small'
                        color='error'
                        onClick={() => handleRemoveSize(index)}
                        disabled={variantForm.sizes.filter(s => !s.id).length === 1}
                      >
                        <i className='tabler-trash' />
                      </IconButton>
                    )}
                  </Grid>
                </Grid>
              ))}
              {sizesError && (
                <Typography
                  variant='caption'
                  sx={{
                    display: 'block',
                    mt: 1,
                    color: 'var(--mui-palette-error-main)'
                  }}
                >
                  {sizesError}
                </Typography>
              )}
            </Box>
            {/* {formError && (
              <Alert severity='error' sx={{ mb: 2 }} onClose={() => setFormError(null)}>
                {formError}
              </Alert>
            )} */}

            <Button
              fullWidth
              variant='contained'
              onClick={handleSaveVariant}
              disabled={uploadMultimedia.isPending || createVariant.isPending || updateVariant.isPending}
              startIcon={
                uploadMultimedia.isPending || createVariant.isPending || updateVariant.isPending ? (
                  <CircularProgress size={16} />
                ) : isEditing ? (
                  <i className='tabler-device-floppy' />
                ) : (
                  <i className='tabler-plus' />
                )
              }
            >
              {uploadMultimedia.isPending
                ? 'Subiendo archivos...'
                : createVariant.isPending || updateVariant.isPending
                  ? isEditing
                    ? 'Actualizando variante...'
                    : 'Guardando variante...'
                  : isEditing
                    ? 'Actualizar Variante'
                    : 'Guardar Variante'}
            </Button>
          </CardContent>
        </Card>
      </Grid>

      <Grid size={{ xs: 12, lg: 5 }}>
        <VariantsList
          variants={existingVariants?.variants || []}
          isLoading={variantsLoading}
          editingVariantId={editingVariantId}
          onVariantClick={handleEditVariant}
        />
      </Grid>

      {existingVariants?.variants?.length ? (
        <Grid size={{ xs: 12 }}>
          <Alert severity='success'>
            <strong>{existingVariants.variants.length} variante(s) creadas</strong>
          </Alert>
        </Grid>
      ) : null}

      <Grid size={{ xs: 12 }}>
        <Box display='flex' justifyContent='space-between' alignItems='center'>
          <Button
            variant='tonal'
            color='secondary'
            onClick={handlePrev}
            type='button'
            startIcon={<DirectionalIcon ltrIconClass='tabler-arrow-left' rtlIconClass='tabler-arrow-right' />}
          >
            Anterior
          </Button>

          <Button
            variant='contained'
            color={activeStep === steps.length - 1 ? 'success' : 'primary'}
            onClick={handleFinish}
            type='button'
            disabled={isSubmitting}
            endIcon={isSubmitting ? <CircularProgress size={16} /> : <i className='tabler-device-floppy' />}
          >
            {isSubmitting ? 'Finalizando...' : isCreateMode ? 'Finalizar Creación' : 'Finalizar Actualización'}
          </Button>
        </Box>
      </Grid>

      <Dialog open={colorModalOpen} onClose={() => setColorModalOpen(false)} maxWidth='xs' fullWidth>
        <DialogTitle>Nuevo Color</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <CustomTextField
              fullWidth
              size='small'
              label='Nombre del Color'
              value={newColor.name}
              onChange={e => setNewColor({ ...newColor, name: e.target.value })}
              placeholder='Ej: Verde Oliva'
              sx={{ mb: 3 }}
            />

            <Typography variant='subtitle2' gutterBottom>
              Selector de Color
            </Typography>
            <Box display='flex' gap={2} alignItems='center'>
              <HexColorPicker
                color={newColor.code}
                onChange={color => setNewColor({ ...newColor, code: color })}
                style={{ width: '120px', height: '120px' }}
              />
              <Box>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: 1,
                    backgroundColor: newColor.code,
                    border: '2px solid #ddd',
                    mb: 1
                  }}
                />
                <Typography variant='caption' color='text.secondary'>
                  {newColor.code}
                </Typography>
              </Box>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setColorModalOpen(false)} color='secondary'>
            Cancelar
          </Button>
          <Button
            onClick={() => {
              try {
                const validatedColor = newColorSchema.parse(newColor)

                setVariantForm(prev => ({
                  ...prev,
                  colorId: 'custom',
                  customColorName: validatedColor.name,
                  customColorCode: validatedColor.code
                }))
                setNewColor({ name: '', code: '#8B7355' })
                setColorModalOpen(false)
                toast.success('Color configurado')
              } catch (error) {
                if (error instanceof z.ZodError) {
                  toast.error(error.issues[0]?.message || 'Error de validación')
                }
              }
            }}
            variant='contained'
            disabled={!newColor.name}
          >
            Usar Color
          </Button>
        </DialogActions>
      </Dialog>
      {isEditing && variantForm.sizes.length > 0 && (
        <AddStockModal
          open={addStockModalOpen}
          onClose={() => {
            setAddStockModalOpen(false)

            if (editingVariantId) {
              setVariantToLoadId(editingVariantId)
            }
          }}
          variants={variantForm.sizes
            .filter(s => s.id)
            .map(s => ({
              id: s.id!,
              size: { name: s.size },
              availableStock: s.quantity
            }))}
          variantId={editingVariantId!}
        />
      )}
    </Grid>
  )
}

export default StepVariantDetails
