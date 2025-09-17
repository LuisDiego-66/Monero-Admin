// React Imports
import { useState } from 'react'

// MUI Imports
import Button from '@mui/material/Button'
import Drawer from '@mui/material/Drawer'
import IconButton from '@mui/material/IconButton'
import MenuItem from '@mui/material/MenuItem'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import Box from '@mui/material/Box'

// Third-party Imports
import { useForm, Controller } from 'react-hook-form'

// Type Imports
import type { categoryType } from './ProductCategoryTable'

// Components Imports
import CustomTextField from '@core/components/mui/TextField'

type Props = {
  open: boolean
  handleClose: () => void
  categoryData: categoryType[]
  setData: (data: categoryType[]) => void
}

type FormValues = {
  tipoCategoria: string
  nombreCategoria: string
  subcategorias: string[]
}

const AddCategoryDrawer = (props: Props) => {
  // Props
  const { open, handleClose, categoryData, setData } = props

  // States
  const [subcategorias, setSubcategorias] = useState<string[]>([''])

  // Hooks
  const {
    control,
    reset: resetForm,
    handleSubmit,
    formState: { errors }
  } = useForm<FormValues>({
    defaultValues: {
      tipoCategoria: '',
      nombreCategoria: '',
      subcategorias: ['']
    }
  })

  // Handle Form Submit
  const handleFormSubmit = (data: FormValues) => {
    // Filtrar subcategorías vacías
    const subcategoriasValidas = subcategorias.filter(sub => sub.trim() !== '')

    // Generar ID único basado en timestamp para evitar duplicados
    const uniqueId = Date.now() + Math.random()

    const newData = {
      id: uniqueId,
      categoryTitle: data.nombreCategoria,
      description: `Categoría: ${data.tipoCategoria}${subcategoriasValidas.length > 0 ? ` - Subcategorías: ${subcategoriasValidas.join(', ')}` : ''}`,
      totalProduct: Math.floor(Math.random() * 9000) + 1000,
      totalEarning: Math.floor(Math.random() * 90000) + 10000,
      image: `/images/apps/ecommerce/product-${Math.floor(Math.random() * 20) + 1}.png`,
      tipo: data.tipoCategoria,
      subcategorias: subcategoriasValidas
    }

    setData([...categoryData, newData])
    handleReset()
  }

  // Handle Form Reset
  const handleReset = () => {
    handleClose()
    resetForm({
      tipoCategoria: '',
      nombreCategoria: '',
      subcategorias: ['']
    })
    setSubcategorias([''])
  }

  // Añadir nueva subcategoría
  const añadirSubcategoria = () => {
    setSubcategorias([...subcategorias, ''])
  }

  // Actualizar subcategoría
  const actualizarSubcategoria = (index: number, valor: string) => {
    const nuevasSubcategorias = [...subcategorias]

    nuevasSubcategorias[index] = valor
    setSubcategorias(nuevasSubcategorias)
  }

  // Eliminar subcategoría
  const eliminarSubcategoria = (index: number) => {
    if (subcategorias.length > 1) {
      const nuevasSubcategorias = subcategorias.filter((_, i) => i !== index)

      setSubcategorias(nuevasSubcategorias)
    }
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
        <Typography variant='h5'>Registrar Categoría</Typography>
        <IconButton size='small' onClick={handleReset}>
          <i className='tabler-x text-textSecondary text-2xl' />
        </IconButton>
      </div>
      <Divider />
      <div className='p-6'>
        <form onSubmit={handleSubmit(data => handleFormSubmit(data))} className='flex flex-col gap-5'>
          {/* Tipo de Categoría */}
          <Controller
            name='tipoCategoria'
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
              <CustomTextField
                {...field}
                select
                fullWidth
                label='exo'
                {...(errors.tipoCategoria && { error: true, helperText: 'Este campo es obligatorio.' })}
              >
                <MenuItem value='Hombres'>Hombres</MenuItem>
                <MenuItem value='Mujeres'>Mujeres</MenuItem>
              </CustomTextField>
            )}
          />

          {/* Nombre de la Categoría */}
          <Controller
            name='nombreCategoria'
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
              <CustomTextField
                {...field}
                fullWidth
                label='Nombre de la categoría'
                placeholder='Ingrese el nombre de la categoría'
                {...(errors.nombreCategoria && { error: true, helperText: 'Este campo es obligatorio.' })}
              />
            )}
          />

          {/* Subcategorías */}
          <div>
            <div className='flex items-center justify-between mb-3'>
              <Typography variant='h6' className='text-base font-medium'>
                Subcategorías
              </Typography>
              <Button variant='contained' size='small' onClick={añadirSubcategoria} className='min-w-fit'>
                Añadir Subcategoría
              </Button>
            </div>

            <Typography variant='body2' className='text-textSecondary mb-3'>
              (Las subcategorías vacías no serán añadidas)
            </Typography>

            <Box className='flex flex-col gap-3'>
              {subcategorias.map((subcategoria, index) => (
                <div key={index} className='flex items-center gap-2'>
                  <CustomTextField
                    fullWidth
                    label={`Subcategoría ${index + 1}`}
                    placeholder='Nombre de la subcategoría'
                    value={subcategoria}
                    onChange={e => actualizarSubcategoria(index, e.target.value)}
                  />
                  {subcategorias.length > 1 && (
                    <IconButton size='small' onClick={() => eliminarSubcategoria(index)} className='text-error'>
                      <i className='tabler-x' />
                    </IconButton>
                  )}
                </div>
              ))}
            </Box>
          </div>

          {/* Botones */}
          <div className='flex items-center gap-4 mt-4'>
            <Button variant='contained' type='submit' fullWidth>
              Registrar
            </Button>
            <Button variant='outlined' color='error' type='reset' onClick={handleReset}>
              Cancelar
            </Button>
          </div>
        </form>
      </div>
    </Drawer>
  )
}

export default AddCategoryDrawer
