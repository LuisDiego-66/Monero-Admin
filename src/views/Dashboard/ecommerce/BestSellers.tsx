'use client'

// React Imports
import { useState, useMemo } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Skeleton from '@mui/material/Skeleton'
import TablePagination from '@mui/material/TablePagination'
import Chip from '@mui/material/Chip'

// Third-party Imports
import { createColumnHelper, flexRender, getCoreRowModel, useReactTable, getPaginationRowModel } from '@tanstack/react-table'
import type { ColumnDef } from '@tanstack/react-table'

// Components Imports
import OptionMenu from '@core/components/option-menu'
import TablePaginationComponent from '@components/TablePaginationComponent'

// Hooks
import { useBestsellers } from '@/hooks/useDashboard'

// Types
import type { BestsellerItem } from '@/types/api/dashboard'

// Style Imports
import tableStyles from '@core/styles/table.module.css'

const columnHelper = createColumnHelper<BestsellerItem>()

const BestSellers = () => {
  const { data: bestsellersData, isLoading } = useBestsellers()
  const [rowSelection, setRowSelection] = useState({})

  const columns = useMemo<ColumnDef<BestsellerItem, any>[]>(
    () => [
      columnHelper.accessor('productColor.multimedia', {
        header: 'Producto',
        cell: ({ row }) => {
          const firstImage = row.original.productColor.multimedia[0] || '/images/placeholder.png'
          const productName = row.original.productColor.product.name

          return (
            <div className='flex items-center gap-3'>
              <img src={firstImage} alt={productName} width={40} height={40} style={{ objectFit: 'cover', borderRadius: '4px' }} />
              <Typography className='font-medium' color='text.primary'>
                {productName}
              </Typography>
            </div>
          )
        }
      }),
      columnHelper.accessor('productColor.color.name', {
        header: 'Color',
        cell: ({ row }) => (
          <Chip
            label={row.original.productColor.color.name}
            size='small'
            variant='tonal'
            style={{ backgroundColor: row.original.productColor.color.code + '30', color: row.original.productColor.color.code }}
          />
        )
      }),
      columnHelper.accessor('size.name', {
        header: 'Talla',
        cell: ({ row }) => <Typography>{row.original.size.name}</Typography>
      }),
      columnHelper.accessor('sale', {
        header: 'Vendidos',
        cell: ({ row }) => (
          <Chip
            label={row.original.sale}
            color='success'
            size='small'
            variant='tonal'
          />
        )
      }),
      columnHelper.accessor('productColor.product.price', {
        header: 'Precio',
        cell: ({ row }) => {
          const price = parseFloat(row.original.productColor.product.price)

          return <Typography className='font-medium'>${price.toFixed(2)}</Typography>
        }
      })
    ],
    []
  )

  const table = useReactTable({
    data: bestsellersData || [],
    columns,
    state: {
      rowSelection
    },
    initialState: {
      pagination: {
        pageSize: 5
      }
    },
    enableRowSelection: false,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onRowSelectionChange: setRowSelection
  })

  return (
    <Card>
      <CardHeader
        title='Productos Más Vendidos'
        subheader='Top productos con más ventas'
        action={<OptionMenu options={['Ver Más', 'Refrescar']} />}
      />
      <CardContent>
        {isLoading ? (
          <div className='flex flex-col gap-4'>
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className='flex items-center gap-4'>
                <Skeleton variant='rectangular' width={40} height={40} />
                <div className='flex-1'>
                  <Skeleton variant='text' width='80%' height={24} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className='overflow-x-auto'>
              <table className={tableStyles.table}>
                <thead>
                  {table.getHeaderGroups().map(headerGroup => (
                    <tr key={headerGroup.id}>
                      {headerGroup.headers.map(header => (
                        <th key={header.id}>
                          {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                {table.getFilteredRowModel().rows.length === 0 ? (
                  <tbody>
                    <tr>
                      <td colSpan={table.getVisibleFlatColumns().length} className='text-center'>
                        No hay datos de productos más vendidos disponibles
                      </td>
                    </tr>
                  </tbody>
                ) : (
                  <tbody>
                    {table.getRowModel().rows.slice(0, table.getState().pagination.pageSize).map(row => (
                      <tr key={row.id}>
                        {row.getVisibleCells().map(cell => (
                          <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                        ))}
                      </tr>
                    ))}
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
              onRowsPerPageChange={e => table.setPageSize(Number(e.target.value))}
            />
          </>
        )}
      </CardContent>
    </Card>
  )
}

export default BestSellers
