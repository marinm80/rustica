import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../auth/useAuth.js'

export function RoleRoute({ allow = [], children }) {
  const { user } = useAuth()

  if (!user?.isStaff) return <Navigate to="/acceso-denegado" replace />

  const isAllowed =
    (user.isManager && allow.includes('gerente')) ||
    allow.includes(user.role)

  if (!isAllowed) return <Navigate to={getRedirect(user)} replace />

  // Soporta uso como layout route (<Route element={<RoleRoute />}>) y como wrapper directo (<RoleRoute><Child/></RoleRoute>)
  return children ?? <Outlet />
}

function getRedirect(user) {
  if (user.isManager) return '/dashboard'
  if (user.role === 'mesero') return '/comandas'
  if (user.role === 'cocina') return '/cocina'
  return '/acceso-denegado'
}
