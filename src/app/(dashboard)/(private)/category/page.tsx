// MUI Imports
import Grid from '@mui/material/Grid2'

// Component Imports
import { Typography } from '@mui/material'

// Component Imports
import ProductCategoryTable from '@views/Dashboard/category/ProductCategoryTable'

const eCommerceProductsCategory = () => {
  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <Typography variant='h4' sx={{ paddingLeft: '20px' }}>
          Categorías y Subcategorías
        </Typography>
       <Typography sx={{ paddingLeft: '20px' }}>
          Aquí puedes visualizar y gestionar la tabla de <code>categorías</code> y <code>subcategorías</code>.
        </Typography>
      </Grid>
      <Grid size={{ xs: 12 }}>
        <ProductCategoryTable />
      </Grid>
    </Grid>
  )
}


export default eCommerceProductsCategory
