'use client'

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

import type { Order } from '@/types/api/sales'

type OrderDetailsModalProps = {
  open: boolean
  onClose: () => void
  order: Order | null
}

const getEstadoColor = (estado: string): 'primary' | 'error' | 'success' | 'warning' => {
  switch (estado) {
    case 'pending':
      return 'warning'
    case 'cancelled':
      return 'error'
    case 'paid':
      return 'success'
    case 'completed':
      return 'primary'
    default:
      return 'primary'
  }
}

const getEstadoLabel = (estado: string): string => {
  const labels: Record<string, string> = {
    pending: 'PENDIENTE',
    cancelled: 'CANCELADO',
    paid: 'PAGADO',
    completed: 'COMPLETADO'
  }

  return labels[estado] || estado.toUpperCase()
}

const getTipoLabel = (tipo: string): string => {
  return tipo === 'in_store' ? 'En Tienda' : 'En Línea'
}

const formatDate = (dateString: string): string => {
  const date = new Date(dateString)

  return date.toLocaleDateString('es-BO', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const OrderDetailsModal = ({ open, onClose, order }: OrderDetailsModalProps) => {
  if (!open || !order) return null

  const handleCancelar = () => {
    console.log('Cancelar orden:', order.id)
  }

  const handleConfirmar = () => {
    console.log('Confirmar orden:', order.id)
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth='lg' fullWidth scroll='paper'>
      <DialogTitle className='flex justify-between items-center pb-4'>
        <Typography variant='h4' className='font-semibold'>
          Detalles de la Orden #{order.id}
        </Typography>
        <IconButton onClick={onClose} size='small'>
          <i className='tabler-x text-xl' />
        </IconButton>
      </DialogTitle>

      <DialogContent className='p-0'>
        <Box className='p-6 space-y-6'>
          <Card variant='outlined'>
            <CardContent>
              <Typography variant='h6' className='mb-4 text-textPrimary'>
                Información General
              </Typography>

              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Box className='space-y-3'>
                    <Box>
                      <Typography variant='caption' className='text-textSecondary'>
                        ID de Orden
                      </Typography>
                      <Typography variant='body1' className='font-medium'>
                        #{order.id}
                      </Typography>
                    </Box>

                    <Box>
                      <Typography variant='caption' className='text-textSecondary'>
                        Tipo de Venta
                      </Typography>
                      <Typography variant='body1'>{getTipoLabel(order.type)}</Typography>
                    </Box>

                    <Box>
                      <Typography variant='caption' className='text-textSecondary'>
                        Fecha de Expiración
                      </Typography>
                      <Typography variant='body2'>{formatDate(order.expiresAt)}</Typography>
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
                        Bs. {parseFloat(order.totalPrice).toFixed(2)}
                      </Typography>
                    </Box>

                    <Box>
                      <Typography variant='caption' className='text-textSecondary'>
                        Estado
                      </Typography>
                      <Box className='mt-1'>
                        <Chip
                          label={getEstadoLabel(order.status)}
                          variant='tonal'
                          color={getEstadoColor(order.status)}
                          size='small'
                        />
                      </Box>
                    </Box>

                    <Box>
                      <Typography variant='caption' className='text-textSecondary'>
                        Habilitado
                      </Typography>
                      <Typography variant='body1'>{order.enabled ? 'Sí' : 'No'}</Typography>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {order.customer && (
            <Card variant='outlined'>
              <CardContent>
                <Typography variant='h6' className='mb-4 text-textPrimary'>
                  Información del Cliente
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  Cliente: {JSON.stringify(order.customer)}
                </Typography>
              </CardContent>
            </Card>
          )}

          {order.address && (
            <Card variant='outlined'>
              <CardContent>
                <Typography variant='h6' className='mb-4 text-textPrimary'>
                  Dirección de Envío
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  {JSON.stringify(order.address)}
                </Typography>
              </CardContent>
            </Card>
          )}

          {order.shipment && (
            <Card variant='outlined'>
              <CardContent>
                <Typography variant='h6' className='mb-4 text-textPrimary'>
                  Información de Envío
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  {JSON.stringify(order.shipment)}
                </Typography>
              </CardContent>
            </Card>
          )}

          <Card variant='outlined'>
            <CardContent>
              <Typography variant='h6' className='mb-4 text-textPrimary'>
                Productos de la Orden
              </Typography>

              <TableContainer component={Paper} variant='outlined'>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell width='80px'>Imagen</TableCell>
                      <TableCell>Producto</TableCell>
                      <TableCell align='center'>Cantidad</TableCell>
                      <TableCell align='right'>Precio Unit.</TableCell>
                      <TableCell align='right'>Descuento</TableCell>
                      <TableCell align='right'>Total</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {order.items.map(item => (
                      <TableRow key={item.id} hover>
                        <TableCell>
                          <Box className='w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden border'>
                            {item.variant?.productColor?.multimedia?.[0] ? (
                              <img
                                src={item.variant.productColor.multimedia[0]}
                                alt={item.variant.productColor.product.name}
                                className='w-full h-full object-cover'
                              />
                            ) : (
                              <Box className='w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center'>
                                <Typography variant='h6' className='text-gray-400'>
                                  📦
                                </Typography>
                              </Box>
                            )}
                          </Box>
                        </TableCell>

                        <TableCell>
                          <Typography variant='body2' className='font-medium'>
                            {item.variant?.productColor?.product?.name || 'Producto sin nombre'}
                          </Typography>
                          {item.variant?.productColor?.product?.description && (
                            <Typography variant='caption' color='text.secondary' className='block mt-1'>
                              {item.variant.productColor.product.description}
                            </Typography>
                          )}
                        </TableCell>

                        <TableCell align='center'>
                          <Typography variant='body2' className='font-medium'>
                            {item.quantity}
                          </Typography>
                        </TableCell>

                        <TableCell align='right'>
                          <Typography variant='body2'>Bs. {parseFloat(item.unit_price).toFixed(2)}</Typography>
                        </TableCell>

                        <TableCell align='right'>
                          <Typography variant='body2' color={item.discountValue > 0 ? 'error' : 'text.secondary'}>
                            {item.discountValue > 0 ? `-${item.discountValue}%` : '0%'}
                          </Typography>
                        </TableCell>

                        <TableCell align='right'>
                          <Typography variant='body2' className='font-semibold'>
                            Bs. {parseFloat(item.totalPrice).toFixed(2)}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}

                    <TableRow>
                      <TableCell colSpan={5} align='right'>
                        <Typography variant='h6' className='font-bold'>
                          Total de la Orden:
                        </Typography>
                      </TableCell>
                      <TableCell align='right'>
                        <Typography variant='h6' className='font-bold text-primary'>
                          Bs. {parseFloat(order.totalPrice).toFixed(2)}
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
        <Box className='flex gap-3 w-full justify-end'>
          {order.status === 'pending' && (
            <>
              <Button variant='contained' color='error' onClick={handleCancelar} startIcon={<i className='tabler-x' />}>
                Cancelar Orden
              </Button>

              <Button
                variant='contained'
                color='success'
                onClick={handleConfirmar}
                startIcon={<i className='tabler-check' />}
              >
                Confirmar Orden
              </Button>
            </>
          )}

          {order.status !== 'pending' && (
            <Button variant='outlined' onClick={onClose}>
              Cerrar
            </Button>
          )}
        </Box>
      </DialogActions>
    </Dialog>
  )
}

export default OrderDetailsModal
