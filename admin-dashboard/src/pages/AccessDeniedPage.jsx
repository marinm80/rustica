import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/useAuth.js'

export function AccessDeniedPage() {
  const { logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-stone-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow text-center max-w-sm">
        <p className="text-stone-700 mb-6">
          Tu cuenta no tiene permisos operativos. Contacta al administrador.
        </p>
        <button
          onClick={handleLogout}
          className="bg-stone-800 text-white px-6 py-2 rounded hover:bg-stone-700"
          data-testid="btn-acceso-denegado-logout"
        >
          Cerrar sesión
        </button>
      </div>
    </div>
  )
}
