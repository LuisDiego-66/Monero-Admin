'use client'

import { useEffect, useMemo, useState, useCallback } from 'react'
import type { SyntheticEvent } from 'react'

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
import DialogContentText from '@mui/material/DialogContentText'
import Button from '@mui/material/Button'
import MenuItem from '@mui/material/MenuItem'
import TablePagination from '@mui/material/TablePagination'
import IconButton from '@mui/material/IconButton'
import Snackbar from '@mui/material/Snackbar'
import type { TextFieldProps } from '@mui/material/TextField'
import { useTheme } from '@mui/material/styles'
import classnames from 'classnames'
import { rankItem } from '@tanstack/match-sorter-utils'
import Avatar from '@mui/material/Avatar'
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

import { useSliders, useDeleteSlider } from '@/hooks/useSliders'
import CustomTextField from '@core/components/mui/TextField'
import tableStyles from '@core/styles/table.module.css'
import CreateEditSliderModal from '../CreateEditSliderModal'
import type { Slider } from '@/types/api/sliders'

declare module '@tanstack/table-core' {
  interface FilterFns {
    fuzzy: FilterFn<unknown>
  }
  interface FilterMeta {
    itemRank: RankingInfo
  }
}

export type SnackbarMessage = {
  key: number
  message: string
  severity: 'success' | 'error' | 'info' | 'warning'
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

const SlidersListTable = () => {
  const theme = useTheme()
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(10)
  const [search, setSearch] = useState('')

  const [modalOpen, setModalOpen] = useState(false)
  const [editingSlider, setEditingSlider] = useState<Slider | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [sliderToDelete, setSliderToDelete] = useState<number | null>(null)

  const [open, setOpen] = useState<boolean>(false)
  const [snackPack, setSnackPack] = useState<SnackbarMessage[]>([])
  const [messageInfo, setMessageInfo] = useState<SnackbarMessage | undefined>(undefined)

  const deleteSlider = useDeleteSlider()

  const queryParams = useMemo(
    () => ({
      search: search
    }),
    [search]
  )

  const { data: slidersData, isLoading, error, isFetching } = useSliders(queryParams)

  const allSliders = useMemo(() => {
    return slidersData || []
  }, [slidersData])

  const filteredSliders = useMemo(() => {
    const startIndex = page * pageSize
    const endIndex = startIndex + pageSize

    return allSliders.slice(startIndex, endIndex)
  }, [allSliders, page, pageSize])

  const totalRecords = useMemo(() => {
    return allSliders.length
  }, [allSliders])

  useEffect(() => {
    if (snackPack.length && !messageInfo) {
      setOpen(true)
      setSnackPack(prev => prev.slice(1))
      setMessageInfo({ ...snackPack[0] })
    } else if (snackPack.length && messageInfo && open) {
      setOpen(false)
    }
  }, [snackPack, messageInfo, open])

  const showMessage = useCallback((message: string, severity: 'success' | 'error' | 'info' | 'warning') => {
    setSnackPack(prev => [...prev, { message, severity, key: new Date().getTime() }])
  }, [])

  const handleSnackbarClose = (event: Event | SyntheticEvent, reason?: string) => {
    if (reason === 'clickaway') {
      return
    }

    setOpen(false)
  }

  const handleExited = () => {
    setMessageInfo(undefined)
  }

  const handleOpenCreateModal = useCallback(() => {
    setEditingSlider(null)
    setModalOpen(true)
  }, [])

  const handleOpenEditModal = useCallback((slider: Slider) => {
    setEditingSlider(slider)
    setModalOpen(true)
  }, [])

  const handleCloseModal = useCallback(() => {
    setModalOpen(false)
    setEditingSlider(null)
  }, [])

  const handleSuccess = useCallback(
    (message: string) => {
      showMessage(message, 'success')
      handleCloseModal()
    },
    [showMessage, handleCloseModal]
  )

  const handleError = useCallback(
    (message: string) => {
      showMessage(message, 'error')
    },
    [showMessage]
  )

  const handleOpenDeleteDialog = useCallback((sliderId: number) => {
    setSliderToDelete(sliderId)
    setDeleteDialogOpen(true)
  }, [])

  const handleCloseDeleteDialog = useCallback(() => {
    setDeleteDialogOpen(false)
    setSliderToDelete(null)
  }, [])

  const handleConfirmDelete = useCallback(async () => {
    if (sliderToDelete) {
      try {
        await deleteSlider.mutateAsync(sliderToDelete)
        showMessage('Slider eliminado correctamente', 'success')
        handleCloseDeleteDialog()
      } catch (error) {
        showMessage('Error al eliminar slider', 'error')
      }
    }
  }, [sliderToDelete, deleteSlider, showMessage, handleCloseDeleteDialog])

  const getGenderLabel = (gender: string) => {
    const labels: Record<string, string> = {
      male: 'Hombre',
      female: 'Mujer'
    }

    return labels[gender] || gender
  }

  const getSliderTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      desktop: 'Desktop',
      mobile: 'Móvil'
    }

    return labels[type] || type
  }

  const columns = useMemo<ColumnDef<Slider, any>[]>(
    () => [
      {
        accessorKey: 'id',
        header: 'ID',
        cell: ({ row }) => (
          <Typography className='font-medium' color='text.primary'>
            {row.original.id}
          </Typography>
        )
      },
      {
        accessorKey: 'image',
        header: 'Imagen',
        cell: ({ row }) => (
          <Avatar src={row.original.image} alt={row.original.name} variant='rounded' sx={{ width: 60, height: 40 }} />
        )
      },
      {
        accessorKey: 'name',
        header: 'Nombre',
        cell: ({ row }) => (
          <Typography className='font-medium' color='text.primary'>
            {row.original.name}
          </Typography>
        ),
        filterFn: 'fuzzy'
      },
      {
        accessorKey: 'button_text',
        header: 'Texto Botón',
        cell: ({ row }) => (
          <Typography variant='body2' color='text.primary'>
            {row.original.button_text}
          </Typography>
        )
      },
      {
        accessorKey: 'slider_type',
        header: 'Tipo',
        cell: ({ row }) => (
          <Chip
            label={getSliderTypeLabel(row.original.slider_type)}
            size='small'
            color={row.original.slider_type === 'desktop' ? 'primary' : 'secondary'}
            variant='tonal'
          />
        )
      },
      {
        accessorKey: 'gender',
        header: 'Género',
        cell: ({ row }) => (
          <Chip
            label={getGenderLabel(row.original.gender)}
            size='small'
            color={row.original.gender === 'male' ? 'info' : 'error'}
            variant='tonal'
          />
        )
      },
      {
        accessorKey: 'actions',
        header: 'Acciones',
        cell: ({ row }) => (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title='Editar'>
              <IconButton size='small' color='primary' onClick={() => handleOpenEditModal(row.original)}>
                <i className='tabler-edit' />
              </IconButton>
            </Tooltip>
            <Tooltip title='Eliminar'>
              <IconButton size='small' color='error' onClick={() => handleOpenDeleteDialog(row.original.id)}>
                <i className='tabler-trash' />
              </IconButton>
            </Tooltip>
          </Box>
        ),
        enableSorting: false
      }
    ],
    [handleOpenEditModal, handleOpenDeleteDialog]
  )

  const table = useReactTable({
    data: filteredSliders,
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
            Error al cargar los sliders: {error instanceof Error ? error.message : 'Error desconocido'}
          </Alert>
        </Box>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader title='Gestión de Sliders' />

        <Box className='flex flex-wrap justify-between gap-4 p-6'>
          <DebouncedInput
            value={search}
            onChange={value => {
              const newSearch = String(value)

              if (newSearch !== search) {
                setSearch(newSearch)
                setPage(0)
              }
            }}
            placeholder='Buscar Slider'
            className='max-sm:is-full'
            size='small'
          />
          <Box className='flex gap-4'>
            <Button
              variant='contained'
              color='primary'
              onClick={handleOpenCreateModal}
              startIcon={<i className='tabler-plus' />}
            >
              Crear Nuevo Slider
            </Button>
            <CustomTextField
              select
              value={pageSize}
              onChange={e => {
                setPageSize(Number(e.target.value))
                setPage(0)
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
                      No hay sliders disponibles
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
          page={page}
          onPageChange={(_, newPage) => {
            setPage(newPage)
          }}
          onRowsPerPageChange={event => {
            setPageSize(parseInt(event.target.value, 10))
            setPage(0)
          }}
          rowsPerPageOptions={[10, 25, 50, 100]}
          labelRowsPerPage='Filas por página:'
          labelDisplayedRows={({ from, to, count }) => `${from}–${to} de ${count}`}
        />
      </Card>

      <CreateEditSliderModal
        open={modalOpen}
        onClose={handleCloseModal}
        slider={editingSlider}
        onSuccess={handleSuccess}
        onError={handleError}
      />

      <Dialog open={deleteDialogOpen} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Confirmar eliminación</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Estás seguro de que deseas eliminar este slider? Esta acción no se puede deshacer.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} color='secondary'>
            Cancelar
          </Button>
          <Button onClick={handleConfirmDelete} color='error' variant='contained'>
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={open}
        onClose={handleSnackbarClose}
        autoHideDuration={3000}
        TransitionProps={{ onExited: handleExited }}
        key={messageInfo ? messageInfo.key : undefined}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          variant='filled'
          onClose={handleSnackbarClose}
          className='is-full shadow-xs items-center'
          severity={messageInfo?.severity || 'info'}
        >
          {messageInfo?.message}
        </Alert>
      </Snackbar>
    </>
  )
}

export default SlidersListTable
