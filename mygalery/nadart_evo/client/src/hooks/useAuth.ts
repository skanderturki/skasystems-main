import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { authService } from '../services/authService'
import { useAuthStore } from '../stores/authStore'
import type { LoginCredentials } from '../types'

export function useLogin() {
  const navigate = useNavigate()
  const login = useAuthStore((state) => state.login)

  return useMutation({
    mutationFn: (credentials: LoginCredentials) => authService.login(credentials),
    onSuccess: (data) => {
      login(data.token, data.user)
      navigate('/admin')
    },
  })
}

export function useGoogleLogin() {
  const navigate = useNavigate()
  const login = useAuthStore((state) => state.login)

  return useMutation({
    mutationFn: (credential: string) => authService.googleLogin(credential),
    onSuccess: (data) => {
      login(data.token, data.user)
      navigate('/admin')
    },
  })
}

export function useLogout() {
  const navigate = useNavigate()
  const logout = useAuthStore((state) => state.logout)

  return useMutation({
    mutationFn: () => authService.logout(),
    onSuccess: () => {
      logout()
      navigate('/login')
    },
    onError: () => {
      // Even if logout fails on server, clear local state
      logout()
      navigate('/login')
    },
  })
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: (email: string) => authService.forgotPassword(email),
  })
}

export function useResetPassword() {
  return useMutation({
    mutationFn: ({ token, password }: { token: string; password: string }) =>
      authService.resetPassword(token, password),
  })
}

export function useChangePassword() {
  return useMutation({
    mutationFn: ({
      currentPassword,
      newPassword,
    }: {
      currentPassword: string
      newPassword: string
    }) => authService.changePassword(currentPassword, newPassword),
  })
}
