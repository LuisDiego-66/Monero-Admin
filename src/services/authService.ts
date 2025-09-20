import axios from 'axios'
import Cookies from 'js-cookie'

export interface LoginCredentials {
  email: string
  password: string
}

export interface LoginResponse {
  token: string
}

class AuthService {
  private baseURL = process.env.NEXT_PUBLIC_API_URL

  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      const response = await axios.post(`${this.baseURL}/api/auth/login`, credentials, {
        headers: { 'Content-Type': 'application/json' }
      })

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

  isAuthenticated(): boolean {
    const token = this.getToken()

    return !!token
  }
}

export const authService = new AuthService()
