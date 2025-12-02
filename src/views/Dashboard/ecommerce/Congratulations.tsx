// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid2'

const BienvenidaAdmin = () => {
  return (
    <Card>
      <Grid container>
        <Grid size={{ xs: 8 }}>
          <CardContent>
            <Typography variant='h5' className='mbe-0.5'>
              ¡Bienvenido de nuevo! 👋
            </Typography>
            <Typography variant='subtitle1' className='mbe-2'>
              Panel de Administración
            </Typography>
            <Typography variant='body2' color='text.secondary' className='mbe-3'>
              Gestiona tu tienda y supervisa todas las operaciones desde aquí
            </Typography>
            <Button variant='contained' color='primary' href='/sales/instore'>
              Venta en Tienda
            </Button>
          </CardContent>
        </Grid>
        <Grid size={{ xs: 4 }}>
          <div className='relative bs-full is-full'>
            <img
              alt='Bienvenida Administrador'
              src='/images/apps/ecommerce/img.png'
              className='max-bs-[150px] absolute block-end-5 inline-end-6 max-is-full'
            />
          </div>
        </Grid>
      </Grid>
    </Card>
  )
}

export default BienvenidaAdmin
