'use client'

import { useEffect, useMemo, useState, useCallback } from 'react'

import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import type dayjs from 'dayjs'
import 'dayjs/locale/es'

import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import Chip from '@mui/material/Chip'
import Typography from '@mui/material/Typography'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Skeleton from '@mui/material/Skeleton'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import MenuItem from '@mui/material/MenuItem'
import TablePagination from '@mui/material/TablePagination'
import Switch from '@mui/material/Switch'
import FormControlLabel from '@mui/material/FormControlLabel'
import type { TextFieldProps } from '@mui/material/TextField'
import { useTheme } from '@mui/material/styles'
import classnames from 'classnames'
import { rankItem } from '@tanstack/match-sorter-utils'
import Avatar from '@mui/material/Avatar'
import AvatarGroup from '@mui/material/AvatarGroup'
import Tooltip from '@mui/material/Tooltip'
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFacetedMinMaxValues,
  getSortedRowModel
} from '@tanstack/react-table'
import type { ColumnDef, FilterFn } from '@tanstack/react-table'
import type { RankingInfo } from '@tanstack/match-sorter-utils'

import CustomTextField from '@core/components/mui/TextField'
import { useProducts } from '@/hooks/useProducts'
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

const DiscountsListTable = () => {
  const theme = useTheme()
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [search, setSearch] = useState('')

  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [discountType, setDiscountType] = useState<'permanent' | 'temporary'>('permanent')

  const [formData, setFormData] = useState({
    description: '',
    value: 0,
    startDate: null as dayjs.Dayjs | null,
    endDate: null as dayjs.Dayjs | null
  })

  const queryParams = useMemo(
    () => ({
      limit: pageSize,
      page: page,
      search: search
    }),
    [pageSize, page, search]
  )

  const { data: productsData, isLoading, error, isFetching } = useProducts(queryParams)

  const allProducts = useMemo(() => {
    return productsData?.products || []
  }, [productsData])

  const totalRecords = useMemo(() => {
    return productsData?.total || 0
  }, [productsData])

  const handleOpenAddDialog = useCallback(() => {
    setFormData({
      description: '',
      value: 0,
      startDate: null,
      endDate: null
    })
    setDiscountType('permanent')
    setAddDialogOpen(true)
  }, [])

  const handleCloseAddDialog = useCallback(() => {
    setAddDialogOpen(false)
  }, [])

  const handleSubmitDiscount = useCallback(async () => {
    try {
      const payload: any = {
        description: formData.description,
        isActive: true,
        value: formData.value
      }

      if (discountType === 'temporary') {
        payload.startDate = formData.startDate?.toISOString()
        payload.endDate = formData.endDate?.toISOString()
      }

      console.log('Crear descuento:', payload)

      handleCloseAddDialog()
    } catch (error) {
      console.error('Error al crear descuento:', error)
    }
  }, [formData, discountType, handleCloseAddDialog])

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
          const gender = row.original.subcategory.category.gender
          const isWomen = gender === 'female'

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
        accessorKey: 'images',
        header: 'Imágenes',
        cell: ({ row }: any) => {
          const productColors = row.original.productColors || []

          const allImages = productColors
            .flatMap((color: any) => color.multimedia || [])
            .filter((url: string) => url.match(/\.(jpeg|jpg|png|gif|webp)$/i))

          const displayImages = allImages.slice(0, 4)
          const remainingCount = allImages.length - 4

          if (allImages.length === 0) {
            return (
              <Typography variant='body2' color='text.secondary'>
                Sin imágenes
              </Typography>
            )
          }

          return (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AvatarGroup max={4} sx={{ '& .MuiAvatar-root': { width: 32, height: 32 } }}>
                {displayImages.map((url: string, index: number) => (
                  <Tooltip key={index} title={`Imagen ${index + 1}`}>
                    <Avatar src={url} alt={`Producto ${index + 1}`} variant='rounded' sx={{ cursor: 'pointer' }} />
                  </Tooltip>
                ))}
              </AvatarGroup>
              {remainingCount > 0 && (
                <Chip label={`+${remainingCount}`} size='small' color='default' variant='outlined' />
              )}
            </Box>
          )
        }
      },
      {
        accessorKey: 'discount',
        header: 'Descuento',
        cell: ({ row }: any) => {
          const discount = row.original.discount

          if (!discount) {
            return <Chip label='Sin descuento' size='small' variant='outlined' color='default' />
          }

          return (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              <Chip label={`${discount.value}% OFF`} size='small' color='success' variant='tonal' />
              {discount.description && (
                <Typography variant='caption' color='text.secondary' sx={{ fontSize: '0.7rem' }}>
                  {discount.description}
                </Typography>
              )}
            </Box>
          )
        }
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
      }
    ],
    []
  )

  const table = useReactTable({
    data: allProducts,
    columns,
    filterFns: {
      fuzzy: fuzzyFilter
    },
    state: {},
    enableRowSelection: false,
    enableSorting: true,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues()
  })

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

      <Box className='flex flex-wrap justify-between gap-4 p-6'>
        <DebouncedInput
          value={search}
          onChange={value => {
            const newSearch = String(value)

            if (newSearch !== search) {
              setSearch(newSearch)
              setPage(1)
            }
          }}
          placeholder='Buscar Producto'
          className='max-sm:is-full'
          size='small'
        />
        <Box className='flex gap-4'>
          <Button
            variant='contained'
            color='primary'
            onClick={handleOpenAddDialog}
            startIcon={<i className='tabler-plus' />}
          >
            Agregar Descuento
          </Button>
          <CustomTextField
            select
            value={pageSize}
            onChange={e => {
              setPageSize(Number(e.target.value))
              setPage(1)
            }}
            className='is-[70px]'
            size='small'
          >
            <MenuItem value={10}>10</MenuItem>
            <MenuItem value={25}>25</MenuItem>
            <MenuItem value={50}>50</MenuItem>
            <MenuItem value={100}>100</MenuItem>
          </CustomTextField>
        </Box>
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
                <tr key={row.original.id}>
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
        count={totalRecords}
        rowsPerPage={pageSize}
        page={page - 1}
        onPageChange={(_, newPage) => {
          setPage(newPage + 1)
        }}
        onRowsPerPageChange={event => {
          setPageSize(parseInt(event.target.value, 10))
          setPage(1)
        }}
        rowsPerPageOptions={[10, 25, 50, 100]}
        labelRowsPerPage='Filas por página:'
        labelDisplayedRows={({ from, to, count }) => `${from}–${to} de ${count}`}
      />

      {/* Modal para Agregar Descuento */}
      <Dialog open={addDialogOpen} onClose={handleCloseAddDialog} maxWidth='sm' fullWidth>
        <DialogTitle>Agregar Descuento</DialogTitle>
        <DialogContent>
          <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale='es'>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 2 }}>
              <CustomTextField
                select
                label='Tipo de Descuento'
                value={discountType}
                onChange={e => setDiscountType(e.target.value as 'permanent' | 'temporary')}
                fullWidth
              >
                <MenuItem value='permanent'>Descuento Permanente</MenuItem>
                <MenuItem value='temporary'>Descuento Temporal</MenuItem>
              </CustomTextField>

              <CustomTextField
                label='Descripción'
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                fullWidth
                multiline
                rows={2}
              />

              <CustomTextField
                label='Valor del Descuento (%)'
                type='number'
                value={formData.value}
                onChange={e => setFormData({ ...formData, value: Number(e.target.value) })}
                fullWidth
                inputProps={{ min: 0, max: 100 }}
              />

              {discountType === 'temporary' && (
                <>
                  <DatePicker
                    label='Fecha de Inicio'
                    value={formData.startDate}
                    onChange={newValue => setFormData({ ...formData, startDate: newValue })}
                    slotProps={{
                      textField: {
                        fullWidth: true
                      }
                    }}
                  />

                  <DatePicker
                    label='Fecha de Fin'
                    value={formData.endDate}
                    onChange={newValue => setFormData({ ...formData, endDate: newValue })}
                    slotProps={{
                      textField: {
                        fullWidth: true
                      }
                    }}
                  />
                </>
              )}
            </Box>
          </LocalizationProvider>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAddDialog} color='secondary'>
            Cancelar
          </Button>
          <Button onClick={handleSubmitDiscount} color='primary' variant='contained'>
            Crear Descuento
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  )
}

export default DiscountsListTable
