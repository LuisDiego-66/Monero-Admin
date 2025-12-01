'use client'

// MUI Imports
import Grid from '@mui/material/Grid2'

// Component Imports
import { Typography } from '@mui/material'

import InStore from '@/views/Dashboard/sales/instore/SalesInStore'

const InStoreSales = () => {
  // Vars

  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <div className='flex justify-between items-center' style={{ paddingLeft: '20px', paddingRight: '20px' }}>
          <div>
            <Typography variant='h4'>Venta en Tienda</Typography>
            <Typography sx={{ mt: 1 }}>
              Aquí puedes gestionar las <code>ventas en tienda</code> y procesar pagos.
            </Typography>
          </div>
          <Typography variant='body2' color='text.secondary'>
            {new Date().toLocaleDateString('es-BO', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric'
            })}{' '}
            -{' '}
            {new Date().toLocaleTimeString('es-BO', {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
              hour12: true
            })}
          </Typography>
        </div>
      </Grid>
      <Grid size={{ xs: 12 }}>
        <InStore />
      </Grid>
    </Grid>
  )
}

export default InStoreSales
