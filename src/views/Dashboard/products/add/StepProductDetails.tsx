// React Imports

import Grid from '@mui/material/Grid2'
import Radio from '@mui/material/Radio'
import RadioGroup from '@mui/material/RadioGroup'
import FormControlLabel from '@mui/material/FormControlLabel'
import Button from '@mui/material/Button'
import FormLabel from '@mui/material/FormLabel'
import FormHelperText from '@mui/material/FormHelperText'
import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'
import { toast } from 'react-toastify'
import { useForm, Controller } from 'react-hook-form'

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
  onProductCreated?: (id: string) => void
}

type FormValues = {
  genero: string
  categoria: string
  subcategoria: string
  sale: boolean
  nombreProducto: string
  costo: string
  codigo: string
  palabrasClave: string
  descripcion: string
}

const StepProductDetails = ({
  activeStep,
  handleNext,
  handlePrev,

  mode,
  productId,
  onProductCreated
}: Props) => {
  const {
    control,
    reset,
    handleSubmit,
    formState: { errors }
  } = useForm<FormValues>({
    defaultValues: {
      genero: '',
      categoria: '',
      subcategoria: '',
      sale: false,
      nombreProducto: '',
      costo: '',
      codigo: '',
      palabrasClave: '',
      descripcion: ''
    }
  })

  const onSubmit = async (data: FormValues) => {
    try {
      if (mode === 'create') {
        // Simulación de creación de producto - aquí harías tu POST real
        console.log('Creando producto:', data)

        // Simular respuesta del backend con ID
        const mockProductId = 'prod_' + Date.now()

        toast.success('Producto registrado exitosamente')

        // Notificar al wizard que el producto fue creado
        onProductCreated?.(mockProductId)

        // En modo wizard, avanza automáticamente
        handleNext()
      } else {
        // Modo edición - hacer PUT/PATCH
        console.log('Actualizando producto:', productId, data)
        toast.success('Producto actualizado exitosamente')
      }
    } catch (error) {
      toast.error('Error al guardar el producto')
      console.error(error)
    }
  }

  const isCreateMode = mode === 'create'

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Grid container spacing={6}>
        <Grid size={{ xs: 12 }}>
          <FormControl error={Boolean(errors.genero)}>
            <FormLabel>Género</FormLabel>
            <Controller
              name='genero'
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <RadioGroup row {...field} name='genero-group'>
                  <FormControlLabel value='hombres' control={<Radio />} label='Hombres' />
                  <FormControlLabel value='mujeres' control={<Radio />} label='Mujeres' />
                </RadioGroup>
              )}
            />
            {errors.genero && <FormHelperText error>Este campo es requerido.</FormHelperText>}
          </FormControl>
        </Grid>

        <Grid size={{ xs: 12, sm: 4 }}>
          <Controller
            name='categoria'
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
              <CustomTextField select fullWidth label='Categoría' {...field} error={Boolean(errors.categoria)}>
                <MenuItem value=''>Seleccionar Tipo</MenuItem>
                <MenuItem value='sweater'>Sweater</MenuItem>
                <MenuItem value='camisa'>Camisa</MenuItem>
                <MenuItem value='pantalon'>Pantalón</MenuItem>
                <MenuItem value='vestido'>Vestido</MenuItem>
              </CustomTextField>
            )}
          />
          {errors.categoria && <FormHelperText error>Este campo es requerido.</FormHelperText>}
        </Grid>

        <Grid size={{ xs: 12, sm: 4 }}>
          <Controller
            name='subcategoria'
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
              <CustomTextField select fullWidth label='Subcategoría' {...field} error={Boolean(errors.subcategoria)}>
                <MenuItem value=''>Seleccionar Subcategoría</MenuItem>
                <MenuItem value='sudaderas-sweater'>SUDADERAS - SWEATER</MenuItem>
                <MenuItem value='sweater-casual'>SWEATER - CASUAL</MenuItem>
                <MenuItem value='sweater-formal'>SWEATER - FORMAL</MenuItem>
                <MenuItem value='sweater-deportivo'>SWEATER - DEPORTIVO</MenuItem>
              </CustomTextField>
            )}
          />
          {errors.subcategoria && <FormHelperText error>Este campo es requerido.</FormHelperText>}
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <Controller
            name='nombreProducto'
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
              <CustomTextField
                {...field}
                fullWidth
                label='Nombre del Producto'
                placeholder='Ingresa el nombre del producto'
                {...(errors.nombreProducto && { error: true, helperText: 'Este campo es requerido.' })}
              />
            )}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <Controller
            name='costo'
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
              <CustomTextField
                {...field}
                fullWidth
                label='Costo'
                placeholder='0.00'
                type='number'
                {...(errors.costo && { error: true, helperText: 'Este campo es requerido.' })}
              />
            )}
          />
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Controller
            name='descripcion'
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
              <CustomTextField
                {...field}
                rows={4}
                fullWidth
                multiline
                label='Descripción'
                placeholder='Descripción detallada del producto'
                {...(errors.descripcion && { error: true, helperText: 'Este campo es requerido.' })}
              />
            )}
          />
        </Grid>

        <Grid size={{ xs: 12 }}>
          <div className='flex items-center justify-between'>
            <Button
              variant='tonal'
              color='secondary'
              disabled={activeStep === 0}
              onClick={handlePrev}
              startIcon={<DirectionalIcon ltrIconClass='tabler-arrow-left' rtlIconClass='tabler-arrow-right' />}
            >
              Anterior
            </Button>

            <div className='flex gap-4'>
              {/* Botón para limpiar/resetear */}
              <Button variant='tonal' color='secondary' type='button' onClick={() => reset()}>
                Limpiar
              </Button>

              {/* Botón principal */}
              <Button
                variant='contained'
                color='primary'
                type='submit'
                endIcon={
                  isCreateMode ? (
                    <DirectionalIcon ltrIconClass='tabler-arrow-right' rtlIconClass='tabler-arrow-left' />
                  ) : (
                    <i className='tabler-device-floppy' />
                  )
                }
              >
                {isCreateMode ? 'Registrar y Continuar' : 'Actualizar Producto'}
              </Button>
            </div>
          </div>
        </Grid>
      </Grid>
    </form>
  )
}

export default StepProductDetails
