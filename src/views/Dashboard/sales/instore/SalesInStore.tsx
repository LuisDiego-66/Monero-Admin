'use client'

import React, { useState, useMemo, useRef, useCallback, useEffect } from 'react'

import {
  Grid,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  IconButton,
  Box,
  Chip,
  Divider,
  Badge,
  Paper,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  LinearProgress
} from '@mui/material'

import { useAddToCart, useRepriceCart, useCreateOrder, useConfirmOrder, useCancelOrder } from '@/hooks/useSales'
import { useInfiniteVariants } from '@/hooks/useVariants'
import type { CartItem, RepriceResponse, Order } from '@/types/api/sales'
import type { Variant, VariantSize } from '@/types/api/variants'

interface CartItemLocal extends CartItem {
  variantInfo?: any
}

interface PaymentMethod {
  id: string
  name: string
  icon: string
  color: string
}

type SaleStep = 'BUILDING_CART' | 'VERIFYING_STOCK' | 'ORDER_CREATED' | 'PAYMENT' | 'COMPLETED' | 'CANCELLED'

const paymentMethods: PaymentMethod[] = [
  { id: 'efectivo', name: 'Efectivo', icon: '💵', color: '#4caf50' },
  { id: 'qr', name: 'QR', icon: '📱', color: '#ff9800' }
]

const steps = ['Armando Carrito', 'Verificando Stock', 'Orden Creada', 'Procesando Pago']

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

const PointOfSale: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [cartItems, setCartItems] = useState<CartItemLocal[]>([])
  const [cartToken, setCartToken] = useState<string>('')
  const [currentStep, setCurrentStep] = useState<SaleStep>('BUILDING_CART')
  const [activeStepIndex, setActiveStepIndex] = useState(0)
  const [repriceData, setRepriceData] = useState<RepriceResponse | null>(null)
  const [orderData, setOrderData] = useState<Order | null>(null)
  const [selectedPayment, setSelectedPayment] = useState('')
  const [showPaymentDialog, setShowPaymentDialog] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string>('')
  const [timeRemaining, setTimeRemaining] = useState<number>(0)
  const [orderExpiresAt, setOrderExpiresAt] = useState<Date | null>(null)
  const [showCancelDialog, setShowCancelDialog] = useState(false)

  const catalogScrollRef = useRef<HTMLDivElement>(null)
  const debounceTimerRef = useRef<NodeJS.Timeout>()
  const timerIntervalRef = useRef<NodeJS.Timeout>()

  const addToCartMutation = useAddToCart()
  const repriceMutation = useRepriceCart()
  const createOrderMutation = useCreateOrder()
  const confirmOrderMutation = useConfirmOrder()
  const cancelOrderMutation = useCancelOrder()

  const {
    data: variantsPages,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: isLoadingVariants
  } = useInfiniteVariants(6, debouncedSearch)

  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    debounceTimerRef.current = setTimeout(() => {
      setDebouncedSearch(searchTerm)
    }, 500)

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [searchTerm])

  useEffect(() => {
    if (orderExpiresAt) {
      timerIntervalRef.current = setInterval(() => {
        const now = new Date().getTime()
        const expiration = orderExpiresAt.getTime()
        const remaining = Math.max(0, Math.floor((expiration - now) / 1000))

        setTimeRemaining(remaining)

        if (remaining === 0) {
          handleOrderExpired()
        }
      }, 1000)
    }

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current)
      }
    }
  }, [orderExpiresAt])

  const flattenedVariants = useMemo(() => {
    if (!variantsPages) return []

    return variantsPages.pages.flatMap(page =>
      page.data
        .flatMap((variant: Variant) =>
          (variant.variants || []).map((size: VariantSize) => ({
            variantSizeId: size.id,
            colorVariant: variant,
            sizeVariant: size,
            displayName: variant.product?.name || 'Producto',
            color: variant.color,
            size: typeof size.size === 'string' ? size.size : size.size?.name,
            stock: size.availableStock || size.quantity || 0,
            multimedia: variant.multimedia,
            product: variant.product,
            price: variant.product?.price
          }))
        )
        .filter(item => item.variantSizeId)
    )
  }, [variantsPages])

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

  const getVariantInfo = (variantId: number) => {
    return flattenedVariants.find(v => v.variantSizeId === variantId)
  }

  const addToCart = (item: any) => {
    const existingItemIndex = cartItems.findIndex(cartItem => cartItem.variantId === item.variantSizeId)

    if (existingItemIndex >= 0) {
      const updatedCart = [...cartItems]

      updatedCart[existingItemIndex] = {
        ...updatedCart[existingItemIndex],
        quantity: updatedCart[existingItemIndex].quantity + 1
      }
      setCartItems(updatedCart)
    } else {
      setCartItems([
        ...cartItems,
        {
          variantId: item.variantSizeId!,
          quantity: 1,
          variantInfo: item
        }
      ])
    }
  }

  const updateQuantity = (variantId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(variantId)

      return
    }

    const updatedCart = cartItems.map(item =>
      item.variantId === variantId ? { ...item, quantity: newQuantity } : item
    )

    setCartItems(updatedCart)
  }

  const removeFromCart = (variantId: number) => {
    setCartItems(cartItems.filter(item => item.variantId !== variantId))
  }

  const clearCart = () => {
    setCartItems([])
    setCartToken('')
    setRepriceData(null)
    setOrderData(null)
    setCurrentStep('BUILDING_CART')
    setActiveStepIndex(0)
    setSelectedPayment('')
    setErrorMessage('')
    setTimeRemaining(0)
    setOrderExpiresAt(null)

    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current)
    }
  }

  const verifyStockAndPrices = async () => {
    if (cartItems.length === 0) {
      setErrorMessage('El carrito está vacío')

      return
    }

    try {
      setErrorMessage('')
      setCurrentStep('VERIFYING_STOCK')
      setActiveStepIndex(1)

      const payload = {
        items: cartItems.map(item => ({
          variantId: item.variantId,
          quantity: item.quantity
        }))
      }

      const cartResponse = await addToCartMutation.mutateAsync(payload)

      setCartToken(cartResponse.token)
      const repriceResponse = await repriceMutation.mutateAsync(cartResponse.token)

      setRepriceData(repriceResponse)
      await createOrder(cartResponse.token)
    } catch (error: any) {
      const errorMsg = error?.response?.data?.message || 'Error al verificar disponibilidad de productos'

      if (errorMsg.includes('Insufficient stock for variant')) {
        const variantId = errorMsg.match(/variant (\d+)/)?.[1]
        const variantInfo = getVariantInfo(Number(variantId))

        setErrorMessage(`Stock insuficiente para: ${variantInfo?.displayName || 'Producto'} (ID: ${variantId})`)
      } else {
        setErrorMessage(errorMsg)
      }

      setCurrentStep('BUILDING_CART')
      setActiveStepIndex(0)
    }
  }

  const createOrder = async (token: string) => {
    try {
      setCurrentStep('ORDER_CREATED')
      setActiveStepIndex(2)
      const payload = { token: token }
      const order = await createOrderMutation.mutateAsync(payload)

      setOrderData(order)

      if (order.expiresAt) {
        const expirationDate = new Date(order.expiresAt)

        setOrderExpiresAt(expirationDate)
      }

      setShowPaymentDialog(true)
    } catch (error: any) {
      setErrorMessage(error?.response?.data?.message || 'Error al crear la orden')
      setCurrentStep('BUILDING_CART')
      setActiveStepIndex(0)
    }
  }

  const confirmPayment = async () => {
    if (!orderData || !selectedPayment) {
      setErrorMessage('Seleccione un método de pago')

      return
    }

    try {
      setErrorMessage('')
      setCurrentStep('PAYMENT')
      setActiveStepIndex(3)

      const payload = {
        paymentMethod: selectedPayment as 'efectivo' | 'qr'
      }

      await confirmOrderMutation.mutateAsync({
        orderId: orderData.id,
        data: payload
      })
      setCurrentStep('COMPLETED')
      setShowPaymentDialog(false)

      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current)
      }
    } catch (error: any) {
      setErrorMessage(error?.response?.data?.message || 'Error al procesar el pago')
    }
  }

  const handleCancelOrder = async () => {
    if (!orderData) return

    try {
      await cancelOrderMutation.mutateAsync(orderData.id)
      setCurrentStep('CANCELLED')
      setShowPaymentDialog(false)
      setShowCancelDialog(false)

      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current)
      }

      setTimeout(() => {
        clearCart()
      }, 2000)
    } catch (error: any) {
      setErrorMessage(error?.response?.data?.message || 'Error al cancelar la orden')
    }
  }

  const handleOrderExpired = async () => {
    if (orderData) {
      try {
        await cancelOrderMutation.mutateAsync(orderData.id)
      } catch (error) {
        console.error('Error auto-cancelling expired order:', error)
      }
    }

    setCurrentStep('CANCELLED')
    setShowPaymentDialog(false)
    setErrorMessage('El tiempo de reserva ha expirado. La orden ha sido cancelada automáticamente.')
    setTimeout(() => {
      clearCart()
    }, 3000)
  }

  const handleClosePaymentDialog = () => {
    if (orderData && currentStep === 'ORDER_CREATED') {
      setShowCancelDialog(true)
    } else {
      setShowPaymentDialog(false)
    }
  }

  const calculateLocalTotals = () => {
    if (repriceData) {
      return {
        total: parseFloat(repriceData.total)
      }
    }

    return { total: 0 }
  }

  const localTotals = calculateLocalTotals()

  const isLoading =
    addToCartMutation.isPending ||
    repriceMutation.isPending ||
    createOrderMutation.isPending ||
    confirmOrderMutation.isPending ||
    cancelOrderMutation.isPending

  const handleCatalogScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const target = e.currentTarget
      const scrollPercentage = (target.scrollTop + target.clientHeight) / target.scrollHeight

      if (scrollPercentage > 0.8 && hasNextPage && !isFetchingNextPage) {
        fetchNextPage()
      }
    },
    [hasNextPage, isFetchingNextPage, fetchNextPage]
  )

  const timerProgress = orderExpiresAt ? (timeRemaining / (15 * 60)) * 100 : 100

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', bgcolor: 'background.default' }}>
      <Paper sx={{ borderRadius: 0, mb: 2 }} elevation={1}>
        <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant='h4' fontWeight='bold' color='primary'>
            Punto de Venta
          </Typography>
          <Typography variant='body2' color='text.secondary'>
            {new Date().toLocaleDateString()} - {new Date().toLocaleTimeString()}
          </Typography>
        </Box>
      </Paper>

      {cartItems.length > 0 && (
        <Box sx={{ px: 3, py: 2, bgcolor: 'background.paper' }}>
          <Stepper activeStep={activeStepIndex}>
            {steps.map((label, index) => (
              <Step key={label} completed={activeStepIndex > index}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>
      )}

      {errorMessage && (
        <Box sx={{ px: 3, pt: 2 }}>
          <Alert severity='error' onClose={() => setErrorMessage('')}>
            {errorMessage}
          </Alert>
        </Box>
      )}

      {currentStep === 'COMPLETED' && (
        <Box sx={{ px: 3, pt: 2 }}>
          <Alert
            severity='success'
            action={
              <Button color='inherit' size='small' onClick={clearCart}>
                Nueva Venta
              </Button>
            }
          >
            ✅ ¡Venta completada exitosamente! Orden #{orderData?.id}
          </Alert>
        </Box>
      )}

      {currentStep === 'CANCELLED' && (
        <Box sx={{ px: 3, pt: 2 }}>
          <Alert
            severity='warning'
            action={
              <Button color='inherit' size='small' onClick={clearCart}>
                Nueva Venta
              </Button>
            }
          >
            ⚠️ Orden #{orderData?.id} cancelada. El stock ha sido liberado.
          </Alert>
        </Box>
      )}

      <Box sx={{ flex: 1, p: 3, overflow: 'auto' }}>
        <Grid container spacing={3} sx={{ height: '100%' }}>
          <Grid item xs={12} md={8}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <Typography variant='h6'>Catálogo de Productos</Typography>
                  <Badge badgeContent={cartItems.length} color='primary'>
                    <span style={{ fontSize: '1.2em' }}>🛒</span>
                  </Badge>
                </Box>
                <TextField
                  fullWidth
                  placeholder='Buscar producto...'
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position='start'>
                        <span>🔍</span>
                      </InputAdornment>
                    )
                  }}
                />
              </Box>
              <CardContent
                sx={{ flex: 1, overflow: 'auto', p: 3 }}
                ref={catalogScrollRef}
                onScroll={handleCatalogScroll}
              >
                {isLoadingVariants && flattenedVariants.length === 0 ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                    <CircularProgress />
                  </Box>
                ) : flattenedVariants.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 8, color: 'text.secondary' }}>
                    <Typography sx={{ fontSize: '3rem', mb: 2, opacity: 0.5 }}>🔍</Typography>
                    <Typography variant='h6'>No se encontraron productos</Typography>
                  </Box>
                ) : (
                  <>
                    <Grid container spacing={2}>
                      {flattenedVariants.map(item => (
                        <Grid item xs={6} sm={4} md={3} lg={2.4} key={`${item.variantSizeId}-${item.colorVariant.id}`}>
                          <Card
                            sx={{
                              cursor: 'pointer',
                              transition: 'all 0.2s',
                              height: '100%',
                              opacity: isLoading ? 0.6 : 1,
                              pointerEvents: isLoading ? 'none' : 'auto',
                              '&:hover': {
                                transform: 'translateY(-4px)',
                                boxShadow: 4
                              }
                            }}
                            onClick={() => addToCart(item)}
                          >
                            <CardContent sx={{ textAlign: 'center', p: 2 }}>
                              <Box
                                component='img'
                                src={item.multimedia?.[0] || 'https://via.placeholder.com/150'}
                                alt={item.displayName}
                                sx={{
                                  width: 60,
                                  height: 60,
                                  objectFit: 'cover',
                                  borderRadius: 1,
                                  mb: 1,
                                  mx: 'auto',
                                  display: 'block'
                                }}
                              />
                              <Typography variant='body2' fontWeight='bold' sx={{ mb: 1, minHeight: '2.4em' }}>
                                {item.displayName}
                              </Typography>
                              <Chip label={`ID: ${item.variantSizeId}`} size='small' sx={{ mb: 1 }} />
                              <Box
                                sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 1 }}
                              >
                                <Box
                                  sx={{
                                    width: 16,
                                    height: 16,
                                    borderRadius: '50%',
                                    bgcolor: item.color?.code || '#ccc',
                                    border: 1,
                                    borderColor: 'divider'
                                  }}
                                />
                                <Typography variant='caption' color='text.secondary'>
                                  {item.color?.name}
                                </Typography>
                              </Box>
                              <Typography variant='caption' color='text.secondary' display='block' sx={{ mb: 1 }}>
                                Talla: {item.size}
                              </Typography>
                              <Typography variant='h6' color='primary' fontWeight='bold' sx={{ mb: 1 }}>
                                {item.price ? formatCurrency(item.price) : '-'}
                              </Typography>
                              <Chip
                                label={`Stock: ${item.stock}`}
                                size='small'
                                color={item.stock > 10 ? 'success' : item.stock > 0 ? 'warning' : 'error'}
                              />
                            </CardContent>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                    {isFetchingNextPage && (
                      <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                        <CircularProgress />
                      </Box>
                    )}
                    {!hasNextPage && flattenedVariants.length > 0 && (
                      <Box sx={{ textAlign: 'center', py: 3 }}>
                        <Typography variant='caption' color='text.secondary'>
                          No hay más productos
                        </Typography>
                      </Box>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant='h6' color='primary' fontWeight='bold'>
                      CARRITO
                    </Typography>
                    {orderData && (
                      <Typography variant='caption' color='text.secondary'>
                        Orden #{orderData.id}
                      </Typography>
                    )}
                  </Box>
                  <IconButton onClick={clearCart} color='error' disabled={isLoading}>
                    <span>🗑️</span>
                  </IconButton>
                </Box>
              </Box>
              <CardContent sx={{ flex: 1, overflow: 'auto', p: 3 }}>
                {cartItems.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 8, color: 'text.secondary' }}>
                    <Typography sx={{ fontSize: '3rem', mb: 2, opacity: 0.5 }}>🛒</Typography>
                    <Typography variant='h6'>Carrito vacío</Typography>
                    <Typography variant='body2' sx={{ mt: 1 }}>
                      Agrega productos del catálogo
                    </Typography>
                  </Box>
                ) : (
                  <Box>
                    {cartItems.map(item => {
                      const variantInfo = item.variantInfo
                      const repriceItem = repriceData?.items.find(ri => ri.variantId === item.variantId)

                      return (
                        <Card key={item.variantId} sx={{ mb: 2 }}>
                          <CardContent>
                            <Box
                              sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}
                            >
                              <Box sx={{ flex: 1 }}>
                                <Typography variant='body1' fontWeight='bold'>
                                  {variantInfo?.displayName || 'Producto'}
                                </Typography>
                                <Typography variant='caption' color='text.secondary'>
                                  {variantInfo?.size} | {variantInfo?.color?.name}
                                </Typography>
                              </Box>
                              {currentStep === 'BUILDING_CART' && (
                                <IconButton
                                  size='small'
                                  color='error'
                                  onClick={() => removeFromCart(item.variantId)}
                                  disabled={isLoading}
                                >
                                  <span>🗑️</span>
                                </IconButton>
                              )}
                            </Box>
                            <Divider sx={{ my: 1 }} />
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              {currentStep === 'BUILDING_CART' ? (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <IconButton
                                    size='small'
                                    onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                                    disabled={isLoading}
                                  >
                                    ➖
                                  </IconButton>
                                  <Typography
                                    variant='body1'
                                    fontWeight='bold'
                                    sx={{ minWidth: 30, textAlign: 'center' }}
                                  >
                                    {item.quantity}
                                  </Typography>
                                  <IconButton
                                    size='small'
                                    onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                                    disabled={isLoading}
                                  >
                                    ➕
                                  </IconButton>
                                </Box>
                              ) : (
                                <Typography variant='body1' fontWeight='bold'>
                                  Cantidad: {item.quantity}
                                </Typography>
                              )}
                              <Box sx={{ textAlign: 'right' }}>
                                <Typography variant='caption' color='text.secondary' display='block'>
                                  {repriceItem
                                    ? formatCurrency(repriceItem.unit_price)
                                    : variantInfo?.price
                                      ? formatCurrency(variantInfo.price)
                                      : '-'}{' '}
                                  c/u
                                </Typography>
                                <Typography variant='h6' color='primary' fontWeight='bold'>
                                  {repriceItem
                                    ? formatCurrency(repriceItem.totalPrice)
                                    : variantInfo?.price
                                      ? formatCurrency(variantInfo.price * item.quantity)
                                      : '-'}
                                </Typography>
                              </Box>
                            </Box>
                          </CardContent>
                        </Card>
                      )
                    })}
                  </Box>
                )}
              </CardContent>
              {cartItems.length > 0 && (
                <Box sx={{ p: 3, borderTop: 1, borderColor: 'divider' }}>
                  <Paper sx={{ p: 2, mb: 2, bgcolor: 'action.hover' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant='h6' fontWeight='bold'>
                        Total:
                      </Typography>
                      <Typography variant='h5' fontWeight='bold' color='primary'>
                        {repriceData
                          ? `Bs ${localTotals.total.toFixed(2)}`
                          : `Bs ${cartItems
                              .reduce((sum, item) => {
                                const variantInfo = item.variantInfo
                                const price = variantInfo?.price || 0

                                return sum + price * item.quantity
                              }, 0)
                              .toFixed(2)}`}
                      </Typography>
                    </Box>
                    {!repriceData && (
                      <Typography
                        variant='caption'
                        color='text.secondary'
                        sx={{ display: 'block', mt: 1, textAlign: 'right' }}
                      >
                        *Estimado (sujeto a verificación)
                      </Typography>
                    )}
                  </Paper>
                  {currentStep === 'BUILDING_CART' ? (
                    <Button
                      variant='contained'
                      fullWidth
                      size='large'
                      onClick={verifyStockAndPrices}
                      disabled={cartItems.length === 0 || isLoading}
                      startIcon={isLoading ? <CircularProgress size={20} color='inherit' /> : <span>✓</span>}
                    >
                      {isLoading ? 'Procesando...' : 'Continuar a Pago'}
                    </Button>
                  ) : (
                    <Alert severity='info'>
                      {currentStep === 'VERIFYING_STOCK' && 'Verificando disponibilidad...'}
                      {currentStep === 'ORDER_CREATED' && 'Orden creada, seleccione método de pago'}
                      {currentStep === 'PAYMENT' && 'Procesando pago...'}
                    </Alert>
                  )}
                </Box>
              )}
            </Card>
          </Grid>
        </Grid>
      </Box>

      <Dialog
        open={showPaymentDialog}
        onClose={handleClosePaymentDialog}
        maxWidth='sm'
        fullWidth
        disableEscapeKeyDown={currentStep === 'ORDER_CREATED'}
      >
        <DialogTitle>
          <Typography variant='h5' fontWeight='bold'>
            Método de Pago - Orden #{orderData?.id}
          </Typography>
        </DialogTitle>
        <DialogContent>
          {orderExpiresAt && timeRemaining > 0 && (
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
              Total a pagar: {orderData ? formatCurrency(orderData.totalPrice) : 'BS 0'}
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
                  onClick={() => !isLoading && setSelectedPayment(method.id)}
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

          {selectedPayment === 'efectivo' && (
            <Paper sx={{ p: 4, mt: 3, textAlign: 'center', bgcolor: 'success.lighter' }}>
              <Typography sx={{ fontSize: '4rem', mb: 2 }}>💵</Typography>
              <Typography variant='h6' fontWeight='bold'>
                Pago en Efectivo
              </Typography>
            </Paper>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 2 }}>
          <Button
            onClick={() => setShowCancelDialog(true)}
            color='error'
            variant='outlined'
            disabled={isLoading || currentStep === 'PAYMENT'}
            fullWidth
          >
            Cancelar Orden
          </Button>
          <Button
            variant='contained'
            onClick={confirmPayment}
            disabled={!selectedPayment || isLoading || timeRemaining === 0}
            startIcon={isLoading ? <CircularProgress size={20} color='inherit' /> : <span>💳</span>}
            fullWidth
          >
            {isLoading ? 'Procesando...' : 'Confirmar Pago'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={showCancelDialog} onClose={() => setShowCancelDialog(false)} maxWidth='xs' fullWidth>
        <DialogTitle>
          <Typography variant='h6' fontWeight='bold'>
            ¿Cancelar Orden?
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Typography>
            ¿Estás seguro que deseas cancelar la orden #{orderData?.id}? El stock reservado será liberado
            inmediatamente.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={() => setShowCancelDialog(false)} disabled={isLoading} variant='outlined' fullWidth>
            No, Continuar
          </Button>
          <Button
            onClick={handleCancelOrder}
            color='error'
            variant='contained'
            disabled={isLoading}
            startIcon={isLoading ? <CircularProgress size={20} color='inherit' /> : null}
            fullWidth
          >
            {isLoading ? 'Cancelando...' : 'Sí, Cancelar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default PointOfSale
