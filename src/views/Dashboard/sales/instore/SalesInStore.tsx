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
  Fab,
  AppBar,
  Toolbar,
  styled,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  useTheme
} from '@mui/material'

// Styled components usando @emotion/styled con soporte para modo oscuro
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
}

interface CartItem extends Product {
  quantity: number
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

// Mock data de ropa
const mockProducts: Product[] = [
  {
    id: '1',
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
    name: 'Blusa Seda',
    price: 85000,
    stock: 15,
    category: 'BLUSAS',
    icon: '👚',
    size: 'S',
    color: 'Blanco',
    image: 'https://via.placeholder.com/150/f8f8ff/000000?text=Blusa'
  },
  {
    id: '9',
    name: 'Shorts Deportivos',
    price: 28000,
    stock: 40,
    category: 'SHORTS',
    icon: '🩳',
    size: 'M',
    color: 'Negro',
    image: 'https://via.placeholder.com/150/333333/ffffff?text=Shorts'
  },
  {
    id: '10',
    name: 'Cardigan Lana',
    price: 95000,
    stock: 8,
    category: 'CHAQUETAS',
    icon: '🧥',
    size: 'L',
    color: 'Gris',
    image: 'https://via.placeholder.com/150/808080/ffffff?text=Cardigan'
  },
  {
    id: '11',
    name: 'Leggings Negros',
    price: 32000,
    stock: 35,
    category: 'PANTALONES',
    icon: '🩱',
    size: 'M',
    color: 'Negro',
    image: 'https://via.placeholder.com/150/1a1a1a/ffffff?text=Leggings'
  },
  {
    id: '12',
    name: 'Camisa Formal',
    price: 58000,
    stock: 22,
    category: 'CAMISAS',
    icon: '👔',
    size: 'L',
    color: 'Azul',
    image: 'https://via.placeholder.com/150/191970/ffffff?text=Camisa'
  }
]

const categories = [
  'TODOS',
  'CAMISETAS',
  'PANTALONES',
  'VESTIDOS',
  'CHAQUETAS',
  'FALDAS',
  'BLUSAS',
  'SHORTS',
  'CAMISAS'
]

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

// QR Code SVG simple
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

    <rect x='90' y='10' width='10' height='10' fill='black' />
    <rect x='110' y='10' width='10' height='10' fill='black' />
    <rect x='90' y='30' width='10' height='10' fill='black' />
    <rect x='110' y='30' width='10' height='10' fill='black' />
    <rect x='90' y='50' width='10' height='10' fill='black' />
    <rect x='110' y='50' width='10' height='10' fill='black' />

    <rect x='10' y='90' width='10' height='10' fill='black' />
    <rect x='30' y='90' width='10' height='10' fill='black' />
    <rect x='50' y='90' width='10' height='10' fill='black' />
    <rect x='10' y='110' width='10' height='10' fill='black' />
    <rect x='30' y='110' width='10' height='10' fill='black' />
    <rect x='50' y='110' width='10' height='10' fill='black' />

    <rect x='90' y='90' width='30' height='30' fill='black' />
    <rect x='95' y='95' width='20' height='20' fill='white' />
    <rect x='100' y='100' width='10' height='10' fill='black' />

    <rect x='130' y='90' width='10' height='10' fill='black' />
    <rect x='150' y='90' width='10' height='10' fill='black' />
    <rect x='170' y='90' width='10' height='10' fill='black' />
    <rect x='130' y='110' width='10' height='10' fill='black' />
    <rect x='150' y='110' width='10' height='10' fill='black' />
    <rect x='170' y='110' width='10' height='10' fill='black' />

    <rect x='90' y='130' width='10' height='10' fill='black' />
    <rect x='110' y='130' width='10' height='10' fill='black' />
    <rect x='130' y='130' width='10' height='10' fill='black' />
    <rect x='150' y='130' width='10' height='10' fill='black' />
    <rect x='170' y='130' width='10' height='10' fill='black' />
    <rect x='90' y='150' width='10' height='10' fill='black' />
    <rect x='110' y='150' width='10' height='10' fill='black' />
    <rect x='130' y='150' width='10' height='10' fill='black' />
    <rect x='150' y='150' width='10' height='10' fill='black' />
    <rect x='170' y='150' width='10' height='10' fill='black' />
    <rect x='90' y='170' width='10' height='10' fill='black' />
    <rect x='110' y='170' width='10' height='10' fill='black' />
    <rect x='130' y='170' width='10' height='10' fill='black' />
    <rect x='150' y='170' width='10' height='10' fill='black' />
    <rect x='170' y='170' width='10' height='10' fill='black' />
  </svg>
)

const PointOfSale: React.FC = () => {
  const theme = useTheme()

  // Estados
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('TODOS')

  const [cart, setCart] = useState<CartItem[]>([
    {
      id: '2',
      name: 'Jeans Slim Azul',
      price: 89000,
      quantity: 1,
      stock: 23,
      category: 'PANTALONES',
      icon: '👖',
      size: 'L',
      color: 'Azul',
      image: 'https://via.placeholder.com/150/0066cc/ffffff?text=Jeans'
    },
    {
      id: '1',
      name: 'Camiseta Básica Blanca',
      price: 35000,
      quantity: 2,
      stock: 45,
      category: 'CAMISETAS',
      icon: '👕',
      size: 'M',
      color: 'Blanco',
      image: 'https://via.placeholder.com/150/ffffff/000000?text=Camiseta'
    }
  ])

  const [selectedPayment, setSelectedPayment] = useState('')
  const [showPaymentDialog, setShowPaymentDialog] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState('')

  // Filtrar productos
  const filteredProducts = mockProducts.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'TODOS' || product.category === selectedCategory

    return matchesSearch && matchesCategory
  })

  // Calcular totales
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const discount = 0
  const tax = subtotal * 0.19 // 19% IVA
  const total = subtotal - discount + tax

  // Formatear moneda
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount)
  }

  // Funciones del carrito
  const addToCart = (product: Product) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id)

      if (existingItem) {
        return prevCart.map(item => (item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item))
      } else {
        return [...prevCart, { ...product, quantity: 1 }]
      }
    })
  }

  const updateQuantity = (productId: string, change: number) => {
    setCart(prevCart =>
      prevCart
        .map(item => (item.id === productId ? { ...item, quantity: Math.max(0, item.quantity + change) } : item))
        .filter(item => item.quantity > 0)
    )
  }

  const removeFromCart = (productId: string) => {
    setCart(prevCart => prevCart.filter(item => item.id !== productId))
  }

  const clearCart = () => {
    setCart([])
  }

  const generatePDF = () => {
    // Crear una ventana nueva con el PDF de la factura
    const pdfWindow = window.open('', '_blank')

    if (pdfWindow) {
      pdfWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Factura - ${new Date().toLocaleDateString()}</title>
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
            <h1>FACTURA DE VENTA</h1>
            <h2>Mi Tienda de Ropa</h2>
            <p>NIT: 123.456.789-0</p>
          </div>
          
          <div class="invoice-details">
            <p><strong>Fecha:</strong> ${new Date().toLocaleDateString()}</p>
            <p><strong>Hora:</strong> ${new Date().toLocaleTimeString()}</p>
            <p><strong>Cliente:</strong> ${mockCustomers.find(c => c.id === selectedCustomer)?.name || 'Cliente General'}</p>
            <p><strong>Vendedor:</strong> María García</p>
          </div>
          
          <table>
            <thead>
              <tr>
                <th>Producto</th>
                <th>Talla</th>
                <th>Color</th>
                <th>Cantidad</th>
                <th>Precio Unit.</th>
                <th>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              ${cart
                .map(
                  item => `
                <tr>
                  <td>${item.name}</td>
                  <td>${item.size || '-'}</td>
                  <td>${item.color || '-'}</td>
                  <td>${item.quantity}</td>
                  <td>${formatCurrency(item.price)}</td>
                  <td>${formatCurrency(item.price * item.quantity)}</td>
                </tr>
              `
                )
                .join('')}
            </tbody>
          </table>
          
          <div class="total">
            <p>Subtotal: ${formatCurrency(subtotal)}</p>
            <p>IVA (19%): ${formatCurrency(tax)}</p>
            <p style="font-size: 1.3em; border-top: 2px solid #000; padding-top: 10px;">
              TOTAL: ${formatCurrency(total)}
            </p>
          </div>
          
          <div class="footer">
            <p>¡Gracias por su compra!</p>
            <p>Dirección: Calle 123 #45-67, Ciudad</p>
            <p>Teléfono: (601) 234-5678</p>
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

  const processSale = () => {
    if (!selectedPayment || cart.length === 0) return

    if (selectedPayment === 'efectivo') {
      generatePDF()
    }

    console.log('Procesando venta:', {
      items: cart,
      payment: selectedPayment,
      customer: selectedCustomer,
      total: total
    })

    // Reset
    setCart([])
    setSelectedPayment('')
    setSelectedCustomer('')
    setShowPaymentDialog(false)
  }

  return (
    <StyledContainer>
      {/* Header */}
      <StyledHeader>
        <Toolbar>
          <Typography variant='h4' sx={{ flexGrow: 1, fontWeight: 'bold', color: 'primary.main' }}>
            Punto de Venta - Tienda de Ropa
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Chip icon={<span>👤</span>} label='Vendedor: María García' variant='outlined' size='small' />
            <Typography variant='body2' color='text.secondary'>
              16 Sep 2025 - 14:30
            </Typography>
          </Box>
        </Toolbar>
      </StyledHeader>

      {/* Contenido Principal */}
      <Box sx={{ flex: 1, p: 2 }}>
        <Grid container spacing={2} sx={{ height: '100%' }}>
          {/* Panel de Productos */}
          <Grid item xs={12} md={8}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardHeader
                title={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant='h6'>Productos</Typography>
                    <Badge badgeContent={cart.length} color='primary'>
                      <span style={{ fontSize: '1.2em' }}>🛒</span>
                    </Badge>
                  </Box>
                }
              />
              <CardContent sx={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                {/* Búsqueda */}
                <TextField
                  fullWidth
                  placeholder='Encuentra tu producto aquí...'
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

                {/* Categorías */}
                <Box sx={{ mb: 2, display: 'flex', gap: 1, flexWrap: 'wrap', overflowX: 'auto' }}>
                  {categories.map(category => (
                    <Chip
                      key={category}
                      label={category}
                      onClick={() => setSelectedCategory(category)}
                      color={selectedCategory === category ? 'primary' : 'default'}
                      variant={selectedCategory === category ? 'filled' : 'outlined'}
                      size='small'
                      sx={{ fontSize: '0.75rem' }}
                    />
                  ))}
                </Box>

                {/* Grid de Productos */}
                <Box sx={{ flex: 1, overflow: 'auto' }}>
                  <Grid container spacing={2}>
                    {filteredProducts.map(product => (
                      <Grid item xs={6} sm={4} md={3} lg={2.4} key={product.id}>
                        <StyledProductCard elevation={1} onClick={() => addToCart(product)}>
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
                                minHeight: '2.4em',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                              }}
                            >
                              {product.name}
                            </Typography>
                            <Typography variant='caption' color='text.secondary' display='block' sx={{ mb: 0.5 }}>
                              Talla: {product.size} | {product.color}
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
                    <Typography variant='h6' color='primary'>
                      ATENDIENDO
                    </Typography>
                    <IconButton onClick={clearCart} color='error' size='small'>
                      <span>🗑️</span>
                    </IconButton>
                  </Box>
                }
              />
              <CardContent sx={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', p: 2 }}>
                {/* Selección de cliente */}
                <Box sx={{ mb: 2 }}>
                  <FormControl fullWidth size='small'>
                    <InputLabel>Seleccionar Cliente</InputLabel>
                    <Select
                      value={selectedCustomer}
                      onChange={e => setSelectedCustomer(e.target.value)}
                      label='Seleccionar Cliente'
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
                  {cart.length === 0 ? (
                    <Box
                      sx={{
                        textAlign: 'center',
                        py: 4,
                        color: 'text.secondary'
                      }}
                    >
                      <Typography sx={{ fontSize: '3rem', mb: 1, opacity: 0.5 }}>🛒</Typography>
                      <Typography>Carrito vacío</Typography>
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
                              Valor
                            </Typography>
                          </TableCell>
                          <TableCell align='right'>
                            <Typography variant='caption' fontWeight='bold'>
                              SubTotal
                            </Typography>
                          </TableCell>
                          <TableCell width={40}></TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {cart.map(item => (
                          <TableRow key={item.id}>
                            <TableCell>
                              <Typography variant='caption' fontWeight='bold'>
                                {item.name}
                              </Typography>
                              <Typography variant='caption' display='block' color='text.secondary'>
                                {item.size} | {item.color} | Stock: {item.stock}
                              </Typography>
                            </TableCell>
                            <TableCell align='center'>
                              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                                <IconButton
                                  size='small'
                                  onClick={() => updateQuantity(item.id, -1)}
                                  sx={{ fontSize: '0.8rem' }}
                                >
                                  ➖
                                </IconButton>
                                <Typography variant='body2' sx={{ minWidth: 20, textAlign: 'center' }}>
                                  {item.quantity}
                                </Typography>
                                <IconButton
                                  size='small'
                                  onClick={() => updateQuantity(item.id, 1)}
                                  sx={{ fontSize: '0.8rem' }}
                                >
                                  ➕
                                </IconButton>
                              </Box>
                            </TableCell>
                            <TableCell align='right'>
                              <Typography variant='caption'>{formatCurrency(item.price)}</Typography>
                            </TableCell>
                            <TableCell align='right'>
                              <Typography variant='caption' fontWeight='bold'>
                                {formatCurrency(item.price * item.quantity)}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <IconButton
                                size='small'
                                color='error'
                                onClick={() => removeFromCart(item.id)}
                                sx={{ fontSize: '0.8rem' }}
                              >
                                🗑️
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </Box>

                {/* Totales */}
                {cart.length > 0 && (
                  <StyledTotalSection elevation={0}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant='body2'>Total Bruto:</Typography>
                      <Typography variant='body2'>{formatCurrency(subtotal)}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant='body2'>Descuento:</Typography>
                      <Typography variant='body2'>-{formatCurrency(discount)}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant='body2'>Impuestos (19%):</Typography>
                      <Typography variant='body2'>{formatCurrency(tax)}</Typography>
                    </Box>
                    <Divider sx={{ my: 1 }} />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant='h6' fontWeight='bold'>
                        Total Compra:
                      </Typography>
                      <Typography variant='h6' fontWeight='bold' color='primary'>
                        {formatCurrency(total)}
                      </Typography>
                    </Box>
                  </StyledTotalSection>
                )}

                {/* Botón de pago */}
                <Button
                  variant='contained'
                  fullWidth
                  size='large'
                  onClick={() => setShowPaymentDialog(true)}
                  disabled={cart.length === 0}
                  sx={{ py: 1.5, fontSize: '1.1rem', fontWeight: 'bold' }}
                >
                  Pagar
                </Button>
              </CardContent>
            </StyledCartSection>
          </Grid>
        </Grid>
      </Box>

      {/* Dialog de Métodos de Pago */}
      <Dialog open={showPaymentDialog} onClose={() => setShowPaymentDialog(false)} maxWidth='sm' fullWidth>
        <DialogTitle>
          <Typography variant='h6'>Seleccionar Método de Pago</Typography>
        </DialogTitle>
        <DialogContent>
          <Typography variant='h5' gutterBottom color='primary' fontWeight='bold'>
            Total a pagar: {formatCurrency(total)}
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
                  onClick={() => setSelectedPayment(method.id)}
                >
                  <Box sx={{ color: method.color, mb: 1, fontSize: '1.5rem' }}>{method.icon}</Box>
                  <Typography variant='body2' fontWeight='medium'>
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
                  Escanea el código QR para realizar el pago
                </Typography>
                <Typography variant='h6' color='primary' fontWeight='bold'>
                  Total: {formatCurrency(total)}
                </Typography>
                <Typography variant='body2' color='text.secondary' sx={{ mt: 1 }}>
                  Cliente: {mockCustomers.find(c => c.id === selectedCustomer)?.name || 'Seleccionar cliente'}
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
                  Al procesar se generará la factura en PDF
                </Typography>
              </Paper>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setShowPaymentDialog(false)}>Cancelar</Button>
          <Button
            variant='contained'
            onClick={processSale}
            disabled={!selectedPayment || !selectedCustomer}
            startIcon={<span>🧾</span>}
          >
            {selectedPayment === 'efectivo' ? 'Generar Factura' : 'Procesar Pago'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* FAB para imprimir */}
      <Fab
        color='primary'
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={() => console.log('Imprimir recibo')}
      >
        <span style={{ fontSize: '1.2rem' }}>🖨️</span>
      </Fab>
    </StyledContainer>
  )
}

export default PointOfSale
