'use client'

// React Imports
import { useEffect, useMemo, useState } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import MenuItem from '@mui/material/MenuItem'
import TablePagination from '@mui/material/TablePagination'
import Typography from '@mui/material/Typography'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Box from '@mui/material/Box'
import Checkbox from '@mui/material/Checkbox'
import type { TextFieldProps } from '@mui/material/TextField'

// Third-party Imports
import classnames from 'classnames'
import { rankItem } from '@tanstack/match-sorter-utils'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getFilteredRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFacetedMinMaxValues,
  getPaginationRowModel,
  getSortedRowModel
} from '@tanstack/react-table'
import type { ColumnDef, FilterFn } from '@tanstack/react-table'
import type { RankingInfo } from '@tanstack/match-sorter-utils'

// Component Imports
import CustomTextField from '@core/components/mui/TextField'
import TablePaginationComponent from '@components/TablePaginationComponent'

// Style Imports
import tableStyles from '@core/styles/table.module.css'

declare module '@tanstack/table-core' {
  interface FilterFns {
    fuzzy: FilterFn<unknown>
  }
  interface FilterMeta {
    itemRank: RankingInfo
  }
}

// Tipos corregidos
type ProductType = {
  id: number
  tienda: 'HOMBRES' | 'MUJERES'
  nombre: string
  fotos: string[]
  costo: number
  descuento: number
}

const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
  const itemRank = rankItem(row.getValue(columnId), value)

  addMeta({ itemRank })

  return itemRank.passed
}

const DebouncedInput = ({
  value: initialValue,
  onChange,
  debounce = 500,
  ...props
}: {
  value: string | number
  onChange: (value: string | number) => void
  debounce?: number
} & Omit<TextFieldProps, 'onChange'>) => {
  const [value, setValue] = useState(initialValue)

  useEffect(() => {
    setValue(initialValue)
  }, [initialValue])

  useEffect(() => {
    const timeout = setTimeout(() => {
      onChange(value)
    }, debounce)

    return () => clearTimeout(timeout)
  }, [value, onChange, debounce])

  return <CustomTextField {...props} value={value} onChange={e => setValue(e.target.value)} />
}

// Datos de ejemplo con múltiples fotos
const productsData: ProductType[] = [
  {
    id: 1,
    tienda: 'HOMBRES',
    nombre: 'Pantalón Cargo Militar',
    fotos: ['👖', '🩲', '👔', '🧥', '👕', '🩱'],
    costo: 270.0,
    descuento: 0
  },
  {
    id: 2,
    tienda: 'MUJERES',
    nombre: 'Blusa Elegante',
    fotos: ['👚', '👗', '🥻', '👘'],
    costo: 180.0,
    descuento: 10
  },
  {
    id: 3,
    tienda: 'HOMBRES',
    nombre: 'Camisa Polo Clásica',
    fotos: ['👕', '🩱', '👔', '🧥', '👖'],
    costo: 120.0,
    descuento: 15
  },
  {
    id: 4,
    tienda: 'MUJERES',
    nombre: 'Vestido Casual',
    fotos: ['👗', '👚', '🥻', '👘', '👠'],
    costo: 350.0,
    descuento: 20
  },
  {
    id: 5,
    tienda: 'HOMBRES',
    nombre: 'Zapatos Deportivos',
    fotos: ['👟', '👞', '🥿', '👠'],
    costo: 450.0,
    descuento: 5
  }
]

// Modal para cambiar descuentos - CORREGIDO
const DiscountModal = ({
  open,
  onClose,
  selectedProducts,
  allProducts,
  onUpdateDiscounts
}: {
  open: boolean
  onClose: () => void
  selectedProducts: number[]
  allProducts: ProductType[]
  onUpdateDiscounts: (productIds: number[], newDiscount: number) => void
}) => {
  const [newDiscount, setNewDiscount] = useState(0)

  const selectedProductsData = allProducts.filter(product => selectedProducts.includes(product.id))

  const handleApplyDiscount = () => {
    onUpdateDiscounts(selectedProducts, newDiscount)
    onClose()
    setNewDiscount(0)
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth='sm' fullWidth>
      <DialogTitle>
        <Typography variant='h5'>Cambiar Descuento</Typography>
      </DialogTitle>

      <DialogContent>
        <Box className='space-y-4'>
          <Typography variant='body2' color='textSecondary'>
            Productos seleccionados: {selectedProducts.length}
          </Typography>

          <Box className='space-y-2'>
            {selectedProductsData.map(product => (
              <Box
                key={product.id}
                className='flex items-center justify-between p-3 rounded-lg border border-divider bg-background'
              >
                <Box className='flex items-center gap-3'>
                  {/* Mostrar múltiples imágenes en el modal */}
                  <Box className='flex gap-1'>
                    {product.fotos.slice(0, 3).map((foto: string, index: number) => (
                      <Box
                        key={index}
                        className='w-8 h-8 bg-actionHover rounded flex items-center justify-center text-xs'
                      >
                        {foto}
                      </Box>
                    ))}
                    {product.fotos.length > 3 && (
                      <Box className='w-8 h-8 bg-actionHover rounded flex items-center justify-center text-xs text-textSecondary'>
                        +{product.fotos.length - 3}
                      </Box>
                    )}
                  </Box>
                  <Typography variant='body2' className='text-textPrimary'>
                    {product.nombre}
                  </Typography>
                </Box>
                <Typography variant='caption' className='text-textSecondary'>
                  Descuento actual: {product.descuento}%
                </Typography>
              </Box>
            ))}
          </Box>

          <CustomTextField
            fullWidth
            type='number'
            label='Nuevo descuento (%)'
            value={newDiscount}
            onChange={e => setNewDiscount(Number(e.target.value))}
            inputProps={{ min: 0, max: 100 }}
            variant='outlined'
          />
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} variant='outlined'>
          Cancelar
        </Button>
        <Button
          onClick={handleApplyDiscount}
          variant='contained'
          color='primary'
          disabled={selectedProducts.length === 0}
        >
          Aplicar Descuento
        </Button>
      </DialogActions>
    </Dialog>
  )
}

// Column Definitions - CORREGIDAS
const columnHelper = createColumnHelper<ProductType>()

const ProductsTable = () => {
  // States
  const [data, setData] = useState<ProductType[]>(productsData)
  const [globalFilter, setGlobalFilter] = useState('')
  const [selectedProducts, setSelectedProducts] = useState<number[]>([])
  const [discountModalOpen, setDiscountModalOpen] = useState(false)

  // Función para manejar selección de productos
  const handleSelectProduct = (productId: number) => {
    setSelectedProducts(prev => (prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]))
  }

  // Función para seleccionar todos
  const handleSelectAll = () => {
    if (selectedProducts.length === data.length) {
      setSelectedProducts([])
    } else {
      setSelectedProducts(data.map(product => product.id))
    }
  }

  // Función para actualizar descuentos
  const handleUpdateDiscounts = (productIds: number[], newDiscount: number) => {
    setData(prev =>
      prev.map(product => (productIds.includes(product.id) ? { ...product, descuento: newDiscount } : product))
    )
    setSelectedProducts([])
  }

  const columns = useMemo<ColumnDef<ProductType, any>[]>(
    () => [
      columnHelper.display({
        id: 'select',
        header: () => (
          <Checkbox
            checked={selectedProducts.length === data.length && data.length > 0}
            indeterminate={selectedProducts.length > 0 && selectedProducts.length < data.length}
            onChange={handleSelectAll}
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={selectedProducts.includes(row.original.id)}
            onChange={() => handleSelectProduct(row.original.id)}
          />
        )
      }),
      columnHelper.accessor('id', {
        header: 'ID',
        cell: ({ row }) => (
          <Typography className='font-medium' color='text.primary'>
            {row.original.id}
          </Typography>
        )
      }),
      columnHelper.accessor('tienda', {
        header: 'Tienda',
        cell: ({ row }) => (
          <Chip
            label={row.original.tienda}
            variant='tonal'
            color={row.original.tienda === 'HOMBRES' ? 'primary' : 'error'}
            size='small'
          />
        )
      }),
      columnHelper.accessor('nombre', {
        header: 'Nombre del Producto',
        cell: ({ row }) => (
          <Typography className='font-medium' color='text.primary'>
            {row.original.nombre}
          </Typography>
        )
      }),
      columnHelper.accessor('fotos', {
        header: 'Fotos',
        cell: ({ row }) => (
          <Box className='flex gap-1'>
            {row.original.fotos.slice(0, 4).map((foto: string, index: number) => (
              <Box
                key={index}
                className='w-10 h-10 bg-actionHover rounded-lg flex items-center justify-center border text-sm'
              >
                {foto}
              </Box>
            ))}
            {row.original.fotos.length > 4 && (
              <Box className='w-10 h-10 bg-actionSelected rounded-lg flex items-center justify-center border text-xs text-textSecondary'>
                +{row.original.fotos.length - 4}
              </Box>
            )}
          </Box>
        )
      }),
      columnHelper.accessor('costo', {
        header: 'Costo',
        cell: ({ row }) => (
          <Typography className='font-medium' color='text.primary'>
            Bs. {row.original.costo.toFixed(2)}
          </Typography>
        )
      }),
      columnHelper.accessor('descuento', {
        header: 'Descuento',
        cell: ({ row }) => (
          <Box className='flex items-center gap-2'>
            <Typography className='font-medium' color='text.primary'>
              {row.original.descuento}%
            </Typography>
            {row.original.descuento > 0 && (
              <Chip label={`-${row.original.descuento}%`} variant='tonal' color='success' size='small' />
            )}
          </Box>
        )
      })
    ],
    [selectedProducts, data]
  )

  const table = useReactTable({
    data: data,
    columns,
    filterFns: {
      fuzzy: fuzzyFilter
    },
    state: {
      globalFilter
    },
    initialState: {
      pagination: {
        pageSize: 10
      }
    },
    enableRowSelection: false,
    globalFilterFn: fuzzyFilter,
    getCoreRowModel: getCoreRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues()
  })

  return (
    <>
      <Card>
        <div className='flex flex-wrap justify-between gap-4 p-6'>
          <DebouncedInput
            value={globalFilter ?? ''}
            onChange={value => setGlobalFilter(String(value))}
            placeholder='Buscar producto...'
            className='max-sm:is-full'
          />

          <div className='flex flex-wrap items-center max-sm:flex-col gap-4 max-sm:is-full is-auto'>
            <Button
              variant='contained'
              color='primary'
              onClick={() => setDiscountModalOpen(true)}
              disabled={selectedProducts.length === 0}
              startIcon={<i className='tabler-percentage' />}
            >
              Cambiar Descuento ({selectedProducts.length})
            </Button>

            <CustomTextField
              select
              value={table.getState().pagination.pageSize}
              onChange={e => table.setPageSize(Number(e.target.value))}
              className='flex-auto is-[70px] max-sm:is-full'
            >
              <MenuItem value='10'>10</MenuItem>
              <MenuItem value='25'>25</MenuItem>
              <MenuItem value='50'>50</MenuItem>
            </CustomTextField>
          </div>
        </div>

        <div className='overflow-x-auto'>
          <table className={tableStyles.table}>
            <thead>
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <th key={header.id}>
                      {header.isPlaceholder ? null : (
                        <div
                          className={classnames({
                            'flex items-center': header.column.getIsSorted(),
                            'cursor-pointer select-none': header.column.getCanSort()
                          })}
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {{
                            asc: <i className='tabler-chevron-up text-xl' />,
                            desc: <i className='tabler-chevron-down text-xl' />
                          }[header.column.getIsSorted() as 'asc' | 'desc'] ?? null}
                        </div>
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            {table.getFilteredRowModel().rows.length === 0 ? (
              <tbody>
                <tr>
                  <td colSpan={table.getVisibleFlatColumns().length} className='text-center'>
                    No hay productos disponibles
                  </td>
                </tr>
              </tbody>
            ) : (
              <tbody>
                {table
                  .getRowModel()
                  .rows.slice(0, table.getState().pagination.pageSize)
                  .map(row => {
                    return (
                      <tr key={row.id} className='hover:bg-actionHover transition-colors duration-200'>
                        {row.getVisibleCells().map(cell => (
                          <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                        ))}
                      </tr>
                    )
                  })}
              </tbody>
            )}
          </table>
        </div>

        <TablePagination
          component={() => <TablePaginationComponent table={table} />}
          count={table.getFilteredRowModel().rows.length}
          rowsPerPage={table.getState().pagination.pageSize}
          page={table.getState().pagination.pageIndex}
          onPageChange={(_, page) => {
            table.setPageIndex(page)
          }}
        />
      </Card>

      {/* Modal de descuentos */}
      <DiscountModal
        open={discountModalOpen}
        onClose={() => setDiscountModalOpen(false)}
        selectedProducts={selectedProducts}
        allProducts={data}
        onUpdateDiscounts={handleUpdateDiscounts}
      />
    </>
  )
}

export default ProductsTable
