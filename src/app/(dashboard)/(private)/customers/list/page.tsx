import Grid from '@mui/material/Grid2'
import { Typography } from '@mui/material'

import CustomerListTable from '@views/Dashboard/customers/list/CustomerListTable'

const CustomerListTablePage = () => {
  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <Typography variant='h4' sx={{ paddingLeft: '20px' }}>
          Gestión de Clientes y Envío de Correos
        </Typography>
      </Grid>
      <Grid size={{ xs: 12 }}>
        <CustomerListTable />
      </Grid>
    </Grid>
  )
}

export default CustomerListTablePage
