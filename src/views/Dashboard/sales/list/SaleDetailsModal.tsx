'use client'

import { useState } from 'react'

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
import TextField from '@mui/material/TextField'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import Snackbar from '@mui/material/Snackbar'

import { useQueryClient } from '@tanstack/react-query'

import { useCancelOrder, useSendOrder } from '@/hooks/useSales'
import type { Order } from '@/types/api/sales'

interface SnackbarMessage {
  message: string
  severity: 'success' | 'error' | 'info' | 'warning'
  key: number
}

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
    case 'completed':
      return 'success'
    case 'confirmed':
      return 'primary'
    case 'sent':
      return 'primary'
    case 'expired':
      return 'error'
    default:
      return 'primary'
  }
}

const getEstadoLabel = (estado: string): string => {
  const labels: Record<string, string> = {
    pending: 'Pendiente',
    cancelled: 'Cancelado',
    paid: 'Pagado',
    completed: 'Completado',
    confirmed: 'Confirmado',
    sent: 'Enviado',
    expired: 'Expirado'
  }

  return labels[estado] || estado
}

const getPaymentLabel = (paymentType: string): string => {
  const labels: Record<string, string> = {
    cash: 'Efectivo',
    card: 'Tarjeta',
    qr: 'QR'
  }

  return labels[paymentType] || paymentType
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
  const queryClient = useQueryClient()
  const [dhlCode, setDhlCode] = useState('')
  const [showDhlInput, setShowDhlInput] = useState(false)
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)
  const [snackPack, setSnackPack] = useState<SnackbarMessage[]>([])
  const [messageInfo, setMessageInfo] = useState<SnackbarMessage | undefined>(undefined)
  const [snackbarOpen, setSnackbarOpen] = useState(false)

  const cancelOrderMutation = useCancelOrder()
  const sendOrderMutation = useSendOrder()

  if (!open || !order) return null

  const showMessage = (message: string, severity: 'success' | 'error' | 'info' | 'warning') => {
    setSnackPack(prev => [...prev, { message, severity, key: new Date().getTime() }])
  }

  const handleSnackbarClose = (_?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return
    }

    setSnackbarOpen(false)
  }

  const handleExited = () => {
    setMessageInfo(undefined)
  }

  const handleCancelar = async () => {
    setShowCancelConfirm(false)

    try {
      await cancelOrderMutation.mutateAsync(order.id)
      showMessage('Orden cancelada exitosamente', 'success')
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      setTimeout(() => {
        onClose()
      }, 1500)
    } catch (error: any) {
      showMessage(error?.response?.data?.message || 'Error al cancelar la orden', 'error')
    }
  }

  const handleSendOrder = async () => {
    if (order.shipment && !dhlCode.trim()) {
      showMessage('Por favor ingrese el código DHL', 'warning')

      return
    }

    try {
      await sendOrderMutation.mutateAsync({
        orderId: order.id,
        dhlCode: order.shipment ? dhlCode.trim() : undefined
      })
      showMessage('Orden enviada exitosamente', 'success')
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      setShowDhlInput(false)
      setDhlCode('')
      setTimeout(() => {
        onClose()
      }, 1500)
    } catch (error: any) {
      showMessage(error?.response?.data?.message || 'Error al enviar la orden', 'error')
    }
  }

  // Handle snackbar queue
  if (snackPack.length && !messageInfo) {
    setMessageInfo({ ...snackPack[0] })
    setSnackPack(prev => prev.slice(1))
    setSnackbarOpen(true)
  } else if (snackPack.length && messageInfo && snackbarOpen) {
    setSnackbarOpen(false)
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
                        Método de Pago
                      </Typography>
                      <Typography variant='body1'>
                        {order.payment_type ? getPaymentLabel(order.payment_type) : 'N/A'}
                      </Typography>
                    </Box>

                    <Box>
                      <Typography variant='caption' className='text-textSecondary'>
                        Fecha de Creación
                      </Typography>
                      <Typography variant='body2'>{order.createdAt ? formatDate(order.createdAt) : 'N/A'}</Typography>
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
        <Box className='flex gap-3 w-full justify-end flex-wrap'>
          {/* Estado: pending - Solo cancelar */}
          {order.status === 'pending' && (
            <Button
              variant='contained'
              color='error'
              onClick={() => setShowCancelConfirm(true)}
              disabled={cancelOrderMutation.isPending}
              startIcon={<i className='tabler-x' />}
            >
              Cancelar Orden
            </Button>
          )}

          {/* Estado: paid - Cancelar y Enviar */}
          {order.status === 'paid' && (
            <>
              <Button
                variant='outlined'
                color='error'
                onClick={() => setShowCancelConfirm(true)}
                disabled={cancelOrderMutation.isPending || sendOrderMutation.isPending}
                startIcon={<i className='tabler-x' />}
              >
                Cancelar Orden
              </Button>

              {!showDhlInput && (
                <Button
                  variant='contained'
                  color='primary'
                  onClick={() => setShowDhlInput(true)}
                  disabled={cancelOrderMutation.isPending || sendOrderMutation.isPending}
                  startIcon={<i className='tabler-truck' />}
                >
                  Enviar Pedido
                </Button>
              )}

              {showDhlInput && (
                <>
                  {order.shipment && (
                    <TextField
                      size='small'
                      label='Código DHL'
                      value={dhlCode}
                      onChange={e => setDhlCode(e.target.value)}
                      placeholder='Ej: DHL-123456'
                      className='max-sm:is-full sm:is-[200px]'
                      disabled={sendOrderMutation.isPending}
                    />
                  )}
                  <Button
                    variant='outlined'
                    onClick={() => {
                      setShowDhlInput(false)
                      setDhlCode('')
                    }}
                    disabled={sendOrderMutation.isPending}
                  >
                    Cancelar
                  </Button>
                  <Button
                    variant='contained'
                    color='success'
                    onClick={handleSendOrder}
                    disabled={sendOrderMutation.isPending}
                    startIcon={
                      sendOrderMutation.isPending ? (
                        <CircularProgress size={20} color='inherit' />
                      ) : (
                        <i className='tabler-check' />
                      )
                    }
                  >
                    {sendOrderMutation.isPending ? 'Enviando...' : 'Confirmar Envío'}
                  </Button>
                </>
              )}
            </>
          )}

          {/* Estado: sent - Solo cancelar */}
          {order.status === 'sent' && (
            <Button
              variant='contained'
              color='error'
              onClick={() => setShowCancelConfirm(true)}
              disabled={cancelOrderMutation.isPending}
              startIcon={<i className='tabler-x' />}
            >
              Cancelar Orden
            </Button>
          )}

          {/* Otros estados - Solo cerrar */}
          {!['pending', 'paid', 'sent'].includes(order.status) && (
            <Button variant='outlined' onClick={onClose}>
              Cerrar
            </Button>
          )}
        </Box>
      </DialogActions>

      {/* Modal de confirmación de cancelación */}
      <Dialog open={showCancelConfirm} onClose={() => setShowCancelConfirm(false)} maxWidth='xs' fullWidth>
        <DialogTitle>
          <Typography fontWeight='bold'>¿Cancelar Orden?</Typography>
        </DialogTitle>
        <DialogContent>
          <Typography>
            ¿Estás seguro que deseas cancelar la orden #{order.id}? Esta acción no se puede deshacer.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={() => setShowCancelConfirm(false)} disabled={cancelOrderMutation.isPending} variant='outlined' fullWidth>
            No, Continuar
          </Button>
          <Button
            onClick={handleCancelar}
            color='error'
            variant='contained'
            disabled={cancelOrderMutation.isPending}
            startIcon={cancelOrderMutation.isPending ? <CircularProgress size={20} color='inherit' /> : null}
            fullWidth
          >
            {cancelOrderMutation.isPending ? 'Cancelando...' : 'Sí, Cancelar'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbarOpen}
        onClose={handleSnackbarClose}
        autoHideDuration={3000}
        TransitionProps={{ onExited: handleExited }}
        key={messageInfo ? messageInfo.key : undefined}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          variant='filled'
          onClose={handleSnackbarClose}
          className='is-full shadow-xs items-center'
          severity={messageInfo?.severity || 'info'}
        >
          {messageInfo?.message}
        </Alert>
      </Snackbar>
    </Dialog>
  )
}

export default OrderDetailsModal
