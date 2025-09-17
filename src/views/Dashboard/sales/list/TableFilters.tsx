// React Imports
import { useState, useEffect } from 'react'

// MUI Imports
import Grid from '@mui/material/Grid2'
import CardContent from '@mui/material/CardContent'
import MenuItem from '@mui/material/MenuItem'

// Type Imports
import type { ProductType } from '@/types/apps/ecommerceTypes'

// Component Imports
import CustomTextField from '@core/components/mui/TextField'

const TableFilters = ({
  setData,
  productData
}: {
  setData: (data: ProductType[]) => void
  productData?: ProductType[]
}) => {
  // States
  const [tienda, setTienda] = useState<string>('TODOS')

  // Función para mapear categorías a tiendas
  const getCategoryTienda = (category: string): string => {
    if (category === 'Electronics' || category === 'Office' || category === 'Games') {
      return 'HOMBRES'
    }

    if (category === 'Accessories' || category === 'Home Decor' || category === 'Shoes') {
      return 'MUJERES'
    }

    return 'OTROS'
  }

  useEffect(
    () => {
      const filteredData = productData?.filter(product => {
        if (tienda === 'TODOS') return true

        const productTienda = getCategoryTienda(product.category)

        return productTienda === tienda
      })

      setData(filteredData ?? [])
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [tienda, productData]
  )

  return (
    <CardContent>
      <Grid container spacing={6}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <CustomTextField select fullWidth id='select-tienda' value={tienda} onChange={e => setTienda(e.target.value)}>
            <MenuItem value='TODOS'>Todos</MenuItem>
            <MenuItem value='HOMBRES'>Hombres</MenuItem>
            <MenuItem value='MUJERES'>Mujeres</MenuItem>
          </CustomTextField>
        </Grid>
      </Grid>
    </CardContent>
  )
}

export default TableFilters
