'use client'

// React Imports
import { useState } from 'react'

// MUI Imports
import useMediaQuery from '@mui/material/useMediaQuery'
import { styled, useTheme } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import Checkbox from '@mui/material/Checkbox'
import Button from '@mui/material/Button'
import FormControlLabel from '@mui/material/FormControlLabel'
import Divider from '@mui/material/Divider'
import Alert from '@mui/material/Alert'

// Third-party Imports
import classnames from 'classnames'

// Type Imports
import type { SystemMode } from '@core/types'

// Component Imports
import Link from '@components/Link'
import Logo from '@components/layout/shared/Logo'
import CustomTextField from '@core/components/mui/TextField'

// Config Imports
import themeConfig from '@configs/themeConfig'

// Hook Imports
import { useImageVariant } from '@core/hooks/useImageVariant'
import { useSettings } from '@core/hooks/useSettings'
import { useAuth } from '@/hooks/useAuth'

// Styled Custom Components
const MaskImg = styled('img')(({ theme }) => ({
  blockSize: '100%',
  objectFit: 'cover',
  inlineSize: '100%',
  position: 'absolute',
  insetBlockEnd: 0,
  zIndex: -1,
  objectPosition: 'left center',
  [theme.breakpoints.down('lg')]: {
    objectPosition: 'left center'
  }
}))

const Logo2 = styled('img')(({ theme }) => ({
  width: '200px',
  height: 'auto',
  position: 'absolute',
  top: '-1%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  objectFit: 'contain',
  transition: 'all 0.3s ease',
  [theme.breakpoints.down(1200)]: {
    width: '350px',
    top: '-1%'
  },
  [theme.breakpoints.down(900)]: {
    width: '320px',
    top: '-1%'
  },
  '@media (max-height: 768px)': {
    width: '350px',
    top: '5%'
  },
  '@media (max-height: 600px)': {
    width: '320px',
    top: '2%'
  },
  [theme.breakpoints.down('sm')]: {
    width: '320px',
    top: '2%'
  }
}))

const LoginV2 = ({ mode }: { mode: SystemMode }) => {
  // States
  const [isPasswordShown, setIsPasswordShown] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)

  // Hook de autenticación
  const { login, isLoggingIn, loginError } = useAuth()

  // Vars
  const darkImg = '/images/illustrations/auth/fondo.jpg'
  const lightImg = '/images/illustrations/auth/fondo.jpg'
  const darkImgL = '/images/illustrations/auth/logo.png'
  const lightImgL = '/images/illustrations/auth/logo1.png'

  // Hooks

  const { settings } = useSettings()
  const theme = useTheme()
  const hidden = useMediaQuery(theme.breakpoints.down('md'))
  const authBackground = useImageVariant(mode, lightImg, darkImg)
  const logoImage = useImageVariant(mode, darkImgL, lightImgL)

  const handleClickShowPassword = () => setIsPasswordShown(show => !show)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email || !password) {
      return
    }

    login({
      email: email.trim(),
      password
    })
  }

  const getErrorMessage = () => {
    if (!loginError) return ''

    if (loginError instanceof Error) {
      return loginError.message
    }

    const axiosError = loginError as any

    if (axiosError?.response?.data?.message) {
      return axiosError.response.data.message
    }

    return 'Error al iniciar sesión. Verifica tus credenciales e inténtalo de nuevo.'
  }

  const isFormValid = email.trim() && password

  return (
    <div className='flex bs-full justify-center'>
      <div
        className={classnames(
          'flex bs-full items-center justify-center flex-1 min-bs-[100dvh] relative p-6 max-md:hidden overflow-hidden',
          {
            'border-ie': settings.skin === 'bordered'
          }
        )}
      >
        {!hidden && (
          <MaskImg
            alt='Fondo'
            src={authBackground}
            className={classnames({ 'scale-x-[-1]': theme.direction === 'rtl' })}
          />
        )}
      </div>
      <div className='flex justify-center items-center bs-full bg-backgroundPaper !min-is-full p-6 md:!min-is-[unset] md:p-12 md:is-[480px]'>
        <Link className='absolute block-start-5 sm:block-start-[33px] inline-start-6 sm:inline-start-[38px]'>
          <Logo />
        </Link>
        <div className='flex flex-col gap-6 is-full sm:is-auto md:is-full sm:max-is-[400px] md:max-is-[unset] mbs-11 sm:mbs-14 md:mbs-0 relative'>
          <Logo2 alt='Logo' src={logoImage} />
          <div className='flex flex-col gap-1 mt-24'>
            <Typography variant='h4'>{`¡Bienvenido a ${themeConfig.templateName}! 👋🏻`}</Typography>
            <Typography>Inicia sesión en tu cuenta para acceder al sistema de administración.</Typography>
          </div>

          {/* Mostrar error si existe */}
          {loginError && <Alert severity='error'>{getErrorMessage()}</Alert>}

          <form noValidate autoComplete='off' onSubmit={handleLogin} className='flex flex-col gap-5'>
            <CustomTextField
              autoFocus
              fullWidth
              label='Correo electrónico'
              placeholder='Ingresa tu correo electrónico'
              type='email'
              value={email}
              onChange={e => setEmail(e.target.value)}
              error={!!loginError}
              disabled={isLoggingIn}
              autoComplete='email'
            />
            <CustomTextField
              fullWidth
              label='Contraseña'
              placeholder='············'
              id='outlined-adornment-password'
              type={isPasswordShown ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              error={!!loginError}
              disabled={isLoggingIn}
              autoComplete='current-password'
              InputProps={{
                endAdornment: (
                  <InputAdornment position='end'>
                    <IconButton
                      edge='end'
                      onClick={handleClickShowPassword}
                      onMouseDown={e => e.preventDefault()}
                      disabled={isLoggingIn}
                    >
                      <i className={isPasswordShown ? 'tabler-eye-off' : 'tabler-eye'} />
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
            <div className='flex justify-between items-center gap-x-3 gap-y-1 flex-wrap'>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={rememberMe}
                    onChange={e => setRememberMe(e.target.checked)}
                    disabled={isLoggingIn}
                  />
                }
                label='Recordarme'
              />
              <Typography className='text-end' color='primary.main' component={Link}>
                ¿Olvidaste tu contraseña?
              </Typography>
            </div>
            <Button fullWidth variant='contained' type='submit' disabled={isLoggingIn || !isFormValid} size='large'>
              {isLoggingIn ? 'Iniciando sesión...' : 'Iniciar sesión'}
            </Button>
            <div className='flex justify-center items-center flex-wrap gap-2'>
              <Typography>¿Necesitas acceso?</Typography>
              <Typography component={Link} color='primary.main'>
                Contacta al administrador
              </Typography>
            </div>
            <Divider className='gap-2 text-textPrimary'>o</Divider>
            <div className='flex justify-center items-center gap-1.5'>
              <IconButton className='text-facebook' size='small' disabled={isLoggingIn}>
                <i className='tabler-brand-facebook-filled' />
              </IconButton>
              <IconButton className='text-twitter' size='small' disabled={isLoggingIn}>
                <i className='tabler-brand-twitter-filled' />
              </IconButton>
              <IconButton className='text-error' size='small' disabled={isLoggingIn}>
                <i className='tabler-brand-google-filled' />
              </IconButton>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default LoginV2
