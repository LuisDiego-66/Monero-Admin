'use client'

// React Imports
import { useEffect, useMemo, useState, useCallback } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import TablePagination from '@mui/material/TablePagination'
import MenuItem from '@mui/material/MenuItem'
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Grid2'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import type { TextFieldProps } from '@mui/material/TextField'
import { styled, useTheme } from '@mui/material/styles'

// Third-party Imports
import classnames from 'classnames'
import { rankItem } from '@tanstack/match-sorter-utils'
import {
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
import type { FilterFn } from '@tanstack/react-table'
import type { RankingInfo } from '@tanstack/match-sorter-utils'

// Drag and Drop Imports
import type { DragEndEvent } from '@dnd-kit/core'
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { restrictToVerticalAxis } from '@dnd-kit/modifiers'

// Component Imports
import AddCategoryDrawer from './AddCategoryDrawer'
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

export type categoryType = {
  id: number
  categoryTitle: string
  description: string
  totalProduct: number
  totalEarning: number
  image: string
}

const StyledAlert = styled(Alert)(({ theme }) => ({
  margin: theme.spacing(3),
  '& .MuiAlert-icon': {
    alignItems: 'center'
  }
}))

const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
  const itemRank = rankItem(row.getValue(columnId), value)

  addMeta({ itemRank })

  return itemRank.passed
}

// Componente para fila arrastrable
const SortableRow = ({
  row,
  children,
  isDragMode,
  onCellClick
}: {
  row: any
  children: React.ReactNode
  isDragMode: boolean
  onCellClick?: (row: any) => void
}) => {
  const theme = useTheme()

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: row.original.id,
    disabled: !isDragMode
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.8 : 1,
    backgroundColor: isDragging ? theme.palette.action.selected : 'transparent',
    zIndex: isDragging ? 1 : 0
  }

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className={classnames(
        tableStyles.row,
        isDragging && 'dragging-row',
        !isDragMode && 'hover:bg-blue-200 transition-colors duration-200 cursor-pointer'
      )}
      {...attributes}
      onClick={!isDragMode ? () => onCellClick?.(row) : undefined}
    >
      {/* Solo mostrar columna grip cuando hay filtros activos */}
      {isDragMode && (
        <td className={tableStyles.cell} style={{ width: '40px', padding: theme.spacing(1) }} {...listeners}>
          <IconButton
            size='small'
            className='drag-handle'
            sx={{
              color: theme.palette.text.secondary,
              cursor: 'grab',
              '&:hover': {
                color: theme.palette.primary.main
              },
              '&:active': {
                cursor: 'grabbing'
              }
            }}
          >
            <i className='tabler-grip-vertical' />
          </IconButton>
        </td>
      )}
      {children}
    </tr>
  )
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

// Vars
const categoryData: categoryType[] = [
  {
    id: 1,
    categoryTitle: 'Smart Phone',
    description: 'Choose from wide range of smartphones online at best prices.',
    totalProduct: 12548,
    totalEarning: 98784,
    image: '/images/apps/ecommerce/product-1.png'
  },
  {
    id: 2,
    categoryTitle: 'Clothing, Shoes, and jewellery',
    description: 'Fashion for a wide selection of clothing, shoes, jewellery and watches.',
    totalProduct: 4689,
    totalEarning: 45627,
    image: '/images/apps/ecommerce/product-9.png'
  },
  {
    id: 3,
    categoryTitle: 'Home and Kitchen',
    description: 'Browse through the wide range of Home and kitchen products.',
    totalProduct: 11297,
    totalEarning: 51097,
    image: '/images/apps/ecommerce/product-10.png'
  },
  {
    id: 4,
    categoryTitle: 'Beauty and Personal Care',
    description: 'Explore beauty and personal care products, shop makeup and etc.',
    totalProduct: 9474,
    totalEarning: 74829,
    image: '/images/apps/ecommerce/product-19.png'
  },
  {
    id: 5,
    categoryTitle: 'Books',
    description: 'Over 25 million titles across categories such as business  and etc.',
    totalProduct: 10257,
    totalEarning: 63618,
    image: '/images/apps/ecommerce/product-25.png'
  },
  {
    id: 6,
    categoryTitle: 'Games',
    description: 'Every month, get exclusive in-game loot, free games, a free subscription.',
    totalProduct: 14501,
    totalEarning: 65920,
    image: '/images/apps/ecommerce/product-12.png'
  },
  {
    id: 7,
    categoryTitle: 'Baby Products',
    description: 'Buy baby products across different categories from top brands.',
    totalProduct: 8624,
    totalEarning: 38838,
    image: '/images/apps/ecommerce/product-14.png'
  },
  {
    id: 8,
    categoryTitle: 'Growsari',
    description: 'Shop grocery Items through at best prices in India.',
    totalProduct: 7389,
    totalEarning: 72652,
    image: '/images/apps/ecommerce/product-26.png'
  },
  {
    id: 9,
    categoryTitle: 'Computer Accessories',
    description: 'Enhance your computing experience with our range of computer accessories.',
    totalProduct: 9876,
    totalEarning: 65421,
    image: '/images/apps/ecommerce/product-17.png'
  },
  {
    id: 10,
    categoryTitle: 'Fitness Tracker',
    description: 'Monitor your health and fitness goals with our range of advanced fitness trackers.',
    totalProduct: 1987,
    totalEarning: 32067,
    image: '/images/apps/ecommerce/product-10.png'
  },
  {
    id: 11,
    categoryTitle: 'Smart Home Devices',
    description: 'Transform your home into a smart home with our innovative smart home devices.',
    totalProduct: 2345,
    totalEarning: 87654,
    image: '/images/apps/ecommerce/product-11.png'
  },
  {
    id: 12,
    categoryTitle: 'Audio Speakers',
    description: 'Immerse yourself in rich audio quality with our wide range of speakers.',
    totalProduct: 5678,
    totalEarning: 32145,
    image: '/images/apps/ecommerce/product-2.png'
  }
]

// Función para determinar la tienda basada en la categoría
const getCategoryTienda = (categoryTitle: string): 'HOMBRES' | 'MUJERES' => {
  const hombresCategories = ['Smart Phone', 'Games', 'Computer Accessories', 'Smart Home Devices', 'Audio Speakers']

  return hombresCategories.includes(categoryTitle) ? 'HOMBRES' : 'MUJERES'
}

// Componente de filtros para categorías
const CategoryFilters = ({
  setData,
  categoryData,
  onFiltersChange
}: {
  setData: (data: categoryType[]) => void
  categoryData?: categoryType[]
  onFiltersChange?: (hasFilters: boolean) => void
}) => {
  const [tienda, setTienda] = useState<string>('TODOS')

  useEffect(() => {
    const filteredData = categoryData?.filter(category => {
      if (tienda === 'TODOS') return true
      const categoryTienda = getCategoryTienda(category.categoryTitle)

      return categoryTienda === tienda
    })

    setData(filteredData ?? [])

    // Reportar si hay filtros activos
    const hasActiveFilters = tienda !== 'TODOS'

    onFiltersChange?.(hasActiveFilters)
  }, [tienda, categoryData, onFiltersChange])

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

const ProductCategoryTable = () => {
  // Hooks
  const theme = useTheme()

  // States
  const [addCategoryOpen, setAddCategoryOpen] = useState(false)
  const [data, setData] = useState<categoryType[]>(categoryData)
  const [filteredData, setFilteredData] = useState<categoryType[]>(data)
  const [globalFilter, setGlobalFilter] = useState('')
  const [hasFiltersFromComponent, setHasFiltersFromComponent] = useState(false)
  const [isClient, setIsClient] = useState(false)

  // Configurar sensores para DnD
  const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor))

  // Determinar si hay filtros activos
  const hasActiveFilters = useMemo(() => {
    return Boolean(globalFilter) || hasFiltersFromComponent
  }, [globalFilter, hasFiltersFromComponent])

  // Effect para detectar cliente y evitar hidratación
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Función para manejar clics en celdas y navegar a información de la categoría
  const handleCellClick = useCallback(
    (row: any) => {
      if (hasActiveFilters) return // No navegar en modo drag
      console.log(`Navigating to category info for:`, row.original)
      window.location.href = `/categories/${row.original.id}`
    },
    [hasActiveFilters]
  )

  // Función para manejar el final del drag
  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event

      if (!over || active.id === over.id) return

      const currentData = hasActiveFilters ? filteredData : data
      const oldIndex = currentData.findIndex(item => item.id === active.id)
      const newIndex = currentData.findIndex(item => item.id === over.id)

      if (oldIndex === -1 || newIndex === -1) return

      const newData = arrayMove(currentData, oldIndex, newIndex)

      if (hasActiveFilters) {
        setFilteredData(newData)
      } else {
        setData(newData)
      }
    },
    [data, filteredData, hasActiveFilters]
  )

  // Crear columnas
  const columns = useMemo(() => {
    const baseColumns = [
      {
        accessorKey: 'id',
        header: 'ID',
        cell: ({ row }: any) => (
          <Box className='h-full w-full p-3 -m-3'>
            <Typography className='font-medium' color='text.primary'>
              {row.original.id}
            </Typography>
          </Box>
        )
      },
      {
        id: 'tienda',
        header: 'Tienda',
        accessorFn: (row: categoryType) => getCategoryTienda(row.categoryTitle),
        cell: ({ row }: any) => (
          <Box className='h-full w-full p-3 -m-3'>
            <Chip
              label={getCategoryTienda(row.original.categoryTitle)}
              variant='tonal'
              color={getCategoryTienda(row.original.categoryTitle) === 'HOMBRES' ? 'primary' : 'error'}
              size='small'
            />
          </Box>
        )
      },
      {
        accessorKey: 'categoryTitle',
        header: 'Nombre',
        cell: ({ row }: any) => (
          <Box className='h-full w-full p-3 -m-3'>
            <Typography className='font-medium' color='text.primary'>
              {row.original.categoryTitle}
            </Typography>
          </Box>
        )
      }
    ]

    return baseColumns
  }, [])

  // Determinar datos a usar
  const tableData = hasActiveFilters ? filteredData : data

  const table = useReactTable({
    data: tableData,
    columns,
    filterFns: {
      fuzzy: fuzzyFilter
    },
    state: {
      globalFilter
    },
    initialState: {
      pagination: {
        pageSize: hasActiveFilters ? 50 : 10
      }
    },
    enableRowSelection: false,
    enableSorting: !hasActiveFilters, // Deshabilitar ordenamiento cuando hay filtros
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

  // Actualizar filteredData cuando cambian los datos
  useEffect(() => {
    if (!hasActiveFilters) {
      setFilteredData(data)
    }
  }, [data, hasActiveFilters])

  // No renderizar nada hasta que estemos en el cliente para evitar hidratación
  if (!isClient) {
    return (
      <Card>
        <Box sx={{ p: 4 }}>Cargando...</Box>
      </Card>
    )
  }

  const tableContent = hasActiveFilters ? (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
      modifiers={[restrictToVerticalAxis]}
    >
      <SortableContext items={tableData.map(item => item.id)} strategy={verticalListSortingStrategy}>
        <div className='overflow-x-auto'>
          <table className={tableStyles.table}>
            <thead>
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                  <th style={{ width: '40px', padding: theme.spacing(1) }}>
                    <IconButton size='small' disabled>
                      <i className='tabler-arrows-sort' style={{ color: theme.palette.text.disabled }} />
                    </IconButton>
                  </th>
                  {headerGroup.headers.map(header => (
                    <th key={header.id} className={tableStyles.cell}>
                      {header.isPlaceholder ? null : (
                        <Box className='flex items-center' sx={{ color: theme.palette.text.primary }}>
                          {flexRender(header.column.columnDef.header, header.getContext())}
                        </Box>
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            {table.getFilteredRowModel().rows.length === 0 ? (
              <tbody>
                <tr>
                  <td colSpan={table.getVisibleFlatColumns().length + 1} className='text-center'>
                    <Typography color='text.secondary' sx={{ py: 4 }}>
                      No hay datos disponibles
                    </Typography>
                  </td>
                </tr>
              </tbody>
            ) : (
              <tbody>
                {table.getRowModel().rows.map(row => (
                  <SortableRow key={row.original.id} row={row} isDragMode={true} onCellClick={handleCellClick}>
                    {row.getVisibleCells().map(cell => (
                      <td key={cell.id} className={tableStyles.cell}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </SortableRow>
                ))}
              </tbody>
            )}
          </table>
        </div>
      </SortableContext>
    </DndContext>
  ) : (
    <div className='overflow-x-auto'>
      <table className={tableStyles.table}>
        <thead>
          {table.getHeaderGroups().map(headerGroup => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map(header => (
                <th key={header.id}>
                  {header.isPlaceholder ? null : (
                    <Box
                      className={classnames({
                        'flex items-center': header.column.getIsSorted(),
                        'cursor-pointer select-none': header.column.getCanSort()
                      })}
                      onClick={header.column.getToggleSortingHandler()}
                      sx={{
                        color: theme.palette.text.primary,
                        '&:hover': header.column.getCanSort() ? { color: theme.palette.primary.main } : {}
                      }}
                    >
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {{
                        asc: <i className='tabler-chevron-up text-xl' />,
                        desc: <i className='tabler-chevron-down text-xl' />
                      }[header.column.getIsSorted() as 'asc' | 'desc'] ?? null}
                    </Box>
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
                <Typography color='text.secondary' sx={{ py: 4 }}>
                  No hay datos disponibles
                </Typography>
              </td>
            </tr>
          </tbody>
        ) : (
          <tbody>
            {table
              .getRowModel()
              .rows.slice(0, table.getState().pagination.pageSize)
              .map(row => (
                <SortableRow key={row.original.id} row={row} isDragMode={false} onCellClick={handleCellClick}>
                  {row.getVisibleCells().map(cell => (
                    <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                  ))}
                </SortableRow>
              ))}
          </tbody>
        )}
      </table>
    </div>
  )

  return (
    <>
      <Card>
        <CardHeader title='Filtros' />
        <CategoryFilters setData={setFilteredData} categoryData={data} onFiltersChange={setHasFiltersFromComponent} />
        <Divider />

        {/* Indicador de modo */}
        {hasActiveFilters && (
          <StyledAlert severity='info' icon={<i className='tabler-arrows-move' />}>
            <Typography variant='body2'>
              Modo reordenamiento activo: Arrastra las categorías hacia arriba o abajo para cambiar su orden de
              visualización
            </Typography>
          </StyledAlert>
        )}

        <div className='flex flex-wrap justify-between gap-4 p-6'>
          <DebouncedInput
            value={globalFilter ?? ''}
            onChange={value => setGlobalFilter(String(value))}
            placeholder='Buscar Categoría'
            className='max-sm:is-full'
            size='small'
          />
          <div className='flex max-sm:flex-col items-start sm:items-center gap-4 max-sm:is-full'>
            {!hasActiveFilters && (
              <CustomTextField
                select
                value={table.getState().pagination.pageSize}
                onChange={e => table.setPageSize(Number(e.target.value))}
                className='flex-auto max-sm:is-full sm:is-[70px]'
                size='small'
              >
                <MenuItem value='10'>10</MenuItem>
                <MenuItem value='15'>15</MenuItem>
                <MenuItem value='25'>25</MenuItem>
              </CustomTextField>
            )}
            <Button
              variant='contained'
              className='max-sm:is-full'
              onClick={() => setAddCategoryOpen(!addCategoryOpen)}
              startIcon={<i className='tabler-plus' />}
              size='small'
            >
              Agregar Categoría
            </Button>
          </div>
        </div>

        {tableContent}

        {!hasActiveFilters && (
          <TablePagination
            component={() => <TablePaginationComponent table={table as any} />}
            count={table.getFilteredRowModel().rows.length}
            rowsPerPage={table.getState().pagination.pageSize}
            page={table.getState().pagination.pageIndex}
            onPageChange={(_, page) => {
              table.setPageIndex(page)
            }}
          />
        )}
      </Card>
      <AddCategoryDrawer
        open={addCategoryOpen}
        categoryData={data}
        setData={setData}
        handleClose={() => setAddCategoryOpen(!addCategoryOpen)}
      />
    </>
  )
}

export default ProductCategoryTable
