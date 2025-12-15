import React from 'react'

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  Box,
  Paper,
  Card,
  CardContent,
  CircularProgress,
  LinearProgress
} from '@mui/material'
import Grid from '@mui/material/Grid2'

import type { Order, RepriceResponse, GenerateQRResponse } from '@/types/api/sales'

interface PaymentMethod {
  id: string
  name: string
  icon: string
  color: string
}

interface PaymentDialogProps {
  open: boolean
  orderData: Order | null
  repriceData: RepriceResponse | null
  selectedPayment: string
  timeRemaining: number
  timerProgress: number
  currentStep: string
  isLoading: boolean
  paymentMethods: PaymentMethod[]
  qrData: GenerateQRResponse | null // Datos del QR generado
  onClose: () => void
  onPaymentSelect: (paymentType: 'cash' | 'card' | 'qr') => void
  onConfirmPayment: () => void
  onCancelOrder: () => void
}

const PaymentDialog: React.FC<PaymentDialogProps> = ({
  open,
  orderData,
  repriceData,
  selectedPayment,
  timeRemaining,
  timerProgress,
  currentStep,
  isLoading,
  paymentMethods,
  qrData,
  onClose,
  onPaymentSelect,
  onConfirmPayment,
  onCancelOrder
}) => {
  const formatCurrency = (amount: number | string) => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount

    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(numAmount)
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const secs = seconds % 60

    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth='sm'
      fullWidth
      disableEscapeKeyDown={currentStep === 'ORDER_CREATED'}
    >
      <DialogTitle>
        <Typography variant='h5' fontWeight='bold'>
          {orderData ? `Método de Pago - Orden #${orderData.id}` : 'Seleccione Método de Pago'}
          {timeRemaining > 0 && orderData && (
            <Paper sx={{ p: 2, mb: 3, bgcolor: 'warning.lighter', border: 1, borderColor: 'warning.main' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant='body1' fontWeight='bold' color='warning.dark'>
                  ⏱️ Tiempo restante: {formatTime(timeRemaining)}
                </Typography>
                <Typography variant='caption' color='text.secondary'>
                  {timeRemaining < 60 ? '¡Cancela antes del tiempo limite!' : 'Stock reservado'}
                </Typography>
              </Box>
              <LinearProgress
                variant='determinate'
                value={timerProgress}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  '& .MuiLinearProgress-bar': {
                    bgcolor: timeRemaining < 60 ? 'error.main' : 'warning.main'
                  }
                }}
              />
            </Paper>
          )}
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Paper sx={{ p: 3, mb: 3, textAlign: 'center', bgcolor: 'primary.lighter' }}>
          <Typography variant='h4' color='primary' fontWeight='bold'>
            Total a pagar:{' '}
            {orderData
              ? formatCurrency(orderData.totalPrice)
              : repriceData
                ? `Bs ${parseFloat(repriceData.total).toFixed(2)}`
                : 'Bs 0.00'}
          </Typography>
        </Paper>

        {/* Mostrar métodos de pago solo si NO se ha creado la orden todavía */}
        {!orderData && (
          <Grid container spacing={2}>
            {paymentMethods.map(method => (
              <Grid size={{ xs: 6 }} key={method.id}>
                <Card
                  sx={{
                    cursor: 'pointer',
                    border: 2,
                    borderColor: selectedPayment === method.id ? method.color : 'divider',
                    textAlign: 'center',
                    transition: 'all 0.2s',
                    '&:hover': {
                      borderColor: method.color,
                      boxShadow: 2
                    }
                  }}
                  onClick={() => !isLoading && onPaymentSelect(method.id as 'cash' | 'card' | 'qr')}
                >
                  <CardContent>
                    <Box sx={{ fontSize: '3rem', mb: 1 }}>{method.icon}</Box>
                    <Typography variant='h6' fontWeight='medium'>
                      {method.name}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {orderData && selectedPayment && (
          <Paper sx={{ p: 3, mb: 2, bgcolor: 'action.hover' }}>
            <Typography variant='caption' color='text.secondary' display='block' gutterBottom>
              Método de pago seleccionado:
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ fontSize: '2rem' }}>{paymentMethods.find(m => m.id === selectedPayment)?.icon}</Box>
              <Typography variant='h6' fontWeight='bold'>
                {paymentMethods.find(m => m.id === selectedPayment)?.name}
              </Typography>
            </Box>
          </Paper>
        )}

        {/* Sección de pago con QR */}
        {selectedPayment === 'qr' && (
          <Paper sx={{ p: 4, mt: 3, textAlign: 'center', bgcolor: 'action.hover' }}>
            {qrData && qrData.qr ? (
              <>
                {/* Mostrar QR generado desde el backend (base64) */}
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                  <img
                    src={qrData.qr.startsWith('data:') ? qrData.qr : `data:image/png;base64,${qrData.qr}`}
                    alt='Código QR para pago'
                    style={{
                      width: '300px',
                      height: '300px',
                      objectFit: 'contain',
                      border: '2px solid #ddd',
                      borderRadius: '8px',
                      backgroundColor: 'white'
                    }}
                  />
                </Box>
                <Typography variant='h6' sx={{ mt: 2, mb: 1, fontWeight: 'bold' }}>
                  Escanea para pagar
                </Typography>
                <Typography variant='h5' color='primary' fontWeight='bold'>
                  {orderData && formatCurrency(orderData.totalPrice)}
                </Typography>

                <Box sx={{ mt: 2 }}>
                  <CircularProgress size={24} />
                  <Typography variant='body2' color='text.secondary' sx={{ mt: 1 }}>
                    Esperando confirmación de pago...
                  </Typography>
                </Box>
              </>
            ) : (
              <>
                {/* Mostrar mientras se genera el QR */}
                <CircularProgress size={60} />
                <Typography variant='h6' sx={{ mt: 2, fontWeight: 'bold' }}>
                  Generando código QR...
                </Typography>
              </>
            )}
          </Paper>
        )}

        {selectedPayment === 'cash' && (
          <Paper sx={{ p: 4, mt: 3, textAlign: 'center', bgcolor: 'success.lighter' }}>
            <Typography sx={{ fontSize: '4rem', mb: 2 }}>💵</Typography>
            <Typography variant='h6' fontWeight='bold'>
              Pago en Efectivo
            </Typography>
          </Paper>
        )}

        {selectedPayment === 'card' && (
          <Paper sx={{ p: 4, mt: 3, textAlign: 'center', bgcolor: 'info.lighter' }}>
            <Typography sx={{ fontSize: '4rem', mb: 2 }}>💳</Typography>
            <Typography variant='h6' fontWeight='bold'>
              Pago con Tarjeta
            </Typography>
          </Paper>
        )}
      </DialogContent>
      <DialogActions sx={{ p: 3, gap: 2 }}>
        {!orderData ? (
          <Button onClick={onClose} variant='outlined' fullWidth>
            Cerrar
          </Button>
        ) : (
          <>
            {/* Botón Cancelar Orden */}
            <Button
              onClick={onCancelOrder}
              color='error'
              variant='outlined'
              disabled={isLoading || (currentStep === 'PAYMENT' && selectedPayment !== 'qr')}
              fullWidth
            >
              Cancelar Orden
            </Button>

            {/* Botón Confirmar Pago - Solo para efectivo y tarjeta */}
            {selectedPayment !== 'qr' && (
              <Button
                variant='contained'
                onClick={onConfirmPayment}
                disabled={!orderData || isLoading || (!!orderData && timeRemaining === 0)}
                startIcon={isLoading ? <CircularProgress size={20} color='inherit' /> : <span>💳</span>}
                fullWidth
              >
                {isLoading ? 'Procesando...' : 'Confirmar Pago'}
              </Button>
            )}
          </>
        )}
      </DialogActions>
    </Dialog>
  )
}

export default PaymentDialog
