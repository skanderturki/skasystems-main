import api from './api'
import type { LoginCredentials, LoginResponse, User } from '../types'

export const authService = {
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>('/auth/login', credentials)
    return response.data
  },

  async googleLogin(credential: string): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>('/auth/google', { credential })
    return response.data
  },

  async logout(): Promise<void> {
    await api.post('/auth/logout')
  },

  async me(): Promise<User> {
    const response = await api.get<User>('/auth/me')
    return response.data
  },

  async forgotPassword(email: string): Promise<{ message: string }> {
    const response = await api.post<{ message: string }>('/auth/forgot-password', { email })
    return response.data
  },

  async resetPassword(token: string, password: string): Promise<{ message: string }> {
    const response = await api.post<{ message: string }>('/auth/reset-password', { token, password })
    return response.data
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<{ message: string }> {
    const response = await api.post<{ message: string }>('/auth/change-password', {
      currentPassword,
      newPassword,
    })
    return response.data
  },
}
