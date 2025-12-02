'use client'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Skeleton from '@mui/material/Skeleton'
import Chip from '@mui/material/Chip'
import Box from '@mui/material/Box'

// Components Imports
import OptionMenu from '@core/components/option-menu'

// Hooks
import { useLowStock } from '@/hooks/useDashboard'

const LowStock = () => {
  const { data: lowStockData, isLoading } = useLowStock()

  return (
    <Card>
      <CardHeader
        title='Productos con Bajo Stock'
        subheader='Productos que necesitan reabastecimiento'
        action={<OptionMenu options={['Ver Más', 'Refrescar']} />}
      />
      <CardContent>
        <Box
          sx={{
            maxHeight: '400px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.638rem',
            pr: 1,
            '&::-webkit-scrollbar': {
              width: '6px'
            },
            '&::-webkit-scrollbar-track': {
              background: 'transparent'
            },
            '&::-webkit-scrollbar-thumb': {
              background: '#888',
              borderRadius: '3px'
            },
            '&::-webkit-scrollbar-thumb:hover': {
              background: '#555'
            }
          }}
        >
          {isLoading ? (
            Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className='flex items-center gap-4'>
                <Skeleton variant='rectangular' width={46} height={46} />
                <div className='flex flex-wrap justify-between items-center gap-x-4 gap-y-1 is-full'>
                  <div className='flex flex-col'>
                    <Skeleton variant='text' width={150} height={24} />
                    <Skeleton variant='text' width={100} height={20} />
                  </div>
                  <Skeleton variant='circular' width={60} height={24} />
                </div>
              </div>
            ))
          ) : lowStockData && lowStockData.length > 0 ? (
            lowStockData.map((item, index) => {
            const firstImage = item.productColor.multimedia[0] || '/images/placeholder.png'
            const productName = item.productColor.product.name
            const colorName = item.productColor.color.name
            const price = parseFloat(item.productColor.product.price)
            const stockLevel = item.stock

            const stockColor = stockLevel === 0 ? 'error' : stockLevel <= 5 ? 'warning' : 'info'

            return (
              <div key={index} className='flex items-center gap-4'>
                <img src={firstImage} alt={productName} width={46} height={46} style={{ objectFit: 'cover' }} />
                <div className='flex flex-wrap justify-between items-center gap-x-4 gap-y-1 is-full'>
                  <div className='flex flex-col gap-1'>
                    <Typography className='font-medium' color='text.primary'>
                      {productName}
                    </Typography>
                    <Typography variant='body2'>
                      {`${colorName} - Talla: ${item.size.name} | Bs ${price.toFixed(2)}`}
                    </Typography>
                  </div>
                  <Chip
                    label={`Stock: ${stockLevel}`}
                    color={stockColor}
                    size='small'
                    variant='filled'
                  />
                </div>
              </div>
            )
          })
        ) : (
          <div className='flex items-center justify-center' style={{ minHeight: '200px' }}>
            <Typography variant='body2' color='text.secondary'>
              No hay productos con bajo stock
            </Typography>
          </div>
        )}
        </Box>
      </CardContent>
    </Card>
  )
}

export default LowStock
