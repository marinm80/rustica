import { useState, useEffect, useRef } from 'react'
import LoginScreen from '../components/LoginScreen'

const POLL_MS = 6000
const IVA = 0.19

const getApiUrl = () => {
  if (window.RusticaConfig?.apiUrl) return window.RusticaConfig.apiUrl
  const savedUrl = localStorage.getItem('rustica_api_url')
  return savedUrl ? `${savedUrl}/rustica/v1` : 'http://localhost:8080/wp-json/rustica/v1'
}

const getHeaders = (json = false) => {
  const h = {}
  if (json) h['Content-Type'] = 'application/json'
  if (window.RusticaConfig?.nonce) h['X-WP-Nonce'] = window.RusticaConfig.nonce
  const t = localStorage.getItem('rustica_token')
  if (t) h['Authorization'] = `Bearer ${t}`
  return h
}

const fmt = (n) => `$${Number(n).toLocaleString('es-CO', { minimumFractionDigits: 0 })}`

const fmtHora = (ts) => {
  if (!ts) return '—'
  return new Date(ts * 1000).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })
}

const ESTADO_META = {
  abierta:           { icon: '🪑', label: 'Leyendo carta',   border: 'border-l-blue-400',   badge: 'bg-blue-50 text-blue-700 border-blue-200',     card: 'border-blue-200' },
  en_cocina:         { icon: '🍳', label: 'En cocina',       border: 'border-l-orange-400', badge: 'bg-orange-50 text-orange-700 border-orange-200', card: 'border-orange-200' },
  listo:             { icon: '🍽', label: 'Listo — servir',  border: 'border-l-teal-400',   badge: 'bg-teal-50 text-teal-700 border-teal-200',     card: 'border-teal-200' },
  cuenta_solicitada: { icon: '💳', label: 'Solicita cuenta', border: 'border-l-purple-400', badge: 'bg-purple-50 text-purple-700 border-purple-200', card: 'border-purple-200' },
}

// ── Modal de Facturación ───────────────────────────────────────────────────────
function FacturaModal({ comanda, onClose, onEmitida, onEliminada }) {
  const [metodo, setMetodo]         = useState('efectivo')
  const [propina, setPropina]       = useState(0)
  const [emitiendo, setEmitiendo]   = useState(false)
  const [eliminando, setEliminando] = useState(false)
  const [factura, setFactura]       = useState(null)
  const [error, setError]           = useState('')
  // Split bill
  const [dividiendo, setDividiendo] = useState(false)
  const [nPartes, setNPartes]       = useState(2)
  const [partes, setPartes]         = useState([])
  const printRef = useRef()

  const API   = getApiUrl()
  const base  = comanda.total
  const iva   = base * IVA
  const total = base + iva + propina

  // Facturación disponible desde cualquier estado — el cajero decide cuándo cobrar
  const esCuentaSolicitada = comanda.estado === 'cuenta_solicitada'

  // Inicializar partes al activar el modo split
  function activarDividir() {
    setPartes(Array.from({ length: nPartes }, (_, i) => ({ id: i, metodo: 'efectivo', pagada: false })))
    setDividiendo(true)
  }

  function ajustarPartes(n) {
    setNPartes(n)
    setPartes(Array.from({ length: n }, (_, i) => ({ id: i, metodo: 'efectivo', pagada: false })))
  }

  function toggleParte(idx) {
    setPartes(prev => prev.map((p, i) => i === idx ? { ...p, pagada: !p.pagada } : p))
  }

  function setMetodoParte(idx, m) {
    setPartes(prev => prev.map((p, i) => i === idx ? { ...p, metodo: m } : p))
  }

  const todasPagadas    = partes.length > 0 && partes.every(p => p.pagada)
  const montoPorParte   = Math.ceil(total / nPartes)
  const metodoPrincipal = partes.filter(p => p.pagada).reduce((acc, p) => {
    acc[p.metodo] = (acc[p.metodo] || 0) + 1; return acc
  }, {})
  const metodoFinal = Object.entries(metodoPrincipal).sort((a, b) => b[1] - a[1])[0]?.[0] || 'efectivo'

  async function emitir(metodoOverride) {
    setEmitiendo(true)
    setError('')
    try {
      const res  = await fetch(`${API}/facturacion/emitir`, {
        method:  'POST',
        headers: getHeaders(true),
        body:    JSON.stringify({ comanda_id: comanda.id, metodo_pago: metodoOverride ?? metodo, propina }),
      })
      const data = await res.json()
      if (data.ok) {
        setFactura({ ...data, _partes: dividiendo ? partes : null })
        onEmitida(comanda.id)
      } else {
        setError(data.message || 'Error al emitir factura')
      }
    } catch {
      setError('Error de red')
    }
    setEmitiendo(false)
  }

  async function cancelarComanda() {
    const aviso = comanda.estado === 'en_cocina'
      ? ' (el pedido ya está en cocina)'
      : comanda.estado === 'listo'
        ? ' (el pedido ya está listo para servir)'
        : ''
    if (!window.confirm(`¿Cancelar la comanda de Mesa ${comanda.mesa_numero}${aviso}?\nLa mesa quedará libre.`)) return
    setEliminando(true)
    setError('')
    try {
      const res  = await fetch(`${API}/comanda/eliminar`, {
        method:  'POST',
        headers: getHeaders(true),
        body:    JSON.stringify({ comanda_id: comanda.id }),
      })
      const data = await res.json()
      if (data.ok) {
        onEliminada(comanda.id)
      } else {
        setError(data.message || 'Error al cancelar la comanda')
      }
    } catch {
      setError('Error de red')
    }
    setEliminando(false)
  }

  function imprimir() {
    const win = window.open('', '_blank', 'width=400,height=700')
    win.document.write(`
      <html><head><title>Factura ${factura.num_factura}</title>
      <style>
        body { font-family: 'Courier New', monospace; font-size: 12px; padding: 16px; }
        h1 { font-size: 16px; text-align: center; } h2 { font-size: 13px; }
        table { width: 100%; border-collapse: collapse; }
        td { padding: 2px 4px; }
        .right { text-align: right; }
        .bold { font-weight: bold; }
        .line { border-top: 1px dashed #000; margin: 6px 0; }
        .center { text-align: center; }
      </style></head><body>
      <h1>La Rústica Terrazza</h1>
      <div class="center">Factura N° ${factura.num_factura}</div>
      <div class="center">${new Date().toLocaleString('es-CO')}</div>
      <div class="line"></div>
      <div>Mesa: ${comanda.mesa_numero} &nbsp; Cliente: ${comanda.cliente || '—'}</div>
      <div class="line"></div>
      <table>
        <tr><td><b>Producto</b></td><td class="right"><b>Cant</b></td><td class="right"><b>Subtotal</b></td></tr>
        ${(comanda.items || []).map(it => `
          <tr><td>${it.nombre}</td><td class="right">${it.cantidad}</td><td class="right">${fmt(it.subtotal)}</td></tr>
          ${it.modificadores?.termino ? `<tr><td colspan="3" style="padding-left:12px;color:#555">Término: ${it.modificadores.termino}</td></tr>` : ''}
          ${it.modificadores?.tamano  ? `<tr><td colspan="3" style="padding-left:12px;color:#555">Tamaño: ${it.modificadores.tamano}</td></tr>` : ''}
          ${it.notas ? `<tr><td colspan="3" style="padding-left:12px;color:#555">Nota: ${it.notas}</td></tr>` : ''}
        `).join('')}
      </table>
      <div class="line"></div>
      <table>
        <tr><td>Subtotal</td><td class="right">${fmt(base)}</td></tr>
        <tr><td>IVA (19%)</td><td class="right">${fmt(iva)}</td></tr>
        ${propina > 0 ? `<tr><td>Propina</td><td class="right">${fmt(propina)}</td></tr>` : ''}
        <tr class="bold"><td>TOTAL</td><td class="right">${fmt(total)}</td></tr>
      </table>
      <div class="line"></div>
      <div>Forma de pago: ${metodo}</div>
      <div class="line"></div>
      <div class="center">¡Gracias por su visita!</div>
      </body></html>
    `)
    win.document.close()
    win.print()
  }

  const labelCls = 'block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1'
  const inputCls = 'w-full px-3 py-2.5 bg-white border border-stone-300 text-stone-900 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition'

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[2000] p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-lg border border-stone-200 shadow-2xl flex flex-col max-h-[92vh]" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="p-5 border-b border-stone-200 flex items-center justify-between">
          <div>
            <h2 className="text-stone-900 text-xl font-bold font-serif">Mesa {comanda.mesa_numero}</h2>
            {comanda.cliente && <p className="text-stone-500 text-sm mt-0.5">Cliente: {comanda.cliente}</p>}
            <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full border mt-1 ${ESTADO_META[comanda.estado]?.badge ?? 'bg-stone-100 text-stone-500 border-stone-200'}`}>
              {ESTADO_META[comanda.estado]?.icon} {ESTADO_META[comanda.estado]?.label ?? comanda.estado}
            </span>
          </div>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-600 text-2xl font-light leading-none">✕</button>
        </div>

        {factura ? (
          /* ── FACTURA EMITIDA ── */
          <div className="p-6 flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center text-3xl">✓</div>
            <h3 className="text-xl font-bold text-stone-900">Factura emitida</h3>
            <p className="text-stone-500 text-sm">N° <strong>{factura.num_factura}</strong></p>
            <div className="w-full bg-stone-50 rounded-xl p-4 border border-stone-200 text-sm space-y-1">
              <div className="flex justify-between"><span className="text-stone-500">Subtotal</span><span>{fmt(base)}</span></div>
              <div className="flex justify-between"><span className="text-stone-500">IVA 19%</span><span>{fmt(iva)}</span></div>
              {propina > 0 && <div className="flex justify-between"><span className="text-stone-500">Propina</span><span>{fmt(propina)}</span></div>}
              <div className="flex justify-between font-bold text-base border-t border-stone-200 pt-2 mt-1">
                <span>Total</span><span className="text-amber-700">{fmt(total)}</span>
              </div>
              <div className="flex justify-between text-stone-500 pt-1"><span>Pago</span><span className="capitalize">{metodo}</span></div>
            </div>
            <button onClick={imprimir} className="w-full py-3 bg-stone-800 hover:bg-stone-700 text-white rounded-xl font-bold text-sm transition">
              Imprimir / Descargar
            </button>
            <button onClick={onClose} className="w-full py-3 border border-stone-300 hover:border-stone-400 text-stone-700 rounded-xl font-semibold text-sm transition">
              Cerrar
            </button>
          </div>
        ) : (
          <>
            {/* Items */}
            <div className="overflow-y-auto flex-1 p-5">

              {/* Aviso si el mesero aún no solicitó la cuenta */}
              {!esCuentaSolicitada && (
                <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                  <p className="text-amber-700 text-xs font-semibold">
                    {ESTADO_META[comanda.estado]?.icon} Mesa en estado "{ESTADO_META[comanda.estado]?.label}" — facturando directamente
                  </p>
                  <p className="text-stone-500 text-xs mt-0.5">El mesero no ha cerrado la comanda, pero puedes facturar si el cliente ya pagó.</p>
                </div>
              )}

              <div className="space-y-2 mb-4">
                {(comanda.items || []).map((it, i) => (
                  <div key={i} className="flex items-start justify-between gap-3 py-2 border-b border-stone-100 last:border-0">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-stone-800">{it.cantidad}× {it.nombre}</p>
                      {it.modificadores?.termino && <p className="text-xs text-stone-400">Término: {it.modificadores.termino}</p>}
                      {it.modificadores?.tamano  && <p className="text-xs text-stone-400">Tamaño: {it.modificadores.tamano}</p>}
                      {it.notas && <p className="text-xs text-stone-400 italic">"{it.notas}"</p>}
                    </div>
                    <span className="text-sm font-bold text-stone-700 shrink-0">{fmt(it.subtotal)}</span>
                  </div>
                ))}
                {(comanda.items || []).length === 0 && (
                  <p className="text-stone-400 text-sm text-center py-4">Sin ítems registrados</p>
                )}
              </div>

              {/* Totales */}
              <div className="bg-stone-50 rounded-xl p-4 border border-stone-200 space-y-1.5 text-sm mb-4">
                <div className="flex justify-between text-stone-600"><span>Subtotal</span><span>{fmt(base)}</span></div>
                <div className="flex justify-between text-stone-600"><span>IVA (19%)</span><span>{fmt(iva)}</span></div>
                {propina > 0 && <div className="flex justify-between text-stone-600"><span>Propina</span><span>{fmt(propina)}</span></div>}
                <div className="flex justify-between font-bold text-base border-t border-stone-200 pt-2">
                  <span>Total a pagar</span>
                  <span className="text-amber-700">{fmt(total)}</span>
                </div>
              </div>

              {/* ── MODO NORMAL: forma de pago ── */}
              {!dividiendo && (<>
                <div className="mb-4">
                  <label className={labelCls}>Forma de pago</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { v: 'efectivo',      label: '💵 Efectivo' },
                      { v: 'tarjeta',       label: '💳 Tarjeta' },
                      { v: 'transferencia', label: '📲 Transferencia' },
                    ].map(opt => (
                      <button
                        key={opt.v}
                        onClick={() => setMetodo(opt.v)}
                        className={`py-2.5 text-xs font-bold rounded-lg border transition-all ${
                          metodo === opt.v
                            ? 'bg-amber-500 text-white border-amber-500'
                            : 'bg-white text-stone-700 border-stone-300 hover:border-amber-400'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Propina */}
                <div className="mb-4">
                  <label className={labelCls}>Propina (opcional)</label>
                  <div className="flex gap-2 flex-wrap mb-2">
                    {[0, Math.round(base * 0.10), Math.round(base * 0.15)].map((v, i) => (
                      <button
                        key={i}
                        onClick={() => setPropina(v)}
                        className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition ${
                          propina === v ? 'bg-amber-500 text-white border-amber-500' : 'bg-white text-stone-600 border-stone-300 hover:border-amber-400'
                        }`}
                      >
                        {i === 0 ? 'Sin propina' : i === 1 ? `10% · ${fmt(v)}` : `15% · ${fmt(v)}`}
                      </button>
                    ))}
                  </div>
                  <input
                    type="number" min="0"
                    value={propina}
                    onChange={e => setPropina(Math.max(0, Number(e.target.value)))}
                    className={inputCls}
                    placeholder="Monto de propina personalizado"
                  />
                </div>

                {/* Botón dividir */}
                <button
                  onClick={activarDividir}
                  className="w-full py-2.5 border border-stone-300 hover:border-amber-400 text-stone-600 hover:text-amber-700 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2"
                >
                  <span>⚡</span> Dividir cuenta entre varias personas
                </button>
              </>)}

              {/* ── MODO DIVIDIR ── */}
              {dividiendo && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className={labelCls}>Dividir entre</label>
                    <div className="flex items-center gap-2">
                      <button onClick={() => ajustarPartes(Math.max(2, nPartes - 1))} className="w-7 h-7 rounded-lg border border-stone-300 font-bold hover:bg-stone-100 text-sm">−</button>
                      <span className="text-base font-black text-stone-900 w-6 text-center">{nPartes}</span>
                      <button onClick={() => ajustarPartes(Math.min(10, nPartes + 1))} className="w-7 h-7 rounded-lg border border-stone-300 font-bold hover:bg-stone-100 text-sm">+</button>
                      <span className="text-xs text-stone-500 ml-1">personas</span>
                    </div>
                  </div>

                  {/* Línea por persona */}
                  <div className="space-y-2 mb-3">
                    {partes.map((parte, idx) => (
                      <div key={parte.id} className={`flex items-center gap-2 p-2.5 rounded-xl border transition-all ${parte.pagada ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-stone-200'}`}>
                        <div className="shrink-0">
                          <div className="text-xs font-bold text-stone-500">P{idx + 1}</div>
                          <div className="text-sm font-black text-amber-700">{fmt(montoPorParte)}</div>
                        </div>
                        <div className="flex-1 flex gap-1">
                          {['efectivo', 'tarjeta', 'transferencia'].map(m => (
                            <button
                              key={m}
                              disabled={parte.pagada}
                              onClick={() => setMetodoParte(idx, m)}
                              className={`flex-1 py-1 text-[10px] font-bold rounded-lg border transition ${
                                parte.metodo === m
                                  ? 'bg-amber-500 text-white border-amber-500'
                                  : 'bg-white text-stone-500 border-stone-200 hover:border-amber-300'
                              } disabled:opacity-60`}
                            >
                              {m === 'efectivo' ? '💵' : m === 'tarjeta' ? '💳' : '📲'}
                            </button>
                          ))}
                        </div>
                        <button
                          onClick={() => toggleParte(idx)}
                          className={`shrink-0 px-3 py-2 rounded-lg text-xs font-bold border transition-all ${
                            parte.pagada
                              ? 'bg-emerald-500 text-white border-emerald-500'
                              : 'bg-white text-stone-600 border-stone-300 hover:border-emerald-400 hover:text-emerald-600'
                          }`}
                        >
                          {parte.pagada ? '✓ Cobrado' : 'Cobrar'}
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between text-xs text-stone-500 mb-1">
                    <span>{partes.filter(p => p.pagada).length}/{nPartes} cobradas</span>
                    <button onClick={() => setDividiendo(false)} className="text-stone-400 hover:text-stone-600 underline">Cancelar división</button>
                  </div>
                </div>
              )}

              {error && <p className="text-rose-600 text-xs font-semibold mt-2">{error}</p>}
            </div>

            {/* Footer */}
            <div className="p-5 border-t border-stone-200 flex flex-col gap-2">
              <div className="flex gap-3">
                <button onClick={onClose} className="flex-1 py-3 border border-stone-300 hover:border-stone-400 text-stone-700 rounded-xl font-semibold text-sm transition">
                  Cerrar
                </button>
                {!dividiendo ? (
                  <button
                    onClick={() => emitir()}
                    disabled={emitiendo}
                    className="flex-[2] py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-sm shadow-lg transition disabled:opacity-50"
                  >
                    {emitiendo ? 'Emitiendo…' : `💳 Facturar · ${fmt(total)}`}
                  </button>
                ) : (
                  <button
                    onClick={() => emitir(metodoFinal)}
                    disabled={!todasPagadas || emitiendo}
                    className="flex-[2] py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-sm shadow-lg transition disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {emitiendo ? 'Emitiendo…' : todasPagadas ? `✓ Confirmar · ${fmt(total)}` : `Faltan ${partes.filter(p => !p.pagada).length} por cobrar`}
                  </button>
                )}
              </div>
              <button
                onClick={cancelarComanda}
                disabled={eliminando}
                className="w-full py-2.5 text-xs font-bold text-rose-500 border border-rose-200 hover:bg-rose-50 rounded-xl transition disabled:opacity-50"
              >
                {eliminando ? 'Cancelando…' : '✕ Cancelar comanda — cliente se retira'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

// ── Panel de Reportes del Día ─────────────────────────────────────────────────
function ReportesPanel() {
  const hoy = new Date().toISOString().slice(0, 10)
  const [fecha, setFecha]       = useState(hoy)
  const [reporte, setReporte]   = useState(null)
  const [cargando, setCargando] = useState(false)
  const [error, setError]       = useState('')
  const API = getApiUrl()

  const cargar = async (f) => {
    setCargando(true)
    setError('')
    try {
      const res  = await fetch(`${API}/reportes/cierre-dia?fecha=${f}`, { headers: getHeaders() })
      const data = await res.json()
      if (data.fecha) {
        setReporte(data)
      } else {
        setError(data.message || 'Error al cargar reporte')
      }
    } catch {
      setError('Error de red')
    }
    setCargando(false)
  }

  useEffect(() => { cargar(fecha) }, [fecha])

  const METODO_LABEL = { efectivo: '💵 Efectivo', tarjeta: '💳 Tarjeta', transferencia: '📲 Transferencia' }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Selector de fecha */}
      <div className="flex items-center gap-4 mb-6">
        <h2 className="text-stone-800 font-bold text-lg font-serif">Reporte de cierre</h2>
        <input
          type="date"
          value={fecha}
          max={hoy}
          onChange={e => setFecha(e.target.value)}
          className="px-3 py-2 border border-stone-300 rounded-lg text-sm text-stone-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
        />
        <button
          onClick={() => cargar(fecha)}
          className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-white rounded-lg text-xs font-bold transition"
        >
          Actualizar
        </button>
      </div>

      {error && <p className="text-rose-600 text-sm font-semibold mb-4">{error}</p>}

      {cargando && (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 rounded-full border-2 border-stone-200 border-t-amber-500 animate-spin" />
        </div>
      )}

      {!cargando && reporte && (
        <>
          {/* KPIs principales */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
            {[
              { label: 'Ventas netas',    value: fmt(reporte.total_ventas),    sub: `IVA ${fmt(reporte.total_iva)}`,      color: 'text-emerald-700' },
              { label: 'Propinas',        value: fmt(reporte.total_propinas),  sub: 'recaudadas',                         color: 'text-amber-700'   },
              { label: 'Total cobrado',   value: fmt(reporte.total_ventas + reporte.total_propinas), sub: 'inc. IVA + propinas', color: 'text-stone-900' },
              { label: 'Mesas atendidas', value: reporte.mesas_atendidas,      sub: 'comandas cerradas',                  color: 'text-blue-700'    },
              { label: 'Cubiertos',       value: reporte.total_cubiertos,      sub: 'personas atendidas',                 color: 'text-purple-700'  },
            ].map(kpi => (
              <div key={kpi.label} className="bg-white rounded-xl border border-stone-200 p-4 shadow-sm">
                <p className="text-xs font-semibold text-stone-400 uppercase tracking-wide mb-1">{kpi.label}</p>
                <p className={`text-2xl font-bold ${kpi.color}`}>{kpi.value}</p>
                <p className="text-[11px] text-stone-400 mt-0.5">{kpi.sub}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Desglose por método de pago */}
            <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-sm">
              <h3 className="font-bold text-stone-700 text-sm mb-4">Desglose por forma de pago</h3>
              {Object.keys(reporte.por_metodo).length === 0 ? (
                <p className="text-stone-400 text-sm">Sin ventas registradas</p>
              ) : (
                <div className="space-y-3">
                  {Object.entries(reporte.por_metodo).map(([metodo, monto]) => (
                    <div key={metodo} className="flex justify-between items-center">
                      <span className="text-sm text-stone-600">{METODO_LABEL[metodo] ?? metodo}</span>
                      <span className="font-bold text-stone-900 text-sm">{fmt(monto)}</span>
                    </div>
                  ))}
                  <div className="border-t border-stone-100 pt-3 flex justify-between items-center">
                    <span className="text-sm font-bold text-stone-700">Total</span>
                    <span className="font-bold text-emerald-700">{fmt(Object.values(reporte.por_metodo).reduce((a, b) => a + b, 0))}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Top productos */}
            <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-sm lg:col-span-2">
              <h3 className="font-bold text-stone-700 text-sm mb-4">Productos más vendidos</h3>
              {reporte.top_productos.length === 0 ? (
                <p className="text-stone-400 text-sm">Sin ventas registradas</p>
              ) : (
                <div className="space-y-2">
                  {reporte.top_productos.map((prod, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <span className="text-xs font-bold text-stone-400 w-5 text-right">{i + 1}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-stone-700 font-semibold truncate">{prod.nombre}</span>
                          <span className="text-xs text-stone-500 shrink-0 ml-2">{prod.cantidad} und · {fmt(prod.total)}</span>
                        </div>
                        <div className="h-1.5 bg-stone-100 rounded-full mt-1 overflow-hidden">
                          <div
                            className="h-full bg-amber-400 rounded-full"
                            style={{ width: `${Math.min(100, (prod.cantidad / (reporte.top_productos[0]?.cantidad || 1)) * 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Listado de facturas */}
          <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-stone-200">
              <h3 className="font-bold text-stone-700 text-sm">Facturas emitidas — {reporte.facturas.length}</h3>
            </div>
            {reporte.facturas.length === 0 ? (
              <p className="text-stone-400 text-sm text-center py-8">Sin facturas emitidas este día</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-stone-50 border-b border-stone-200">
                    <tr>
                      {['Folio', 'Mesa', 'Cliente', 'Hora', 'Subtotal', 'Propina', 'Total', 'Método'].map(h => (
                        <th key={h} className="px-4 py-2.5 text-left text-xs font-bold text-stone-500 uppercase tracking-wide">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {reporte.facturas.map((f, i) => (
                      <tr key={i} className="hover:bg-stone-50 transition">
                        <td className="px-4 py-3 font-mono text-xs font-bold text-amber-700">{f.num}</td>
                        <td className="px-4 py-3 font-bold">#{f.mesa}</td>
                        <td className="px-4 py-3 text-stone-600">{f.cliente || '—'}</td>
                        <td className="px-4 py-3 text-stone-500">{fmtHora(f.hora)}</td>
                        <td className="px-4 py-3">{fmt(f.subtotal)}</td>
                        <td className="px-4 py-3 text-stone-500">{f.propina > 0 ? fmt(f.propina) : '—'}</td>
                        <td className="px-4 py-3 font-bold text-stone-900">{fmt(f.total)}</td>
                        <td className="px-4 py-3 text-stone-500 capitalize">{f.metodo}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-stone-50 border-t-2 border-stone-200">
                    <tr>
                      <td colSpan={4} className="px-4 py-3 text-xs font-bold text-stone-500 uppercase">Total del día</td>
                      <td className="px-4 py-3 font-bold">{fmt(reporte.total_ventas)}</td>
                      <td className="px-4 py-3 font-bold">{fmt(reporte.total_propinas)}</td>
                      <td className="px-4 py-3 font-bold text-emerald-700">{fmt(reporte.total_ventas + reporte.total_propinas)}</td>
                      <td />
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {!cargando && !reporte && !error && (
        <div className="text-center py-20 text-stone-400">
          <p className="text-lg">📊</p>
          <p className="text-sm mt-2">Selecciona una fecha para ver el reporte</p>
        </div>
      )}
    </div>
  )
}

// ── App principal ─────────────────────────────────────────────────────────────
export default function FacturacionApp() {
  const [authTrigger, setAuthTrigger] = useState(0)
  const isEmbedded       = !!window.RusticaConfig
  const isLoggedHeadless = !isEmbedded && !!localStorage.getItem('rustica_token')

  const [tab, setTab]               = useState('mesas')
  const [pendientes, setPendientes] = useState([])
  const [lastPoll, setLastPoll]     = useState(null)
  const [detalle, setDetalle]       = useState(null)
  const [now, setNow]               = useState(Math.floor(Date.now() / 1000))

  const API = getApiUrl()

  useEffect(() => {
    const id = setInterval(() => setNow(Math.floor(Date.now() / 1000)), 30000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    if (!isEmbedded && !isLoggedHeadless) return
    const poll = async () => {
      try {
        const res  = await fetch(`${API}/facturacion/pendientes`, { headers: getHeaders() })
        if (res.status === 401 && !isEmbedded) { handleLogout(); return }
        const data = await res.json()
        setPendientes(data.pendientes || [])
        setLastPoll(new Date().toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit', second: '2-digit' }))
      } catch {}
    }
    poll()
    const id = setInterval(poll, POLL_MS)
    return () => clearInterval(id)
  }, [authTrigger, API])

  function onEmitida(comandaId) {
    setPendientes(prev => prev.filter(c => c.id !== comandaId))
    setDetalle(null)
  }

  function onEliminada(comandaId) {
    setPendientes(prev => prev.filter(c => c.id !== comandaId))
    setDetalle(null)
  }

  function handleLogout() {
    ['rustica_token','rustica_api_url','rustica_user_role','rustica_es_gerente','rustica_is_staff','rustica_user_display_name']
      .forEach(k => localStorage.removeItem(k))
    setAuthTrigger(p => p + 1)
  }

  if (!isEmbedded && !isLoggedHeadless) {
    return <LoginScreen onLoginSuccess={() => setAuthTrigger(p => p + 1)} />
  }

  const userDisplay = localStorage.getItem('rustica_user_display_name') || 'Cajero'
  const porCobrar   = pendientes.filter(c => c.estado === 'cuenta_solicitada').length

  return (
    <div className="min-h-screen bg-stone-50 font-sans antialiased">
      {/* Header */}
      <header className="bg-white border-b border-stone-200 px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-stone-900">Facturación — La Rústica Terrazza</h1>
          <p className="text-xs text-stone-500 mt-0.5">
            {tab === 'mesas' ? 'Vista general de mesas activas' : 'Cierre y reportes del día'}
            {!isEmbedded && <span className="text-amber-700"> · {userDisplay}</span>}
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap justify-end">
          {tab === 'mesas' && (
            <>
              {porCobrar > 0 && (
                <span className="text-xs bg-purple-50 border border-purple-300 text-purple-700 px-3.5 py-1.5 rounded-full font-bold animate-pulse">
                  💳 {porCobrar} por cobrar
                </span>
              )}
              <span className="text-xs bg-stone-100 border border-stone-200 text-stone-600 px-3 py-1.5 rounded-full font-semibold">
                {pendientes.length} mesa(s) activa(s)
              </span>
              <span className="text-xs text-stone-400">{lastPoll || '—'}</span>
            </>
          )}
          {!isEmbedded && (
            <button onClick={handleLogout} className="py-1.5 px-3 bg-rose-50 border border-rose-200 hover:bg-rose-100 text-rose-600 text-xs font-bold rounded-lg transition">
              Cerrar sesión
            </button>
          )}
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-white border-b border-stone-200 px-6">
        <div className="flex gap-0 max-w-xs">
          {[
            { id: 'mesas',    label: '🍽 Mesas activas' },
            { id: 'reportes', label: '📊 Reporte del día' },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`py-3 px-5 text-sm font-bold border-b-2 transition-all ${
                tab === t.id
                  ? 'border-amber-500 text-amber-700'
                  : 'border-transparent text-stone-400 hover:text-stone-600'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Contenido */}
      {tab === 'mesas' && (
        <main className="p-6">
          {pendientes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 text-stone-400">
              <span className="text-6xl mb-4">🍽</span>
              <h3 className="text-lg font-bold text-stone-500">No hay mesas activas</h3>
              <p className="text-sm max-w-xs text-center mt-1">Las mesas con comandas abiertas aparecerán aquí en tiempo real.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {pendientes.map(cmd => {
                const meta    = ESTADO_META[cmd.estado] ?? { icon: '?', label: cmd.estado, border: 'border-l-stone-300', badge: 'bg-stone-100 text-stone-500 border-stone-200', card: 'border-stone-200' }
                const minutos = cmd.hora_apertura ? Math.floor((now - cmd.hora_apertura) / 60) : 0
                const esPago  = cmd.estado === 'cuenta_solicitada'

                return (
                  <div
                    key={cmd.id}
                    onClick={() => setDetalle(cmd)}
                    className={`bg-white rounded-xl border-l-4 ${meta.border} border ${meta.card} p-5 cursor-pointer hover:shadow-md transition-all`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="text-lg font-bold font-serif text-stone-900">Mesa {cmd.mesa_numero}</h3>
                        {cmd.cliente && <p className="text-xs text-stone-500">👤 {cmd.cliente}</p>}
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-full border ${meta.badge}`}>
                        {meta.icon} {meta.label}
                      </span>
                    </div>

                    <div className="space-y-1 mb-3">
                      {(cmd.items || []).slice(0, 3).map((it, i) => (
                        <div key={i} className="flex justify-between text-xs text-stone-600">
                          <span className="truncate">{it.cantidad}× {it.nombre}</span>
                          <span className="shrink-0 ml-2">{fmt(it.subtotal)}</span>
                        </div>
                      ))}
                      {cmd.items.length > 3 && <p className="text-xs text-stone-400">+{cmd.items.length - 3} más…</p>}
                      {cmd.items.length === 0 && <p className="text-xs text-stone-400 italic">Sin ítems aún</p>}
                    </div>

                    <div className="border-t border-stone-100 pt-3 flex justify-between items-center mb-3">
                      <span className="text-xs text-stone-400">{minutos} min en mesa</span>
                      <span className="text-base font-bold text-amber-700">{fmt(cmd.total)}</span>
                    </div>

                    <button className={`w-full py-2.5 rounded-lg font-bold text-xs transition ${
                      esPago
                        ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                        : 'bg-amber-500 hover:bg-amber-400 text-white'
                    }`}>
                      💳 Facturar
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </main>
      )}

      {tab === 'reportes' && <ReportesPanel />}

      {detalle && (
        <FacturaModal
          comanda={detalle}
          onClose={() => setDetalle(null)}
          onEmitida={onEmitida}
          onEliminada={onEliminada}
        />
      )}
    </div>
  )
}
