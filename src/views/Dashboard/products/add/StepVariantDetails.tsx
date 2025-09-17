// React Imports
import { useState, useRef, useEffect } from 'react'

import { useRouter } from 'next/navigation'

// MUI Imports
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
import Chip from '@mui/material/Chip'
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

// Third-party Imports
import { toast } from 'react-toastify'
import { HexColorPicker } from 'react-colorful'

// Component Imports
import DirectionalIcon from '@components/DirectionalIcon'
import CustomTextField from '@core/components/mui/TextField'

type Props = {
  activeStep: number
  handleNext: () => void
  handlePrev: () => void
  steps: { icon: string; title: string; subtitle: string }[]
  mode: 'create' | 'edit'
  productId?: string
  productCreated?: boolean
}

type ColorItem = {
  name: string
  hex: string
}

type MediaFile = {
  id: string
  file: File
  url: string
  type: 'image' | 'video'
  name: string
}

type Variant = {
  id?: number
  talla: string
  stock: number
}

type CreatedVariant = {
  id: number
  selectedColor: string
  variants: Variant[]
  mediaFiles: MediaFile[]
  pdfFiles: File[]
  createdAt: string
}

const StepVariantDetails = ({ activeStep, handlePrev, steps, mode, productId, productCreated }: Props) => {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Estados
  const [selectedColor, setSelectedColor] = useState('verde-hoja-seca')
  const [isDragging, setIsDragging] = useState(false)
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([])
  const [pdfFiles, setPdfFiles] = useState<File[]>([])
  const [variants, setVariants] = useState<Variant[]>([{ talla: 'S', stock: 5 }])
  const [createdVariants, setCreatedVariants] = useState<CreatedVariant[]>([])
  const [colorModalOpen, setColorModalOpen] = useState(false)
  const [newColor, setNewColor] = useState({ name: '', hex: '#8B7355' })

  const [colors, setColors] = useState<ColorItem[]>([
    { name: 'Verde Hoja Seca', hex: '#8B7355' },
    { name: 'Azul Marino', hex: '#1B4965' },
    { name: 'Negro', hex: '#000000' }
  ])

  const isCreateMode = mode === 'create'

  // Validar archivos
  const isValidFileType = (file: File): boolean => {
    const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    const validVideoTypes = ['video/mp4', 'video/avi', 'video/mov', 'video/wmv', 'video/webm']

    return validImageTypes.includes(file.type) || validVideoTypes.includes(file.type)
  }

  // Procesar archivos
  const processFiles = (files: FileList) => {
    const newFiles: MediaFile[] = []

    Array.from(files).forEach(file => {
      if (isValidFileType(file)) {
        const mediaFile: MediaFile = {
          id: Date.now() + Math.random().toString(),
          file: file,
          url: URL.createObjectURL(file),
          type: file.type.startsWith('image/') ? 'image' : 'video',
          name: file.name
        }

        newFiles.push(mediaFile)
      } else {
        toast.error(`Tipo de archivo no válido: ${file.name}`)
      }
    })

    if (newFiles.length > 0) {
      setMediaFiles(prev => [...prev, ...newFiles])
      toast.success(`${newFiles.length} archivo(s) agregado(s)`)
    }
  }

  // Drag and Drop
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
    setMediaFiles(prev => {
      const fileToRemove = prev.find(f => f.id === id)

      if (fileToRemove) {
        URL.revokeObjectURL(fileToRemove.url)
      }

      return prev.filter(f => f.id !== id)
    })
    toast.success('Archivo eliminado')
  }

  const handleAddColor = () => {
    if (newColor.name) {
      setColors([...colors, { ...newColor }])
      setNewColor({ name: '', hex: '#8B7355' })
      setColorModalOpen(false)
      toast.success('Color agregado')
    }
  }

  const handleAddVariant = () => {
    setVariants([...variants, { talla: '', stock: 0 }])
  }

  const handleVariantChange = (index: number, field: keyof Variant, value: any) => {
    const updated = [...variants]

    updated[index] = { ...updated[index], [field]: value }
    setVariants(updated)
  }

  const handleRemoveVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index))
  }

  // Guardar variante
  const handleSaveCurrentVariant = () => {
    if (!selectedColor) {
      toast.error('Selecciona un color')

      return
    }

    if (variants.some(v => !v.talla || v.stock < 0)) {
      toast.error('Completa todas las tallas y stocks')

      return
    }

    const newVariant: CreatedVariant = {
      id: Date.now(),
      selectedColor,
      variants: [...variants],
      mediaFiles: [...mediaFiles],
      pdfFiles: [...pdfFiles],
      createdAt: new Date().toLocaleString()
    }

    setCreatedVariants(prev => [...prev, newVariant])

    // Limpiar formulario
    setSelectedColor('verde-hoja-seca')
    setVariants([{ talla: 'S', stock: 5 }])
    setMediaFiles([])
    setPdfFiles([])

    toast.success('Variante guardada')
  }

  const handleDeleteCreatedVariant = (index: number) => {
    setCreatedVariants(prev => prev.filter((_, i) => i !== index))
    toast.success('Variante eliminada')
  }

  const handleSave = async () => {
    try {
      if (isCreateMode && createdVariants.length === 0) {
        toast.error('Debes crear al menos una variante')

        return
      }

      const variantData = {
        productId,
        variants: createdVariants,
        colors
      }

      if (isCreateMode) {
        console.log('Creando producto con variantes:', variantData)
        toast.success('Producto creado exitosamente')
        router.push('/products/list')
      } else {
        console.log('Actualizando variantes:', variantData)
        toast.success('Variantes actualizadas')
      }
    } catch (error) {
      toast.error('Error al guardar')
      console.error(error)
    }
  }

  useEffect(() => {
    return () => {
      mediaFiles.forEach(file => {
        URL.revokeObjectURL(file.url)
      })
    }
  }, [mediaFiles])

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
      {/* INFO DEL PRODUCTO */}
      {productId && (
        <Grid size={{ xs: 12 }}>
          <CustomTextField
            fullWidth
            label='Producto'
            value={productId}
            disabled
            size='small'
            helperText='Configurando variantes'
          />
        </Grid>
      )}

      {/* LAYOUT PRINCIPAL: FORMULARIO + TABLA */}
      <Grid size={{ xs: 12, lg: 7 }}>
        {/* FORMULARIO COMPACTO */}
        <Card>
          <CardHeader
            title='Nueva Variante'
            subheader='Configura color, archivos y tallas'
            titleTypographyProps={{ variant: 'h6' }}
            subheaderTypographyProps={{ variant: 'body2' }}
          />
          <CardContent>
            {/* ARCHIVOS */}
            <Box sx={{ mb: 3 }}>
              <Typography variant='subtitle2' gutterBottom>
                Archivos
              </Typography>
              <Grid container spacing={2}>
                {/* DRAG IMÁGENES */}
                <Grid size={{ xs: 12, sm: 8 }}>
                  <Box
                    sx={{
                      border: '2px dashed',
                      borderColor: isDragging ? 'primary.main' : 'divider',
                      borderRadius: 1,
                      p: 2,
                      textAlign: 'center',
                      backgroundColor: isDragging ? 'action.hover' : 'background.paper',
                      cursor: 'pointer',
                      minHeight: '80px',
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
                      style={{ fontSize: '1.5rem', color: 'var(--mui-palette-primary-main)' }}
                    />
                    <Typography variant='caption' color='text.secondary'>
                      {isDragging ? 'Suelta aquí' : 'Imágenes/Videos'}
                    </Typography>
                  </Box>
                  <input
                    ref={fileInputRef}
                    type='file'
                    multiple
                    accept='image/*,video/*'
                    style={{ display: 'none' }}
                    onChange={handleFileInputChange}
                  />
                </Grid>

                {/* DRAG PDFs */}
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Box
                    sx={{
                      border: '2px dashed',
                      borderColor: 'divider',
                      borderRadius: 1,
                      p: 2,
                      textAlign: 'center',
                      backgroundColor: 'background.paper',
                      cursor: 'pointer',
                      minHeight: '80px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center'
                    }}
                    onClick={() => {
                      const pdfInput = document.getElementById('pdf-upload') as HTMLInputElement

                      pdfInput?.click()
                    }}
                  >
                    <i
                      className='tabler-file-type-pdf'
                      style={{ fontSize: '1.5rem', color: 'var(--mui-palette-secondary-main)' }}
                    />
                    <Typography variant='caption' color='text.secondary'>
                      PDFs
                    </Typography>
                  </Box>
                  <input
                    id='pdf-upload'
                    type='file'
                    multiple
                    accept='.pdf,application/pdf'
                    style={{ display: 'none' }}
                    onChange={e => {
                      const files = e.target.files

                      if (files && files.length > 0) {
                        Array.from(files).forEach(file => {
                          if (file.type === 'application/pdf') {
                            setPdfFiles(prev => [...prev, file])
                            toast.success(`PDF agregado: ${file.name}`)
                          }
                        })
                      }

                      e.target.value = ''
                    }}
                  />
                </Grid>
              </Grid>
              {/* PREVIEW ARCHIVOS  */}
              {mediaFiles.length > 0 && mediaFiles.find(file => file.type === 'image') && (
                <Box sx={{ mt: 2 }}>
                  <Box
                    sx={{
                      position: 'relative',
                      width: '120px',
                      height: '90px',
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 1,
                      overflow: 'hidden',
                      backgroundColor: 'background.paper'
                    }}
                  >
                    <img
                      src={mediaFiles.find(file => file.type === 'image')?.url}
                      alt='Imagen de la variante'
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                    />
                    <IconButton
                      size='small'
                      color='error'
                      onClick={() => {
                        const imageFile = mediaFiles.find(file => file.type === 'image')

                        if (imageFile) handleRemoveFile(imageFile.id)
                      }}
                      sx={{
                        position: 'absolute',
                        top: 4,
                        right: 4,
                        backgroundColor: 'rgba(0,0,0,0.6)',
                        color: 'white',
                        width: '20px',
                        height: '20px',
                        '&:hover': {
                          backgroundColor: 'rgba(0,0,0,0.8)'
                        }
                      }}
                    >
                      <i className='tabler-x' style={{ fontSize: '12px' }} />
                    </IconButton>
                  </Box>
                </Box>
              )}

              {/* Solo mostrar chips de PDFs si los hay */}
              {pdfFiles.length > 0 && (
                <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {pdfFiles.map((file, index) => (
                    <Chip
                      key={index}
                      label={file.name}
                      size='small'
                      color='secondary'
                      onDelete={() => {
                        setPdfFiles(prev => prev.filter((_, i) => i !== index))
                        toast.success('PDF eliminado')
                      }}
                      deleteIcon={<i className='tabler-x' style={{ fontSize: '12px' }} />}
                    />
                  ))}
                </Box>
              )}
            </Box>

            {/* COLOR */}
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
                    value={selectedColor}
                    onChange={e => setSelectedColor(e.target.value)}
                    label='Seleccionar Color'
                  >
                    {colors.map((color, index) => (
                      <MenuItem key={index} value={color.name.toLowerCase().replace(/\s+/g, '-')}>
                        <Box display='flex' alignItems='center' gap={1}>
                          <Box
                            sx={{
                              width: 12,
                              height: 12,
                              borderRadius: '50%',
                              backgroundColor: color.hex,
                              border: '1px solid #ddd'
                            }}
                          />
                          <Typography variant='body2'>{color.name}</Typography>
                        </Box>
                      </MenuItem>
                    ))}
                  </CustomTextField>
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Button
                    fullWidth
                    variant='outlined'
                    size='small'
                    onClick={() => setColorModalOpen(true)}
                    startIcon={<i className='tabler-plus' />}
                  >
                    Nuevo
                  </Button>
                </Grid>
              </Grid>
            </Box>

            {/* TALLAS */}
            <Box sx={{ mb: 3 }}>
              <Box display='flex' justifyContent='space-between' alignItems='center' sx={{ mb: 2 }}>
                <Typography variant='subtitle2'>Tallas y Stock</Typography>
                <Button
                  variant='outlined'
                  size='small'
                  startIcon={<i className='tabler-plus' />}
                  onClick={handleAddVariant}
                >
                  Añadir
                </Button>
              </Box>

              {variants.map((variant, index) => (
                <Grid container spacing={1} key={index} sx={{ mb: 1, alignItems: 'center' }}>
                  <Grid size={{ xs: 5 }}>
                    <CustomTextField
                      fullWidth
                      size='small'
                      value={variant.talla}
                      onChange={e => handleVariantChange(index, 'talla', e.target.value)}
                      placeholder='Talla'
                    />
                  </Grid>
                  <Grid size={{ xs: 5 }}>
                    <CustomTextField
                      fullWidth
                      size='small'
                      type='number'
                      value={variant.stock}
                      onChange={e => handleVariantChange(index, 'stock', parseInt(e.target.value) || 0)}
                      placeholder='Stock'
                    />
                  </Grid>
                  <Grid size={{ xs: 2 }}>
                    <IconButton
                      size='small'
                      color='error'
                      onClick={() => handleRemoveVariant(index)}
                      disabled={variants.length === 1}
                    >
                      <i className='tabler-trash' style={{ fontSize: '16px' }} />
                    </IconButton>
                  </Grid>
                </Grid>
              ))}
            </Box>

            {/* BOTÓN GUARDAR VARIANTE */}
            <Button
              fullWidth
              variant='contained'
              onClick={handleSaveCurrentVariant}
              startIcon={<i className='tabler-plus' />}
            >
              Guardar Variante
            </Button>
          </CardContent>
        </Card>
      </Grid>

      {/* TABLA DE VARIANTES CREADAS */}
      <Grid size={{ xs: 12, lg: 5 }}>
        <Card sx={{ height: 'fit-content', position: 'sticky', top: 20 }}>
          <CardHeader
            title={`Variantes (${createdVariants.length})`}
            subheader='Listas para el producto'
            titleTypographyProps={{ variant: 'h6' }}
            subheaderTypographyProps={{ variant: 'body2' }}
          />
          <CardContent sx={{ p: 0, maxHeight: '500px', overflow: 'auto' }}>
            {createdVariants.length > 0 ? (
              <TableContainer>
                <Table size='small'>
                  <TableHead>
                    <TableRow>
                      <TableCell>#</TableCell>
                      <TableCell>Color</TableCell>
                      <TableCell>Tallas</TableCell>
                      <TableCell>Stock</TableCell>
                      <TableCell>Archivos</TableCell>
                      <TableCell></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {createdVariants.map((variant, index) => (
                      <TableRow key={variant.id}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>
                          <Box display='flex' alignItems='center' gap={1}>
                            <Box
                              sx={{
                                width: 12,
                                height: 12,
                                borderRadius: '50%',
                                backgroundColor:
                                  colors.find(c => c.name.toLowerCase().replace(/\s+/g, '-') === variant.selectedColor)
                                    ?.hex || '#ccc',
                                border: '1px solid #ddd'
                              }}
                            />
                            <Typography variant='caption'>
                              {colors.find(c => c.name.toLowerCase().replace(/\s+/g, '-') === variant.selectedColor)
                                ?.name || variant.selectedColor}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant='caption'>{variant.variants.map(v => v.talla).join(', ')}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant='caption'>
                            {variant.variants.reduce((sum, v) => sum + v.stock, 0)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          {/* Mostrar miniatura de imagen en lugar de chips */}
                          {variant.mediaFiles.find(file => file.type === 'image') ? (
                            <Box
                              sx={{
                                width: 30,
                                height: 30,
                                borderRadius: 0.5,
                                overflow: 'hidden',
                                border: '1px solid',
                                borderColor: 'divider'
                              }}
                            >
                              <img
                                src={variant.mediaFiles.find(file => file.type === 'image')?.url}
                                alt=''
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              />
                            </Box>
                          ) : (
                            <Typography variant='caption' color='text.secondary'>
                              Sin imagen
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <IconButton size='small' color='error' onClick={() => handleDeleteCreatedVariant(index)}>
                            <i className='tabler-trash' style={{ fontSize: '14px' }} />
                          </IconButton>
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
                  No hay variantes
                </Typography>
                <Typography variant='caption'>Crea la primera variante</Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      </Grid>

      {/* RESUMEN */}
      {createdVariants.length > 0 && (
        <Grid size={{ xs: 12 }}>
          <Alert severity='success' sx={{ mb: 2 }}>
            <strong>{createdVariants.length} variante(s) Añadidas</strong>
          </Alert>
        </Grid>
      )}

      {/* BOTONES DE NAVEGACIÓN */}
      <Grid size={{ xs: 12 }}>
        <Box display='flex' justifyContent='space-between' alignItems='center'>
          <Button
            variant='tonal'
            color='secondary'
            onClick={handlePrev}
            startIcon={<DirectionalIcon ltrIconClass='tabler-arrow-left' rtlIconClass='tabler-arrow-right' />}
          >
            Anterior
          </Button>

          <Button
            variant='contained'
            color={activeStep === steps.length - 1 ? 'success' : 'primary'}
            onClick={handleSave}
            endIcon={<i className='tabler-device-floppy' />}
            disabled={isCreateMode && createdVariants.length === 0}
          >
            {isCreateMode ? 'Finalizar Creación' : 'Actualizar Variantes'}
          </Button>
        </Box>
      </Grid>

      {/* MODAL DE COLOR */}
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
              Color
            </Typography>
            <Box display='flex' gap={2} alignItems='center'>
              <HexColorPicker
                color={newColor.hex}
                onChange={color => setNewColor({ ...newColor, hex: color })}
                style={{ width: '120px', height: '120px' }}
              />
              <Box>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: 1,
                    backgroundColor: newColor.hex,
                    border: '2px solid #ddd',
                    mb: 1
                  }}
                />
                <Typography variant='caption' color='text.secondary'>
                  {newColor.hex}
                </Typography>
              </Box>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setColorModalOpen(false)} color='secondary' size='small'>
            Cancelar
          </Button>
          <Button onClick={handleAddColor} variant='contained' disabled={!newColor.name} size='small'>
            Agregar
          </Button>
        </DialogActions>
      </Dialog>
    </Grid>
  )
}

export default StepVariantDetails
