'use client'

import { useState, useMemo, useEffect, useCallback } from 'react'

import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardMedia from '@mui/material/CardMedia'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'
import Divider from '@mui/material/Divider'
import Badge from '@mui/material/Badge'
import MenuItem from '@mui/material/MenuItem'
import type { TextFieldProps } from '@mui/material/TextField'

import CustomTextField from '@core/components/mui/TextField'
import { useVariants, useCreateOutfit, useUpdateOutfit } from '@/hooks/useOutfits'

import type { Outfit, ProductColor } from '@/types/api/outfits'

interface CreateEditOutfitModalProps {
  open: boolean
  onClose: () => void
  outfit?: Outfit | null
  onSuccess: (message: string) => void
  onError: (message: string) => void
}

const DebouncedInput = ({
  value: initialValue,
  onChange,
  debounce = 500,
  ...props
}: {
  value: string | number
  onChange: (value: string | number) => void
  debounce?: number
} & Omit<TextFieldProps, 'onChange'>) => {
  const [value, setValue] = useState(initialValue)

  useEffect(() => {
    setValue(initialValue)
  }, [initialValue])

  useEffect(() => {
    const timeout = setTimeout(() => {
      onChange(value)
    }, debounce)

    return () => clearTimeout(timeout)
  }, [value, onChange, debounce])

  return <CustomTextField {...props} value={value} onChange={e => setValue(e.target.value)} />
}

const CreateEditOutfitModal = ({ open, onClose, outfit, onSuccess, onError }: CreateEditOutfitModalProps) => {
  const [outfitName, setOutfitName] = useState('')
  const [selectedProductColors, setSelectedProductColors] = useState<number[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(12)

  const createOutfit = useCreateOutfit()
  const updateOutfit = useUpdateOutfit()

  const queryParams = useMemo(
    () => ({
      limit: pageSize,
      page: page,
      search: searchTerm
    }),
    [pageSize, page, searchTerm]
  )

  const { data: variantsData, isLoading } = useVariants(queryParams)

  const productColors = useMemo(() => {
    return variantsData?.data || []
  }, [variantsData])

  const totalRecords = useMemo(() => {
    return variantsData?.meta?.total || 0
  }, [variantsData])

  const hasNextPage = useMemo(() => {
    return variantsData?.meta?.hasNextPage || false
  }, [variantsData])

  const hasPreviousPage = useMemo(() => {
    return variantsData?.meta?.hasPreviousPage || false
  }, [variantsData])

  useEffect(() => {
    if (open) {
      if (outfit) {
        setOutfitName(outfit.name)
        const productColorIds = outfit.productColors?.map(pc => pc.id) || []

        setSelectedProductColors(productColorIds)
      } else {
        setOutfitName('')
        setSelectedProductColors([])
      }

      setSearchTerm('')
      setPage(1)
    }
  }, [open, outfit])

  const handleToggleProductColor = useCallback((productColorId: number) => {
    setSelectedProductColors(prev => {
      if (prev.includes(productColorId)) {
        return prev.filter(id => id !== productColorId)
      } else {
        return [...prev, productColorId]
      }
    })
  }, [])

  const handleRemoveProductColor = useCallback((productColorId: number) => {
    setSelectedProductColors(prev => prev.filter(id => id !== productColorId))
  }, [])

  const isProductColorSelected = useCallback(
    (productColorId: number) => {
      return selectedProductColors.includes(productColorId)
    },
    [selectedProductColors]
  )

  const selectedProductColorsDetails = useMemo(() => {
    const selectedFromCurrent = productColors.filter(pc => selectedProductColors.includes(pc.id))

    if (outfit) {
      const outfitProductColors = outfit.productColors || []
      const selectedFromOutfit = outfitProductColors.filter(pc => selectedProductColors.includes(pc.id))

      const allSelected = [...selectedFromCurrent]

      selectedFromOutfit.forEach(outfitPc => {
        if (!allSelected.find(pc => pc.id === outfitPc.id)) {
          allSelected.push({
            id: outfitPc.id,
            multimedia: outfitPc.multimedia,
            pdfs: outfitPc.pdfs,
            color: { id: 0, name: 'N/A', code: '#000000' },
            product: { id: 0, name: 'Producto', description: '', price: '0', enabled: true },
            variants: []
          })
        }
      })

      return allSelected
    }

    return selectedFromCurrent
  }, [productColors, selectedProductColors, outfit])

  const handleSubmit = useCallback(async () => {
    if (!outfitName.trim()) {
      onError('Debe ingresar un nombre para el outfit')

      return
    }

    if (selectedProductColors.length < 1) {
      onError('Debe seleccionar al menos 1 prenda')

      return
    }

    try {
      if (outfit) {
        await updateOutfit.mutateAsync({
          id: outfit.id,
          data: {
            name: outfitName,
            productColorIds: selectedProductColors
          }
        })
        onSuccess('Outfit actualizado correctamente')
      } else {
        await createOutfit.mutateAsync({
          name: outfitName,
          productColorIds: selectedProductColors
        })
        onSuccess('Outfit creado correctamente')
      }

      onClose()
    } catch (error) {
      onError(error instanceof Error ? error.message : 'Error al guardar el outfit')
    }
  }, [outfitName, selectedProductColors, outfit, createOutfit, updateOutfit, onSuccess, onError, onClose])

  const handleLoadMore = useCallback(() => {
    if (hasNextPage) {
      setPage(prev => prev + 1)
    }
  }, [hasNextPage])

  const handleLoadPrevious = useCallback(() => {
    if (hasPreviousPage) {
      setPage(prev => prev - 1)
    }
  }, [hasPreviousPage])

  return (
    <Dialog open={open} onClose={onClose} maxWidth='lg' fullWidth>
      <DialogTitle>{outfit ? 'Editar Outfit' : 'Crear Nuevo Outfit'}</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 2 }}>
          <CustomTextField
            label='Nombre del Outfit'
            value={outfitName}
            onChange={e => setOutfitName(e.target.value)}
            fullWidth
            required
          />

          <Divider />

          <Box>
            <Typography variant='subtitle1' sx={{ mb: 2, fontWeight: 600 }}>
              Buscar Prendas
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
              <DebouncedInput
                value={searchTerm}
                onChange={value => {
                  setSearchTerm(String(value))
                  setPage(1)
                }}
                placeholder='Buscar por nombre de producto...'
                fullWidth
                size='small'
              />
              <CustomTextField
                select
                value={pageSize}
                onChange={e => {
                  setPageSize(Number(e.target.value))
                  setPage(1)
                }}
                className='is-[70px]'
                size='small'
              >
                <MenuItem value={12}>12</MenuItem>
                <MenuItem value={24}>24</MenuItem>
                <MenuItem value={48}>48</MenuItem>
              </CustomTextField>
            </Box>
          </Box>

          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : productColors.length === 0 ? (
            <Alert severity='info'>No se encontraron productos</Alert>
          ) : (
            <>
              <Grid container spacing={2}>
                {productColors.map(productColor => {
                  const isSelected = isProductColorSelected(productColor.id)
                  const imageUrl = productColor.multimedia?.[0] || ''

                  return (
                    <Grid item xs={12} sm={6} md={4} lg={3} key={productColor.id}>
                      <Card
                        sx={{
                          cursor: 'pointer',
                          border: isSelected ? 2 : 1,
                          borderColor: isSelected ? 'primary.main' : 'divider',
                          transition: 'all 0.2s',
                          '&:hover': {
                            transform: 'translateY(-4px)',
                            boxShadow: 4
                          }
                        }}
                        onClick={() => handleToggleProductColor(productColor.id)}
                      >
                        <Badge
                          badgeContent={isSelected ? <i className='tabler-check' /> : null}
                          color='primary'
                          sx={{
                            width: '100%',
                            '& .MuiBadge-badge': {
                              top: 10,
                              right: 10
                            }
                          }}
                        >
                          <CardMedia
                            component='img'
                            height='200'
                            image={imageUrl || '/images/placeholder.png'}
                            alt={productColor.product.name}
                            sx={{ objectFit: 'cover', height: 200 }}
                          />
                        </Badge>
                        <CardContent>
                          <Typography variant='subtitle2' noWrap sx={{ fontWeight: 600 }}>
                            {productColor.product.name}
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 0.5, mt: 1, alignItems: 'center' }}>
                            <Chip
                              label={productColor.color.name}
                              size='small'
                              sx={{
                                backgroundColor: productColor.color.code,
                                color: 'white'
                              }}
                            />
                            <Typography variant='caption' color='text.secondary'>
                              ${productColor.product.price}
                            </Typography>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  )
                })}
              </Grid>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                <Button
                  variant='outlined'
                  disabled={!hasPreviousPage}
                  onClick={handleLoadPrevious}
                  startIcon={<i className='tabler-chevron-left' />}
                >
                  Anterior
                </Button>
                <Typography variant='body2' color='text.secondary'>
                  Página {page} - {totalRecords} productos
                </Typography>
                <Button
                  variant='outlined'
                  disabled={!hasNextPage}
                  onClick={handleLoadMore}
                  endIcon={<i className='tabler-chevron-right' />}
                >
                  Siguiente
                </Button>
              </Box>
            </>
          )}

          <Divider />

          <Box>
            <Typography variant='subtitle1' sx={{ mb: 2, fontWeight: 600 }}>
              Prendas Seleccionadas ({selectedProductColors.length})
            </Typography>
            {selectedProductColors.length === 0 ? (
              <Alert severity='warning'>No has seleccionado ninguna prenda</Alert>
            ) : (
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {selectedProductColorsDetails.map(pc => {
                  const productName = pc.product?.name || 'Producto'
                  const colorName = pc.color?.name || 'Color'

                  return (
                    <Chip
                      key={pc.id}
                      label={`${productName} - ${colorName}`}
                      onDelete={() => handleRemoveProductColor(pc.id)}
                      color='primary'
                      variant='outlined'
                    />
                  )
                })}
              </Box>
            )}
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color='secondary'>
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit}
          color='primary'
          variant='contained'
          disabled={createOutfit.isPending || updateOutfit.isPending}
        >
          {createOutfit.isPending || updateOutfit.isPending ? (
            <CircularProgress size={20} />
          ) : outfit ? (
            'Actualizar Outfit'
          ) : (
            'Crear Outfit'
          )}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default CreateEditOutfitModal
