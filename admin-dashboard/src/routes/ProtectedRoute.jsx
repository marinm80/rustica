import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../auth/useAuth.js'

export function ProtectedRoute() {
  const { status, isAuthenticated } = useAuth()
  if (status === 'loading') return null
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return <Outlet />
}
