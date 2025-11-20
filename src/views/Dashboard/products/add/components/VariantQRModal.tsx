'use client'

import { useRef } from 'react'

import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { QRCodeSVG } from 'qrcode.react'

interface VariantQRModalProps {
  open: boolean
  onClose: () => void
  variantId: number
  colorName: string
  sizeName: string
}

const VariantQRModal = ({ open, onClose, variantId, colorName, sizeName }: VariantQRModalProps) => {
  const qrRef = useRef<HTMLDivElement>(null)

  const qrValue = `<qr>${variantId}</qr>`

  const handleDownloadQR = () => {
    const svg = qrRef.current?.querySelector('svg')

    if (!svg) return

    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    if (!ctx) return

    const svgData = new XMLSerializer().serializeToString(svg)
    const img = new Image()

    canvas.width = 512
    canvas.height = 512

    img.onload = () => {
      ctx.fillStyle = 'white'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

      canvas.toBlob(blob => {
        if (blob) {
          const url = URL.createObjectURL(blob)
          const link = document.createElement('a')

          link.href = url
          link.download = `variante-${variantId}-qr.png`
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          URL.revokeObjectURL(url)
        }
      })
    }

    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)))
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth='sm' fullWidth>
      <DialogTitle>Código QR de Variante</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, py: 2 }}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant='h6' color='text.primary'>
              {colorName}
            </Typography>
            <Typography variant='subtitle2' color='text.secondary'>
              Talla: {sizeName}
            </Typography>
          </Box>

          <Box
            ref={qrRef}
            sx={{
              p: 3,
              bgcolor: 'white',
              borderRadius: 2,
              boxShadow: 2,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center'
            }}
          >
            <QRCodeSVG value={qrValue} size={256} level='M' includeMargin={true} />
          </Box>

          <Box sx={{ textAlign: 'center' }}>
            <Typography variant='caption' color='text.secondary' sx={{ mt: 1, display: 'block' }}>
              ID de Variante: {variantId}
            </Typography>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color='secondary'>
          Cerrar
        </Button>
        <Button
          onClick={handleDownloadQR}
          color='primary'
          variant='contained'
          startIcon={<i className='tabler-download' />}
        >
          Descargar QR
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default VariantQRModal
