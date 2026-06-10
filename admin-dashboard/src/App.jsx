import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './auth/useAuth.js'
import { ProtectedRoute } from './routes/ProtectedRoute.jsx'
import { RoleRoute } from './routes/RoleRoute.jsx'
import { AppShell } from './layout/AppShell.jsx'
import { LoginPage } from './pages/LoginPage.jsx'
import { DashboardPage } from './pages/DashboardPage.jsx'
import { ComandasPage } from './pages/ComandasPage.jsx'
import { CocinaPage } from './pages/CocinaPage.jsx'
import { ReservasPage } from './pages/ReservasPage.jsx'
import { FacturacionPage } from './pages/FacturacionPage.jsx'
import { CartaPage } from './pages/CartaPage.jsx'
import { AccessDeniedPage } from './pages/AccessDeniedPage.jsx'

function RootRedirect() {
  const { isAuthenticated, resolveRedirect } = useAuth()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return <Navigate to={resolveRedirect()} replace />
}

export function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<AppShell />}>
          <Route path="/dashboard" element={
            <RoleRoute allow={['gerente']}><DashboardPage /></RoleRoute>
          } />
          <Route path="/comandas" element={
            <RoleRoute allow={['mesero', 'gerente']}><ComandasPage /></RoleRoute>
          } />
          <Route path="/cocina" element={
            <RoleRoute allow={['cocina', 'gerente']}><CocinaPage /></RoleRoute>
          } />
          <Route path="/reservas" element={
            <RoleRoute allow={['gerente']}><ReservasPage /></RoleRoute>
          } />
          <Route path="/facturacion" element={
            <RoleRoute allow={['gerente']}><FacturacionPage /></RoleRoute>
          } />
          <Route path="/carta" element={
            <RoleRoute allow={['gerente']}><CartaPage /></RoleRoute>
          } />
          <Route path="/acceso-denegado" element={<AccessDeniedPage />} />
        </Route>
      </Route>
      <Route path="/" element={<RootRedirect />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
