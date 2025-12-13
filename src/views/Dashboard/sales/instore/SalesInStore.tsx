'use client'

import React, { useState, useMemo, useRef, useEffect } from 'react'

import { useRouter } from 'next/navigation'

import { Grid, Box, Alert } from '@mui/material'

import { useAddToCart, useRepriceCart, useCreateOrder, useConfirmOrder, useCancelOrder } from '@/hooks/useSales'
import { useVariants } from '@/hooks/useVariants'
import type { CartItem, RepriceResponse, Order } from '@/types/api/sales'
import type { Variant, VariantSize } from '@/types/api/variants'
import ProductCatalog from './components/ProductCatalog'
import ShoppingCart from './components/ShoppingCart'
import PaymentDialog from './components/PaymentDialog'
import SuccessDialog from './components/SuccessDialog'
import CancelDialog from './components/CancelDialog'

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
  { id: 'cash', name: 'Efectivo', icon: '💵', color: '#4caf50' },
  { id: 'card', name: 'Tarjeta', icon: '💳', color: '#2196f3' },
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
  const router = useRouter()
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
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)
  const [variantsPage, setVariantsPage] = useState(1)
  const [variantsLimit] = useState(10)

  const debounceTimerRef = useRef<NodeJS.Timeout>()
  const timerIntervalRef = useRef<NodeJS.Timeout>()
  const skipDebounceRef = useRef(false)

  const addToCartMutation = useAddToCart()
  const repriceMutation = useRepriceCart()
  const createOrderMutation = useCreateOrder()
  const confirmOrderMutation = useConfirmOrder()
  const cancelOrderMutation = useCancelOrder()

  const { data: variantsData, isLoading: isLoadingVariants } = useVariants(variantsPage, variantsLimit, debouncedSearch)

  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    // Detectar formato QR: <qr>123</qr> y buscar inmediatamente
    const qrMatch = searchTerm.match(/<qr>\d+<\/qr>/)

    if (qrMatch) {
      // Enviar el formato completo al backend
      setDebouncedSearch(searchTerm)
      skipDebounceRef.current = true

      setTimeout(() => {
        setSearchTerm('')
      }, 100)

      return
    }

    // Si acabamos de limpiar después de un QR, no hacer nada
    if (skipDebounceRef.current && searchTerm === '') {
      skipDebounceRef.current = false

      return
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
    if (!variantsData?.data) return []

    return variantsData.data
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
      .slice(0, variantsLimit)
  }, [variantsData, variantsLimit])

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
      setCurrentStep('ORDER_CREATED')
      setActiveStepIndex(2)
      setShowPaymentDialog(true)
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

  const handlePaymentMethodSelect = async (paymentType: 'cash' | 'card' | 'qr') => {
    if (!cartToken) {
      setErrorMessage('No hay carrito disponible')

      return
    }

    setSelectedPayment(paymentType)

    if (orderData) {
      return
    }

    try {
      setErrorMessage('')

      const payload = {
        token: cartToken,
        payment_type: paymentType
      }

      const order = await createOrderMutation.mutateAsync(payload)

      setOrderData(order)

      if (order.expiresAt) {
        const expirationDate = new Date(order.expiresAt)

        setOrderExpiresAt(expirationDate)
      }
    } catch (error: any) {
      setErrorMessage(error?.response?.data?.message || 'Error al crear la orden')
      setSelectedPayment('')
      setCurrentStep('ORDER_CREATED')
      setActiveStepIndex(2)
    }
  }

  const confirmPayment = async () => {
    if (!orderData) {
      setErrorMessage('No hay orden creada')

      return
    }

    try {
      setErrorMessage('')
      setCurrentStep('PAYMENT')
      setActiveStepIndex(3)

      await confirmOrderMutation.mutateAsync({
        orderId: orderData.id,
        data: undefined
      })

      setCurrentStep('COMPLETED')
      setShowPaymentDialog(false)
      setShowSuccessDialog(true)

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

  const handleCloseWithoutOrder = () => {
    setShowPaymentDialog(false)

    setCurrentStep('BUILDING_CART')
    setActiveStepIndex(0)
    setRepriceData(null)
    setCartToken('')
    setSelectedPayment('')
    setOrderData(null)
    setTimeRemaining(0)
    setOrderExpiresAt(null)

    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current)
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

  const handleVariantsPageChange = (_: unknown, newPage: number) => {
    setVariantsPage(newPage + 1)
  }

  const timerProgress = orderExpiresAt ? (timeRemaining / (15 * 60)) * 100 : 100

  return (
    <Box
      sx={{ height: 'calc(100vh - 180px)', display: 'flex', flexDirection: 'column', bgcolor: 'background.default' }}
    >
      {errorMessage && (
        <Box sx={{ px: 3, pt: 2 }}>
          <Alert severity='error' onClose={() => setErrorMessage('')}>
            {errorMessage}
          </Alert>
        </Box>
      )}

      <Box sx={{ flex: 1, p: 3, overflow: 'hidden' }}>
        <Grid container spacing={3} sx={{ height: '100%' }}>
          <Grid item xs={12} md={8} sx={{ height: '100%' }}>
            <ProductCatalog
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              cartItemsCount={cartItems.length}
              activeStepIndex={activeStepIndex}
              steps={steps}
              isLoading={isLoadingVariants || isLoading}
              variants={flattenedVariants}
              variantsPage={variantsPage}
              variantsLimit={variantsLimit}
              totalVariants={variantsData?.meta?.total || 0}
              onPageChange={handleVariantsPageChange}
              onProductClick={addToCart}
            />
          </Grid>

          <Grid item xs={12} md={4} sx={{ height: '100%' }}>
            <ShoppingCart
              cartItems={cartItems}
              orderData={orderData}
              repriceData={repriceData}
              currentStep={currentStep}
              isLoading={isLoading}
              onClearCart={clearCart}
              onRemoveItem={removeFromCart}
              onUpdateQuantity={updateQuantity}
              onProceedToPayment={verifyStockAndPrices}
            />
          </Grid>
        </Grid>
      </Box>

      <PaymentDialog
        open={showPaymentDialog}
        orderData={orderData}
        repriceData={repriceData}
        selectedPayment={selectedPayment}
        timeRemaining={timeRemaining}
        timerProgress={timerProgress}
        currentStep={currentStep}
        isLoading={isLoading}
        paymentMethods={paymentMethods}
        onClose={handleCloseWithoutOrder}
        onPaymentSelect={handlePaymentMethodSelect}
        onConfirmPayment={confirmPayment}
        onCancelOrder={() => setShowCancelDialog(true)}
      />

      <CancelDialog
        open={showCancelDialog}
        orderData={orderData}
        isLoading={isLoading}
        onClose={() => setShowCancelDialog(false)}
        onConfirm={handleCancelOrder}
      />

      <SuccessDialog
        open={showSuccessDialog}
        orderData={orderData}
        onAccept={() => {
          setShowSuccessDialog(false)
          clearCart()
        }}
        onViewSales={() => router.push('/sales/list')}
      />
    </Box>
  )
}

export default PointOfSale
