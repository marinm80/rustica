import { useState } from 'react'
import { useNavigate, useSearchParams, Navigate } from 'react-router-dom'
import { useAuth } from '../auth/useAuth.js'

export function LoginPage() {
  const { login, isAuthenticated, resolveRedirect } = useAuth()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (isAuthenticated) return <Navigate to={resolveRedirect()} replace />

  const expired = params.get('expired') === '1'

  async function handleSubmit(e) {
    e.preventDefault()
    if (!username.trim() || !password.trim()) {
      setError('Usuario y contraseña son obligatorios')
      return
    }
    setLoading(true)
    setError('')
    try {
      const { redirectTo } = await login(username, password)
      navigate(redirectTo, { replace: true })
    } catch (err) {
      setError(
        err.code === 'network_error'
          ? 'No fue posible conectar. Inténtalo de nuevo.'
          : 'Credenciales incorrectas. Verifica tu usuario y contraseña.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-stone-900 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white tracking-tight">Rústica</h1>
          <p className="text-stone-400 mt-1 text-sm">Panel operacional</p>
        </div>

        {expired && (
          <div role="alert" className="mb-4 flex items-start gap-2 text-sm text-amber-300 bg-amber-900/40 border border-amber-700/50 px-4 py-3 rounded-lg">
            <span aria-hidden="true">⚠</span>
            Tu sesión expiró. Por favor ingresa de nuevo.
          </div>
        )}

        {error && (
          <div role="alert" className="mb-4 flex items-start gap-2 text-sm text-red-300 bg-red-900/40 border border-red-700/50 px-4 py-3 rounded-lg">
            <span aria-hidden="true">✕</span>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label htmlFor="username" className="text-stone-300 text-sm font-medium">
              Usuario
            </label>
            <input
              id="username"
              type="text"
              autoComplete="username"
              autoCapitalize="none"
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="bg-white border border-stone-300 text-stone-900 placeholder-stone-400 rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition"
              placeholder="tu usuario de WordPress"
              aria-label="Usuario"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="password" className="text-stone-300 text-sm font-medium">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="bg-white border border-stone-300 text-stone-900 placeholder-stone-400 rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition"
              placeholder="••••••••"
              aria-label="Contraseña"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 bg-amber-600 hover:bg-amber-500 active:bg-amber-700 text-white font-semibold py-3 rounded-lg text-base transition disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-stone-900"
          >
            {loading ? 'Ingresando…' : 'Ingresar'}
          </button>
        </form>
      </div>
    </div>
  )
}
