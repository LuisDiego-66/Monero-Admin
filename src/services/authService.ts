import axios from 'axios'
import Cookies from 'js-cookie'

export interface LoginCredentials {
  email: string
  password: string
}

export interface LoginResponse {
  token: string
  email?: string
}

class AuthService {
  private baseURL = process.env.NEXT_PUBLIC_API_URL

  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      const response = await axios.post(`${this.baseURL}/api/auth/login`, credentials, {
        headers: { 'Content-Type': 'application/json' }
      })

      // Guardar email si viene en la respuesta
      if (response.data.email) {
        this.setUserEmail(response.data.email)
      }

      return response.data
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message)
      }

      throw new Error('Error de conexión. Inténtalo de nuevo.')
    }
  }

  async logout(): Promise<void> {
    this.removeToken()
    this.removeUserEmail()
  }

  setToken(token: string) {
    Cookies.set('auth-token', token, {
      expires: 7,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    })
  }

  getToken(): string | null {
    return Cookies.get('auth-token') || null
  }

  removeToken() {
    Cookies.remove('auth-token')
  }

  setUserEmail(email: string) {
    Cookies.set('user-email', email, {
      expires: 7,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    })
  }

  getUserEmail(): string | null {
    return Cookies.get('user-email') || null
  }

  removeUserEmail() {
    Cookies.remove('user-email')
  }

  isAuthenticated(): boolean {
    const token = this.getToken()

    return !!token
  }
}

export const authService = new AuthService()
