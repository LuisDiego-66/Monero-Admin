'use client'

// React Imports
import { useState, useEffect, useMemo } from 'react'

// Next Imports
import Link from 'next/link'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Checkbox from '@mui/material/Checkbox'
import TablePagination from '@mui/material/TablePagination'
import type { TextFieldProps } from '@mui/material/TextField'
import MenuItem from '@mui/material/MenuItem'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import Chip from '@mui/material/Chip'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'

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

// Type Imports
import type { ThemeColor } from '@core/types'
import type { Customer } from '@/types/apps/ecommerceTypes'

// Component Imports
import CustomAvatar from '@core/components/mui/Avatar'
import CustomTextField from '@core/components/mui/TextField'
import TablePaginationComponent from '@components/TablePaginationComponent'

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

type PayementStatusType = {
  text: string
  color: ThemeColor
}

type StatusChipColorType = {
  color: ThemeColor
}

export const paymentStatus: { [key: number]: PayementStatusType } = {
  1: { text: 'Paid', color: 'success' },
  2: { text: 'Pending', color: 'warning' },
  3: { text: 'Cancelled', color: 'secondary' },
  4: { text: 'Failed', color: 'error' }
}

export const statusChipColor: { [key: string]: StatusChipColorType } = {
  Delivered: { color: 'success' },
  'Out for Delivery': { color: 'primary' },
  'Ready to Pickup': { color: 'info' },
  Dispatched: { color: 'warning' }
}

type ECommerceOrderTypeWithAction = Customer & {
  action?: string
  customerType?: 'registered' | 'subscriber'
  status?: 'active' | 'inactive'
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

// Column Definitions
const columnHelper = createColumnHelper<ECommerceOrderTypeWithAction>()

const CustomerListTable = ({ customerData }: { customerData?: Customer[] }) => {
  // States

  const [rowSelection, setRowSelection] = useState({})
  const [data, setData] = useState(...[customerData])
  const [globalFilter, setGlobalFilter] = useState('')

  // Estados nuevos para email
  const [emailDialogOpen, setEmailDialogOpen] = useState(false)
  const [customerTypeFilter, setCustomerTypeFilter] = useState<'all' | 'registered' | 'subscriber'>('all')

  const [emailForm, setEmailForm] = useState({
    subject: '',
    message: '',
    recipients: 'all' as 'all' | 'registered' | 'subscriber' | 'selected'
  })

  const [sendingStatus, setSendingStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle')

  // Agregar datos de ejemplo si no existen
  useEffect(() => {
    if (!customerData || customerData.length === 0) {
      const mockData = [
        {
          customerId: 1,
          customer: 'Juan Pérez',
          email: 'juan@email.com',
          avatar: '',
          country: 'Spain',
          countryFlag: '/images/flag-icons/es.png',
          order: 5,
          totalSpent: 1250,
          customerType: 'registered' as const,
          status: 'active' as const
        },
        {
          customerId: 2,
          customer: 'María García',
          email: 'maria@email.com',
          avatar: '',
          country: 'Mexico',
          countryFlag: '/images/flag-icons/mx.png',
          order: 3,
          totalSpent: 850,
          customerType: 'registered' as const,
          status: 'active' as const
        },
        {
          customerId: 3,
          customer: 'Carlos López',
          email: 'carlos@email.com',
          avatar: '',
          country: 'Argentina',
          countryFlag: '/images/flag-icons/ar.png',
          order: 8,
          totalSpent: 2100,
          customerType: 'registered' as const,
          status: 'active' as const
        }
      ]

      setData(mockData)
    }
  }, [customerData])

  // Hooks
  const columns = useMemo<ColumnDef<ECommerceOrderTypeWithAction, any>[]>(
    () => [
      {
        id: 'select',
        header: ({ table }) => (
          <Checkbox
            {...{
              checked: table.getIsAllRowsSelected(),
              indeterminate: table.getIsSomeRowsSelected(),
              onChange: table.getToggleAllRowsSelectedHandler()
            }}
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            {...{
              checked: row.getIsSelected(),
              disabled: !row.getCanSelect(),
              indeterminate: row.getIsSomeSelected(),
              onChange: row.getToggleSelectedHandler()
            }}
          />
        )
      },
      columnHelper.accessor('customer', {
        header: 'Clientes',
        cell: ({ row }) => (
          <div className='flex items-center gap-3'>
            {getAvatar({ avatar: row.original.avatar, customer: row.original.customer })}
            <div className='flex flex-col items-start'>
              <Typography
                component={Link}
                color='text.primary'
                href={`/apps/ecommerce/customers/details/${row.original.customerId}`}
                className='font-medium hover:text-primary'
              >
                {row.original.customer}
              </Typography>
              <Typography variant='body2'>{row.original.email}</Typography>
            </div>
          </div>
        )
      }),
      columnHelper.accessor('customerType', {
        header: 'Tipo',
        cell: () => <Chip label='Cliente' color='primary' size='small' />
      }),
      columnHelper.accessor('status', {
        header: 'Estado',
        cell: () => <Chip label='Activo' color='success' size='small' />
      })
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  // Filtrar datos por tipo
  const filteredData = useMemo(() => {
    let filtered = data || []

    if (customerTypeFilter !== 'all') {
      filtered = filtered.filter(customer => customer.customerType === customerTypeFilter)
    }

    return filtered
  }, [data, customerTypeFilter])

  const table = useReactTable({
    data: filteredData as Customer[],
    columns,
    filterFns: {
      fuzzy: fuzzyFilter
    },
    state: {
      rowSelection,
      globalFilter
    },
    initialState: {
      pagination: {
        pageSize: 10
      }
    },
    enableRowSelection: true,
    globalFilterFn: fuzzyFilter,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues()
  })

  const getAvatar = (params: Pick<Customer, 'avatar' | 'customer'>) => {
    const { avatar, customer } = params

    if (avatar) {
      return <CustomAvatar src={avatar} skin='light' size={34} />
    } else {
      return (
        <CustomAvatar skin='light' size={34}>
          {getInitials(customer as string)}
        </CustomAvatar>
      )
    }
  }

  // Funciones para email
  const getSelectedCustomers = () => {
    const selectedRows = table.getFilteredSelectedRowModel().rows

    return selectedRows.map(row => row.original)
  }

  const getRecipientCount = () => {
    switch (emailForm.recipients) {
      case 'all':
        return filteredData.length
      case 'registered':
        return filteredData.length
      case 'subscriber':
        return 0
      case 'selected':
        return getSelectedCustomers().length
      default:
        return 0
    }
  }

  const handleSendEmails = async () => {
    if (!emailForm.subject || !emailForm.message) {
      alert('Por favor completa el asunto y mensaje')

      return
    }

    setSendingStatus('sending')

    try {
      const response = await fetch('/api/send-emails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: emailForm.subject,
          message: emailForm.message,
          recipients: emailForm.recipients,
          selectedClients: emailForm.recipients === 'selected' ? getSelectedCustomers().map(c => c.customerId) : null,
          filterType: customerTypeFilter
        })
      })

      if (response.ok) {
        setSendingStatus('success')
        setEmailForm({ subject: '', message: '', recipients: 'all' })
        setRowSelection({})
        setTimeout(() => {
          setEmailDialogOpen(false)
          setSendingStatus('idle')
        }, 2000)
      } else {
        setSendingStatus('error')
      }
    } catch (error) {
      console.error('Error enviando correos:', error)
      setSendingStatus('error')
    }

    setTimeout(() => setSendingStatus('idle'), 3000)
  }

  return (
    <>
      <Card>
        <CardContent className='flex justify-between flex-wrap max-sm:flex-col sm:items-center gap-4'>
          <Box className='flex gap-4 items-center'>
            <DebouncedInput
              value={globalFilter ?? ''}
              onChange={value => setGlobalFilter(String(value))}
              placeholder='Buscar clientes...'
              className='max-sm:is-full'
            />

            <FormControl size='small' style={{ minWidth: 150 }}>
              <InputLabel>Filtrar por Tipo</InputLabel>
              <Select
                value={customerTypeFilter}
                label='Filtrar por Tipo'
                onChange={e => setCustomerTypeFilter(e.target.value as any)}
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
              value={table.getState().pagination.pageSize}
              onChange={e => table.setPageSize(Number(e.target.value))}
              className='is-full sm:is-[70px]'
            >
              <MenuItem value='10'>10</MenuItem>
              <MenuItem value='25'>25</MenuItem>
              <MenuItem value='50'>50</MenuItem>
              <MenuItem value='100'>100</MenuItem>
            </CustomTextField>

            <Button
              variant='contained'
              color='secondary'
              startIcon={<i className='tabler-mail' />}
              onClick={() => setEmailDialogOpen(true)}
            >
              Enviar Correos
            </Button>
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
                      <tr key={row.id} className={classnames({ selected: row.getIsSelected() })}>
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

      {/* Dialog para envío de correos */}
      <Dialog open={emailDialogOpen} onClose={() => setEmailDialogOpen(false)} maxWidth='md' fullWidth>
        <DialogTitle>
          <Box className='flex items-center gap-2'>
            <i className='tabler-mail text-xl' />
            Enviar Correos a Clientes
          </Box>
        </DialogTitle>

        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Enviar a</InputLabel>
                <Select
                  value={emailForm.recipients}
                  label='Enviar a'
                  onChange={e => setEmailForm({ ...emailForm, recipients: e.target.value as any })}
                >
                  <MenuItem value='all'>Todos los Clientes </MenuItem>
                  <MenuItem value='registered'>Solo Clientes Registrados</MenuItem>
                  <MenuItem value='subscriber'>Solo Suscriptores</MenuItem>
                  <MenuItem value='selected' disabled={Object.keys(rowSelection).length === 0}>
                    Clientes Seleccionados ({Object.keys(rowSelection).length})
                  </MenuItem>
                </Select>
              </FormControl>

              <Box sx={{ mt: 1 }}>
                <Chip label={`${getRecipientCount()} destinatarios`} color='primary' variant='outlined' size='small' />
              </Box>
            </Grid>

            <Grid item xs={12}>
              <CustomTextField
                fullWidth
                label='Asunto'
                value={emailForm.subject}
                onChange={e => setEmailForm({ ...emailForm, subject: e.target.value })}
                placeholder='Asunto del correo'
              />
            </Grid>

            <Grid item xs={12}>
              <CustomTextField
                fullWidth
                multiline
                rows={6}
                label='Mensaje'
                value={emailForm.message}
                onChange={e => setEmailForm({ ...emailForm, message: e.target.value })}
                placeholder='Escribe tu mensaje aquí...'
              />
            </Grid>

            {sendingStatus === 'success' && (
              <Grid item xs={12}>
                <Alert severity='success'>¡Correos enviados exitosamente!</Alert>
              </Grid>
            )}

            {sendingStatus === 'error' && (
              <Grid item xs={12}>
                <Alert severity='error'>Error al enviar correos. Inténtalo de nuevo.</Alert>
              </Grid>
            )}
          </Grid>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setEmailDialogOpen(false)}>Cancelar</Button>
          <Button
            variant='contained'
            onClick={handleSendEmails}
            disabled={sendingStatus === 'sending' || !emailForm.subject || !emailForm.message}
            startIcon={sendingStatus === 'sending' ? <CircularProgress size={16} /> : <i className='tabler-send' />}
          >
            {sendingStatus === 'sending' ? 'Enviando...' : 'Enviar Correos'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default CustomerListTable
