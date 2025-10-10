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
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import CircularProgress from '@mui/material/CircularProgress'
import { toast } from 'react-toastify'
import { HexColorPicker } from 'react-colorful'

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
import type { VariantSize, Color, Variant } from '@/types/api/variants'

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

type MediaFile = {
  id: string
  file: File | null
  url: string
  type: 'image' | 'video' | 'document'
  name: string
  source: 'existing' | 'new'
}

type VariantForm = {
  colorId: string
  customColorName?: string
  customColorCode?: string
  sizes: VariantSize[]
  mediaFiles: MediaFile[]
}

const StepVariantDetails = ({ activeStep, handlePrev, steps, mode, productId, productName, productCreated }: Props) => {
  const router = useRouter()

  const fileInputRef = useRef<HTMLInputElement>(null)

  const [variantForm, setVariantForm] = useState<VariantForm>({
    colorId: '',
    sizes: [{ size: '', quantity: 0 }],
    mediaFiles: []
  })

  const [isEditing, setIsEditing] = useState(false)
  const [editingVariantId, setEditingVariantId] = useState<number | null>(null)
  const [variantToLoadId, setVariantToLoadId] = useState<number | null>(null)
  const [colorToLoadId, setColorToLoadId] = useState<number | null>(null)

  const [isDragging, setIsDragging] = useState(false)
  const [colorModalOpen, setColorModalOpen] = useState(false)
  const [newColor, setNewColor] = useState({ name: '', code: '#8B7355' })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { data: colors, isLoading: colorsLoading } = useColors()
  const { data: existingVariants, isLoading: variantsLoading } = useVariantsByProduct(productId)
  const uploadMultimedia = useUploadMultimedia()
  const { data: variantToLoad, isLoading: variantLoading } = useVariantById(variantToLoadId)
  const { data: colorToLoad } = useColorById(colorToLoadId)

  const createVariant = useCreateVariant()
  const updateVariant = useUpdateVariant()

  const isCreateMode = mode === 'create'

  const detectFileType = (url: string): 'image' | 'video' | 'document' => {
    const ext = url.split('.').pop()?.toLowerCase() || ''

    if (['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext)) return 'image'
    if (['mp4', 'webm', 'mov'].includes(ext)) return 'video'
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
      sizes: [],
      mediaFiles: []
    })
    setIsEditing(false)
    setEditingVariantId(null)
  }

  const isValidFileType = (file: File): boolean => {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'video/mp4', 'application/pdf']

    return validTypes.includes(file.type)
  }

  const processFiles = (files: FileList) => {
    const newFiles: MediaFile[] = []

    Array.from(files).forEach(file => {
      if (isValidFileType(file)) {
        const mediaFile: MediaFile = {
          id: Date.now() + Math.random().toString(),
          file,
          url: URL.createObjectURL(file),
          type: file.type.startsWith('image/') ? 'image' : file.type.startsWith('video/') ? 'video' : 'document',
          name: file.name,
          source: 'new' as const
        }

        newFiles.push(mediaFile)
      } else {
        toast.error(`Tipo de archivo no válido: ${file.name}`)
      }
    })

    if (newFiles.length > 0) {
      setVariantForm(prev => ({
        ...prev,
        mediaFiles: [...prev.mediaFiles, ...newFiles]
      }))
      toast.success(`${newFiles.length} archivo(s) agregado(s)`)
    }
  }

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    const files = e.dataTransfer.files

    if (files.length > 0) {
      processFiles(files)
    }
  }

  const handleFileInputClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files

    if (files && files.length > 0) {
      processFiles(files)
    }

    e.target.value = ''
  }

  const handleRemoveFile = (id: string) => {
    setVariantForm(prev => {
      const fileToRemove = prev.mediaFiles.find(f => f.id === id)

      if (fileToRemove && fileToRemove.file) {
        URL.revokeObjectURL(fileToRemove.url)
      }

      return {
        ...prev,
        mediaFiles: prev.mediaFiles.filter(f => f.id !== id)
      }
    })
    toast.success('Archivo eliminado')
  }

  const handleAddSize = () => {
    setVariantForm(prev => ({
      ...prev,
      sizes: [...prev.sizes, { size: '', quantity: 0 }]
    }))
  }

  const handleSizeChange = (index: number, field: keyof VariantSize, value: any) => {
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
    const selectedColor = getSelectedColor()

    if (!selectedColor || !selectedColor.name) {
      toast.error('Selecciona un color')

      return
    }

    if (variantForm.sizes.some(s => !s.size || (s.quantity ?? 0) < 0)) {
      toast.error('Completa todas las tallas y stocks')

      return
    }

    if (variantForm.mediaFiles.length === 0) {
      toast.error('Agrega al menos una imagen')

      return
    }

    try {
      const newMultimediaFiles = variantForm.mediaFiles.filter(f => f.source === 'new' && f.type !== 'document')
      const newPdfFiles = variantForm.mediaFiles.filter(f => f.source === 'new' && f.type === 'document')

      const existingMultimediaUrls = variantForm.mediaFiles
        .filter(f => f.source === 'existing' && f.type !== 'document')
        .map(f => f.url)

      const existingPdfUrls = variantForm.mediaFiles
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

      const normalizedVariants = variantForm.sizes.map(s => ({
        size: typeof s.size === 'object' ? s.size.name : s.size,
        quantity: s.quantity || 0
      }))

      const variantData = {
        multimedia: finalMultimediaUrls,
        pdfs: finalPdfUrls,
        variants: normalizedVariants,
        colorName: selectedColor.name,
        colorCode: selectedColor.code,
        productId: parseInt(productId!)
      }

      /*   console.log(' Datos a enviar:', variantData)
      console.log(' PDFs:', finalPdfUrls) */

      if (isEditing && editingVariantId) {
        await updateVariant.mutateAsync({
          id: editingVariantId,
          data: variantData
        })
        toast.success('Variante actualizada exitosamente')
      } else {
        await createVariant.mutateAsync(variantData)
        toast.success('Variante guardada exitosamente')
      }

      handleClearForm()
    } catch (error: any) {
      if (error?.response?.status === 409) {
        toast.error('Ya existe una variante con este color para este producto')
      } else if (error?.response?.status === 400) {
        const message = error?.response?.data?.message

        if (Array.isArray(message)) {
          toast.error(`Error: ${message.join(', ')}`)
        } else if (typeof message === 'string') {
          toast.error(`Error: ${message}`)
        } else {
          toast.error('Datos inválidos. Verifica todos los campos.')
        }
      } else if (error?.message?.includes('multimedia')) {
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

      const normalizedSizes = (variantToLoad.variants || []).map(v => ({
        id: v.id,
        size: typeof v.size === 'object' ? v.size.name : v.size,
        quantity: v.availableStock || v.quantity || 0
      }))

      setVariantForm({
        colorId: '',
        sizes: normalizedSizes,
        mediaFiles: [...multimediaFiles, ...pdfFiles]
      })

      setIsEditing(true)
      setEditingVariantId(variantToLoadId)

      if (variantToLoad.color?.id) {
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
            <Box sx={{ mb: 3 }}>
              <Typography variant='subtitle2' gutterBottom>
                Archivos Multimedia
              </Typography>
              <Box
                sx={{
                  border: '2px dashed',
                  borderColor: isDragging ? 'primary.main' : 'divider',
                  borderRadius: 1,
                  p: 3,
                  textAlign: 'center',
                  backgroundColor: isDragging ? 'action.hover' : 'background.paper',
                  cursor: 'pointer',
                  minHeight: '120px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center'
                }}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={handleFileInputClick}
              >
                <i
                  className='tabler-cloud-upload'
                  style={{ fontSize: '2rem', color: 'var(--mui-palette-primary-main)' }}
                />
                <Typography variant='body2' color='text.secondary' sx={{ mt: 1 }}>
                  {isDragging ? 'Suelta aquí los archivos' : 'Arrastra imágenes/videos o haz clic para seleccionar'}
                </Typography>
                <Typography variant='caption' color='text.secondary'>
                  Formatos: JPG, PNG, MP4, PDF
                </Typography>
              </Box>
              <input
                ref={fileInputRef}
                type='file'
                multiple
                accept='image/*,video/*,.pdf'
                style={{ display: 'none' }}
                onChange={handleFileInputChange}
              />

              {variantForm.mediaFiles.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  {variantForm.mediaFiles.filter(f => f.type !== 'document').length > 0 && (
                    <Box sx={{ mb: 3 }}>
                      <Typography variant='caption' color='primary' sx={{ mb: 1, display: 'block', fontWeight: 600 }}>
                        🖼️ IMÁGENES Y VIDEOS ({variantForm.mediaFiles.filter(f => f.type !== 'document').length})
                      </Typography>
                      <Grid container spacing={2}>
                        {variantForm.mediaFiles
                          .filter(f => f.type !== 'document')
                          .map(file => (
                            <Grid size={{ xs: 6, sm: 4, md: 3 }} key={file.id}>
                              <Box
                                sx={{
                                  position: 'relative',
                                  width: '100%',
                                  height: '120px',
                                  border: '1px solid',
                                  borderColor: 'divider',
                                  borderRadius: 1,
                                  overflow: 'hidden'
                                }}
                              >
                                {file.type === 'image' ? (
                                  <img
                                    src={file.url}
                                    alt={file.name}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                  />
                                ) : (
                                  <video src={file.url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                )}
                                <IconButton
                                  size='small'
                                  color='error'
                                  onClick={() => handleRemoveFile(file.id)}
                                  sx={{
                                    position: 'absolute',
                                    top: 4,
                                    right: 4,
                                    backgroundColor: 'rgba(0,0,0,0.7)',
                                    color: 'white',
                                    '&:hover': { backgroundColor: 'rgba(0,0,0,0.9)' }
                                  }}
                                >
                                  <i className='tabler-x' style={{ fontSize: '16px' }} />
                                </IconButton>
                              </Box>
                            </Grid>
                          ))}
                      </Grid>
                    </Box>
                  )}

                  {variantForm.mediaFiles.filter(f => f.type === 'document').length > 0 && (
                    <Box>
                      <Typography variant='caption' color='secondary' sx={{ mb: 1, display: 'block', fontWeight: 600 }}>
                        📄 DOCUMENTOS PDF ({variantForm.mediaFiles.filter(f => f.type === 'document').length})
                      </Typography>
                      <Grid container spacing={2}>
                        {variantForm.mediaFiles
                          .filter(f => f.type === 'document')
                          .map(file => (
                            <Grid size={{ xs: 6, sm: 4, md: 3 }} key={file.id}>
                              <Box
                                sx={{
                                  position: 'relative',
                                  width: '100%',
                                  height: '100px',
                                  border: '1px solid',
                                  borderColor: 'divider',
                                  borderRadius: 1,
                                  overflow: 'hidden',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  backgroundColor: 'rgba(255,0,0,0.05)'
                                }}
                              >
                                <i className='tabler-file-type-pdf' style={{ fontSize: '2.5rem', color: '#d32f2f' }} />
                                <Typography variant='caption' sx={{ mt: 1, textAlign: 'center', px: 1 }}>
                                  {file.name.length > 20 ? file.name.substring(0, 20) + '...' : file.name}
                                </Typography>
                                <IconButton
                                  size='small'
                                  color='error'
                                  onClick={() => handleRemoveFile(file.id)}
                                  sx={{
                                    position: 'absolute',
                                    top: 4,
                                    right: 4,
                                    backgroundColor: 'rgba(0,0,0,0.7)',
                                    color: 'white',
                                    '&:hover': { backgroundColor: 'rgba(0,0,0,0.9)' }
                                  }}
                                >
                                  <i className='tabler-x' style={{ fontSize: '16px' }} />
                                </IconButton>
                              </Box>
                            </Grid>
                          ))}
                      </Grid>
                    </Box>
                  )}
                </Box>
              )}
            </Box>

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
                    onChange={e => setVariantForm(prev => ({ ...prev, colorId: e.target.value }))}
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
                <Typography variant='subtitle2'>Tallas y Stock</Typography>
                <Button
                  variant='outlined'
                  size='small'
                  startIcon={<i className='tabler-plus' />}
                  onClick={handleAddSize}
                >
                  Añadir Talla
                </Button>
              </Box>

              {variantForm.sizes.map((size, index) => (
                <Grid container spacing={1} key={index} sx={{ mb: 1, alignItems: 'center' }}>
                  <Grid size={{ xs: 5 }}>
                    <CustomTextField
                      fullWidth
                      size='small'
                      value={size.size}
                      onChange={e => handleSizeChange(index, 'size', e.target.value)}
                      placeholder='Talla (S, M, L)'
                      disabled={!!size.id}
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
            </Box>

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
        <Card sx={{ height: 'fit-content', position: 'sticky', top: 20 }}>
          <CardHeader
            title={`Variantes Creadas (${existingVariants?.variants?.length || 0})`}
            subheader='Click para editar'
            titleTypographyProps={{ variant: 'h6' }}
          />
          <CardContent sx={{ p: 0, maxHeight: '500px', overflow: 'auto' }}>
            {variantsLoading ? (
              <Box display='flex' justifyContent='center' alignItems='center' py={4}>
                <CircularProgress size={24} />
                <Typography variant='body2' sx={{ ml: 2 }}>
                  Cargando variantes...
                </Typography>
              </Box>
            ) : existingVariants?.variants?.length ? (
              <TableContainer>
                <Table size='small'>
                  <TableHead>
                    <TableRow>
                      <TableCell>Color</TableCell>
                      <TableCell>Tallas</TableCell>
                      <TableCell>Imagen</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {existingVariants.variants.map(variant => (
                      <TableRow
                        key={variant.id}
                        hover
                        sx={{
                          cursor: 'pointer',
                          backgroundColor: editingVariantId === Number(variant.id) ? 'action.selected' : 'transparent'
                        }}
                        onClick={() => handleEditVariant(variant)}
                      >
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Box
                              sx={{
                                width: 20,
                                height: 20,
                                borderRadius: '50%',
                                backgroundColor: variant.color?.code || variant.colorCode,
                                border: '1px solid #ddd'
                              }}
                            />
                            <Typography variant='caption'>{variant.color?.name || variant.colorName}</Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant='caption'>
                            {variant.variants.map(s => (typeof s.size === 'object' ? s.size.name : s.size)).join(', ')}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <div className='flex items-center gap-1'>
                            {variant.multimedia
                              .filter(url => {
                                const ext = url.split('.').pop()?.toLowerCase() || ''

                                return ['jpg', 'jpeg', 'png'].includes(ext)
                              })
                              .slice(0, 3)
                              .map((url, idx) => (
                                <Box
                                  key={idx}
                                  sx={{
                                    width: 24,
                                    height: 24,
                                    borderRadius: 0.5,
                                    overflow: 'hidden',
                                    border: '1px solid',
                                    borderColor: 'divider'
                                  }}
                                >
                                  <img src={url} alt='' style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                </Box>
                              ))}
                            {variant.multimedia.length > 3 && (
                              <Typography variant='caption' sx={{ fontSize: '10px', color: 'text.secondary' }}>
                                +{variant.multimedia.length - 3}
                              </Typography>
                            )}
                            {variant.multimedia.length === 0 && (
                              <Typography variant='caption' color='text.secondary'>
                                Sin imagen
                              </Typography>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Box textAlign='center' py={4} color='text.secondary'>
                <i className='tabler-package' style={{ fontSize: '2rem', opacity: 0.3 }} />
                <Typography variant='body2' sx={{ mt: 1 }}>
                  No hay variantes creadas
                </Typography>
                <Typography variant='caption'>Crea la primera variante del producto</Typography>
              </Box>
            )}
          </CardContent>
        </Card>
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
              if (newColor.name) {
                setVariantForm(prev => ({
                  ...prev,
                  colorId: 'custom',
                  customColorName: newColor.name,
                  customColorCode: newColor.code
                }))
                setNewColor({ name: '', code: '#8B7355' })
                setColorModalOpen(false)
                toast.success('Color configurado')
              }
            }}
            variant='contained'
            disabled={!newColor.name}
          >
            Usar Color
          </Button>
        </DialogActions>
      </Dialog>
    </Grid>
  )
}

export default StepVariantDetails
