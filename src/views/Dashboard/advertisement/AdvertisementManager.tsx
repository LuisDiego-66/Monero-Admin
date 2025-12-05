'use client'

import { useState, useEffect, useCallback } from 'react'
import type { SyntheticEvent } from 'react'

import {
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Alert,
  CircularProgress,
  Switch,
  FormControlLabel,
  Snackbar
} from '@mui/material'

import CustomTextField from '@core/components/mui/TextField'
import { useAdvertisement, useUpdateAdvertisement } from '@/hooks/useAdvertisement'

export type SnackbarMessage = {
  key: number
  message: string
  severity: 'success' | 'error' | 'info' | 'warning'
}

const AdvertisementManager = () => {
  const [text, setText] = useState('')
  const [enabled, setEnabled] = useState(false)
  const [open, setOpen] = useState<boolean>(false)
  const [snackPack, setSnackPack] = useState<SnackbarMessage[]>([])
  const [messageInfo, setMessageInfo] = useState<SnackbarMessage | undefined>(undefined)

  const { data: advertisement, isLoading, error } = useAdvertisement()
  const updateAdvertisement = useUpdateAdvertisement()

  useEffect(() => {
    if (advertisement) {
      setText(advertisement.text)
      setEnabled(advertisement.enabled)
    }
  }, [advertisement])

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

  const handleSubmit = async () => {
    if (!text.trim()) {
      showMessage('El texto del anuncio es requerido', 'error')

      return
    }

    try {
      await updateAdvertisement.mutateAsync({
        text,
        enabled
      })

      showMessage('Anuncio actualizado exitosamente', 'success')
    } catch (err: any) {
      showMessage(err?.response?.data?.message || 'Error al actualizar el anuncio', 'error')
    }
  }

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return (
      <Alert severity='error' sx={{ m: 3 }}>
        Error al cargar el anuncio
      </Alert>
    )
  }

  return (
    <>
      <Card>
        <CardContent>
          <Typography variant='h5' sx={{ mb: 3 }}>
            Gestión de Anuncios
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <CustomTextField
              fullWidth
              label='Texto del Anuncio'
              placeholder='Ingrese el texto del anuncio'
              value={text}
              onChange={e => setText(e.target.value)}
              multiline
              rows={4}
            />

            <FormControlLabel
              control={<Switch checked={enabled} onChange={e => setEnabled(e.target.checked)} color='primary' />}
              label={enabled ? 'Anuncio Habilitado' : 'Anuncio Deshabilitado'}
            />

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <Button
                variant='contained'
                color='primary'
                onClick={handleSubmit}
                disabled={updateAdvertisement.isPending}
                startIcon={updateAdvertisement.isPending ? <CircularProgress size={20} /> : null}
              >
                {updateAdvertisement.isPending ? 'Guardando...' : 'Guardar Cambios'}
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>

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

export default AdvertisementManager
