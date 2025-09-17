// MUI Imports
import Grid from '@mui/material/Grid2'

// Component Imports
import { Typography } from '@mui/material'

import AddProductForm from '@/views/Dashboard/products/add/index'

const eCommerceProductsAdd = () => {
  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <Typography variant='h4' sx={{ paddingLeft: '20px' }}>
          Agregar Producto
        </Typography>
        <Typography sx={{ paddingLeft: '20px' }}>
          Completa el formulario para <code>agregar</code> un nuevo producto al catálogo.
        </Typography>
      </Grid>
      <Grid size={{ xs: 12 }}>
        <AddProductForm />
      </Grid>
    </Grid>
  )
}

export default eCommerceProductsAdd
