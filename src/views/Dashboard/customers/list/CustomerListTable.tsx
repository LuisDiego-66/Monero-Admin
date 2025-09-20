'use client'

// React Imports
import { useState, useEffect, useMemo, useCallback } from 'react'

// Next Imports
import Link from 'next/link'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'

import Typography from '@mui/material/Typography'
import Checkbox from '@mui/material/Checkbox'
import TablePagination from '@mui/material/TablePagination'
import type { TextFieldProps } from '@mui/material/TextField'
import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import Chip from '@mui/material/Chip'
import Box from '@mui/material/Box'
import Alert from '@mui/material/Alert'
import Skeleton from '@mui/material/Skeleton'

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
  getSortedRowModel
} from '@tanstack/react-table'
import type { ColumnDef, FilterFn } from '@tanstack/react-table'
import type { RankingInfo } from '@tanstack/match-sorter-utils'

// Hook Imports
import { useCustomers } from '@/hooks/useCustomers'

// Type Imports
import type { ThemeColor } from '@core/types'
import type { Customer } from '@/types/api/customer'

// Component Imports
import CustomAvatar from '@core/components/mui/Avatar'
import CustomTextField from '@core/components/mui/TextField'

// Util Imports
import { getInitials } from '@/utils/getInitials'

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

type StatusChipColorType = {
  color: ThemeColor
}

export const statusChipColor: { [key: string]: StatusChipColorType } = {
  registered: { color: 'success' },
  subscriber: { color: 'primary' }
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
  }, [value, onChange])

  return <CustomTextField {...props} value={value} onChange={e => setValue(e.target.value)} />
}

const columnHelper = createColumnHelper<Customer>()

const CustomerListTable = () => {
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(10)
  const [search, setSearch] = useState('')
  const [customerTypeFilter, setCustomerTypeFilter] = useState<'all' | 'registered' | 'subscriber'>('all')

  const [rowSelection, setRowSelection] = useState({})

  const {
    data: customersData,
    isLoading,
    error,
    isError
  } = useCustomers({
    limit: pageSize,
    offset: page * pageSize,
    search: search || undefined,
    type: customerTypeFilter
  })

  const tableData = useMemo(() => {
    return customersData?.customers || []
  }, [customersData])

  const totalRecords = useMemo(() => {
    return customersData?.total || 0
  }, [customersData])

  const columns = useMemo<ColumnDef<Customer, any>[]>(
    () => [
      {
        id: 'select',
        header: ({ table }) => (
          <Checkbox
            checked={table.getIsAllRowsSelected()}
            indeterminate={table.getIsSomeRowsSelected()}
            onChange={table.getToggleAllRowsSelectedHandler()}
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            disabled={!row.getCanSelect()}
            indeterminate={row.getIsSomeSelected()}
            onChange={row.getToggleSelectedHandler()}
          />
        )
      },
      columnHelper.accessor('name', {
        header: 'Cliente',
        cell: ({ row }) => (
          <div className='flex items-center gap-3'>
            {getAvatar({ name: row.original.name })}
            <div className='flex flex-col items-start'>
              <Typography
                component={Link}
                color='text.primary'
                href={`/apps/ecommerce/customers/details/${row.original.id}`}
                className='font-medium hover:text-primary'
              >
                {row.original.name}
              </Typography>
              <Typography variant='body2'>{row.original.email}</Typography>
            </div>
          </div>
        )
      }),
      columnHelper.accessor('type', {
        header: 'Tipo',
        cell: ({ row }) => (
          <Chip
            label={row.original.type === 'registered' ? 'Registrado' : 'Suscriptor'}
            color={statusChipColor[row.original.type]?.color || 'default'}
            size='small'
          />
        )
      }),
      columnHelper.accessor('enabled', {
        header: 'Estado',
        cell: ({ row }) => (
          <Chip
            label={row.original.enabled ? 'Activo' : 'Inactivo'}
            color={row.original.enabled ? 'success' : 'error'}
            size='small'
          />
        )
      }),
      columnHelper.accessor('provider', {
        header: 'Proveedor',
        cell: ({ row }) => (
          <Typography variant='body2' className='capitalize'>
            {row.original.provider}
          </Typography>
        )
      })
    ],
    []
  )

  const table = useReactTable({
    data: tableData,
    columns,
    filterFns: { fuzzy: fuzzyFilter },
    state: { rowSelection },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues(),

    // Deshabilitamos la paginación del cliente ya que usamos server-side
    manualPagination: true,
    pageCount: Math.ceil(totalRecords / pageSize)
  })

  const getAvatar = ({ name }: { name: string }) => {
    return (
      <CustomAvatar skin='light' size={34}>
        {getInitials(name)}
      </CustomAvatar>
    )
  }

  // Funciones para manejo de paginación
  const handlePageChange = useCallback((_: unknown, newPage: number) => {
    setPage(newPage)
    setRowSelection({}) // Limpiar selección al cambiar página
  }, [])

  const handlePageSizeChange = useCallback((newPageSize: number) => {
    setPageSize(newPageSize)
    setPage(0)
    setRowSelection({})
  }, [])

  /*   const getSelectedCustomers = useCallback(() => {
    const selectedRows = table.getFilteredSelectedRowModel().rows

    return selectedRows.map(row => row.original)
  }, [table]) */

  // Skeleton loader para tabla
  const renderSkeleton = () => (
    <tbody>
      {Array.from({ length: pageSize }).map((_, index) => (
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

  // Componente de paginación personalizado para server-side
  const CustomTablePagination = () => (
    <div className='flex justify-between items-center flex-wrap pli-6 border-bs bs-auto plb-[12.5px] gap-2'>
      <Typography color='text.disabled'>
        {`Mostrando ${
          totalRecords === 0 ? 0 : page * pageSize + 1
        } a ${Math.min((page + 1) * pageSize, totalRecords)} de ${totalRecords} registros`}
      </Typography>
      <TablePagination
        component='div'
        count={totalRecords}
        page={page}
        onPageChange={handlePageChange}
        rowsPerPage={pageSize}
        onRowsPerPageChange={event => handlePageSizeChange(parseInt(event.target.value, 10))}
        rowsPerPageOptions={[10, 25, 50, 100]}
        labelRowsPerPage='Filas por página:'
        labelDisplayedRows={({ from, to, count }) => `${from}–${to} de ${count}`}
      />
    </div>
  )

  if (isError && error) {
    return (
      <Card>
        <CardContent>
          <Alert severity='error'>
            Error al cargar los clientes: {error instanceof Error ? error.message : 'Error desconocido'}
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className='flex justify-between flex-wrap max-sm:flex-col sm:items-center gap-4'>
        <Box className='flex gap-4 items-center'>
          <DebouncedInput
            value={search}
            onChange={value => {
              setSearch(String(value))
              setPage(0) // Reset página al buscar
            }}
            placeholder='Buscar clientes...'
            className='max-sm:is-full'
          />

          <FormControl size='small' style={{ minWidth: 150 }}>
            <InputLabel>Filtrar por Tipo</InputLabel>
            <Select
              value={customerTypeFilter}
              label='Filtrar por Tipo'
              onChange={e => {
                setCustomerTypeFilter(e.target.value as any)
                setPage(0)
                setRowSelection({})
              }}
            >
              <MenuItem value='all'>Todos los Clientes</MenuItem>
              <MenuItem value='registered'>Solo Registrados</MenuItem>
              <MenuItem value='subscriber'>Solo Suscriptores</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <div className='flex max-sm:flex-col items-start sm:items-center gap-4 max-sm:is-full'>
          {Object.keys(rowSelection).length > 0 && (
            <Chip label={`${Object.keys(rowSelection).length} seleccionados`} color='primary' variant='outlined' />
          )}

          <CustomTextField
            select
            value={pageSize}
            onChange={e => handlePageSizeChange(Number(e.target.value))}
            className='is-full sm:is-[70px]'
          >
            <MenuItem value={10}>10</MenuItem>
            <MenuItem value={25}>25</MenuItem>
            <MenuItem value={50}>50</MenuItem>
            <MenuItem value={100}>100</MenuItem>
          </CustomTextField>

          {/* <Button
            variant='contained'
            color='secondary'
            startIcon={<i className='tabler-mail' />}
            onClick={() => console.log('Email feature pending')}
            disabled={isLoading}
          >
            Enviar Correos
          </Button> */}
        </div>
      </CardContent>

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

          {isLoading ? (
            renderSkeleton()
          ) : tableData.length === 0 ? (
            <tbody>
              <tr>
                <td colSpan={table.getVisibleFlatColumns().length} className='text-center p-8'>
                  No hay clientes disponibles
                </td>
              </tr>
            </tbody>
          ) : (
            <tbody>
              {table.getRowModel().rows.map(row => (
                <tr key={row.id} className={classnames({ selected: row.getIsSelected() })}>
                  {row.getVisibleCells().map(cell => (
                    <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          )}
        </table>
      </div>

      <CustomTablePagination />
    </Card>
  )
}

export default CustomerListTable
