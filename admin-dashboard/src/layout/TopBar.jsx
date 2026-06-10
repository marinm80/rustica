import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/useAuth.js'

const ROLE_LABELS = {
  mesero: 'Mesero',
  cocina: 'Cocina',
  gerente: 'Gerente',
  administrator: 'Administrador',
}

export function TopBar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const role = user?.role ?? ''

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <header className="bg-stone-800 text-white px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <span className="font-semibold text-lg">Rústica</span>
        {user?.isManager && (
          <nav className="flex gap-3 text-sm">
            <Link to="/dashboard" className="hover:text-amber-300">Inicio</Link>
            <Link to="/comandas" className="hover:text-amber-300">Comandas</Link>
            <Link to="/cocina" className="hover:text-amber-300">Cocina</Link>
            <Link to="/reservas" className="hover:text-amber-300">Reservas</Link>
            <Link to="/facturacion" className="hover:text-amber-300">Facturación</Link>
            <Link to="/carta" className="hover:text-amber-300">Carta</Link>
          </nav>
        )}
      </div>
      <div className="flex items-center gap-3 text-sm">
        <span data-testid="topbar-name">{user?.displayName}</span>
        <span data-testid="topbar-role" className="text-stone-400">
          {ROLE_LABELS[role] ?? role}
        </span>
        <button
          onClick={handleLogout}
          className="bg-stone-600 hover:bg-stone-500 px-3 py-1 rounded text-sm"
          data-testid="btn-logout"
        >
          Cerrar sesión
        </button>
      </div>
    </header>
  )
}
