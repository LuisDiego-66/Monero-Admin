'use client'

import React, { useState } from 'react'
import {
  Grid,
  Card,
  CardContent,
  CardHeader,
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  AppBar,
  Toolbar,
  styled,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  useTheme,
  Alert,
  CircularProgress,
  Stepper,
  Step,
  StepLabel
} from '@mui/material'

import { useAddToCart, useRepriceCart, useCreateOrder, useConfirmOrder } from '@/hooks/useSales'
import { useVariantsByProduct } from '@/hooks/useVariants'
import type { CartItem, RepriceResponse, Order } from '@/types/api/sales'
import type { Variant, VariantSize } from '@/types/api/variants'

const StyledContainer = styled(Box)(({ theme }) => ({
  height: '100vh',
  backgroundColor: theme.palette.mode === 'dark' ? '#1a1a1a' : '#f4f5fa',
  display: 'flex',
  flexDirection: 'column'
}))

const StyledHeader = styled(AppBar)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? theme.palette.background.paper : 'white',
  color: theme.palette.text.primary,
  boxShadow: theme.palette.mode === 'dark' ? '0 1px 3px rgba(255,255,255,0.1)' : '0 1px 3px rgba(0,0,0,0.1)',
  borderBottom: `1px solid ${theme.palette.divider}`,
  position: 'static'
}))

const StyledProductCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(1.5),
  cursor: 'pointer',
  transition: 'all 0.2s ease-in-out',
  border: '1px solid',
  borderColor: theme.palette.divider,
  borderRadius: 12,
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: theme.palette.background.paper,
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[4],
    borderColor: theme.palette.primary.main
  }
}))

const StyledCartSection = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: theme.palette.background.paper
}))

const StyledTotalSection = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  marginBottom: theme.spacing(2),
  backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(248, 249, 250, 0.8)',
  border: `1px solid ${theme.palette.divider}`
}))

const StyledPaymentCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  cursor: 'pointer',
  border: '2px solid',
  borderColor: theme.palette.divider,
  textAlign: 'center',
  transition: 'all 0.2s ease-in-out',
  backgroundColor: theme.palette.background.paper,
  '&:hover': {
    backgroundColor: theme.palette.action.hover
  }
}))

const QRContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  padding: theme.spacing(3),
  backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(248, 249, 250, 0.8)',
  borderRadius: 12,
  marginTop: theme.spacing(2)
}))

interface CartItemLocal extends CartItem {
  variantInfo?: Variant
  sizeInfo?: VariantSize
}

interface Customer {
  id: string
  name: string
  email?: string
  phone?: string
}

interface PaymentMethod {
  id: string
  name: string
  icon: string
  color: string
}

type SaleStep = 'BUILDING_CART' | 'VERIFYING_STOCK' | 'ORDER_CREATED' | 'PAYMENT' | 'COMPLETED'

const mockCustomers: Customer[] = [
  { id: '1', name: 'Juan Pérez', email: 'juan@email.com', phone: '301-234-5678' },
  { id: '2', name: 'María García', email: 'maria@email.com', phone: '302-345-6789' },
  { id: '3', name: 'Carlos López', email: 'carlos@email.com', phone: '303-456-7890' },
  { id: '4', name: 'Ana Rodríguez', email: 'ana@email.com', phone: '304-567-8901' },
  { id: '5', name: 'Cliente General', email: '', phone: '' }
]

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
  const theme = useTheme()
  
  const [searchTerm, setSearchTerm] = useState('')
  
  const [cartToken, setCartToken] = useState<string>('')
  const [cartItems, setCartItems] = useState<CartItemLocal[]>([])
  const [currentStep, setCurrentStep] = useState<SaleStep>('BUILDING_CART')
  const [activeStepIndex, setActiveStepIndex] = useState(0)
  
  const [repriceData, setRepriceData] = useState<RepriceResponse | null>(null)
  const [orderData, setOrderData] = useState<Order | null>(null)
  
  const [selectedCustomer, setSelectedCustomer] = useState('')
  const [selectedPayment, setSelectedPayment] = useState('')
  const [showPaymentDialog, setShowPaymentDialog] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string>('')

  const addToCartMutation = useAddToCart()
  const repriceMutation = useRepriceCart()
  const createOrderMutation = useCreateOrder()
  const confirmOrderMutation = useConfirmOrder()

  const { data: variantsData } = useVariantsByProduct(1)

  const variants = variantsData?.variants || []

  const formatCurrency = (amount: number | string) => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(numAmount)
  }

  const flattenedVariants = variants.flatMap((variant: Variant) =>
    (variant.variants || []).map((size: VariantSize) => ({
      variantSizeId: size.id,
      colorVariant: variant,
      sizeVariant: size,
      displayName: `${variant.product?.name || 'Producto'} - ${variant.color?.name || variant.colorName || 'Sin color'}`,
      color: variant.color,
      size: typeof size.size === 'string' ? size.size : size.size?.name,
      stock: size.availableStock || size.quantity || 0,
      multimedia: variant.multimedia,
      product: variant.product
    }))
  ).filter(item => item.variantSizeId)

  const filteredProducts = flattenedVariants.filter(item =>
    item.displayName.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getVariantInfo = (variantId: number) => {
    return flattenedVariants.find(v => v.variantSizeId === variantId)
  }

  const addToCart = async (item: any) => {
    try {
      setErrorMessage('')

      const existingItem = cartItems.find(cartItem => cartItem.variantId === item.variantSizeId)

      const payload = {
        items: [
          {
            variantId: item.variantSizeId!,
            quantity: existingItem ? existingItem.quantity + 1 : 1
          }
        ],
        ...(cartToken && { token: cartToken })
      }

      const response = await addToCartMutation.mutateAsync(payload)

      setCartToken(response.token)

      const updatedCart = response.cart.map(cartItem => ({
        ...cartItem,
        variantInfo: item.colorVariant,
        sizeInfo: item.sizeVariant
      }))

      setCartItems(updatedCart)
      setCurrentStep('BUILDING_CART')
      setActiveStepIndex(0)
    } catch (error: any) {
      setErrorMessage(error?.response?.data?.message || 'Error al agregar producto al carrito')
    }
  }

  const updateQuantity = async (variantId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(variantId)
      return
    }

    try {
      setErrorMessage('')

      const updatedItems = cartItems.map(item =>
        item.variantId === variantId ? { ...item, quantity: newQuantity } : item
      )

      const payload = {
        items: updatedItems.map(item => ({
          variantId: item.variantId,
          quantity: item.quantity
        })),
        token: cartToken
      }

      const response = await addToCartMutation.mutateAsync(payload)

      setCartToken(response.token)
      
      const updatedCart = response.cart.map(cartItem => {
        const existing = cartItems.find(ci => ci.variantId === cartItem.variantId)
        return {
          ...cartItem,
          variantInfo: existing?.variantInfo,
          sizeInfo: existing?.sizeInfo
        }
      })

      setCartItems(updatedCart)
    } catch (error: any) {
      setErrorMessage(error?.response?.data?.message || 'Error al actualizar cantidad')
    }
  }

  const removeFromCart = async (variantId: number) => {
    try {
      setErrorMessage('')

      const updatedItems = cartItems.filter(item => item.variantId !== variantId)

      if (updatedItems.length === 0) {
        setCartToken('')
        setCartItems([])
        setCurrentStep('BUILDING_CART')
        setActiveStepIndex(0)
        return
      }

      const payload = {
        items: updatedItems.map(item => ({
          variantId: item.variantId,
          quantity: item.quantity
        })),
        token: cartToken
      }

      const response = await addToCartMutation.mutateAsync(payload)

      setCartToken(response.token)
      
      const updatedCart = response.cart.map(cartItem => {
        const existing = cartItems.find(ci => ci.variantId === cartItem.variantId)
        return {
          ...cartItem,
          variantInfo: existing?.variantInfo,
          sizeInfo: existing?.sizeInfo
        }
      })

      setCartItems(updatedCart)
    } catch (error: any) {
      setErrorMessage(error?.response?.data?.message || 'Error al eliminar producto')
    }
  }

  const clearCart = () => {
    setCartToken('')
    setCartItems([])
    setRepriceData(null)
    setOrderData(null)
    setCurrentStep('BUILDING_CART')
    setActiveStepIndex(0)
    setSelectedCustomer('')
    setSelectedPayment('')
    setErrorMessage('')
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

      if (!cartToken) {
        setCartToken('DEMO_TOKEN_' + Date.now())
      }

      const repriceResponse = await repriceMutation.mutateAsync(cartToken)

      setRepriceData(repriceResponse)

      await createOrder(repriceResponse)
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

  const createOrder = async (repriceResponse: RepriceResponse) => {
    try {
      setCurrentStep('ORDER_CREATED')
      setActiveStepIndex(2)

      const customerId = selectedCustomer || '5'
      if (!selectedCustomer) {
        setSelectedCustomer('5')
      }

      const payload = {
        token: cartToken,
        customerId: customerId
      }

      const order = await createOrderMutation.mutateAsync(payload)

      setOrderData(order)
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
        paymentMethod: selectedPayment as 'efectivo' | 'qr',
        customerId: selectedCustomer
      }

      await confirmOrderMutation.mutateAsync({
        orderId: orderData.id,
        data: payload
      })

      if (selectedPayment === 'efectivo') {
        generatePDF()
      }

      setCurrentStep('COMPLETED')
      setShowPaymentDialog(false)
    } catch (error: any) {
      setErrorMessage(error?.response?.data?.message || 'Error al procesar el pago')
    }
  }

  const generatePDF = () => {
    if (!orderData || !repriceData) return

    const pdfWindow = window.open('', '_blank')

    if (pdfWindow) {
      pdfWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Factura #${orderData.id} - ${new Date().toLocaleDateString()}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .invoice-details { margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            .total { text-align: right; font-weight: bold; font-size: 1.2em; }
            .footer { margin-top: 30px; text-align: center; color: #666; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>FACTURA DE VENTA #${orderData.id}</h1>
            <h2>Mi Tienda de Ropa</h2>
            <p>NIT: 123.456.789-0</p>
          </div>
          
          <div class="invoice-details">
            <p><strong>Fecha:</strong> ${new Date().toLocaleDateString()}</p>
            <p><strong>Hora:</strong> ${new Date().toLocaleTimeString()}</p>
            <p><strong>Cliente:</strong> ${mockCustomers.find(c => c.id === selectedCustomer)?.name || 'Cliente General'}</p>
            <p><strong>Estado:</strong> ${orderData.status}</p>
          </div>
          
          <table>
            <thead>
              <tr>
                <th>Producto</th>
                <th>Variant ID</th>
                <th>Cantidad</th>
                <th>Precio Unit.</th>
                <th>Descuento</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${repriceData.items
                .map(item => {
                  const variantInfo = getVariantInfo(item.variantId)
                  return `
                    <tr>
                      <td>${variantInfo?.displayName || 'Producto'}</td>
                      <td>${item.variantId}</td>
                      <td>${item.quantity}</td>
                      <td>${formatCurrency(item.unit_price)}</td>
                      <td>${formatCurrency(item.discountValue)}</td>
                      <td>${formatCurrency(item.totalPrice)}</td>
                    </tr>
                  `
                })
                .join('')}
            </tbody>
          </table>
          
          <div class="total">
            <p style="font-size: 1.3em; border-top: 2px solid #000; padding-top: 10px;">
              TOTAL: ${formatCurrency(repriceData.total)}
            </p>
          </div>
          
          <div class="footer">
            <p>¡Gracias por su compra!</p>
            <p>Método de pago: ${selectedPayment.toUpperCase()}</p>
          </div>
          
          <script>
            window.onload = function() {
              window.print();
            }
          </script>
        </body>
        </html>
      `)
      pdfWindow.document.close()
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

  const isLoading = addToCartMutation.isPending || 
                    repriceMutation.isPending || 
                    createOrderMutation.isPending || 
                    confirmOrderMutation.isPending

  return (
    <StyledContainer>
      <StyledHeader>
        <Toolbar>
          <Typography variant='h4' sx={{ flexGrow: 1, fontWeight: 'bold', color: 'primary.main' }}>
            Punto de Venta
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Chip icon={<span>👤</span>} label='Vendedor: María García' variant='outlined' size='small' />
            <Typography variant='body2' color='text.secondary'>
              {new Date().toLocaleDateString()} - {new Date().toLocaleTimeString()}
            </Typography>
          </Box>
        </Toolbar>
      </StyledHeader>

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

      <Box sx={{ flex: 1, p: 2, overflow: 'auto' }}>
        <Grid container spacing={2} sx={{ height: '100%' }}>
          <Grid item xs={12} md={8}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardHeader
                title={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant='h6'>Catálogo de Productos</Typography>
                    <Badge badgeContent={cartItems.length} color='primary'>
                      <span style={{ fontSize: '1.2em' }}>🛒</span>
                    </Badge>
                    {cartToken && (
                      <Chip
                        label={`Token: ${cartToken.substring(cartToken.length - 8)}`}
                        size='small'
                        color='secondary'
                        sx={{ ml: 1 }}
                      />
                    )}
                  </Box>
                }
              />
              <CardContent sx={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
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
                  sx={{ mb: 2 }}
                />

                <Box sx={{ flex: 1, overflow: 'auto' }}>
                  <Grid container spacing={2}>
                    {filteredProducts.map((item) => (
                      <Grid item xs={6} sm={4} md={3} lg={2.4} key={item.variantSizeId}>
                        <StyledProductCard
                          elevation={1}
                          onClick={() => addToCart(item)}
                          sx={{
                            opacity: isLoading ? 0.6 : 1,
                            pointerEvents: isLoading ? 'none' : 'auto'
                          }}
                        >
                          <Box sx={{ textAlign: 'center', flex: 1 }}>
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
                            <Typography
                              variant='caption'
                              fontWeight='bold'
                              sx={{
                                display: 'block',
                                lineHeight: 1.2,
                                mb: 0.5,
                                minHeight: '2.4em'
                              }}
                            >
                              {item.displayName}
                            </Typography>
                            <Chip
                              label={`ID: ${item.variantSizeId}`}
                              size='small'
                              sx={{ mb: 0.5, fontSize: '0.65rem', height: 18 }}
                            />
                            <Typography variant='caption' color='text.secondary' display='block' sx={{ mb: 0.5 }}>
                              Talla: {item.size}
                            </Typography>
                            <Box
                              sx={{
                                width: 20,
                                height: 20,
                                borderRadius: '50%',
                                backgroundColor: item.color?.code || '#ccc',
                                mx: 'auto',
                                mb: 0.5,
                                border: '1px solid',
                                borderColor: 'divider'
                              }}
                            />
                            <Typography
                              variant='caption'
                              sx={{
                                display: 'block',
                                mt: 0.5,
                                color: item.stock > 10 ? 'success.main' : item.stock > 0 ? 'warning.main' : 'error.main'
                              }}
                            >
                              Stock: {item.stock}
                            </Typography>
                          </Box>
                        </StyledProductCard>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <StyledCartSection>
              <CardHeader
                title={
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant='h6' color='primary'>
                        CARRITO DE COMPRA
                      </Typography>
                      {orderData && (
                        <Typography variant='caption' color='text.secondary'>
                          Orden #{orderData.id}
                        </Typography>
                      )}
                    </Box>
                    <IconButton onClick={clearCart} color='error' size='small' disabled={isLoading}>
                      <span>🗑️</span>
                    </IconButton>
                  </Box>
                }
              />
              <CardContent sx={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', p: 2 }}>
                <Box sx={{ mb: 2 }}>
                  <FormControl fullWidth size='small'>
                    <InputLabel>Cliente</InputLabel>
                    <Select
                      value={selectedCustomer}
                      onChange={e => setSelectedCustomer(e.target.value)}
                      label='Cliente'
                      disabled={currentStep !== 'BUILDING_CART' || isLoading}
                    >
                      {mockCustomers.map(customer => (
                        <MenuItem key={customer.id} value={customer.id}>
                          {customer.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>

                <Divider sx={{ mb: 2 }} />

                <Box sx={{ flex: 1, overflow: 'auto', mb: 2 }}>
                  {cartItems.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
                      <Typography sx={{ fontSize: '3rem', mb: 1, opacity: 0.5 }}>🛒</Typography>
                      <Typography>Carrito vacío</Typography>
                      <Typography variant='caption'>Agrega productos del catálogo</Typography>
                    </Box>
                  ) : (
                    <Table size='small'>
                      <TableHead>
                        <TableRow>
                          <TableCell>
                            <Typography variant='caption' fontWeight='bold'>Producto</Typography>
                          </TableCell>
                          <TableCell align='center'>
                            <Typography variant='caption' fontWeight='bold'>Cant</Typography>
                          </TableCell>
                          <TableCell align='right'>
                            <Typography variant='caption' fontWeight='bold'>Precio</Typography>
                          </TableCell>
                          <TableCell align='right'>
                            <Typography variant='caption' fontWeight='bold'>Total</Typography>
                          </TableCell>
                          {currentStep === 'BUILDING_CART' && <TableCell width={40}></TableCell>}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {cartItems.map(item => {
                          const variantInfo = getVariantInfo(item.variantId)
                          const repriceItem = repriceData?.items.find(ri => ri.variantId === item.variantId)

                          return (
                            <TableRow key={item.variantId}>
                              <TableCell>
                                <Typography variant='caption' fontWeight='bold'>
                                  {variantInfo?.displayName || 'Producto'}
                                </Typography>
                                <Typography variant='caption' display='block' color='text.secondary'>
                                  ID: {item.variantId}
                                </Typography>
                              </TableCell>
                              <TableCell align='center'>
                                {currentStep === 'BUILDING_CART' ? (
                                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                                    <IconButton
                                      size='small'
                                      onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                                      disabled={isLoading}
                                      sx={{ fontSize: '0.8rem' }}
                                    >
                                      ➖
                                    </IconButton>
                                    <Typography variant='body2' sx={{ minWidth: 20, textAlign: 'center' }}>
                                      {item.quantity}
                                    </Typography>
                                    <IconButton
                                      size='small'
                                      onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                                      disabled={isLoading}
                                      sx={{ fontSize: '0.8rem' }}
                                    >
                                      ➕
                                    </IconButton>
                                  </Box>
                                ) : (
                                  <Typography variant='body2'>{item.quantity}</Typography>
                                )}
                              </TableCell>
                              <TableCell align='right'>
                                <Typography variant='caption'>
                                  {repriceItem 
                                    ? formatCurrency(repriceItem.unit_price)
                                    : '-'
                                  }
                                </Typography>
                              </TableCell>
                              <TableCell align='right'>
                                <Typography variant='caption' fontWeight='bold'>
                                  {repriceItem 
                                    ? formatCurrency(repriceItem.totalPrice)
                                    : '-'
                                  }
                                </Typography>
                              </TableCell>
                              {currentStep === 'BUILDING_CART' && (
                                <TableCell>
                                  <IconButton
                                    size='small'
                                    color='error'
                                    onClick={() => removeFromCart(item.variantId)}
                                    disabled={isLoading}
                                    sx={{ fontSize: '0.8rem' }}
                                  >
                                    🗑️
                                  </IconButton>
                                </TableCell>
                              )}
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
                  )}
                </Box>

                {(cartItems.length > 0 && repriceData) && (
                  <StyledTotalSection elevation={0}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant='h6' fontWeight='bold'>
                        Total:
                      </Typography>
                      <Typography variant='h6' fontWeight='bold' color='primary'>
                        {formatCurrency(localTotals.total)}
                      </Typography>
                    </Box>
                  </StyledTotalSection>
                )}

                {currentStep === 'BUILDING_CART' && (
                  <>
                    <Button
                      variant='contained'
                      fullWidth
                      size='large'
                      onClick={verifyStockAndPrices}
                      disabled={cartItems.length === 0 || isLoading}
                      sx={{ py: 1.5, fontSize: '1.1rem', fontWeight: 'bold' }}
                      startIcon={isLoading ? <CircularProgress size={20} color='inherit' /> : <span>✓</span>}
                    >
                      {isLoading ? 'Procesando...' : 'Continuar a Pago'}
                    </Button>

                    {cartItems.length > 0 && !selectedCustomer && (
                      <Alert severity='info' sx={{ mt: 1, fontSize: '0.75rem' }}>
                        💡 Selecciona un cliente antes de continuar
                      </Alert>
                    )}
                  </>
                )}

                {currentStep !== 'BUILDING_CART' && currentStep !== 'COMPLETED' && (
                  <Alert severity='info' sx={{ mt: 1 }}>
                    {currentStep === 'VERIFYING_STOCK' && 'Verificando disponibilidad...'}
                    {currentStep === 'ORDER_CREATED' && 'Orden creada, seleccione método de pago'}
                    {currentStep === 'PAYMENT' && 'Procesando pago...'}
                  </Alert>
                )}
              </CardContent>
            </StyledCartSection>
          </Grid>
        </Grid>
      </Box>

      <Dialog
        open={showPaymentDialog}
        onClose={() => !isLoading && setShowPaymentDialog(false)}
        maxWidth='sm'
        fullWidth
      >
        <DialogTitle>
          <Typography variant='h6'>Método de Pago - Orden #{orderData?.id}</Typography>
        </DialogTitle>
        <DialogContent>
          <Typography variant='h5' gutterBottom color='primary' fontWeight='bold'>
            Total a pagar: {orderData ? formatCurrency(orderData.totalPrice) : '$0'}
          </Typography>

          <Typography variant='body2' color='text.secondary' gutterBottom>
            Cliente: {mockCustomers.find(c => c.id === selectedCustomer)?.name}
          </Typography>

          <Grid container spacing={2} sx={{ mt: 1 }}>
            {paymentMethods.map(method => (
              <Grid item xs={6} key={method.id}>
                <StyledPaymentCard
                  sx={{
                    borderColor: selectedPayment === method.id ? method.color : 'divider',
                    '&:hover': {
                      borderColor: method.color
                    }
                  }}
                  onClick={() => !isLoading && setSelectedPayment(method.id)}
                >
                  <Box sx={{ color: method.color, mb: 1, fontSize: '2rem' }}>{method.icon}</Box>
                  <Typography variant='body1' fontWeight='medium'>
                    {method.name}
                  </Typography>
                </StyledPaymentCard>
              </Grid>
            ))}
          </Grid>

          {selectedPayment === 'qr' && (
            <QRContainer>
              <Box sx={{ textAlign: 'center' }}>
                <QRCodeSVG />
                <Typography variant='body1' sx={{ mt: 2, mb: 1, fontWeight: 'bold' }}>
                  Escanea para pagar
                </Typography>
                <Typography variant='h6' color='primary' fontWeight='bold'>
                  {orderData && formatCurrency(orderData.totalPrice)}
                </Typography>
              </Box>
            </QRContainer>
          )}

          {selectedPayment === 'efectivo' && (
            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Paper sx={{ p: 3, bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'grey.50' }}>
                <Typography sx={{ fontSize: '3rem', color: 'success.main', mb: 1 }}>💵</Typography>
                <Typography variant='body1' fontWeight='bold'>
                  Pago en Efectivo
                </Typography>
                <Typography variant='body2' color='text.secondary' sx={{ mt: 1 }}>
                  Se generará la factura en PDF
                </Typography>
              </Paper>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setShowPaymentDialog(false)} disabled={isLoading}>
            Cancelar
          </Button>
          <Button
            variant='contained'
            onClick={confirmPayment}
            disabled={!selectedPayment || isLoading}
            startIcon={isLoading ? <CircularProgress size={20} color='inherit' /> : <span>💳</span>}
          >
            {isLoading ? 'Procesando...' : 'Confirmar Pago'}
          </Button>
        </DialogActions>
      </Dialog>
    </StyledContainer>
  )
}

export default PointOfSale
