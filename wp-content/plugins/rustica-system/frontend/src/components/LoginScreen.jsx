import { useState } from 'react'

export default function LoginScreen({ onLoginSuccess }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [apiUrl, setApiUrl]     = useState(localStorage.getItem('rustica_api_url') || 'http://localhost:8080/wp-json')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState(null)

  const handleLogin = async (e) => {
    e.preventDefault()
    if (!username.trim() || !password.trim() || !apiUrl.trim()) return

    setLoading(true)
    setError(null)

    // Normalizar la URL de la API: remover barras diagonales finales
    const cleanApiUrl = apiUrl.trim().replace(/\/+$/, '')

    try {
      const res = await fetch(`${cleanApiUrl}/jwt-auth/v1/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      })

      const data = await res.json()

      if (res.ok && data.token) {
        localStorage.setItem('rustica_token', data.token)
        localStorage.setItem('rustica_api_url', cleanApiUrl)
        localStorage.setItem('rustica_user_display_name', data.user_display_name || username)
        
        // Cargar detalles de rol llamando al endpoint /auth/me que creamos
        const resMe = await fetch(`${cleanApiUrl}/rustica/v1/auth/me`, {
          headers: { 'Authorization': `Bearer ${data.token}` }
        })
        
        if (resMe.ok) {
          const userMe = await resMe.json()
          localStorage.setItem('rustica_user_role', userMe.user_role)
          localStorage.setItem('rustica_es_gerente', userMe.es_gerente ? '1' : '0')
          localStorage.setItem('rustica_is_staff', userMe.is_staff ? '1' : '0')
        } else {
          // Valores por defecto
          localStorage.setItem('rustica_user_role', 'mesero')
          localStorage.setItem('rustica_es_gerente', '0')
          localStorage.setItem('rustica_is_staff', '1')
        }

        onLoginSuccess()
      } else {
        setError(data.message || 'Credenciales inválidas. Verifica tu usuario y contraseña.')
      }
    } catch (err) {
      setError('Error al conectar con la API de WordPress. Asegúrate de que WordPress esté corriendo y de ingresar la URL correcta.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-stone-100 flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-[420px] bg-stone-50 border border-stone-200 p-8 rounded-2xl shadow-2xl">
        <div className="text-center mb-8">
          <span className="text-4xl">🍽️</span>
          <h2 className="font-serif text-3xl text-rustica-gold font-bold tracking-tight mt-3">
            La Rustica Terrazza
          </h2>
          <p className="text-xs text-stone-500 mt-1.5 uppercase tracking-wider font-bold">
            Portal de Personal
          </p>
        </div>

        {error && (
          <div className="p-3 mb-5 text-xs font-semibold bg-rose-950/40 border border-rose-200/60 text-rose-600 rounded-lg">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-[10px] uppercase font-bold tracking-wider text-stone-500 mb-1.5">Usuario de WordPress</label>
            <input
              type="text"
              required
              placeholder="Ej. mesero_juan o admin"
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="w-full px-4 py-2.5 bg-stone-100 text-rustica-light border border-stone-200 rounded-lg text-sm focus:outline-none focus:border-rustica-gold transition-colors"
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold tracking-wider text-stone-500 mb-1.5">Contraseña</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 bg-stone-100 text-rustica-light border border-stone-200 rounded-lg text-sm focus:outline-none focus:border-rustica-gold transition-colors"
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold tracking-wider text-stone-500 mb-1.5">Servidor REST API WordPress</label>
            <input
              type="url"
              required
              placeholder="Ej. http://localhost:8080/wp-json"
              value={apiUrl}
              onChange={e => setApiUrl(e.target.value)}
              className="w-full px-4 py-2.5 bg-stone-100 text-stone-500 text-xs border border-stone-200 rounded-lg focus:outline-none focus:border-rustica-gold transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-rustica-gold hover:bg-yellow-600 text-neutral-900 rounded-xl font-bold text-sm shadow-lg shadow-rustica-gold/10 hover:shadow-rustica-gold/20 transition-all duration-200 mt-6"
          >
            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>
        </form>

        <p className="text-center text-[10px] text-stone-400 mt-8 leading-relaxed">
          Este portal requiere credenciales del sistema.<br />
          Las peticiones están encriptadas y aseguradas mediante JWT.
        </p>
      </div>
    </div>
  )
}
