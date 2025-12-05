// MUI Imports
import Grid from '@mui/material/Grid2'
import { Typography } from '@mui/material'

// Component Imports
import AdvertisementManager from '@views/Dashboard/advertisement/AdvertisementManager'

const AdvertisementPage = () => {
  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <Typography variant='h4' sx={{ paddingLeft: '20px' }}>
          Anuncios
        </Typography>
        <Typography sx={{ paddingLeft: '20px' }}>
          <code>Gestiona el anuncio</code> que se muestra en la aplicación.
        </Typography>
      </Grid>
      <Grid size={{ xs: 12 }}>
        <AdvertisementManager />
      </Grid>
    </Grid>
  )
}

export default AdvertisementPage
