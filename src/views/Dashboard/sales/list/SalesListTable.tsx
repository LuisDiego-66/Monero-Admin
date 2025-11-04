'use client'

import { useState } from 'react'

import Card from '@mui/material/Card'
import Chip from '@mui/material/Chip'
import MenuItem from '@mui/material/MenuItem'
import Typography from '@mui/material/Typography'
import TablePagination from '@mui/material/TablePagination'
import CircularProgress from '@mui/material/CircularProgress'

import { useOrders } from '@/hooks/useSales'
import CustomTextField from '@core/components/mui/TextField'
import OrderDetailsModal from './SaleDetailsModal'
import type { Order } from '@/types/api/sales'

const getEstadoColor = (estado: string): 'primary' | 'error' | 'success' | 'warning' => {
  switch (estado) {
    case 'pending':
      return 'warning'
    case 'cancelled':
      return 'error'
    case 'paid':
      return 'success'
    case 'completed':
      return 'primary'
    default:
      return 'primary'
  }
}

const getEstadoLabel = (estado: string): string => {
  const labels: Record<string, string> = {
    pending: 'PENDIENTE',
    cancelled: 'CANCELADO',
    paid: 'PAGADO',
    completed: 'COMPLETADO'
  }

  return labels[estado] || estado.toUpperCase()
}

const getTipoLabel = (tipo: string): string => {
  return tipo === 'in_store' ? 'En Tienda' : 'En Línea'
}

const formatDate = (dateString: string): string => {
  const date = new Date(dateString)

  return date.toLocaleDateString('es-BO', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const OrdersListTable = () => {
  const [page, setPage] = useState(0)
  const [limit, setLimit] = useState(10)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  const { data, isLoading, isError } = useOrders({
    page: page + 1,
    limit
  })

  const handleRowClick = (order: Order) => {
    setSelectedOrder(order)
    setModalOpen(true)
  }

  const handleCloseModal = () => {
    setModalOpen(false)
    setSelectedOrder(null)
  }

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLimit(parseInt(event.target.value, 10))
    setPage(0)
  }

  if (isLoading) {
    return (
      <Card className='flex justify-center items-center p-10'>
        <CircularProgress />
      </Card>
    )
  }

  if (isError) {
    return (
      <Card className='p-6'>
        <Typography color='error'>Error al cargar las órdenes</Typography>
      </Card>
    )
  }

  const orders = data?.data || []
  const meta = data?.meta

  return (
    <>
      <Card>
        <div className='flex flex-wrap justify-between gap-4 p-6'>
          <Typography variant='h5'>Lista de Ventas</Typography>
          <div className='flex items-center gap-4'>
            <CustomTextField select value={limit} onChange={handleChangeRowsPerPage} className='w-[100px]' size='small'>
              <MenuItem value={10}>10</MenuItem>
              <MenuItem value={25}>25</MenuItem>
              <MenuItem value={50}>50</MenuItem>
            </CustomTextField>
          </div>
        </div>

        <div className='overflow-x-auto'>
          <table className='w-full'>
            <thead>
              <tr className='border-b border-t'>
                <th className='text-left p-4'>
                  <Typography variant='body2' className='font-semibold'>
                    ID
                  </Typography>
                </th>
                <th className='text-left p-4'>
                  <Typography variant='body2' className='font-semibold'>
                    Estado
                  </Typography>
                </th>
                <th className='text-left p-4'>
                  <Typography variant='body2' className='font-semibold'>
                    Tipo
                  </Typography>
                </th>
                <th className='text-left p-4'>
                  <Typography variant='body2' className='font-semibold'>
                    Fecha de Expiración
                  </Typography>
                </th>
                <th className='text-left p-4'>
                  <Typography variant='body2' className='font-semibold'>
                    Total
                  </Typography>
                </th>
                <th className='text-left p-4'>
                  <Typography variant='body2' className='font-semibold'>
                    Items
                  </Typography>
                </th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className='text-center p-8'>
                    <Typography color='text.secondary'>No hay órdenes disponibles</Typography>
                  </td>
                </tr>
              ) : (
                orders.map(order => (
                  <tr
                    key={order.id}
                    onClick={() => handleRowClick(order)}
                    className='border-b hover:bg-actionHover cursor-pointer transition-colors'
                  >
                    <td className='p-4'>
                      <Typography variant='body2' className='font-medium'>
                        #{order.id}
                      </Typography>
                    </td>
                    <td className='p-4'>
                      <Chip
                        label={getEstadoLabel(order.status)}
                        variant='tonal'
                        color={getEstadoColor(order.status)}
                        size='small'
                      />
                    </td>
                    <td className='p-4'>
                      <Typography variant='body2'>{getTipoLabel(order.type)}</Typography>
                    </td>
                    <td className='p-4'>
                      <Typography variant='body2' color='text.secondary'>
                        {formatDate(order.expiresAt)}
                      </Typography>
                    </td>
                    <td className='p-4'>
                      <Typography variant='body2' className='font-semibold'>
                        Bs. {parseFloat(order.totalPrice).toFixed(2)}
                      </Typography>
                    </td>
                    <td className='p-4'>
                      <Typography variant='body2'>{order.items.length} productos</Typography>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <TablePagination
          component='div'
          count={meta?.total || 0}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={limit}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage='Filas por página:'
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
        />
      </Card>

      <OrderDetailsModal open={modalOpen} onClose={handleCloseModal} order={selectedOrder} />
    </>
  )
}

export default OrdersListTable
