import { ReactNode, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'
import LoadingSpinner from '../ui/LoadingSpinner'

interface ProtectedRouteProps {
  children: ReactNode
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const navigate = useNavigate()
  const { isAuthenticated, checkAuth } = useAuthStore()

  useEffect(() => {
    if (!checkAuth()) {
      navigate('/login', { replace: true })
    }
  }, [checkAuth, navigate])

  if (!isAuthenticated) {
    return <LoadingSpinner fullScreen />
  }

  return <>{children}</>
}
