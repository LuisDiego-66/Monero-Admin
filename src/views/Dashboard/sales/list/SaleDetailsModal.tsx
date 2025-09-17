'use client'

// MUI Imports
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import Grid from '@mui/material/Grid'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Paper from '@mui/material/Paper'

// Tipos
type SaleType = {
  id: number
  estado: 'PENDIENTE' | 'RECHAZADO' | 'PAGADO'
  duracion: string
  cliente: string
  telefono: string
  departamento: string
  costo: number
}

type SaleDetailsModalProps = {
  open: boolean
  onClose: () => void
  sale: SaleType | null
}

// Función para obtener color del estado
const getEstadoColor = (estado: string): 'primary' | 'error' | 'success' => {
  switch (estado) {
    case 'PENDIENTE':
      return 'primary'
    case 'RECHAZADO':
      return 'error'
    case 'PAGADO':
      return 'success'
    default:
      return 'primary'
  }
}

const SaleDetailsModal = ({ open, onClose, sale }: SaleDetailsModalProps) => {
  if (!open || !sale) return null

  const handleVerComprobante = () => {
    console.log('Ver comprobante para venta:', sale.id)
  }

  const handleRechazar = () => {
    console.log('Rechazar venta:', sale.id)
  }

  const handleAprobar = () => {
    console.log('Aprobar venta:', sale.id)
  }

  // FUNCIÓN PARA WHATSAPP
  const handleWhatsAppClick = () => {
    // Limpiar el número de teléfono (quitar espacios, guiones, etc.)
    const phoneNumber = sale.telefono.replace(/\D/g, '')

    // Crear mensaje personalizado
    const message = `Hola ${sale.cliente}, te contacto por tu pedido #${sale.id}. ¿En qué puedo ayudarte?`

    // Codificar el mensaje para URL
    const encodedMessage = encodeURIComponent(message)

    // Crear URL de WhatsApp (591 es el código de Bolivia)
    const whatsappUrl = `https://wa.me/591${phoneNumber}?text=${encodedMessage}`

    // Abrir WhatsApp en nueva pestaña
    window.open(whatsappUrl, '_blank')
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth='lg' fullWidth scroll='paper'>
      <DialogTitle className='flex justify-between items-center pb-4'>
        <Typography variant='h4' className='font-semibold'>
          Detalles de la Venta
        </Typography>
        <IconButton onClick={onClose} size='small'>
          <i className='tabler-x text-xl' />
        </IconButton>
      </DialogTitle>

      <DialogContent className='p-0'>
        <Box className='p-6 space-y-6'>
          {/* Detalles de Venta */}
          <Card variant='outlined'>
            <CardContent>
              <Typography variant='h6' className='mb-4 text-textPrimary'>
                Detalles de Venta
              </Typography>

              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Box className='space-y-3'>
                    <Box>
                      <Typography variant='caption' className='text-textSecondary'>
                        ID
                      </Typography>
                      <Typography variant='body1' className='font-medium'>
                        {sale.id}
                      </Typography>
                    </Box>

                    <Box>
                      <Typography variant='caption' className='text-textSecondary'>
                        Envío
                      </Typography>
                      <Typography variant='body1'>Envío a terminal (24 hrs)</Typography>
                    </Box>

                    <Box>
                      <Typography variant='caption' className='text-textSecondary'>
                        Costo de Envío
                      </Typography>
                      <Typography variant='body1'>15 Bs.</Typography>
                    </Box>
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Box className='space-y-3'>
                    <Box>
                      <Typography variant='caption' className='text-textSecondary'>
                        Total
                      </Typography>
                      <Typography variant='h6' className='font-semibold text-primary'>
                        {sale.costo} Bs.
                      </Typography>
                    </Box>

                    <Box>
                      <Typography variant='caption' className='text-textSecondary'>
                        Método de Pago
                      </Typography>
                      <Typography variant='body1'>Transferencia Bancaria</Typography>
                    </Box>

                    <Box>
                      <Typography variant='caption' className='text-textSecondary'>
                        Estado de la venta
                      </Typography>
                      <Box className='mt-1'>
                        <Chip label={sale.estado} variant='tonal' color={getEstadoColor(sale.estado)} size='small' />
                      </Box>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Detalles del Cliente */}
          <Card variant='outlined'>
            <CardContent>
              <Typography variant='h6' className='mb-4 text-textPrimary'>
                Detalles del Cliente
              </Typography>

              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Box className='space-y-3'>
                    <Box>
                      <Typography variant='caption' className='text-textSecondary'>
                        Nombre
                      </Typography>
                      <Typography variant='body1' className='font-medium'>
                        {sale.cliente}
                      </Typography>
                    </Box>

                    {/* TELÉFONO CON WHATSAPP */}
                    <Box>
                      <Typography variant='caption' className='text-textSecondary'>
                        Teléfono
                      </Typography>
                      <Box className='flex items-center gap-2'>
                        <Typography variant='body1'>{sale.telefono}</Typography>
                        <IconButton
                          size='small'
                          onClick={handleWhatsAppClick}
                          className='text-green-600 hover:text-green-700 hover:bg-green-50'
                          title={`Contactar a ${sale.cliente} por WhatsApp`}
                        >
                          <i className='tabler-brand-whatsapp text-lg' />
                        </IconButton>
                      </Box>
                    </Box>

                    <Box>
                      <Typography variant='caption' className='text-textSecondary'>
                        Departamento
                      </Typography>
                      <Typography variant='body1'>{sale.departamento}</Typography>
                    </Box>
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Box className='space-y-3'>
                    <Box>
                      <Typography variant='caption' className='text-textSecondary'>
                        Año del Auto
                      </Typography>
                      <Typography variant='body1'>El ato</Typography>
                    </Box>

                    <Box>
                      <Typography variant='caption' className='text-textSecondary'>
                        Descripción
                      </Typography>
                      <Typography variant='body2' className='leading-relaxed'>
                        Calle 5 Juan mantienzo, villa tejada rectangular a tres cuadras del Teleforico amarillo de
                        ciudad satelite
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* TABLA DE PRENDAS CON TODOS LOS CAMPOS ORIGINALES + IMAGEN */}
          <Card variant='outlined'>
            <CardContent>
              <Typography variant='h6' className='mb-4 text-textPrimary'>
                Lista de Prendas
              </Typography>

              <TableContainer component={Paper} variant='outlined'>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell width='80px'></TableCell>
                      <TableCell>ID</TableCell>
                      <TableCell>Nombre Del Producto</TableCell>
                      <TableCell>Talla</TableCell>
                      <TableCell>Color</TableCell>
                      <TableCell align='center'>Ca...</TableCell>
                      <TableCell align='right'>Costo</TableCell>
                      <TableCell align='right'>Sub-Total</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow hover>
                      {/* NUEVA COLUMNA DE IMAGEN */}
                      <TableCell>
                        <Box className='w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden border'>
                          <Box className='w-full h-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center'>
                            <Typography variant='h6' className='text-blue-600'>
                              👕
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>

                      {/* TODOS LOS CAMPOS ORIGINALES */}
                      <TableCell>1011</TableCell>
                      <TableCell>
                        <Typography variant='body2' className='font-medium'>
                          Pantalón Cargo
                        </Typography>
                      </TableCell>
                      <TableCell>40</TableCell>
                      <TableCell>Plomo Oscuro</TableCell>
                      <TableCell align='center'>1</TableCell>
                      <TableCell align='right'>{(sale.costo - 15).toFixed(2)}</TableCell>
                      <TableCell align='right'>
                        <Typography variant='body2' className='font-semibold'>
                          {(sale.costo - 15).toFixed(2)}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Box>
      </DialogContent>

      <DialogActions className='p-6 pt-0'>
        <Box className='flex gap-3 w-full'>
          <Button
            variant='contained'
            color='secondary'
            onClick={handleVerComprobante}
            startIcon={<i className='tabler-file-text' />}
          >
            Ver Comprobante
          </Button>

          <Box className='flex-grow' />

          <Button variant='contained' color='error' onClick={handleRechazar} startIcon={<i className='tabler-x' />}>
            RECHAZAR
          </Button>

          <Button
            variant='contained'
            color='success'
            onClick={handleAprobar}
            startIcon={<i className='tabler-check' />}
          >
            APROBAR
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  )
}

export default SaleDetailsModal
