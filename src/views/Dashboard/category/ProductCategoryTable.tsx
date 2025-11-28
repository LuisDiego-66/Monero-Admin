'use client'

import { useEffect, useMemo, useState, useCallback } from 'react'
import type { SyntheticEvent } from 'react'

import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import MenuItem from '@mui/material/MenuItem'
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Grid2'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Skeleton from '@mui/material/Skeleton'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import DialogContentText from '@mui/material/DialogContentText'
import Snackbar from '@mui/material/Snackbar'
import TablePagination from '@mui/material/TablePagination'
import type { TextFieldProps } from '@mui/material/TextField'
import { styled, useTheme } from '@mui/material/styles'
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
  getSortedRowModel
} from '@tanstack/react-table'
import type { FilterFn } from '@tanstack/react-table'
import type { RankingInfo } from '@tanstack/match-sorter-utils'
import type { DragEndEvent } from '@dnd-kit/core'
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { restrictToVerticalAxis } from '@dnd-kit/modifiers'

import CreateEditCategoryModal from './CreateEditCategoryModal'
import CustomTextField from '@core/components/mui/TextField'
import { useCategories, useUpdateCategoryOrder, useDeleteCategory } from '@/hooks/useCategory'
import type { Category, Gender } from '@/types/api/category'
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
      {isDragMode && (
        <td className={tableStyles.cell} style={{ width: '40px', padding: theme.spacing(1) }} {...listeners}>
          <IconButton
            size='small'
            className='drag-handle'
            sx={{
              color: theme.palette.text.secondary,
              cursor: 'grab',
              '&:hover': { color: theme.palette.primary.main },
              '&:active': { cursor: 'grabbing' }
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

const CategoryFilters = ({
  onGenderChange,
  gender
}: {
  onGenderChange: (gender: Gender | 'all') => void
  gender: Gender | 'all'
}) => {
  return (
    <CardContent>
      <Grid container spacing={6}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <CustomTextField
            select
            fullWidth
            label='Filtrar por Género'
            value={gender}
            onChange={e => onGenderChange(e.target.value as Gender | 'all')}
          >
            <MenuItem value='all'>Todos </MenuItem>
            <MenuItem value='male'>Solo Hombres </MenuItem>
            <MenuItem value='female'>Solo Mujeres </MenuItem>
          </CustomTextField>
        </Grid>
      </Grid>
    </CardContent>
  )
}

const ProductCategoryTable = () => {
  const theme = useTheme()
  const [addCategoryOpen, setAddCategoryOpen] = useState(false)
  const [editCategoryOpen, setEditCategoryOpen] = useState(false)
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null)
  const [globalFilter, setGlobalFilter] = useState('')
  const [genderFilter, setGenderFilter] = useState<Gender | 'all'>('all')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [categoryToDelete, setCategoryToDelete] = useState<number | null>(null)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)

  const [open, setOpen] = useState<boolean>(false)
  const [snackPack, setSnackPack] = useState<SnackbarMessage[]>([])
  const [messageInfo, setMessageInfo] = useState<SnackbarMessage | undefined>(undefined)

  const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor))
  const updateOrder = useUpdateCategoryOrder()
  const deleteCategory = useDeleteCategory()

  const {
    data: categories,
    isLoading,
    error
  } = useCategories({
    gender: genderFilter !== 'all' ? genderFilter : undefined,
    search: globalFilter || undefined
  })

  const handleEdit = useCallback((categoryId: number) => {
    setSelectedCategoryId(categoryId)
    setEditCategoryOpen(true)
  }, [])

  const handleDelete = useCallback((categoryId: number) => {
    setCategoryToDelete(categoryId)
    setDeleteDialogOpen(true)
  }, [])

  const confirmDelete = useCallback(async () => {
    if (categoryToDelete) {
      try {
        await deleteCategory.mutateAsync(categoryToDelete)
        setDeleteDialogOpen(false)
        setCategoryToDelete(null)
      } catch (error) {
        console.error('Error deleting category:', error)
      }
    }
  }, [categoryToDelete, deleteCategory])

  const cancelDelete = useCallback(() => {
    setDeleteDialogOpen(false)
    setCategoryToDelete(null)
  }, [])

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

  const handleSuccess = useCallback(
    (message: string) => {
      showMessage(message, 'success')
    },
    [showMessage]
  )

  const handleError = useCallback(
    (message: string) => {
      showMessage(message, 'error')
    },
    [showMessage]
  )

  const shouldPaginate = genderFilter === 'all' && !globalFilter

  const sortedData = useMemo(() => {
    if (!categories || !Array.isArray(categories)) return []

    let filtered = categories

    if (genderFilter !== 'all') {
      filtered = filtered.filter((category: any) => category.gender === genderFilter)
    }

    // La búsqueda solo funciona cuando el filtro está en "Todos"
    if (globalFilter && genderFilter === 'all') {
      filtered = filtered.filter((category: any) => category.name.toLowerCase().includes(globalFilter.toLowerCase()))
    }

    if (genderFilter === 'all') {
      return filtered.sort((a: any, b: any) => a.name.localeCompare(b.name))
    } else {
      return filtered.sort((a: any, b: any) => a.displayOrder - b.displayOrder)
    }
  }, [categories, globalFilter, genderFilter])

  const paginatedData = useMemo(() => {
    if (!shouldPaginate) return sortedData
    const startIndex = page * rowsPerPage
    const endIndex = startIndex + rowsPerPage

    return sortedData.slice(startIndex, endIndex)
  }, [sortedData, shouldPaginate, page, rowsPerPage])

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event

      if (!over || active.id === over.id) return

      const oldIndex = sortedData.findIndex((item: any) => item.id === active.id)
      const newIndex = sortedData.findIndex((item: any) => item.id === over.id)

      if (oldIndex === -1 || newIndex === -1) return

      try {
        await updateOrder.mutateAsync({
          id: Number(active.id),
          newOrder: newIndex
        })
      } catch (error) {
        console.error('Error updating category order:', error)
      }
    },
    [sortedData, updateOrder]
  )

  const columns = useMemo(
    () => [
      /* {
        accessorKey: 'id',
        header: 'ID',
        cell: ({ row }: any) => (
          <Box className='h-full w-full p-3 -m-3'>
            <Typography className='font-medium' color='text.primary'>
              {row.original.id}
            </Typography>
          </Box>
        )
      }, */
      {
        accessorKey: 'gender',
        header: 'Género',
        cell: ({ row }: any) => (
          <Box className='h-full w-full p-3 -m-3'>
            <Chip
              label={row.original.gender === 'male' ? 'Hombres' : 'Mujeres'}
              variant='tonal'
              color={row.original.gender === 'male' ? 'primary' : 'error'}
              size='small'
            />
          </Box>
        )
      },
      {
        accessorKey: 'name',
        header: 'Nombre',
        cell: ({ row }: any) => (
          <Box className='h-full w-full p-3 -m-3'>
            <Typography className='font-medium' color='text.primary'>
              {row.original.name}
            </Typography>
          </Box>
        )
      },
      {
        accessorKey: 'image',
        header: 'Imagen',
        cell: ({ row }: any) => (
          <Box className='h-full w-full p-3 -m-3'>
            {row.original.image ? (
              <Box
                component='img'
                src={row.original.image}
                alt={row.original.name}
                sx={{
                  width: 50,
                  height: 50,
                  objectFit: 'cover',
                  borderRadius: 1
                }}
              />
            ) : (
              <Typography variant='caption' color='text.secondary'>
                Sin imagen
              </Typography>
            )}
          </Box>
        )
      },
      {
        accessorKey: 'displayOrder',
        header: 'Orden',
        cell: ({ row }: any) => (
          <Box className='h-full w-full p-3 -m-3'>
            <Typography color='text.secondary'>{row.original.displayOrder}</Typography>
          </Box>
        )
      },
      {
        accessorKey: 'subcategories',
        header: 'Subcategorías',
        cell: ({ row }: any) => (
          <Box className='h-full w-full p-3 -m-3'>
            <Typography color='text.secondary'>{row.original.subcategories?.length || 0}</Typography>
          </Box>
        )
      },
      {
        accessorKey: 'enabled',
        header: 'Estado',
        cell: ({ row }: any) => (
          <Box className='h-full w-full p-3 -m-3'>
            <Chip
              label={row.original.enabled ? 'Activo' : 'Inactivo'}
              color={row.original.enabled ? 'success' : 'error'}
              size='small'
            />
          </Box>
        )
      },
      {
        id: 'actions',
        header: 'Acciones',
        cell: ({ row }: any) => (
          <Box className='flex gap-2'>
            <IconButton
              size='small'
              onClick={e => {
                e.stopPropagation()
                handleEdit(row.original.id)
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
    [handleEdit, handleDelete]
  )

  const table = useReactTable({
    data: paginatedData,
    columns,
    filterFns: { fuzzy: fuzzyFilter },
    state: {
      globalFilter,
      columnVisibility: {
        actions: genderFilter === 'all',
        displayOrder: genderFilter !== 'all'
      }
    },
    enableRowSelection: false,
    enableSorting: false,
    globalFilterFn: fuzzyFilter,
    getCoreRowModel: getCoreRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues()
  })

  const renderSkeleton = () => (
    <tbody>
      {Array.from({ length: 10 }).map((_, index) => (
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
        <CardContent>
          <Alert severity='error'>
            Error al cargar las categorías: {error instanceof Error ? error.message : 'Error desconocido'}
          </Alert>
        </CardContent>
      </Card>
    )
  }

  const isDragMode = genderFilter !== 'all' && !globalFilter

  const tableContent = isDragMode ? (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
      modifiers={[restrictToVerticalAxis]}
    >
      <SortableContext items={sortedData.map((item: any) => item.id)} strategy={verticalListSortingStrategy}>
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
            {isLoading ? (
              renderSkeleton()
            ) : sortedData.length === 0 ? (
              <tbody>
                <tr>
                  <td colSpan={table.getVisibleFlatColumns().length + 1} className='text-center'>
                    <Typography color='text.secondary' sx={{ py: 4 }}>
                      No hay categorías disponibles
                    </Typography>
                  </td>
                </tr>
              </tbody>
            ) : (
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
            )}
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
                <th key={header.id}>
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
        {isLoading ? (
          renderSkeleton()
        ) : sortedData.length === 0 ? (
          <tbody>
            <tr>
              <td colSpan={table.getVisibleFlatColumns().length} className='text-center'>
                <Typography color='text.secondary' sx={{ py: 4 }}>
                  No hay categorías disponibles
                </Typography>
              </td>
            </tr>
          </tbody>
        ) : (
          <tbody>
            {table.getRowModel().rows.map(row => (
              <SortableRow key={row.original.id} row={row} isDragMode={false}>
                {row.getVisibleCells().map(cell => (
                  <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                ))}
              </SortableRow>
            ))}
          </tbody>
        )}
      </table>
    </div>
  )

  return (
    <>
      <Card>
        <CardHeader title='Filtros' />
        <CategoryFilters onGenderChange={setGenderFilter} gender={genderFilter} />
        <Divider />

        {isDragMode && (
          <StyledAlert severity='info' icon={<i className='tabler-arrows-move' />}>
            <Typography variant='body2'>
              Modo reordenamiento activo: Arrastra las categorías hacia arriba o abajo para cambiar su orden de
              visualización
            </Typography>
          </StyledAlert>
        )}

        <div className='flex flex-wrap justify-between gap-4 p-6'>
          <DebouncedInput
            value={globalFilter ?? ''}
            onChange={value => {
              setGlobalFilter(String(value))
            }}
            placeholder='Buscar Categoría'
            className='max-sm:is-full'
            size='small'
            disabled={genderFilter !== 'all'}
          />
          <div className='flex max-sm:flex-col items-start sm:items-center gap-4 max-sm:is-full'>
            <Button
              variant='contained'
              className='max-sm:is-full'
              onClick={() => setAddCategoryOpen(true)}
              startIcon={<i className='tabler-plus' />}
              size='small'
            >
              Agregar Categoría
            </Button>
          </div>
        </div>

        {tableContent}

        {shouldPaginate ? (
          <TablePagination
            component='div'
            count={sortedData.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={(_, newPage) => {
              setPage(newPage)
            }}
            onRowsPerPageChange={event => {
              setRowsPerPage(parseInt(event.target.value, 10))
              setPage(0)
            }}
            rowsPerPageOptions={[5, 10, 20, 50]}
            labelRowsPerPage='Filas por página:'
            labelDisplayedRows={({ from, to, count }) => `${from}–${to} de ${count}`}
          />
        ) : (
          <Box sx={{ py: 2, px: 3, borderTop: 1, borderColor: 'divider' }}>
            <Typography variant='body2' color='text.secondary'>
              Mostrando {sortedData.length} categorías en total
            </Typography>
          </Box>
        )}
      </Card>

      <CreateEditCategoryModal
        open={addCategoryOpen}
        onClose={() => setAddCategoryOpen(false)}
        mode='create'
        onSuccess={handleSuccess}
        onError={handleError}
      />

      <CreateEditCategoryModal
        open={editCategoryOpen}
        onClose={() => {
          setEditCategoryOpen(false)
          setSelectedCategoryId(null)
        }}
        categoryId={selectedCategoryId}
        mode='edit'
        onSuccess={handleSuccess}
        onError={handleError}
      />

      <Dialog open={deleteDialogOpen} onClose={cancelDelete} maxWidth='xs' fullWidth>
        <DialogTitle>
          <Box display='flex' alignItems='center' gap={2}>
            <i className='tabler-alert-triangle' style={{ color: theme.palette.warning.main, fontSize: 24 }} />
            Confirmar Eliminación
          </Box>
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Estás seguro de que quieres eliminar esta categoría? Esta acción no se puede deshacer y también eliminará
            todas las subcategorías asociadas.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={cancelDelete} variant='tonal' color='secondary'>
            Cancelar
          </Button>
          <Button
            onClick={confirmDelete}
            variant='contained'
            color='error'
            disabled={deleteCategory.isPending}
            startIcon={
              deleteCategory.isPending ? <i className='tabler-loader animate-spin' /> : <i className='tabler-trash' />
            }
          >
            {deleteCategory.isPending ? 'Eliminando...' : 'Eliminar'}
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

export default ProductCategoryTable
