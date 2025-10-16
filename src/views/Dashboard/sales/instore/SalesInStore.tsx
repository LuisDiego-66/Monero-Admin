'use client'

import React, { useState, useEffect } from 'react'

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
  Fab,
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

// Styled components
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

// Interfaces
interface Product {
  id: string
  name: string
  price: number
  stock: number
  category: string
  icon: string
  size?: string
  color?: string
  image?: string
  variantId: number // ID del variante que se envía al backend
}

interface CartItemLocal {
  variantId: number
  quantity: number
  productInfo?: Product // Info local para mostrar en UI
}

interface CartResponse {
  cart: Array<{
    variantId: number
    quantity: number
  }>
  token: string
}

interface OrderDetails {
  id: number
  items: Array<{
    variantId: number
    quantity: number
    productName: string
    price: number
    subtotal: number
  }>
  subtotal: number
  tax: number
  discount: number
  total: number
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

// Estados del proceso de venta
type SaleStep = 'BUILDING_CART' | 'VERIFYING_STOCK' | 'ORDER_CREATED' | 'PAYMENT' | 'COMPLETED'

// Mock data de productos (simulando respuesta del backend)
const mockProducts: Product[] = [
  {
    id: '1',
    variantId: 33,
    name: 'Camiseta Básica Blanca',
    price: 35000,
    stock: 45,
    category: 'CAMISETAS',
    icon: '👕',
    size: 'M',
    color: 'Blanco',
    image: 'https://via.placeholder.com/150/ffffff/000000?text=Camiseta'
  },
  {
    id: '2',
    variantId: 15,
    name: 'Jeans Slim Azul',
    price: 89000,
    stock: 23,
    category: 'PANTALONES',
    icon: '👖',
    size: 'L',
    color: 'Azul',
    image: 'https://via.placeholder.com/150/0066cc/ffffff?text=Jeans'
  },
  {
    id: '3',
    variantId: 22,
    name: 'Vestido Floral',
    price: 75000,
    stock: 18,
    category: 'VESTIDOS',
    icon: '👗',
    size: 'S',
    color: 'Rosa',
    image: 'https://via.placeholder.com/150/ff69b4/ffffff?text=Vestido'
  },
  {
    id: '4',
    variantId: 44,
    name: 'Chaqueta Denim',
    price: 120000,
    stock: 12,
    category: 'CHAQUETAS',
    icon: '🧥',
    size: 'M',
    color: 'Azul',
    image: 'https://via.placeholder.com/150/4169e1/ffffff?text=Chaqueta'
  },
  {
    id: '5',
    variantId: 55,
    name: 'Falda Plisada',
    price: 45000,
    stock: 30,
    category: 'FALDAS',
    icon: '👛',
    size: 'S',
    color: 'Negro',
    image: 'https://via.placeholder.com/150/000000/ffffff?text=Falda'
  },
  {
    id: '6',
    variantId: 66,
    name: 'Polo Rayas',
    price: 42000,
    stock: 25,
    category: 'CAMISETAS',
    icon: '👕',
    size: 'L',
    color: 'Rayas',
    image: 'https://via.placeholder.com/150/87ceeb/000000?text=Polo'
  },
  {
    id: '7',
    variantId: 77,
    name: 'Pantalón Chino',
    price: 67000,
    stock: 20,
    category: 'PANTALONES',
    icon: '👖',
    size: 'M',
    color: 'Beige',
    image: 'https://via.placeholder.com/150/f5f5dc/000000?text=Chino'
  },
  {
    id: '8',
    variantId: 88,
    name: 'Blusa Seda',
    price: 85000,
    stock: 15,
    category: 'BLUSAS',
    icon: '👚',
    size: 'S',
    color: 'Blanco',
    image: 'https://via.placeholder.com/150/f8f8ff/000000?text=Blusa'
  }
]

const categories = ['TODOS', 'CAMISETAS', 'PANTALONES', 'VESTIDOS', 'CHAQUETAS', 'FALDAS', 'BLUSAS']

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

// QR Code SVG
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

const PointOfSaleRefactored: React.FC = () => {
  const theme = useTheme()

  // Estados principales
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('TODOS')

  // Estados del carrito y proceso de venta
  const [cartToken, setCartToken] = useState<string>('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.INITIAL_DEMO_TOKEN')

  const [cartItems, setCartItems] = useState<CartItemLocal[]>([
    {
      variantId: 15,
      quantity: 2,
      productInfo: mockProducts.find(p => p.variantId === 15)
    },
    {
      variantId: 33,
      quantity: 1,
      productInfo: mockProducts.find(p => p.variantId === 33)
    }
  ])

  const [currentStep, setCurrentStep] = useState<SaleStep>('BUILDING_CART')
  const [activeStepIndex, setActiveStepIndex] = useState(0)

  // Estados de la orden
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null)
  const [orderId, setOrderId] = useState<number | null>(null)

  // Estados de UI
  const [selectedCustomer, setSelectedCustomer] = useState('')
  const [selectedPayment, setSelectedPayment] = useState('')
  const [showPaymentDialog, setShowPaymentDialog] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string>('')

  const filteredProducts = mockProducts.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'TODOS' || product.category === selectedCategory

    return matchesSearch && matchesCategory
  })

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount)
  }

  // Obtener información del producto local
  const getProductInfo = (variantId: number): Product | undefined => {
    return mockProducts.find(p => p.variantId === variantId)
  }

  // PASO 1: Agregar producto al carrito (POST /api/cart)
  const addToCart = async (product: Product) => {
    try {
      setIsLoading(true)
      setErrorMessage('')

      // Verificar si el producto ya está en el carrito
      const existingItem = cartItems.find(item => item.variantId === product.variantId)

      const payload = {
        items: [
          {
            variantId: product.variantId,
            quantity: existingItem ? existingItem.quantity + 1 : 1
          }
        ],
        ...(cartToken && { token: cartToken }) // Solo incluir token si existe
      }

      // Simular llamada API
      console.log('POST /api/cart', payload)

      // Simular respuesta del servidor
      await new Promise(resolve => setTimeout(resolve, 500))

      const mockResponse: CartResponse = {
        cart: existingItem
          ? cartItems.map(item =>
              item.variantId === product.variantId
                ? { variantId: item.variantId, quantity: item.quantity + 1 }
                : { variantId: item.variantId, quantity: item.quantity }
            )
          : [
              ...cartItems.map(item => ({ variantId: item.variantId, quantity: item.quantity })),
              { variantId: product.variantId, quantity: 1 }
            ],
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.NEW_TOKEN_' + Date.now()
      }

      // Actualizar estado local
      setCartToken(mockResponse.token)

      const updatedCart = mockResponse.cart.map(item => ({
        ...item,
        productInfo: getProductInfo(item.variantId)
      }))

      setCartItems(updatedCart)
      setCurrentStep('BUILDING_CART')
      setActiveStepIndex(0)
    } catch (error) {
      setErrorMessage('Error al agregar producto al carrito')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  // Actualizar cantidad de un item
  const updateQuantity = async (variantId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(variantId)

      return
    }

    try {
      setIsLoading(true)

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

      console.log('POST /api/cart (update)', payload)
      await new Promise(resolve => setTimeout(resolve, 300))

      const mockResponse: CartResponse = {
        cart: payload.items,
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.UPDATED_TOKEN_' + Date.now()
      }

      setCartToken(mockResponse.token)
      setCartItems(
        mockResponse.cart.map(item => ({
          ...item,
          productInfo: getProductInfo(item.variantId)
        }))
      )
    } catch (error) {
      setErrorMessage('Error al actualizar cantidad')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  // Eliminar item del carrito
  const removeFromCart = async (variantId: number) => {
    try {
      setIsLoading(true)

      const updatedItems = cartItems.filter(item => item.variantId !== variantId)

      if (updatedItems.length === 0) {
        // Si no quedan items, resetear todo
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

      console.log('POST /api/cart (remove)', payload)
      await new Promise(resolve => setTimeout(resolve, 300))

      const mockResponse: CartResponse = {
        cart: payload.items,
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.REMOVED_TOKEN_' + Date.now()
      }

      setCartToken(mockResponse.token)
      setCartItems(
        mockResponse.cart.map(item => ({
          ...item,
          productInfo: getProductInfo(item.variantId)
        }))
      )
    } catch (error) {
      setErrorMessage('Error al eliminar producto')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  // Limpiar carrito completamente
  const clearCart = () => {
    setCartToken('')
    setCartItems([])
    setOrderDetails(null)
    setOrderId(null)
    setCurrentStep('BUILDING_CART')
    setActiveStepIndex(0)
    setSelectedCustomer('')
    setSelectedPayment('')
  }

  // PASO 2: Verificar stock y obtener precios (POST /api/orders/reprice/{token})
  const verifyStockAndPrices = async () => {
    // En modo estático, permitir continuar incluso sin cliente o carrito vacío
    if (cartItems.length === 0) {
      setErrorMessage('El carrito está vacío')

      return
    }

    try {
      setIsLoading(true)
      setErrorMessage('')
      setCurrentStep('VERIFYING_STOCK')
      setActiveStepIndex(1)

      // Generar token si no existe (modo demo)
      if (!cartToken) {
        setCartToken('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.DEMO_TOKEN_' + Date.now())
      }

      console.log('POST /api/orders/reprice/' + (cartToken || 'DEMO_TOKEN'))
      await new Promise(resolve => setTimeout(resolve, 800))

      // Simular verificación exitosa - en producción aquí validarías stock real
      // Si hay problemas de stock, lanzarías un error

      // Continuar al siguiente paso
      await createOrder()
    } catch (error) {
      setErrorMessage('Error al verificar disponibilidad de productos')
      setCurrentStep('BUILDING_CART')
      setActiveStepIndex(0)
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  // PASO 3: Crear orden (POST /api/orders)
  const createOrder = async () => {
    try {
      setIsLoading(true)
      setCurrentStep('ORDER_CREATED')
      setActiveStepIndex(2)

      // En modo demo, usar cliente general si no hay uno seleccionado
      const customerId = selectedCustomer || '5'

      if (!selectedCustomer) {
        setSelectedCustomer('5')
      }

      const payload = {
        token: cartToken || 'DEMO_TOKEN',
        customerId: customerId
      }

      console.log('POST /api/orders', payload)
      await new Promise(resolve => setTimeout(resolve, 800))

      // Simular respuesta del servidor con detalles de la orden
      const subtotal = cartItems.reduce((sum, item) => {
        const product = getProductInfo(item.variantId)

        return sum + (product ? product.price * item.quantity : 0)
      }, 0)

      const tax = subtotal * 0.19
      const discount = 0

      const mockOrderResponse: OrderDetails = {
        id: Math.floor(Math.random() * 10000) + 1000,
        items: cartItems.map(item => {
          const product = getProductInfo(item.variantId)!

          return {
            variantId: item.variantId,
            quantity: item.quantity,
            productName: product.name,
            price: product.price,
            subtotal: product.price * item.quantity
          }
        }),
        subtotal,
        tax,
        discount,
        total: subtotal + tax - discount
      }

      setOrderDetails(mockOrderResponse)
      setOrderId(mockOrderResponse.id)
      setShowPaymentDialog(true)
    } catch (error) {
      setErrorMessage('Error al crear la orden')
      setCurrentStep('BUILDING_CART')
      setActiveStepIndex(0)
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  // PASO 4: Confirmar pago (POST /api/orders/confirm/{id})
  const confirmPayment = async () => {
    if (!orderId || !selectedPayment) {
      setErrorMessage('Seleccione un método de pago')

      return
    }

    try {
      setIsLoading(true)
      setCurrentStep('PAYMENT')
      setActiveStepIndex(3)

      const payload = {
        orderId,
        paymentMethod: selectedPayment,
        customerId: selectedCustomer
      }

      console.log('POST /api/orders/confirm/' + orderId, payload)
      await new Promise(resolve => setTimeout(resolve, 1500))

      // Si es efectivo, generar PDF
      if (selectedPayment === 'efectivo') {
        generatePDF()
      }

      // Completar venta
      setCurrentStep('COMPLETED')
      setShowPaymentDialog(false)

      // El usuario puede hacer clic en "Nueva Venta" cuando quiera
    } catch (error) {
      setErrorMessage('Error al procesar el pago')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  // Generar PDF de factura
  const generatePDF = () => {
    if (!orderDetails) return

    const pdfWindow = window.open('', '_blank')

    if (pdfWindow) {
      pdfWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Factura #${orderId} - ${new Date().toLocaleDateString()}</title>
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
            <h1>FACTURA DE VENTA #${orderId}</h1>
            <h2>Mi Tienda de Ropa</h2>
            <p>NIT: 123.456.789-0</p>
          </div>
          
          <div class="invoice-details">
            <p><strong>Fecha:</strong> ${new Date().toLocaleDateString()}</p>
            <p><strong>Hora:</strong> ${new Date().toLocaleTimeString()}</p>
            <p><strong>Cliente:</strong> ${mockCustomers.find(c => c.id === selectedCustomer)?.name || 'Cliente General'}</p>
            <p><strong>Token Carrito:</strong> ${cartToken.substring(0, 20)}...</p>
          </div>
          
          <table>
            <thead>
              <tr>
                <th>Producto</th>
                <th>Variant ID</th>
                <th>Cantidad</th>
                <th>Precio Unit.</th>
                <th>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              ${orderDetails.items
                .map(
                  item => `
                <tr>
                  <td>${item.productName}</td>
                  <td>${item.variantId}</td>
                  <td>${item.quantity}</td>
                  <td>${formatCurrency(item.price)}</td>
                  <td>${formatCurrency(item.subtotal)}</td>
                </tr>
              `
                )
                .join('')}
            </tbody>
          </table>
          
          <div class="total">
            <p>Subtotal: ${formatCurrency(orderDetails.subtotal)}</p>
            <p>Descuento: -${formatCurrency(orderDetails.discount)}</p>
            <p>IVA (19%): ${formatCurrency(orderDetails.tax)}</p>
            <p style="font-size: 1.3em; border-top: 2px solid #000; padding-top: 10px;">
              TOTAL: ${formatCurrency(orderDetails.total)}
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

  // Calcular totales locales para mostrar en UI (antes de crear orden)
  const calculateLocalTotals = () => {
    const subtotal = cartItems.reduce((sum, item) => {
      const product = getProductInfo(item.variantId)

      return sum + (product ? product.price * item.quantity : 0)
    }, 0)

    const tax = subtotal * 0.19
    const discount = 0
    const total = subtotal + tax - discount

    return { subtotal, tax, discount, total }
  }

  const localTotals = orderDetails || calculateLocalTotals()

  return (
    <StyledContainer>
      {/* Header */}
      <StyledHeader>
        <Toolbar>
          <Typography variant='h4' sx={{ flexGrow: 1, fontWeight: 'bold', color: 'primary.main' }}>
            Punto de Venta - Sistema por Token
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Chip icon={<span>👤</span>} label='Vendedor: María García' variant='outlined' size='small' />
            <Typography variant='body2' color='text.secondary'>
              {new Date().toLocaleDateString()} - {new Date().toLocaleTimeString()}
            </Typography>
          </Box>
        </Toolbar>
      </StyledHeader>

      {/* Stepper de proceso */}
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

      {/* Alert de errores */}
      {errorMessage && (
        <Box sx={{ px: 3, pt: 2 }}>
          <Alert severity='error' onClose={() => setErrorMessage('')}>
            {errorMessage}
          </Alert>
        </Box>
      )}

      {/* Alert de éxito */}
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
            ✅ ¡Venta completada exitosamente! Orden #{orderId}
          </Alert>
        </Box>
      )}

      {/* Contenido Principal */}
      <Box sx={{ flex: 1, p: 2, overflow: 'auto' }}>
        <Grid container spacing={2} sx={{ height: '100%' }}>
          {/* Panel de Productos */}
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

                <Box sx={{ mb: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {categories.map(category => (
                    <Chip
                      key={category}
                      label={category}
                      onClick={() => setSelectedCategory(category)}
                      color={selectedCategory === category ? 'primary' : 'default'}
                      variant={selectedCategory === category ? 'filled' : 'outlined'}
                      size='small'
                    />
                  ))}
                </Box>

                <Box sx={{ flex: 1, overflow: 'auto' }}>
                  <Grid container spacing={2}>
                    {filteredProducts.map(product => (
                      <Grid item xs={6} sm={4} md={3} lg={2.4} key={product.id}>
                        <StyledProductCard
                          elevation={1}
                          onClick={() => addToCart(product)}
                          sx={{
                            opacity: isLoading ? 0.6 : 1,
                            pointerEvents: isLoading ? 'none' : 'auto'
                          }}
                        >
                          <Box sx={{ textAlign: 'center', flex: 1 }}>
                            <Box
                              component='img'
                              src={product.image}
                              alt={product.name}
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
                              {product.name}
                            </Typography>
                            <Chip
                              label={`ID: ${product.variantId}`}
                              size='small'
                              sx={{ mb: 0.5, fontSize: '0.65rem', height: 18 }}
                            />
                            <Typography variant='caption' color='text.secondary' display='block' sx={{ mb: 0.5 }}>
                              {product.size} | {product.color}
                            </Typography>
                            <Typography variant='h6' color='primary' fontWeight='bold' sx={{ fontSize: '0.9rem' }}>
                              {formatCurrency(product.price)}
                            </Typography>
                            <Typography
                              variant='caption'
                              sx={{
                                display: 'block',
                                mt: 0.5,
                                color:
                                  product.stock > 10
                                    ? 'success.main'
                                    : product.stock > 0
                                      ? 'warning.main'
                                      : 'error.main'
                              }}
                            >
                              Stock: {product.stock}
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

          {/* Panel de Carrito */}
          <Grid item xs={12} md={4}>
            <StyledCartSection>
              <CardHeader
                title={
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant='h6' color='primary'>
                        CARRITO DE COMPRA
                      </Typography>
                      {orderId && (
                        <Typography variant='caption' color='text.secondary'>
                          Orden #{orderId}
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
                {/* Selección de cliente */}
                <Box sx={{ mb: 2 }}>
                  <FormControl fullWidth size='small'>
                    <InputLabel>Cliente *</InputLabel>
                    <Select
                      value={selectedCustomer}
                      onChange={e => setSelectedCustomer(e.target.value)}
                      label='Cliente *'
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

                {/* Items del carrito */}
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
                            <Typography variant='caption' fontWeight='bold'>
                              Producto
                            </Typography>
                          </TableCell>
                          <TableCell align='center'>
                            <Typography variant='caption' fontWeight='bold'>
                              Cant
                            </Typography>
                          </TableCell>
                          <TableCell align='right'>
                            <Typography variant='caption' fontWeight='bold'>
                              Precio
                            </Typography>
                          </TableCell>
                          <TableCell align='right'>
                            <Typography variant='caption' fontWeight='bold'>
                              Total
                            </Typography>
                          </TableCell>
                          {currentStep === 'BUILDING_CART' && <TableCell width={40}></TableCell>}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {cartItems.map(item => {
                          const product = item.productInfo

                          if (!product) return null

                          return (
                            <TableRow key={item.variantId}>
                              <TableCell>
                                <Typography variant='caption' fontWeight='bold'>
                                  {product.name}
                                </Typography>
                                <Typography variant='caption' display='block' color='text.secondary'>
                                  ID: {item.variantId} | {product.size}
                                </Typography>
                              </TableCell>
                              <TableCell align='center'>
                                {currentStep === 'BUILDING_CART' ? (
                                  <Box
                                    sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}
                                  >
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
                                <Typography variant='caption'>{formatCurrency(product.price)}</Typography>
                              </TableCell>
                              <TableCell align='right'>
                                <Typography variant='caption' fontWeight='bold'>
                                  {formatCurrency(product.price * item.quantity)}
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

                {/* Totales */}
                {cartItems.length > 0 && (
                  <StyledTotalSection elevation={0}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant='body2'>Subtotal:</Typography>
                      <Typography variant='body2'>{formatCurrency(localTotals.subtotal)}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant='body2'>Descuento:</Typography>
                      <Typography variant='body2'>-{formatCurrency(localTotals.discount)}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant='body2'>IVA (19%):</Typography>
                      <Typography variant='body2'>{formatCurrency(localTotals.tax)}</Typography>
                    </Box>
                    <Divider sx={{ my: 1 }} />
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

                {/* Botón de continuar - Solo visible en BUILDING_CART */}
                {currentStep === 'BUILDING_CART' && (
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
                )}

                {/* Mensaje informativo si no hay cliente */}
                {currentStep === 'BUILDING_CART' && cartItems.length > 0 && !selectedCustomer && (
                  <Alert severity='info' sx={{ mt: 1, fontSize: '0.75rem' }}>
                    💡 Tip: Selecciona un cliente antes de continuar (opcional en modo demo)
                  </Alert>
                )}

                {/* Info del proceso actual */}
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

      {/* Dialog de Métodos de Pago */}
      <Dialog
        open={showPaymentDialog}
        onClose={() => !isLoading && setShowPaymentDialog(false)}
        maxWidth='sm'
        fullWidth
      >
        <DialogTitle>
          <Typography variant='h6'>Método de Pago - Orden #{orderId}</Typography>
        </DialogTitle>
        <DialogContent>
          <Typography variant='h5' gutterBottom color='primary' fontWeight='bold'>
            Total a pagar: {orderDetails ? formatCurrency(orderDetails.total) : '$0'}
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
                  {orderDetails && formatCurrency(orderDetails.total)}
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

export default PointOfSaleRefactored
