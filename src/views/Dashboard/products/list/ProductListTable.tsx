'use client'

import { useEffect, useMemo, useState, useCallback } from 'react'

import { useRouter } from 'next/navigation'

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
import Skeleton from '@mui/material/Skeleton'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import DialogContentText from '@mui/material/DialogContentText'
import type { TextFieldProps } from '@mui/material/TextField'
import { useTheme } from '@mui/material/styles'
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
import type { ColumnDef, FilterFn, ColumnFiltersState } from '@tanstack/react-table'
import type { RankingInfo } from '@tanstack/match-sorter-utils'

import CustomTextField from '@core/components/mui/TextField'
import { useProducts, useDeleteProduct } from '@/hooks/useProducts'
import tableStyles from '@core/styles/table.module.css'

declare module '@tanstack/table-core' {
  interface FilterFns {
    fuzzy: FilterFn<unknown>
  }
  interface FilterMeta {
    itemRank: RankingInfo
  }
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

const ProductListTable = () => {
  const router = useRouter()
  const theme = useTheme()
  const [globalFilter, setGlobalFilter] = useState('')
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [productToDelete, setProductToDelete] = useState<number | null>(null)

  const deleteProduct = useDeleteProduct()
  const { data: allProducts, isLoading, error, isFetching } = useProducts()

  const handleCellClick = useCallback(
    (row: any) => {
      router.push(`/products/edit/${row.original.id}`)
    },
    [router]
  )

  const handleDelete = useCallback((productId: number) => {
    setProductToDelete(productId)
    setDeleteDialogOpen(true)
  }, [])

  const confirmDelete = useCallback(async () => {
    if (productToDelete) {
      try {
        await deleteProduct.mutateAsync(productToDelete)
        setDeleteDialogOpen(false)
        setProductToDelete(null)
      } catch (error) {
        console.error('Error deleting product:', error)
      }
    }
  }, [productToDelete, deleteProduct])

  const cancelDelete = useCallback(() => {
    setDeleteDialogOpen(false)
    setProductToDelete(null)
  }, [])

  const columns = useMemo<ColumnDef<any, any>[]>(
    () => [
      {
        accessorKey: 'id',
        header: 'ID',
        cell: ({ row }: any) => (
          <Typography className='font-medium' color='text.primary'>
            {row.original.id}
          </Typography>
        )
      },
      {
        accessorKey: 'gender',
        header: 'Tienda',
        cell: ({ row }: any) => {
          const gender = row.original.gender
          const isWomen = gender === 'WOMEN' || gender === 'MUJERES' || gender === 'F'

          return (
            <Chip
              label={isWomen ? 'MUJERES' : 'HOMBRES'}
              variant='tonal'
              color={isWomen ? 'error' : 'primary'}
              size='small'
            />
          )
        }
      },
      {
        accessorKey: 'name',
        header: 'Nombre',
        cell: ({ row }: any) => (
          <Typography className='font-medium' color='text.primary'>
            {row.original.name}
          </Typography>
        ),
        filterFn: 'fuzzy'
      },
      {
        accessorKey: 'price',
        header: 'Precio',
        cell: ({ row }: any) => (
          <Typography className='font-medium' color='text.primary'>
            ${row.original.price}
          </Typography>
        )
      },
      {
        accessorKey: 'description',
        header: 'Descripción',
        cell: ({ row }: any) => (
          <Box sx={{ maxWidth: 300 }}>
            <Typography variant='body2' className='truncate' title={row.original.description} color='text.secondary'>
              {row.original.description}
            </Typography>
          </Box>
        ),
        filterFn: 'fuzzy'
      },
      {
        accessorKey: 'enabled',
        header: 'Estado',
        cell: ({ row }: any) => (
          <Chip
            label={row.original.enabled ? 'Activo' : 'Inactivo'}
            color={row.original.enabled ? 'success' : 'error'}
            size='small'
          />
        ),
        filterFn: (row: any, columnId: string, filterValue: any) => {
          if (filterValue === undefined || filterValue === '') return true

          return row.getValue(columnId) === filterValue
        }
      },
      {
        id: 'actions',
        header: 'Acciones',
        enableSorting: false,
        cell: ({ row }: any) => (
          <Box className='flex gap-2'>
            <IconButton
              size='small'
              onClick={e => {
                e.stopPropagation()
                router.push(`/products/edit/${row.original.id}`)
              }}
              color='primary'
            >
              <i className='tabler-edit' />
            </IconButton>
            <IconButton
              size='small'
              onClick={e => {
                e.stopPropagation()
                handleDelete(row.original.id)
              }}
              color='error'
            >
              <i className='tabler-trash' />
            </IconButton>
          </Box>
        )
      }
    ],
    [router, handleDelete]
  )

  const table = useReactTable({
    data: allProducts ?? [],
    columns,
    filterFns: {
      fuzzy: fuzzyFilter
    },
    state: {
      globalFilter,
      columnFilters
    },
    enableRowSelection: false,
    enableSorting: true,
    globalFilterFn: fuzzyFilter,
    getCoreRowModel: getCoreRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters,
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues(),
    initialState: {
      pagination: {
        pageSize: 10
      }
    }
  })

  const renderSkeleton = () => (
    <tbody>
      {Array.from({ length: table.getState().pagination.pageSize }).map((_, index) => (
        <tr key={index}>
          {columns.map((_, colIndex) => (
            <td key={colIndex} className='p-4'>
              <Skeleton variant='text' width='100%' height={20} />
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  )

  if (error) {
    return (
      <Card>
        <Box sx={{ p: 4 }}>
          <Alert severity='error'>
            Error al cargar los productos: {error instanceof Error ? error.message : 'Error desconocido'}
          </Alert>
        </Box>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader title='Productos' />
      <Box className='flex gap-4 p-6'>
        <CustomTextField
          select
          label='Estado'
          value={
            columnFilters.find(f => f.id === 'enabled')?.value === undefined
              ? ''
              : String(columnFilters.find(f => f.id === 'enabled')?.value)
          }
          onChange={e => {
            const value = e.target.value

            table.getColumn('enabled')?.setFilterValue(value === '' ? undefined : value === 'true')
          }}
          size='small'
          className='min-w-[150px]'
        >
          <MenuItem value=''>Todos</MenuItem>
          <MenuItem value='true'>Activos</MenuItem>
          <MenuItem value='false'>Inactivos</MenuItem>
        </CustomTextField>
      </Box>
      <Divider />
      <Box className='flex flex-wrap justify-between gap-4 p-6'>
        <DebouncedInput
          value={globalFilter ?? ''}
          onChange={value => setGlobalFilter(String(value))}
          placeholder='Buscar Producto'
          className='max-sm:is-full'
          size='small'
        />
        <CustomTextField
          select
          value={table.getState().pagination.pageSize}
          onChange={e => table.setPageSize(Number(e.target.value))}
          className='is-[70px]'
          size='small'
        >
          <MenuItem value={10}>10</MenuItem>
          <MenuItem value={25}>25</MenuItem>
          <MenuItem value={50}>50</MenuItem>
          <MenuItem value={100}>100</MenuItem>
        </CustomTextField>
      </Box>
      {isFetching && !isLoading && (
        <Box sx={{ px: 3, pb: 2 }}>
          <Alert severity='info'>Actualizando datos...</Alert>
        </Box>
      )}
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
                          'flex items-center cursor-pointer select-none': header.column.getCanSort()
                        })}
                        onClick={header.column.getToggleSortingHandler()}
                        sx={{ color: theme.palette.text.primary }}
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
          {isLoading ? (
            renderSkeleton()
          ) : table.getRowModel().rows.length === 0 ? (
            <tbody>
              <tr>
                <td colSpan={columns.length} className='text-center'>
                  <Typography color='text.secondary' sx={{ py: 4 }}>
                    No hay productos disponibles
                  </Typography>
                </td>
              </tr>
            </tbody>
          ) : (
            <tbody>
              {table.getRowModel().rows.map(row => (
                <tr
                  key={row.original.id}
                  className={`transition-colors cursor-pointer hover:bg-[rgba(255,255,255,0.05)] dark:hover:bg-[rgba(0,0,0,0.04)]`}
                  onClick={() => handleCellClick(row)}
                >
                  {row.getVisibleCells().map(cell => (
                    <td key={cell.id} className={tableStyles.cell}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          )}
        </table>
      </div>
      <TablePagination
        component='div'
        count={table.getFilteredRowModel().rows.length}
        rowsPerPage={table.getState().pagination.pageSize}
        page={table.getState().pagination.pageIndex}
        onPageChange={(_, newPage) => table.setPageIndex(newPage)}
        onRowsPerPageChange={event => {
          table.setPageSize(parseInt(event.target.value, 10))
        }}
        rowsPerPageOptions={[10, 25, 50, 100]}
        labelRowsPerPage='Filas por página:'
        labelDisplayedRows={({ from, to, count }) => `${from}–${to} de ${count}`}
      />

      <Dialog open={deleteDialogOpen} onClose={cancelDelete}>
        <DialogTitle>Confirmar eliminación</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Estás seguro de que deseas eliminar este producto? Esta acción no se puede deshacer.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelDelete} color='secondary'>
            Cancelar
          </Button>
          <Button onClick={confirmDelete} color='error' variant='contained'>
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  )
}

export default ProductListTable
