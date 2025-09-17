'use client'

// React Imports
import { useEffect, useMemo, useState } from 'react'

// MUI Imports
import Card from '@mui/material/Card'

import Chip from '@mui/material/Chip'
import MenuItem from '@mui/material/MenuItem'
import TablePagination from '@mui/material/TablePagination'
import Typography from '@mui/material/Typography'

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

import SaleDetailsModal from './SaleDetailsModal'

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

// Tipo para ventas
type SaleType = {
  id: number
  estado: 'PENDIENTE' | 'RECHAZADO' | 'PAGADO'
  duracion: string
  cliente: string
  telefono: string
  departamento: string
  costo: number
}

type SaleWithActionsType = SaleType & {
  actions?: string
}

const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
  // Rank the item
  const itemRank = rankItem(row.getValue(columnId), value)

  // Store the itemRank info
  addMeta({
    itemRank
  })

  // Return if the item should be filtered in/out
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
  // States
  const [value, setValue] = useState(initialValue)

  useEffect(() => {
    setValue(initialValue)
  }, [initialValue])

  useEffect(() => {
    const timeout = setTimeout(() => {
      onChange(value)
    }, debounce)

    return () => clearTimeout(timeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  return <CustomTextField {...props} value={value} onChange={e => setValue(e.target.value)} />
}

// Datos de ejemplo basados en la imagen
const salesData: SaleType[] = [
  {
    id: 219,
    estado: 'PENDIENTE',
    duracion: '0 días 8 horas',
    cliente: 'Virginia',
    telefono: '72338776',
    departamento: 'La Paz',
    costo: 285.0
  },
  {
    id: 218,
    estado: 'RECHAZADO',
    duracion: '7 días 0 horas',
    cliente: 'Cesar Larico nina',
    telefono: '64084741',
    departamento: 'Beni',
    costo: 300.0
  },
  {
    id: 217,
    estado: 'PENDIENTE',
    duracion: '5 días 11 horas',
    cliente: 'Sandro Flores Coronado',
    telefono: '72371159',
    departamento: 'Potosí',
    costo: 360.0
  },
  {
    id: 216,
    estado: 'PAGADO',
    duracion: '6 días 11 horas',
    cliente: 'Juan Carlos Velasco',
    telefono: '73873736',
    departamento: 'Potosí',
    costo: 860.0
  },
  {
    id: 215,
    estado: 'PENDIENTE',
    duracion: '21 días 9 horas',
    cliente: 'Manuel',
    telefono: '69694737',
    departamento: 'Chuquisaca',
    costo: 1260.0
  },
  {
    id: 214,
    estado: 'PENDIENTE',
    duracion: '22 días 9 horas',
    cliente: 'Manuel',
    telefono: '69694737',
    departamento: 'Chuquisaca',
    costo: 1060.0
  },
  {
    id: 213,
    estado: 'PENDIENTE',
    duracion: '14 días 14 horas',
    cliente: 'Gustavo Palabral',
    telefono: '77702052',
    departamento: 'La Paz',
    costo: 295.0
  },
  {
    id: 212,
    estado: 'PENDIENTE',
    duracion: '15 días 13 horas',
    cliente: 'Marcelo Quiroga Cuellar',
    telefono: '70777461',
    departamento: 'Cochabamba',
    costo: 740.0
  },
  {
    id: 211,
    estado: 'RECHAZADO',
    duracion: '18 días 15 horas',
    cliente: 'Romer Calle Cepeda',
    telefono: '65418642',
    departamento: 'Beni',
    costo: 360.0
  },
  {
    id: 210,
    estado: 'RECHAZADO',
    duracion: '0 días 8 horas',
    cliente: 'Cesar Corvera',
    telefono: '68921251',
    departamento: 'Santa Cruz',
    costo: 345.0
  }
]

// Función para obtener color del estado
const getEstadoColor = (estado: string): 'primary' | 'error' | 'success' => {
  switch (estado) {
    case 'PENDIENTE':
      return 'primary'
    case 'RECHAZADO':
      return 'error'
    case 'PAGADO':
      return 'success'
    default:
      return 'primary'
  }
}

// Column Definitions
const columnHelper = createColumnHelper<SaleWithActionsType>()

const SalesListTable = () => {
  // States
  const [data] = useState(...[salesData])
  const [globalFilter, setGlobalFilter] = useState('')
  const [selectedSale, setSelectedSale] = useState<SaleType | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  // Función para manejar clics en celdas y mostrar detalles
  const handleCellClick = (row: any) => {
    setSelectedSale(row.original)
    setModalOpen(true)
  }

  const handleCloseModal = () => {
    setModalOpen(false)
    setSelectedSale(null)
  }

  const columns = useMemo<ColumnDef<SaleWithActionsType, any>[]>(
    () => [
      columnHelper.accessor('id', {
        header: 'ID',
        cell: ({ row }) => (
          <div className='cursor-pointer h-full w-full p-3 -m-3' onClick={() => handleCellClick(row)}>
            <Typography className='font-medium' color='text.primary'>
              {row.original.id}
            </Typography>
          </div>
        )
      }),
      columnHelper.accessor('estado', {
        header: 'Estado',
        cell: ({ row }) => (
          <div className='cursor-pointer h-full w-full p-3 -m-3' onClick={() => handleCellClick(row)}>
            <Chip
              label={row.original.estado}
              variant='tonal'
              color={getEstadoColor(row.original.estado)}
              size='small'
            />
          </div>
        )
      }),
      columnHelper.accessor('duracion', {
        header: 'Duración',
        cell: ({ row }) => (
          <div className='cursor-pointer h-full w-full p-3 -m-3' onClick={() => handleCellClick(row)}>
            <Typography className='font-medium' color='text.primary'>
              {row.original.duracion}
            </Typography>
          </div>
        )
      }),
      columnHelper.accessor('cliente', {
        header: 'Cliente',
        cell: ({ row }) => (
          <div className='cursor-pointer h-full w-full p-3 -m-3' onClick={() => handleCellClick(row)}>
            <Typography className='font-medium' color='text.primary'>
              {row.original.cliente}
            </Typography>
          </div>
        )
      }),
      columnHelper.accessor('telefono', {
        header: 'Teléfono',
        cell: ({ row }) => (
          <div className='cursor-pointer h-full w-full p-3 -m-3' onClick={() => handleCellClick(row)}>
            <Typography className='font-medium' color='text.primary'>
              {row.original.telefono}
            </Typography>
          </div>
        )
      }),
      columnHelper.accessor('departamento', {
        header: 'Departamento',
        cell: ({ row }) => (
          <div className='cursor-pointer h-full w-full p-3 -m-3' onClick={() => handleCellClick(row)}>
            <Typography className='font-medium' color='text.primary'>
              {row.original.departamento}
            </Typography>
          </div>
        )
      }),
      columnHelper.accessor('costo', {
        header: 'Costo',
        cell: ({ row }) => (
          <div className='cursor-pointer h-full w-full p-3 -m-3' onClick={() => handleCellClick(row)}>
            <Typography className='font-medium' color='text.primary'>
              Bs. {row.original.costo.toFixed(2)}
            </Typography>
          </div>
        )
      })
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data]
  )

  const table = useReactTable({
    data: data as SaleType[],
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
            placeholder='Buscar...'
            className='max-sm:is-full'
          />
          <div className='flex flex-wrap items-center max-sm:flex-col gap-4 max-sm:is-full is-auto'>
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
                        <>
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
                        </>
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
                    No hay datos disponibles
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
                      <tr key={row.id} className='hover:bg-actionHover transition-colors duration-200 cursor-pointer'>
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

      {/* Modal de detalles */}
      <SaleDetailsModal open={modalOpen} onClose={handleCloseModal} sale={selectedSale} />
    </>
  )
}

export default SalesListTable
