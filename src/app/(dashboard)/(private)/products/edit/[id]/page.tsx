import Grid from '@mui/material/Grid2'
import { Typography } from '@mui/material'

import AddProductForm from '@/views/Dashboard/products/add/index'

const ProductsEdit = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params

  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <Typography variant='h4' sx={{ paddingLeft: '20px' }}>
          Editar Producto
        </Typography>
        <Typography sx={{ paddingLeft: '20px' }}>
          Modifica los datos del <code>producto con ID {id}</code> y sus variantes.
        </Typography>
      </Grid>
      <Grid size={{ xs: 12 }}>
        <AddProductForm mode='edit' productId={id} />
      </Grid>
    </Grid>
  )
}

export default ProductsEdit
