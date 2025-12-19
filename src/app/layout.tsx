// MUI Imports
import InitColorSchemeScript from '@mui/material/InitColorSchemeScript'

// Third-party Imports
import 'react-perfect-scrollbar/dist/css/styles.css'

// Type Imports
import type { ChildrenType } from '@core/types'

// Util Imports
import { getSystemMode } from '@core/utils/serverHelpers'

// Style Imports
import '@/app/globals.css'

// Generated Icon CSS Imports
import '@assets/iconify-icons/generated-icons.css'
import type { Locale } from '@/configs/i18n'
import AuthGuard from '@/components/AuthGuard'

export const metadata = {
  title: 'Monero Admin',
  description: 'Administrador - Monero'
}

const RootLayout = async (props: ChildrenType & { params?: Promise<{ lang?: Locale }> }) => {
  const { children } = props

  // Vars

  const systemMode = await getSystemMode()
  const direction = 'ltr'

  return (
    <html id='__next' lang='en' dir={direction} suppressHydrationWarning>
      <body className='flex is-full min-bs-full flex-auto flex-col'>
        <AuthGuard>
          <InitColorSchemeScript attribute='data' defaultMode={systemMode} />
          {children}
        </AuthGuard>
      </body>
    </html>
  )
}

export default RootLayout
