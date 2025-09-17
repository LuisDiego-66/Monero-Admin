'use client'

import { useState, useRef, useEffect } from 'react'

import { useRouter } from 'next/navigation'

import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
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
import { toast } from 'react-toastify'
import { HexColorPicker } from 'react-colorful'

import CustomTextField from '@core/components/mui/TextField'

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

const ProductVariantsForm = () => {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedColor, setSelectedColor] = useState('verde-hoja-seca')
  const [isDragging, setIsDragging] = useState(false)
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([])

  const [colors, setColors] = useState<ColorItem[]>([
    { name: 'Verde Hoja Seca', hex: '#8B7355' },
    { name: 'Azul Marino', hex: '#1B4965' },
    { name: 'Negro', hex: '#000000' }
  ])

  const [variants, setVariants] = useState([{ talla: 'S', stock: 5, peso: 0.5, precio: 25.99 }])

  const [colorModalOpen, setColorModalOpen] = useState(false)
  const [newColor, setNewColor] = useState({ name: '', hex: '#8B7355' })

  // Validar tipos de archivo
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
      toast.success(`${newFiles.length} archivo(s) agregado(s) exitosamente`)
    }
  }

  // Drag and Drop handlers
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

  // Click to select files
  const handleFileInputClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files

    if (files && files.length > 0) {
      processFiles(files)
    }

    // Reset input value para permitir seleccionar el mismo archivo otra vez
    e.target.value = ''
  }

  // Eliminar archivo
  const handleRemoveFile = (id: string) => {
    setMediaFiles(prev => {
      const fileToRemove = prev.find(f => f.id === id)

      if (fileToRemove) {
        URL.revokeObjectURL(fileToRemove.url) // Limpiar memoria
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
      toast.success('Color agregado exitosamente')
    }
  }

  const handleAddVariant = () => {
    setVariants([...variants, { talla: '', stock: 0, peso: 0, precio: 0 }])
  }

  const handleVariantChange = (index: number, field: string, value: any) => {
    const updated = [...variants]

    updated[index] = { ...updated[index], [field]: value }
    setVariants(updated)
  }

  const handleRemoveVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index))
  }

  const handleSave = () => {
    toast.success('Variantes guardadas exitosamente')
    router.push('/products/list')
  }

  // Limpiar URLs cuando el componente se desmonte
  useEffect(() => {
    return () => {
      mediaFiles.forEach(file => {
        URL.revokeObjectURL(file.url)
      })
    }
  }, [])

  const selectedProduct = {
    name: 'Chamarra Polar'
  }

  return (
    <Card>
      <CardHeader title='Gestión de Variantes' />
      <CardContent>
        {/* Producto */}
        <Grid size={{ xs: 12 }}>
          <Typography variant='h6' gutterBottom>
            Nombre del Producto
          </Typography>
          <Box
            sx={{
              border: '1px solid #e0e0e0',
              borderRadius: 1,
              p: 2,
              backgroundColor: '#f5f5f5'
            }}
          >
            <Typography variant='body2' color='text.secondary' sx={{ fontSize: '0.875rem' }}>
              {selectedProduct.name}
            </Typography>
          </Box>
        </Grid>
        <Grid container spacing={6}>
          {/* Imágenes del Producto */}
          <Grid size={{ xs: 12 }}>
            <Typography variant='h6' gutterBottom>
              Imágenes y Videos del Producto
            </Typography>

            {/* Área de Drag and Drop */}
            <Box
              sx={{
                border: isDragging ? '2px solid #1976d2' : '2px dashed #d1d5db',
                borderRadius: 2,
                p: 6,
                textAlign: 'center',
                backgroundColor: isDragging ? '#f3f9ff' : '#fafafa',
                cursor: 'pointer',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  backgroundColor: '#f5f5f5',
                  borderColor: '#999'
                }
              }}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={handleFileInputClick}
            >
              <i
                className='tabler-cloud-upload'
                style={{
                  fontSize: '3rem',
                  color: isDragging ? '#1976d2' : '#9ca3af',
                  marginBottom: '1rem'
                }}
              />
              <Typography variant='body2' color={isDragging ? 'primary' : 'text.secondary'}>
                {isDragging ? 'Suelta los archivos aquí' : 'Arrastra imágenes o videos para subir'}
              </Typography>
              <Typography variant='caption' color='text.secondary' display='block'>
                o haz click para seleccionar
              </Typography>
              <Typography variant='caption' color='text.secondary' display='block' sx={{ mt: 1 }}>
                Formatos soportados: JPG, PNG, GIF, WebP, MP4, AVI, MOV, WMV, WebM
              </Typography>
            </Box>

            {/* Input file oculto */}
            <input
              ref={fileInputRef}
              type='file'
              multiple
              accept='image/*,video/*'
              style={{ display: 'none' }}
              onChange={handleFileInputChange}
            />

            {/* Preview de archivos subidos */}
            {mediaFiles.length > 0 && (
              <Box sx={{ mt: 3 }}>
                <Typography variant='subtitle2' gutterBottom>
                  Archivos subidos ({mediaFiles.length})
                </Typography>
                <Grid container spacing={2}>
                  {mediaFiles.map(mediaFile => (
                    <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={mediaFile.id}>
                      <Box
                        sx={{
                          position: 'relative',
                          border: '1px solid #e0e0e0',
                          borderRadius: 2,
                          overflow: 'hidden',
                          backgroundColor: '#fff'
                        }}
                      >
                        {/* Preview del archivo */}
                        {mediaFile.type === 'image' ? (
                          <img
                            src={mediaFile.url}
                            alt={mediaFile.name}
                            style={{
                              width: '100%',
                              height: '120px',
                              objectFit: 'cover'
                            }}
                          />
                        ) : (
                          <video
                            src={mediaFile.url}
                            style={{
                              width: '100%',
                              height: '120px',
                              objectFit: 'cover'
                            }}
                            controls={false}
                            muted
                          />
                        )}

                        {/* Información del archivo */}
                        <Box sx={{ p: 1 }}>
                          <Box display='flex' justifyContent='space-between' alignItems='center'>
                            <Box>
                              <Typography variant='caption' noWrap sx={{ maxWidth: '120px' }}>
                                {mediaFile.name}
                              </Typography>
                              <Box>
                                <Chip
                                  label={mediaFile.type === 'image' ? 'Imagen' : 'Video'}
                                  size='small'
                                  color={mediaFile.type === 'image' ? 'success' : 'info'}
                                  sx={{ fontSize: '0.7rem', height: '20px' }}
                                />
                              </Box>
                            </Box>
                            <IconButton
                              size='small'
                              color='error'
                              onClick={() => handleRemoveFile(mediaFile.id)}
                              sx={{ ml: 1 }}
                            >
                              <i className='tabler-trash' style={{ fontSize: '1rem' }} />
                            </IconButton>
                          </Box>
                        </Box>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}
          </Grid>

          {/* Colores Disponibles */}
          <Grid size={{ xs: 12 }}>
            <Typography variant='h6' gutterBottom>
              Colores Disponibles
            </Typography>

            <Typography variant='body2' color='text.secondary' gutterBottom>
              Color Seleccionado
            </Typography>

            <Grid container spacing={2} alignItems='center'>
              <Grid size={{ xs: 12, sm: 6 }}>
                <CustomTextField
                  select
                  fullWidth
                  value={selectedColor}
                  onChange={e => setSelectedColor(e.target.value)}
                >
                  {colors.map((color, index) => (
                    <MenuItem key={index} value={color.name.toLowerCase().replace(/\s+/g, '-')}>
                      <Box display='flex' alignItems='center' gap={1}>
                        <Box
                          sx={{
                            width: 16,
                            height: 16,
                            borderRadius: '50%',
                            backgroundColor: color.hex,
                            border: '1px solid #ddd'
                          }}
                        />
                        {color.name}
                      </Box>
                    </MenuItem>
                  ))}
                </CustomTextField>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Button
                  variant='contained'
                  onClick={() => setColorModalOpen(true)}
                  startIcon={<i className='tabler-plus' />}
                >
                  ¿Otro color?
                </Button>
              </Grid>
            </Grid>
          </Grid>

          {/* Tallas y Stock */}
          <Grid size={{ xs: 12 }}>
            <Box className='flex justify-between items-center' sx={{ mb: 3 }}>
              <Typography variant='h6'>Tallas y Stock</Typography>
              <Button
                variant='contained'
                color='inherit'
                startIcon={<i className='tabler-plus' />}
                onClick={handleAddVariant}
              >
                Añadir Talla
              </Button>
            </Box>

            {variants.map((variant, index) => (
              <Grid container spacing={2} key={index} sx={{ mb: 2, alignItems: 'center' }}>
                <Grid size={{ xs: 12, sm: 6, md: 5 }}>
                  <Typography variant='body2' color='text.secondary' gutterBottom>
                    Talla
                  </Typography>
                  <CustomTextField
                    fullWidth
                    value={variant.talla}
                    onChange={e => handleVariantChange(index, 'talla', e.target.value)}
                    placeholder='Ej: S, M, L'
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 5 }}>
                  <Typography variant='body2' color='text.secondary' gutterBottom>
                    cantidad
                  </Typography>
                  <CustomTextField
                    fullWidth
                    type='number'
                    value={variant.stock}
                    onChange={e => handleVariantChange(index, 'stock', parseInt(e.target.value) || 0)}
                  />
                </Grid>
                {/*  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <Typography variant='body2' color='text.secondary' gutterBottom>
                    Peso (kg)
                  </Typography>
                  <CustomTextField
                    fullWidth
                    type='number'
                    value={variant.peso}
                    onChange={e => handleVariantChange(index, 'peso', parseFloat(e.target.value) || 0)}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <Typography variant='body2' color='text.secondary' gutterBottom>
                    Precio
                  </Typography>
                  <CustomTextField
                    fullWidth
                    type='number'
                    value={variant.precio}
                    onChange={e => handleVariantChange(index, 'precio', parseFloat(e.target.value) || 0)}
                    InputProps={{
                      startAdornment: <InputAdornment position='start'>$</InputAdornment>
                    }}
                  />
                </Grid> */}
                <Grid size={{ xs: 12, md: 2 }}>
                  <IconButton color='error' onClick={() => handleRemoveVariant(index)}>
                    <i className='tabler-trash' />
                  </IconButton>
                </Grid>
              </Grid>
            ))}
          </Grid>

          {/* Botones */}
          <Grid size={{ xs: 12 }} className='flex gap-4'>
            <Button
              variant='contained'
              type='button'
              onClick={handleSave}
              startIcon={<i className='tabler-device-floppy' />}
            >
              Guardar Cambios
            </Button>

            <Button variant='tonal' color='secondary' onClick={() => router.back()}>
              Cancelar
            </Button>
          </Grid>
        </Grid>
      </CardContent>

      {/* Modal de Color */}
      <Dialog open={colorModalOpen} onClose={() => setColorModalOpen(false)} maxWidth='sm' fullWidth>
        <DialogTitle>Agregar Nuevo Color</DialogTitle>
        <DialogContent>
          <Grid container spacing={4} sx={{ mt: 1 }}>
            <Grid size={{ xs: 12 }}>
              <CustomTextField
                fullWidth
                label='Nombre del Color'
                value={newColor.name}
                onChange={e => setNewColor({ ...newColor, name: e.target.value })}
                placeholder='Ej: Verde Oliva'
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Typography variant='subtitle2' gutterBottom>
                Seleccionar Color
              </Typography>
              <Box className='flex gap-4 items-center'>
                <HexColorPicker color={newColor.hex} onChange={color => setNewColor({ ...newColor, hex: color })} />
                <Box>
                  <Box
                    sx={{
                      width: 60,
                      height: 60,
                      borderRadius: 2,
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
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setColorModalOpen(false)} color='secondary'>
            Cancelar
          </Button>
          <Button onClick={handleAddColor} variant='contained' disabled={!newColor.name}>
            Agregar Color
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  )
}

export default ProductVariantsForm
