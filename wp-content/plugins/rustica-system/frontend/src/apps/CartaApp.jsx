import { useState, useEffect } from 'react'
import LoginScreen from '../components/LoginScreen'

const getApiUrl = () => {
  if (window.RusticaConfig?.apiUrl) return window.RusticaConfig.apiUrl
  const saved = localStorage.getItem('rustica_api_url')
  return saved ? `${saved}/rustica/v1` : 'http://localhost:8080/wp-json/rustica/v1'
}

const getHeaders = (json = false) => {
  const h = {}
  if (json) h['Content-Type'] = 'application/json'
  if (window.RusticaConfig?.nonce) h['X-WP-Nonce'] = window.RusticaConfig.nonce
  const t = localStorage.getItem('rustica_token')
  if (t) h['Authorization'] = `Bearer ${t}`
  return h
}

const CAT_ICON = { desayunos: '🌅', almuerzos: '🍱', cenas: '🍽️', bebidas: '🥤' }
const fmt = n => `$${Math.round(n).toLocaleString('es-CO')}`

export default function CartaApp() {
  const [authTrigger, setAuthTrigger] = useState(0)
  const isEmbedded     = !!window.RusticaConfig
  const isLogged       = !isEmbedded && !!localStorage.getItem('rustica_token')
  const esGerente      = isEmbedded
    ? window.RusticaConfig?.es_gerente
    : localStorage.getItem('rustica_es_gerente') === '1'

  const [productos,  setProductos]  = useState([])
  const [loading,    setLoading]    = useState(false)
  const [toggling,   setToggling]   = useState(null)   // producto_id en proceso
  const [filtro,     setFiltro]     = useState('')
  const [catActiva,  setCatActiva]  = useState('todas')
  const [msg,        setMsg]        = useState(null)   // { tipo: 'ok'|'err', texto }

  const API = getApiUrl()

  const cargar = async () => {
    setLoading(true)
    try {
      const res  = await fetch(`${API}/productos`, { headers: getHeaders() })
      const data = await res.json()
      setProductos(data.productos || [])
    } catch { setProductos([]) }
    setLoading(false)
  }

  useEffect(() => {
    if (!isEmbedded && !isLogged) return
    cargar()
  }, [authTrigger])

  const toggleDisponible = async (producto) => {
    if (!esGerente) return
    setToggling(producto.id)
    setMsg(null)
    try {
      const res  = await fetch(`${API}/producto/disponibilidad`, {
        method:  'POST',
        headers: getHeaders(true),
        body:    JSON.stringify({ producto_id: producto.id, disponible: !producto.disponible }),
      })
      const data = await res.json()
      if (data.ok) {
        setProductos(prev => prev.map(p =>
          p.id === producto.id ? { ...p, disponible: !p.disponible } : p
        ))
        setMsg({ tipo: 'ok', texto: `"${producto.nombre}" ${!producto.disponible ? 'activado' : 'marcado como agotado'}` })
        setTimeout(() => setMsg(null), 3000)
      }
    } catch { setMsg({ tipo: 'err', texto: 'Error de red' }) }
    setToggling(null)
  }

  if (!isEmbedded && !isLogged) {
    return <LoginScreen onLoginSuccess={() => setAuthTrigger(p => p + 1)} />
  }

  const categorias = ['todas', ...new Set(productos.map(p => p.cat_slug))]

  const filtrados = productos.filter(p => {
    const matchCat  = catActiva === 'todas' || p.cat_slug === catActiva
    const matchText = !filtro || p.nombre.toLowerCase().includes(filtro.toLowerCase())
    return matchCat && matchText
  })

  const agotados    = filtrados.filter(p => !p.disponible).length
  const disponibles = filtrados.filter(p => p.disponible).length

  return (
    <div className="min-h-screen bg-stone-50 font-sans antialiased">
      {/* Header */}
      <div className="bg-stone-900 px-6 py-5">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
          <div>
            <h1 className="text-white text-2xl font-bold font-serif">Gestión de Carta</h1>
            <p className="text-stone-400 text-xs mt-0.5">Activa o desactiva productos del menú en tiempo real</p>
          </div>
          <div className="flex items-center gap-3">
            {disponibles > 0 && (
              <span className="text-xs bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 px-3 py-1 rounded-full font-bold">
                {disponibles} disponibles
              </span>
            )}
            {agotados > 0 && (
              <span className="text-xs bg-rose-600/30 border border-rose-500/40 text-rose-300 px-3 py-1 rounded-full font-bold">
                {agotados} agotados
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-5">
        {/* Aviso si no es gerente */}
        {!esGerente && (
          <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-700 text-sm font-semibold">
            Solo el gerente puede modificar la disponibilidad de productos.
          </div>
        )}

        {/* Toast */}
        {msg && (
          <div className={`mb-4 px-4 py-3 rounded-xl text-sm font-semibold ${msg.tipo === 'ok' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
            {msg.texto}
          </div>
        )}

        {/* Buscador */}
        <input
          type="text"
          placeholder="Buscar producto…"
          value={filtro}
          onChange={e => setFiltro(e.target.value)}
          className="w-full px-4 py-3 bg-white border border-stone-300 rounded-xl text-sm font-medium focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100 transition mb-3"
        />

        {/* Chips de categoría */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
          {categorias.map(cat => (
            <button
              key={cat}
              onClick={() => setCatActiva(cat)}
              className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-bold border transition-all ${
                catActiva === cat
                  ? 'bg-stone-900 text-white border-stone-900'
                  : 'bg-white text-stone-600 border-stone-300 hover:border-stone-500'
              }`}
            >
              {cat === 'todas' ? 'Todas' : `${CAT_ICON[cat] ?? '🍴'} ${cat.charAt(0).toUpperCase() + cat.slice(1)}`}
            </button>
          ))}
        </div>

        {/* Lista */}
        {loading ? (
          <div className="flex items-center justify-center py-16 text-stone-400 text-sm">Cargando carta…</div>
        ) : (
          <div className="space-y-2">
            {filtrados.map(p => (
              <div
                key={p.id}
                className={`bg-white rounded-xl border px-4 py-3.5 flex items-center gap-4 transition-all ${
                  p.disponible ? 'border-stone-200' : 'border-rose-200 bg-rose-50/40 opacity-75'
                }`}
              >
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className={`font-semibold text-sm truncate ${p.disponible ? 'text-stone-800' : 'text-stone-400 line-through'}`}>
                      {p.nombre}
                    </p>
                    {!p.disponible && (
                      <span className="shrink-0 text-[10px] font-bold bg-rose-100 text-rose-600 border border-rose-200 px-1.5 py-0.5 rounded-full">86</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-stone-400">{CAT_ICON[p.cat_slug] ?? '🍴'} {p.categoria}</span>
                    <span className="text-xs font-bold text-amber-700">{fmt(p.precio)}</span>
                  </div>
                </div>

                {/* Toggle */}
                {esGerente && (
                  <button
                    onClick={() => toggleDisponible(p)}
                    disabled={toggling === p.id}
                    className={`shrink-0 relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      p.disponible ? 'bg-emerald-500' : 'bg-rose-400'
                    } disabled:opacity-60`}
                  >
                    <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${p.disponible ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                )}
              </div>
            ))}

            {filtrados.length === 0 && !loading && (
              <div className="text-center py-12 text-stone-400 text-sm">
                <p className="text-3xl mb-2">🔍</p>
                No hay productos que coincidan con la búsqueda.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
