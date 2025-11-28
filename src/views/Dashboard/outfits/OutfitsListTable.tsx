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

import { useOutfits, useDeleteOutfit } from '@/hooks/useOutfits'
import CustomTextField from '@core/components/mui/TextField'
import tableStyles from '@core/styles/table.module.css'
import CreateEditOutfitModal from './CreateEditOutfitModal'
import type { Outfit } from '@/types/api/outfits'

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

const OutfitsListTable = () => {
  const theme = useTheme()
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(10)
  const [search, setSearch] = useState('')

  const [modalOpen, setModalOpen] = useState(false)
  const [editingOutfit, setEditingOutfit] = useState<Outfit | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [outfitToDelete, setOutfitToDelete] = useState<number | null>(null)

  const [open, setOpen] = useState<boolean>(false)
  const [snackPack, setSnackPack] = useState<SnackbarMessage[]>([])
  const [messageInfo, setMessageInfo] = useState<SnackbarMessage | undefined>(undefined)

  const deleteOutfit = useDeleteOutfit()

  const queryParams = useMemo(
    () => ({
      search: search
    }),
    [search]
  )

  const { data: outfitsData, isLoading, error, isFetching } = useOutfits(queryParams)

  const allOutfits = useMemo(() => {
    return outfitsData || []
  }, [outfitsData])

  const filteredOutfits = useMemo(() => {
    const startIndex = page * pageSize
    const endIndex = startIndex + pageSize

    return allOutfits.slice(startIndex, endIndex)
  }, [allOutfits, page, pageSize])

  const totalRecords = useMemo(() => {
    return allOutfits.length
  }, [allOutfits])

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
    setEditingOutfit(null)
    setModalOpen(true)
  }, [])

  const handleOpenEditModal = useCallback((outfit: Outfit) => {
    setEditingOutfit(outfit)
    setModalOpen(true)
  }, [])

  const handleCloseModal = useCallback(() => {
    setModalOpen(false)
    setEditingOutfit(null)
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

  const handleOpenDeleteDialog = useCallback((outfitId: number) => {
    setOutfitToDelete(outfitId)
    setDeleteDialogOpen(true)
  }, [])

  const handleCloseDeleteDialog = useCallback(() => {
    setDeleteDialogOpen(false)
    setOutfitToDelete(null)
  }, [])

  const handleConfirmDelete = useCallback(async () => {
    if (outfitToDelete) {
      try {
        await deleteOutfit.mutateAsync(outfitToDelete)
        showMessage('Outfit eliminado correctamente', 'success')
        handleCloseDeleteDialog()
      } catch (error) {
        showMessage('Error al eliminar outfit', 'error')
      }
    }
  }, [outfitToDelete, deleteOutfit, showMessage, handleCloseDeleteDialog])

  const columns = useMemo<ColumnDef<Outfit, any>[]>(
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
        accessorKey: 'productColors',
        header: 'Prendas',
        cell: ({ row }) => {
          const productColors = row.original.productColors || []
          const count = productColors.length

          const allImages = productColors
            .flatMap(pc => pc.multimedia || [])
            .filter((url: string) => url.match(/\.(jpeg|jpg|png|gif|webp)$/i))

          const displayImages = allImages.slice(0, 4)
          const remainingCount = allImages.length - 4

          if (allImages.length === 0) {
            return (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Chip label={`${count} prendas`} size='small' color='primary' variant='tonal' />
                <Typography variant='body2' color='text.secondary'>
                  Sin imágenes
                </Typography>
              </Box>
            )
          }

          return (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Chip label={`${count} prendas`} size='small' color='primary' variant='tonal' />
              <AvatarGroup max={4} sx={{ '& .MuiAvatar-root': { width: 32, height: 32 } }}>
                {displayImages.map((url: string, index: number) => (
                  <Tooltip key={index} title={`Prenda ${index + 1}`}>
                    <Avatar src={url} alt={`Prenda ${index + 1}`} variant='rounded' sx={{ cursor: 'pointer' }} />
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
    data: filteredOutfits,
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
            Error al cargar los outfits: {error instanceof Error ? error.message : 'Error desconocido'}
          </Alert>
        </Box>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader title='Gestión de Outfits' />

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
            placeholder='Buscar Outfit'
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
              Crear Nuevo Outfit
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
                      No hay outfits disponibles
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

      <CreateEditOutfitModal
        open={modalOpen}
        onClose={handleCloseModal}
        outfit={editingOutfit}
        onSuccess={handleSuccess}
        onError={handleError}
      />

      <Dialog open={deleteDialogOpen} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Confirmar eliminación</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Estás seguro de que deseas eliminar este outfit? Esta acción no se puede deshacer.
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
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
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

export default OutfitsListTable
