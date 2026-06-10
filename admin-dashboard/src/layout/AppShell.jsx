import { Outlet, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { useAuth } from '../auth/useAuth.js'
import { TopBar } from './TopBar.jsx'

export function AppShell() {
  const { logout } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    function handleUnauthorized() {
      logout()
      navigate('/login?expired=1')
    }
    window.addEventListener('rustica:unauthorized', handleUnauthorized)
    return () => window.removeEventListener('rustica:unauthorized', handleUnauthorized)
  }, [logout, navigate])

  return (
    <div className="min-h-screen bg-stone-100">
      <TopBar />
      <main className="p-4">
        <Outlet />
      </main>
    </div>
  )
}
