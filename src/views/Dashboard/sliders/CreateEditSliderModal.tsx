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

import CustomTextField from '@core/components/mui/TextField'
import { useCreateSlider, useUpdateSlider, useUploadSliderImage } from '@/hooks/useSliders'

import type { Slider } from '@/types/api/sliders'

interface CreateEditSliderModalProps {
  open: boolean
  onClose: () => void
  slider?: Slider | null
  onSuccess: (message: string) => void
  onError: (message: string) => void
}

const CreateEditSliderModal = ({ open, onClose, slider, onSuccess, onError }: CreateEditSliderModalProps) => {
  const [name, setName] = useState('')
  const [image, setImage] = useState('')
  const [buttonText, setButtonText] = useState('')
  const [url, setUrl] = useState('')
  const [sliderType, setSliderType] = useState<'mobile' | 'desktop'>('desktop')
  const [gender, setGender] = useState<'male' | 'female'>('male')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>('')
  const [isDragging, setIsDragging] = useState(false)

  const createSlider = useCreateSlider()
  const updateSlider = useUpdateSlider()
  const uploadImage = useUploadSliderImage()

  useEffect(() => {
    if (open) {
      if (slider) {
        setName(slider.name)
        setImage(slider.image)
        setButtonText(slider.button_text)
        setUrl(slider.url)
        setSliderType(slider.slider_type)
        setGender(slider.gender)
        setImagePreview(slider.image)
        setImageFile(null)
      } else {
        setName('')
        setImage('')
        setButtonText('')
        setUrl('')
        setSliderType('desktop')
        setGender('male')
        setImagePreview('')
        setImageFile(null)
      }
    }
  }, [open, slider])

  const validateImageFile = useCallback(
    (file: File): boolean => {
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png']

      if (!validTypes.includes(file.type.toLowerCase())) {
        onError('Solo se permiten imágenes en formato JPG, JPEG o PNG')

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

  const handleRemoveImage = useCallback(() => {
    setImageFile(null)
    setImagePreview(slider?.image || '')
    setImage(slider?.image || '')
  }, [slider])

  const handleSubmit = useCallback(async () => {
    if (!name.trim()) {
      onError('Debe ingresar un nombre para el slider')

      return
    }

    if (!buttonText.trim()) {
      onError('Debe ingresar un texto para el botón')

      return
    }

    if (!slider && !imageFile && !image) {
      onError('Debe seleccionar una imagen')

      return
    }

    try {
      let imageUrl = image

      if (imageFile) {
        const uploadResult = await uploadImage.mutateAsync(imageFile)

        imageUrl = uploadResult.url
      }

      const sliderData = {
        name: name.trim(),
        image: imageUrl,
        button_text: buttonText.trim(),
        url: url.trim() || '',
        slider_type: sliderType,
        gender: gender
      }

      if (slider) {
        await updateSlider.mutateAsync({
          id: slider.id,
          data: sliderData
        })
        onSuccess('Slider actualizado correctamente')
      } else {
        await createSlider.mutateAsync(sliderData)
        onSuccess('Slider creado correctamente')
      }

      onClose()
    } catch (error) {
      onError(error instanceof Error ? error.message : 'Error al guardar el slider')
    }
  }, [
    name,
    image,
    buttonText,
    url,
    sliderType,
    gender,
    imageFile,
    slider,
    createSlider,
    updateSlider,
    uploadImage,
    onSuccess,
    onError,
    onClose
  ])

  const isLoading = createSlider.isPending || updateSlider.isPending || uploadImage.isPending

  return (
    <Dialog open={open} onClose={onClose} maxWidth='md' fullWidth>
      <DialogTitle>{slider ? 'Editar Slider' : 'Crear Nuevo Slider'}</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 2 }}>
          <CustomTextField
            label='Nombre del Slider'
            value={name}
            onChange={e => setName(e.target.value)}
            fullWidth
            required
          />

          <CustomTextField
            label='Texto del Botón'
            value={buttonText}
            onChange={e => setButtonText(e.target.value)}
            fullWidth
            required
          />

          <CustomTextField
            label='URL de destino'
            value={url}
            onChange={e => setUrl(e.target.value)}
            fullWidth
            placeholder='https://example.com'
            helperText='URL a la que redirige el botón (opcional)'
          />

          <Box sx={{ display: 'flex', gap: 2 }}>
            <CustomTextField
              select
              label='Tipo de Slider'
              value={sliderType}
              onChange={e => setSliderType(e.target.value as 'mobile' | 'desktop')}
              fullWidth
              required
            >
              <MenuItem value='mobile'>Móvil</MenuItem>
              <MenuItem value='desktop'>Desktop</MenuItem>
            </CustomTextField>

            <CustomTextField
              select
              label='Género'
              value={gender}
              onChange={e => setGender(e.target.value as 'male' | 'female')}
              fullWidth
              required
            >
              <MenuItem value='male'>Hombre</MenuItem>
              <MenuItem value='female'>Mujer</MenuItem>
            </CustomTextField>
          </Box>

          <Box>
            <Typography variant='subtitle1' sx={{ mb: 2, fontWeight: 600 }}>
              Imagen del Slider
            </Typography>

            {imagePreview ? (
              <Card sx={{ position: 'relative', mb: 2 }}>
                <CardMedia
                  component='img'
                  height='300'
                  image={imagePreview}
                  alt='Preview'
                  sx={{ objectFit: 'cover' }}
                />
                <IconButton
                  sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    bgcolor: 'background.paper',
                    '&:hover': { bgcolor: 'error.main', color: 'white' }
                  }}
                  onClick={handleRemoveImage}
                  size='small'
                >
                  <i className='tabler-trash' />
                </IconButton>
              </Card>
            ) : null}

            <Box
              onDragEnter={handleDragEnter}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              sx={{
                border: '2px dashed',
                borderColor: isDragging ? 'primary.main' : 'divider',
                borderRadius: 2,
                p: 4,
                textAlign: 'center',
                bgcolor: isDragging ? 'action.hover' : 'background.paper',
                transition: 'all 0.2s',
                cursor: 'pointer',
                '&:hover': {
                  borderColor: 'primary.main',
                  bgcolor: 'action.hover'
                }
              }}
            >
              <input type='file' hidden accept='image/jpeg,image/jpg,image/png' onChange={handleImageChange} id='slider-image-input' />
              <label htmlFor='slider-image-input' style={{ cursor: 'pointer', width: '100%', display: 'block' }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                  <i
                    className='tabler-upload'
                    style={{ fontSize: 48, color: isDragging ? 'primary.main' : 'text.secondary' }}
                  />
                  <Box>
                    <Typography variant='body1' color='text.primary' sx={{ fontWeight: 500 }}>
                      {isDragging ? 'Suelta la imagen aquí' : 'Arrastra y suelta una imagen aquí'}
                    </Typography>
                    <Typography variant='body2' color='text.secondary'>
                      o haz clic para seleccionar
                    </Typography>
                  </Box>
                  <Typography variant='caption' color='text.secondary'>
                    Formatos aceptados: JPG, JPEG, PNG. Tamaño máximo: 2MB
                  </Typography>
                </Box>
              </label>
            </Box>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color='secondary' disabled={isLoading}>
          Cancelar
        </Button>
        <Button onClick={handleSubmit} color='primary' variant='contained' disabled={isLoading}>
          {isLoading ? <CircularProgress size={20} /> : slider ? 'Actualizar Slider' : 'Crear Slider'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default CreateEditSliderModal
