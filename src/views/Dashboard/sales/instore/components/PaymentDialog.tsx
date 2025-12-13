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
  Grid,
  Card,
  CardContent,
  CircularProgress,
  LinearProgress
} from '@mui/material'

import type { Order, RepriceResponse } from '@/types/api/sales'

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
  onClose: () => void
  onPaymentSelect: (paymentType: 'cash' | 'card' | 'qr') => void
  onConfirmPayment: () => void
  onCancelOrder: () => void
}

const QRCodeSVG = () => (
  <svg width='200' height='200' viewBox='0 0 200 200' fill='none' xmlns='http://www.w3.org/2000/svg'>
    <rect width='200' height='200' fill='white' />
    <rect x='10' y='10' width='60' height='60' fill='black' />
    <rect x='20' y='20' width='40' height='40' fill='white' />
    <rect x='30' y='30' width='20' height='20' fill='black' />
    <rect x='130' y='10' width='60' height='60' fill='black' />
    <rect x='140' y='20' width='40' height='40' fill='white' />
    <rect x='150' y='30' width='20' height='20' fill='black' />
    <rect x='10' y='130' width='60' height='60' fill='black' />
    <rect x='20' y='140' width='40' height='40' fill='white' />
    <rect x='30' y='150' width='20' height='20' fill='black' />
  </svg>
)

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
        </Typography>
      </DialogTitle>
      <DialogContent>
        {timeRemaining > 0 && orderData && (
          <Paper sx={{ p: 2, mb: 3, bgcolor: 'warning.lighter', border: 1, borderColor: 'warning.main' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant='body1' fontWeight='bold' color='warning.dark'>
                ⏱️ Tiempo restante: {formatTime(timeRemaining)}
              </Typography>
              <Typography variant='caption' color='text.secondary'>
                {timeRemaining < 60 ? '¡Apúrate!' : 'Stock reservado'}
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

        <Grid container spacing={2}>
          {paymentMethods.map(method => (
            <Grid item xs={6} key={method.id}>
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

        {selectedPayment === 'qr' && (
          <Paper sx={{ p: 4, mt: 3, textAlign: 'center', bgcolor: 'action.hover' }}>
            <QRCodeSVG />
            <Typography variant='h6' sx={{ mt: 2, mb: 1, fontWeight: 'bold' }}>
              Escanea para pagar
            </Typography>
            <Typography variant='h5' color='primary' fontWeight='bold'>
              {orderData && formatCurrency(orderData.totalPrice)}
            </Typography>
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
            <Button
              onClick={onCancelOrder}
              color='error'
              variant='outlined'
              disabled={isLoading || currentStep === 'PAYMENT'}
              fullWidth
            >
              Cancelar Orden
            </Button>
            <Button
              variant='contained'
              onClick={onConfirmPayment}
              disabled={!orderData || isLoading || (!!orderData && timeRemaining === 0)}
              startIcon={isLoading ? <CircularProgress size={20} color='inherit' /> : <span>💳</span>}
              fullWidth
            >
              {isLoading ? 'Procesando...' : 'Confirmar Pago'}
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  )
}

export default PaymentDialog
