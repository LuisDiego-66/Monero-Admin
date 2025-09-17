'use client'

import { useRouter } from 'next/navigation'

import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
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

import CustomTextField from '@core/components/mui/TextField'

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

const AddProductForm = () => {
  const router = useRouter()

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

  const onSubmit = () => {
    toast.success('Producto Registrado Exitosamente')
    router.push('/products/add/variants')
  }

  return (
    <Card>
      <CardHeader title='Producto' />
      <CardContent>
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
                  <CustomTextField
                    select
                    fullWidth
                    label='Subcategoría'
                    {...field}
                    error={Boolean(errors.subcategoria)}
                  >
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

            {/*    <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name='palabrasClave'
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    label='Palabras Clave'
                    placeholder='Palabras clave separadas por comas'
                    {...(errors.palabrasClave && { error: true, helperText: 'Este campo es requerido.' })}
                  />
                )}
              />
            </Grid> */}

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

            <Grid size={{ xs: 12 }} className='flex gap-4'>
              <Button
                variant='contained'
                type='button'
                onClick={() => {
                  toast.success('Producto Registrado Exitosamente')
                  router.push('/products/add/details')
                }}
              >
                Registrar
              </Button>
              <Button variant='tonal' color='secondary' type='reset' onClick={() => reset()}>
                Limpiar
              </Button>
            </Grid>
          </Grid>
        </form>
      </CardContent>
    </Card>
  )
}

export default AddProductForm
