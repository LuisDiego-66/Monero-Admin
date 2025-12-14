import React from 'react'

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  CircularProgress
} from '@mui/material'

import type { Order } from '@/types/api/sales'

interface CancelDialogProps {
  open: boolean
  orderData: Order | null
  isLoading: boolean
  onClose: () => void
  onConfirm: () => void
}

const CancelDialog: React.FC<CancelDialogProps> = ({ open, orderData, isLoading, onClose, onConfirm }) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth='xs' fullWidth>
      <DialogTitle>
        <Typography fontWeight='bold'>¿Cancelar Orden?</Typography>
      </DialogTitle>
      <DialogContent>
        <Typography>
          ¿Estás seguro que deseas cancelar la orden #{orderData?.id}? El stock reservado será liberado
          inmediatamente.
        </Typography>
      </DialogContent>
      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button onClick={onClose} disabled={isLoading} variant='outlined' fullWidth>
          No, Continuar
        </Button>
        <Button
          onClick={onConfirm}
          color='error'
          variant='contained'
          disabled={isLoading}
          startIcon={isLoading ? <CircularProgress size={20} color='inherit' /> : null}
          fullWidth
        >
          {isLoading ? 'Cancelando...' : 'Sí, Cancelar'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default CancelDialog
