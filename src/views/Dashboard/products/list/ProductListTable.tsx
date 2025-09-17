'use client'

// React Imports
import { useEffect, useMemo, useState, useCallback } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'

import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import MenuItem from '@mui/material/MenuItem'
import TablePagination from '@mui/material/TablePagination'
import Typography from '@mui/material/Typography'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
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

import type { ProductType } from '@/types/apps/ecommerceTypes'

// Component Imports
import TableFilters from './TableFilters'
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
const SortableRow = ({ row, children, isDragMode }: { row: any; children: React.ReactNode; isDragMode: boolean }) => {
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
      className={classnames(tableStyles.row, isDragging && 'dragging-row')}
      {...attributes}
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

const ProductListTable = ({ productData }: { productData?: ProductType[] }) => {
  // Hooks
  const theme = useTheme()

  // States
  const [data, setData] = useState<ProductType[]>(productData || [])
  const [filteredData, setFilteredData] = useState<ProductType[]>(data)
  const [globalFilter, setGlobalFilter] = useState('')
  const [hasFiltersFromComponent, setHasFiltersFromComponent] = useState(false)
  const [isClient, setIsClient] = useState(false)

  // Configurar sensores para DnD
  const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor))

  // Determinar si hay filtros activos
  const hasActiveFilters = useMemo(() => {
    return Boolean(globalFilter) || hasFiltersFromComponent
  }, [globalFilter, hasFiltersFromComponent])

  useEffect(() => {
    setIsClient(true)
  }, [])

  const handleEdit = useCallback((productId: string) => {
    console.log(`Editing product:`, productId)
    window.location.href = `/products/edit/${productId}`
  }, [])

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
        accessorKey: 'category',
        header: 'Tienda',
        cell: ({ row }: any) => (
          <Box className='h-full w-full p-3 -m-3'>
            <Chip
              label={
                row.original.category === 'Electronics' ||
                row.original.category === 'Office' ||
                row.original.category === 'Games'
                  ? 'HOMBRES'
                  : 'MUJERES'
              }
              variant='tonal'
              color={
                row.original.category === 'Electronics' ||
                row.original.category === 'Office' ||
                row.original.category === 'Games'
                  ? 'primary'
                  : 'error'
              }
              size='small'
            />
          </Box>
        )
      },
      {
        accessorKey: 'productName',
        header: 'Nombre',
        cell: ({ row }: any) => (
          <Box className='h-full w-full p-3 -m-3'>
            <Typography className='font-medium' color='text.primary'>
              {row.original.productName}
            </Typography>
          </Box>
        )
      },
      {
        accessorKey: 'price',
        header: 'Costo',
        cell: ({ row }: any) => (
          <Box className='h-full w-full p-3 -m-3'>
            <Typography className='font-medium' color='text.primary'>
              {row.original.price}
            </Typography>
          </Box>
        )
      },
      {
        accessorKey: 'productBrand',
        header: 'Descripción',
        cell: ({ row }: any) => (
          <Box className='h-full w-full p-3 -m-3' sx={{ maxWidth: 300 }}>
            <Typography variant='body2' className='truncate' title={row.original.productBrand} color='text.secondary'>
              {row.original.productBrand}
            </Typography>
          </Box>
        )
      }
    ]

    // Solo agregar columna de acciones cuando NO hay filtros activos Y estamos en cliente
    if (!hasActiveFilters && isClient) {
      baseColumns.push({
        id: 'actions',
        header: 'Acciones',
        cell: ({ row }: any) => (
          <Box className='flex items-center gap-2'>
            <IconButton
              onClick={() => handleEdit(row.original.id)}
              size='small'
              sx={{
                color: theme.palette.primary.main,
                '&:hover': {
                  backgroundColor: theme.palette.primary.light + '20'
                }
              }}
            >
              <i className='tabler-edit' />
            </IconButton>
            <IconButton
              onClick={() => {
                const newData = data.filter(product => product.id !== row.original.id)
                const newFiltered = filteredData.filter(product => product.id !== row.original.id)

                setData(newData)
                setFilteredData(newFiltered)
                console.log('Eliminando producto:', row.original.id)
              }}
              size='small'
              sx={{
                color: theme.palette.error.main,
                '&:hover': {
                  backgroundColor: theme.palette.error.light + '20'
                }
              }}
            >
              <i className='tabler-trash' />
            </IconButton>
          </Box>
        ),
        enableSorting: false
      } as any)
    }

    return baseColumns
  }, [data, filteredData, hasActiveFilters, handleEdit, theme, isClient])

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
    enableSorting: !hasActiveFilters,
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

  useEffect(() => {
    if (!hasActiveFilters) {
      setFilteredData(data)
    }
  }, [data, hasActiveFilters])

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
            <tbody>
              {table.getRowModel().rows.map(row => (
                <SortableRow key={row.original.id} row={row} isDragMode={true}>
                  {row.getVisibleCells().map(cell => (
                    <td key={cell.id} className={tableStyles.cell}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </SortableRow>
              ))}
            </tbody>
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
                <th key={header.id} className={tableStyles.cell}>
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
        <tbody>
          {table.getRowModel().rows.map(row => (
            <SortableRow key={row.original.id} row={row} isDragMode={false}>
              {row.getVisibleCells().map(cell => (
                <td key={cell.id} className={tableStyles.cell}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </SortableRow>
          ))}
        </tbody>
      </table>
    </div>
  )

  return (
    <Card>
      <CardHeader title='Filtros' />
      <TableFilters setData={setFilteredData} productData={data} onFiltersChange={setHasFiltersFromComponent} />
      <Divider />

      {hasActiveFilters && (
        <StyledAlert severity='info' icon={<i className='tabler-arrows-move' />}>
          <Typography variant='body2'>Modo reordenamiento activo: Arrastra las filas para cambiar el orden</Typography>
        </StyledAlert>
      )}

      <Box className='flex flex-wrap justify-between gap-4 p-6'>
        <DebouncedInput
          value={globalFilter ?? ''}
          onChange={value => setGlobalFilter(String(value))}
          placeholder='Buscar Producto'
          className='max-sm:is-full'
          size='small'
        />
        <Box className='flex flex-wrap items-center max-sm:flex-col gap-4 max-sm:is-full is-auto'>
          {!hasActiveFilters && (
            <CustomTextField
              select
              value={table.getState().pagination.pageSize}
              onChange={e => table.setPageSize(Number(e.target.value))}
              className='flex-auto is-[70px] max-sm:is-full'
              size='small'
            >
              <MenuItem value='10'>10</MenuItem>
              <MenuItem value='25'>25</MenuItem>
              <MenuItem value='50'>50</MenuItem>
            </CustomTextField>
          )}
        </Box>
      </Box>

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
  )
}

export default ProductListTable
