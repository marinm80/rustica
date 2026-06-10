import { useState, useEffect, useRef } from 'react'
import LoginScreen from '../components/LoginScreen'

const POLL_MS = 5000

const getApiUrl = () => {
  if (window.RusticaConfig?.apiUrl) return window.RusticaConfig.apiUrl
  const savedUrl = localStorage.getItem('rustica_api_url')
  return savedUrl ? `${savedUrl}/rustica/v1` : 'http://localhost:8080/wp-json/rustica/v1'
}

const getHeaders = (hasJsonBody = false) => {
  const headers = {}
  if (hasJsonBody) headers['Content-Type'] = 'application/json'
  if (window.RusticaConfig?.nonce) headers['X-WP-Nonce'] = window.RusticaConfig.nonce
  const token = localStorage.getItem('rustica_token')
  if (token) headers['Authorization'] = `Bearer ${token}`
  return headers
}

function formatMod(label, value) {
  if (!value) return null
  return (
    <span className="inline-flex items-center gap-1 text-[11px] bg-stone-100/80 border border-stone-300 text-stone-600 px-2 py-0.5 rounded-full">
      <span className="text-stone-400">{label}:</span> {value.replace(/-/g, ' ')}
    </span>
  )
}

function DetalleModal({ comanda, onClose, onListo }) {
  const tiempo = comanda.hora_envio
    ? Math.floor((Date.now() / 1000 - comanda.hora_envio) / 60) + ' min'
    : '—'

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[2000] p-4 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-stone-100 border border-stone-200 rounded-2xl w-full max-w-lg shadow-2xl flex flex-col max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-stone-200">
          <div>
            <h2 className="text-rustica-gold text-2xl font-bold font-serif">
              Mesa {comanda.mesa_numero}
            </h2>
            {comanda.cliente && (
              <p className="text-stone-500 text-sm mt-0.5">Cliente: {comanda.cliente}</p>
            )}
          </div>
          <div className="text-right">
            <span className="text-xs text-stone-400 bg-stone-50 border border-stone-200 px-3 py-1.5 rounded-full block">
              Hace {tiempo}
            </span>
            <span className="text-xs text-stone-400 mt-1 block">
              #{comanda.id}
            </span>
          </div>
        </div>

        {/* Items */}
        <div className="overflow-y-auto flex-1 p-5 space-y-4">
          {(comanda.items || []).map((item, i) => (
            <div key={i} className="bg-stone-50 rounded-xl p-4 border border-stone-200">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-rustica-light">
                  <span className="text-rustica-gold text-lg mr-2">{item.cantidad}×</span>
                  {item.nombre}
                </span>
              </div>

              {/* Modificadores */}
              {(item.modificadores && Object.keys(item.modificadores).length > 0) && (
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {formatMod('Término', item.modificadores.termino)}
                  {formatMod('Acomp.', item.modificadores.acompanamiento)}
                  {formatMod('Tamaño', item.modificadores.tamano)}
                  {formatMod('Hielo', item.modificadores.hielo)}
                  {formatMod('Gas', item.modificadores.gas)}
                </div>
              )}

              {item.notas && (
                <div className="text-stone-500 text-xs italic bg-stone-100/60 rounded-lg px-3 py-2 border border-stone-200">
                  "{item.notas}"
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-stone-200 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 bg-transparent border border-stone-300 hover:border-stone-400 text-stone-600 rounded-xl font-semibold text-sm transition-all"
          >
            Cerrar
          </button>
          <button
            onClick={() => { onListo(comanda.id); onClose() }}
            className="flex-[2] py-2.5 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold text-sm rounded-xl shadow-lg transition-all"
          >
            Marcar Listo
          </button>
        </div>
      </div>
    </div>
  )
}

function ComandaCard({ comanda, esNueva, onListo }) {
  const tiempoTranscurrido = comanda.hora_envio
    ? Math.floor((Date.now() / 1000 - comanda.hora_envio) / 60)
    : 0

  const urgente = tiempoTranscurrido >= 15

  return (
    <div
      className={`rounded-2xl border-l-4 shadow-xl transition-all duration-300 overflow-hidden ${
        esNueva
          ? 'border-emerald-400 ring-2 ring-emerald-400/30 animate-pulse'
          : urgente
            ? 'border-rose-500 ring-1 ring-rose-400/20'
            : 'border-rustica-gold'
      } bg-rustica-card`}
    >
      {/* Header */}
      <div className="flex justify-between items-center px-5 pt-4 pb-3 border-b border-stone-700/40">
        <div>
          <h3 className="text-rustica-gold font-bold text-2xl font-serif leading-tight">
            Mesa {comanda.mesa_numero}
          </h3>
          {comanda.cliente && (
            <p className="text-stone-400 text-xs mt-0.5">👤 {comanda.cliente}</p>
          )}
        </div>
        <div className="text-right">
          <span className={`text-xs font-bold px-2.5 py-1 rounded-full border block ${
            urgente
              ? 'bg-rose-900/40 border-rose-500/50 text-rose-400'
              : 'bg-stone-700/50 border-stone-600 text-stone-300'
          }`}>
            {tiempoTranscurrido === 0 ? 'Justo ahora' : `Hace ${tiempoTranscurrido} min`}
          </span>
          <span className="text-[10px] text-stone-600 mt-1 block">#{comanda.id}</span>
        </div>
      </div>

      {/* Ítems del pedido */}
      <div className="px-4 py-3 space-y-3">
        {(comanda.items || []).length === 0 ? (
          <p className="text-stone-500 text-sm italic text-center py-2">Sin ítems registrados</p>
        ) : (
          (comanda.items || []).map((item, i) => (
            <div key={i} className="bg-stone-800/50 rounded-xl px-4 py-3 border border-stone-700/50">
              {/* Cantidad + nombre */}
              <div className="flex items-baseline gap-2 mb-1.5">
                <span className="text-rustica-gold font-black text-xl leading-none">{item.cantidad}×</span>
                <span className="text-rustica-light font-bold text-base leading-tight">{item.nombre}</span>
              </div>

              {/* Modificadores como badges */}
              {item.modificadores && Object.values(item.modificadores).some(Boolean) && (
                <div className="flex flex-wrap gap-1.5 mb-1.5 ml-7">
                  {item.modificadores.termino && (
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-amber-900/50 border border-amber-700/50 text-amber-300 uppercase tracking-wide">
                      {item.modificadores.termino.replace(/-/g, ' ')}
                    </span>
                  )}
                  {item.modificadores.acompanamiento && (
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-stone-700/60 border border-stone-600 text-stone-300">
                      Acomp: {item.modificadores.acompanamiento.replace(/-/g, ' ')}
                    </span>
                  )}
                  {item.modificadores.tamano && (
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-blue-900/40 border border-blue-700/40 text-blue-300">
                      {item.modificadores.tamano.replace(/-/g, ' ')}
                    </span>
                  )}
                  {item.modificadores.hielo && (
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-stone-700/60 border border-stone-600 text-stone-300">
                      {item.modificadores.hielo.replace(/-/g, ' ')}
                    </span>
                  )}
                  {item.modificadores.gas && (
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-stone-700/60 border border-stone-600 text-stone-300">
                      {item.modificadores.gas.replace(/-/g, ' ')}
                    </span>
                  )}
                </div>
              )}

              {/* Notas */}
              {item.notas && (
                <div className="ml-7 mt-1 text-xs text-amber-400/80 italic bg-amber-950/30 border border-amber-800/30 rounded-lg px-3 py-1.5">
                  ⚠ {item.notas}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Acción */}
      <div className="px-4 pb-4">
        <button
          onClick={() => onListo(comanda.id)}
          className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold text-sm rounded-xl shadow-lg transition-all duration-200"
        >
          ✓ Marcar Listo
        </button>
      </div>
    </div>
  )
}

export default function CocinaApp() {
  const [authTrigger, setAuthTrigger] = useState(0)
  const isEmbedded    = !!window.RusticaConfig
  const isLoggedHeadless = !isEmbedded && !!localStorage.getItem('rustica_token')

  const [comandas, setComandas]     = useState([])
  const [lastPoll, setLastPoll]     = useState(null)
  const [nuevasIds, setNuevasIds]   = useState([])
  const [detalle, setDetalle]       = useState(null)
  const prevIds = useRef(new Set())

  const API = getApiUrl()

  useEffect(() => {
    if (!isEmbedded && !isLoggedHeadless) return

    const poll = async () => {
      try {
        const res  = await fetch(`${API}/cocina/comandas-activas`, { headers: getHeaders() })
        if (res.status === 401 && !isEmbedded) { handleLogout(); return }

        const data = await res.json()
        const currIds = new Set((data.comandas || []).map(c => c.id))
        const nuevas  = [...currIds].filter(id => !prevIds.current.has(id))

        if (nuevas.length > 0) {
          setNuevasIds(nuevas)
          new Audio('/wp-content/plugins/rustica-system/assets/ping.mp3').play().catch(() => {})
          setTimeout(() => setNuevasIds([]), 4000)
        }

        prevIds.current = currIds
        setComandas(data.comandas || [])
        setLastPoll(new Date().toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit', second: '2-digit' }))
      } catch {}
    }

    poll()
    const interval = setInterval(poll, POLL_MS)
    return () => clearInterval(interval)
  }, [authTrigger, API])

  const marcarListo = async (cmdId) => {
    await fetch(`${API}/cocina/marcar-listo`, {
      method:  'POST',
      headers: getHeaders(true),
      body:    JSON.stringify({ comanda_id: cmdId }),
    })
    setComandas(prev => prev.filter(c => c.id !== cmdId))
    if (detalle?.id === cmdId) setDetalle(null)
  }

  const handleLogout = () => {
    ['rustica_token','rustica_api_url','rustica_user_role','rustica_es_gerente','rustica_is_staff','rustica_user_display_name'].forEach(k => localStorage.removeItem(k))
    setAuthTrigger(prev => prev + 1)
  }

  if (!isEmbedded && !isLoggedHeadless) {
    return <LoginScreen onLoginSuccess={() => setAuthTrigger(prev => prev + 1)} />
  }

  const userDisplayName = localStorage.getItem('rustica_user_display_name') || 'Usuario Cocina'

  return (
    <div className="min-h-screen bg-rustica-dark text-rustica-light p-6 font-sans antialiased">
      <header className="flex flex-col sm:flex-row justify-between items-center mb-6 pb-4 border-b-2 border-rustica-gold/45 gap-4">
        <div>
          <h1 className="font-serif text-3xl text-rustica-gold font-bold tracking-tight">
            Cocina — La Rustica Terrazza
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Panel de control de comandas en tiempo real (KDS)
            {!isEmbedded && <span className="text-rustica-gold"> · {userDisplayName}</span>}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs bg-stone-50 border border-stone-200 text-stone-500 px-3.5 py-1.5 rounded-full font-medium shadow-none">
            Última actualización: {lastPoll || '—'}
          </span>
          <span className="text-xs bg-rustica-gold/15 border border-rustica-gold/30 text-rustica-gold px-3.5 py-1.5 rounded-full font-bold shadow-none">
            {comandas.length} comanda(s) pendiente(s)
          </span>
          {!isEmbedded && (
            <button
              onClick={handleLogout}
              className="py-1.5 px-3 bg-rose-100/60 border border-rose-200/60 hover:bg-rose-200/60 text-rose-600 text-xs font-bold rounded-lg transition-all"
            >
              Cerrar Sesión
            </button>
          )}
        </div>
      </header>

      {comandas.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-stone-400">
          <p className="text-5xl mb-4">🍳</p>
          <h3 className="text-lg font-bold text-stone-500">Sin comandas pendientes</h3>
          <p className="text-xs max-w-xs text-center mt-1">Los pedidos de los meseros aparecerán automáticamente con sonido de alerta.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {comandas.map(cmd => (
            <ComandaCard
              key={cmd.id}
              comanda={cmd}
              esNueva={nuevasIds.includes(cmd.id)}
              onListo={marcarListo}
              onAbrir={() => setDetalle(cmd)}
            />
          ))}
        </div>
      )}

      {detalle && (
        <DetalleModal
          comanda={detalle}
          onClose={() => setDetalle(null)}
          onListo={marcarListo}
        />
      )}
    </div>
  )
}
