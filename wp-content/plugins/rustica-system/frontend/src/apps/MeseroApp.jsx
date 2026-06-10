import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import ModificadorModal from '../components/ModificadorModal'
import LoginScreen from '../components/LoginScreen'

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

const CAT_ICON = {
  almuerzos: '🍱', almuerzo: '🍱',
  bebidas: '🥤', bebida: '🥤',
  cenas: '🍽', cena: '🍽',
  desayunos: '🌅', desayuno: '🌅',
}
const getCatIcon = (slug = '') => {
  const s = slug.toLowerCase()
  return Object.entries(CAT_ICON).find(([k]) => s.includes(k))?.[1] ?? '🍴'
}

// ── App principal ─────────────────────────────────────────────────────────────
export default function MeseroApp({ initialMesaId = null }) {
  const [authTrigger, setAuthTrigger] = useState(0)
  const isEmbedded       = !!window.RusticaConfig
  const isLoggedHeadless = !isEmbedded && !!localStorage.getItem('rustica_token')

  const getQueryMesaId = () => {
    const params = new URLSearchParams(window.location.search)
    const mId = params.get('mesa')
    return mId ? parseInt(mId) : null
  }

  const configMesaId = window.RusticaConfig?.mesa_id
    ? parseInt(window.RusticaConfig.mesa_id)
    : (initialMesaId || getQueryMesaId())
  const [mesaId, setMesaId] = useState(configMesaId)

  useEffect(() => { if (initialMesaId) setMesaId(initialMesaId) }, [initialMesaId])

  useEffect(() => {
    if (!isEmbedded) {
      const url = new URL(window.location.href)
      mesaId ? url.searchParams.set('mesa', mesaId) : url.searchParams.delete('mesa')
      window.history.replaceState({}, '', url.pathname + url.search)
    }
  }, [mesaId, isEmbedded])

  // ── Estado menú ──────────────────────────────────────────────────────────────
  const [categorias, setCategorias]   = useState([])
  const [loadMenu, setLoadMenu]       = useState(true)

  // ── Estado comanda ───────────────────────────────────────────────────────────
  const [comanda, setComanda]         = useState(null)
  const [loadCmd, setLoadCmd]         = useState(true)
  const [itemsLocal, setItems]        = useState([])

  // ── Estado selector de mesas ─────────────────────────────────────────────────
  const [mesas, setMesas]             = useState([])
  const [loadMesas, setLoadMesas]     = useState(false)
  const [zonaFiltro, setZonaFiltro]   = useState('todas')
  const [busqueda, setBusqueda]       = useState('')
  const [showManualModal, setShowManualModal]   = useState(null)
  const [showReservaModal, setShowReservaModal] = useState(null)
  const [selectedResId, setSelectedResId]       = useState('')

  // ── Vista de captura ─────────────────────────────────────────────────────────
  const [vista, setVista]             = useState('buscar')   // 'buscar' | 'comanda'
  const [busquedaMenu, setBusquedaMenu] = useState('')
  const [categoriaActiva, setCategoriaActiva] = useState('')
  const searchRef = useRef(null)

  // ── Acciones en curso ────────────────────────────────────────────────────────
  const [modal, setModal]                             = useState(null)
  const [guardando, setGuardando]                     = useState(false)
  const [enviando, setEnviando]                       = useState(false)
  const [msg, setMsg]                                 = useState(null)
  const [nombreClienteInput, setNombreClienteInput]   = useState('')
  const [personasInput, setPersonasInput]             = useState(1)
  const [creandoComanda, setCreandoComanda]           = useState(false)
  const [convirtiendoReserva, setConvirtiendoReserva] = useState(false)
  const [solicitandoCuenta, setSolicitandoCuenta]     = useState(false)
  const [eliminandoComanda, setEliminandoComanda]     = useState(false)
  const [liberandoMesa, setLiberandoMesa]             = useState(false)
  const [cancelandoComanda, setCancelandoComanda]     = useState(false)

  const API = getApiUrl()

  const esGerente = isEmbedded
    ? (window.RusticaConfig?.es_gerente || false)
    : (localStorage.getItem('rustica_es_gerente') === '1')

  // ── Carga menú ───────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isEmbedded && !isLoggedHeadless) return
    setLoadMenu(true)
    fetch(`${API}/menu`)
      .then(r => { if (r.status === 401 && !isEmbedded) { handleLogout(); return } return r.json() })
      .then(d => { if (d) setCategorias(d.menu || []); setLoadMenu(false) })
      .catch(() => setLoadMenu(false))
  }, [authTrigger, API])

  // ── Comanda activa ───────────────────────────────────────────────────────────
  const refetchComanda = useCallback(async () => {
    if (!mesaId) { setComanda(null); setLoadCmd(false); return }
    setLoadCmd(true)
    try {
      const r = await fetch(`${API}/comanda-activa?mesa=${mesaId}`, { headers: getHeaders() })
      if (r.status === 401 && !isEmbedded) { handleLogout(); return }
      const d = await r.json()
      setComanda(d.comanda)
    } catch (_) {}
    setLoadCmd(false)
  }, [mesaId, API])

  useEffect(() => {
    if (!isEmbedded && !isLoggedHeadless) return
    refetchComanda()
  }, [refetchComanda, authTrigger])

  // ── Mesas ────────────────────────────────────────────────────────────────────
  const cargarMesas = useCallback(async () => {
    if (mesaId) return
    if (!isEmbedded && !isLoggedHeadless) return
    setLoadMesas(true)
    try {
      const res = await fetch(`${API}/mesas`, { headers: getHeaders() })
      if (res.status === 401 && !isEmbedded) { handleLogout(); return }
      const data = await res.json()
      setMesas(data || [])
    } catch (_) {}
    setLoadMesas(false)
  }, [mesaId, API, authTrigger])

  useEffect(() => { cargarMesas() }, [cargarMesas])

  // ── Sincronizar items ────────────────────────────────────────────────────────
  useEffect(() => {
    setItems(comanda?.items ?? [])
  }, [comanda])

  // ── Productos filtrados (búsqueda + categoría) ───────────────────────────────
  const productosFiltrados = useMemo(() => {
    const todos = categorias.flatMap(cat =>
      cat.items.map(item => ({ ...item, catSlug: cat.slug, catLabel: cat.categoria }))
    )
    const q = busquedaMenu.toLowerCase().trim()
    return todos.filter(item => {
      const matchCat    = !categoriaActiva || item.catSlug === categoriaActiva
      const matchSearch = !q || item.nombre.toLowerCase().includes(q) || (item.desc || '').toLowerCase().includes(q)
      return matchCat && matchSearch
    })
  }, [categorias, busquedaMenu, categoriaActiva])

  // ── Helpers ──────────────────────────────────────────────────────────────────
  const mostrarMsg = (tipo, texto) => { setMsg({ tipo, texto }); setTimeout(() => setMsg(null), 3000) }

  const quickRemove = (productoId) => {
    setItems(prev => {
      const idx = prev.findIndex(i => i.producto_id === productoId)
      if (idx === -1) return prev
      const copia = [...prev]
      if (copia[idx].cantidad <= 1) {
        copia.splice(idx, 1)
      } else {
        const nueva = copia[idx].cantidad - 1
        copia[idx] = { ...copia[idx], cantidad: nueva, subtotal: copia[idx].precio * nueva }
      }
      return copia
    })
  }

  const quickAdd = (item) => {
    setItems(prev => {
      const idx = prev.findIndex(i => i.producto_id === item.id && !i.notas)
      if (idx >= 0) {
        const copia = [...prev]
        const nueva = copia[idx].cantidad + 1
        copia[idx] = { ...copia[idx], cantidad: nueva, subtotal: copia[idx].precio * nueva }
        return copia
      }
      const precio = parseFloat(item.precio || 0)
      return [...prev, {
        producto_id: item.id,
        nombre:      item.nombre,
        precio,
        cantidad:    1,
        subtotal:    precio,
        modificadores: {},
        notas:       '',
        estado:      'pendiente',
      }]
    })
  }

  // ── Handlers de comanda ──────────────────────────────────────────────────────
  const iniciarComandaManual = async (targetMesaId, clienteNombre, personas = 1) => {
    if (!clienteNombre.trim()) return
    setCreandoComanda(true)
    try {
      const res  = await fetch(`${API}/comanda/crear`, {
        method: 'POST', headers: getHeaders(true),
        body: JSON.stringify({ mesa_id: targetMesaId, cliente: clienteNombre.trim(), personas: parseInt(personas) || 1 }),
      })
      const data = await res.json()
      if (data.ok) {
        if (data.comanda) { setComanda(data.comanda); setItems(data.comanda.items || []) }
        setMesaId(targetMesaId)
        setShowManualModal(null)
        setNombreClienteInput('')
        setPersonasInput(1)
        setVista('buscar')
      } else {
        mostrarMsg('err', data.message || 'Error al iniciar comanda')
      }
    } catch (_) { mostrarMsg('err', 'Error al iniciar comanda') }
    setCreandoComanda(false)
  }

  const convertirReserva = async (targetMesaId, resId) => {
    if (!resId) return
    setConvirtiendoReserva(true)
    try {
      const res  = await fetch(`${API}/reservacion/convertir-comanda`, {
        method: 'POST', headers: getHeaders(true),
        body: JSON.stringify({ reservacion_id: parseInt(resId), mesa_id: targetMesaId }),
      })
      const data = await res.json()
      if (data.ok) {
        if (data.comanda) { setComanda(data.comanda); setItems(data.comanda.items || []) }
        setMesaId(targetMesaId)
        setShowReservaModal(null)
        setSelectedResId('')
        setVista('buscar')
      } else {
        mostrarMsg('err', data.message || 'Error al convertir reserva')
      }
    } catch (_) { mostrarMsg('err', 'Error al convertir reserva') }
    setConvirtiendoReserva(false)
  }

  const agregarDesdeModal = ({ producto, cantidad, modificadores, notas }) => {
    const nombre = producto.nombre || producto.name || ''
    const precio = parseFloat(producto.precio || producto.price || 0)
    setItems(prev => {
      const idx = prev.findIndex(i => i.producto_id === producto.id && !i.notas && !notas)
      if (idx >= 0) {
        const copia = [...prev]
        const nueva = copia[idx].cantidad + cantidad
        copia[idx] = { ...copia[idx], cantidad: nueva, subtotal: copia[idx].precio * nueva }
        return copia
      }
      return [...prev, { producto_id: producto.id, nombre, precio, cantidad, subtotal: precio * cantidad, modificadores, notes: notas, notas, estado: 'pendiente' }]
    })
    setModal(null)
    // Se mantiene en 'buscar' para seguir agregando
  }

  const cambiarCantidad = (idx, nuevaCantidad) => {
    if (nuevaCantidad < 1) return
    setItems(prev => {
      const copia = [...prev]
      copia[idx] = { ...copia[idx], cantidad: nuevaCantidad, subtotal: copia[idx].precio * nuevaCantidad }
      return copia
    })
  }

  const cambiarPrecio = (idx, nuevoPrecio) => {
    setItems(prev => {
      const copia = [...prev]
      copia[idx] = { ...copia[idx], precio: nuevoPrecio, subtotal: nuevoPrecio * copia[idx].cantidad }
      return copia
    })
  }

  const eliminarItem = (idx) => setItems(prev => prev.filter((_, i) => i !== idx))

  const guardarCambios = async () => {
    if (!mesaId || itemsLocal.length === 0) return
    setGuardando(true)
    try {
      let activeComandaId = comanda?.id
      if (!activeComandaId) {
        const res  = await fetch(`${API}/comanda/crear`, {
          method: 'POST', headers: getHeaders(true),
          body: JSON.stringify({ mesa_id: mesaId, cliente: 'Cliente Mesa' }),
        })
        const data = await res.json()
        if (data.ok) activeComandaId = data.comanda_id
        else throw new Error('Error al crear comanda')
      }
      const resUpdate = await fetch(`${API}/comanda/actualizar-items`, {
        method: 'POST', headers: getHeaders(true),
        body: JSON.stringify({ comanda_id: activeComandaId, items: itemsLocal }),
      })
      const dataUpdate = await resUpdate.json()
      if (dataUpdate.ok) { await refetchComanda(); mostrarMsg('ok', 'Cambios guardados') }
      else mostrarMsg('err', dataUpdate.message || 'Error al guardar items')
    } catch (_) { mostrarMsg('err', 'Error al guardar cambios') }
    setGuardando(false)
  }

  const enviarAcocina = async () => {
    if (!comanda?.id) { mostrarMsg('err', 'Inicia la comanda antes de enviar'); return }
    if (itemsLocal.length === 0) { mostrarMsg('err', 'Agrega al menos un producto antes de enviar'); return }
    setEnviando(true)
    try {
      const res  = await fetch(`${API}/comanda/enviar`, {
        method: 'POST', headers: getHeaders(true),
        // Los ítems se guardan atómicamente junto con el cambio de estado
        body: JSON.stringify({ comanda_id: comanda.id, items: itemsLocal }),
      })
      const data = await res.json()
      if (data.ok) { await refetchComanda(); mostrarMsg('ok', '🍳 Comanda enviada a cocina') }
      else mostrarMsg('err', data.message || 'Error al enviar a cocina')
    } catch (_) { mostrarMsg('err', 'Error al enviar a cocina') }
    setEnviando(false)
  }

  const solicitarCuenta = async () => {
    if (!comanda?.id) return
    setSolicitandoCuenta(true)
    try {
      const res  = await fetch(`${API}/comanda/solicitar-cuenta`, {
        method: 'POST', headers: getHeaders(true),
        body: JSON.stringify({ comanda_id: comanda.id }),
      })
      const data = await res.json()
      if (data.ok) { await refetchComanda(); mostrarMsg('ok', 'Cuenta solicitada — cajero notificado') }
      else mostrarMsg('err', data.message || 'Error al solicitar cuenta')
    } catch (_) { mostrarMsg('err', 'Error de red') }
    setSolicitandoCuenta(false)
  }

  const cancelarComanda = async () => {
    if (!comanda?.id) return
    const aviso = enCocina ? ' (el pedido ya está en cocina)' : listoParaServir ? ' (el pedido ya está listo)' : ''
    if (!window.confirm(`¿Cancelar la comanda de ${comanda.cliente || 'este cliente'}${aviso}?\nLa mesa quedará libre.`)) return
    setCancelandoComanda(true)
    try {
      const res  = await fetch(`${API}/comanda/eliminar`, {
        method: 'POST', headers: getHeaders(true),
        body: JSON.stringify({ comanda_id: comanda.id }),
      })
      const data = await res.json()
      if (data.ok) volverAMesas()
      else mostrarMsg('err', data.message || 'Error al cancelar la comanda')
    } catch (_) { mostrarMsg('err', 'Error de red') }
    setCancelandoComanda(false)
  }

  const liberarMesa = async () => {
    if (!mesaId) return
    setLiberandoMesa(true)
    try {
      if (itemsLocal.length > 0 && comanda?.id) {
        await fetch(`${API}/comanda/actualizar-items`, {
          method: 'POST', headers: getHeaders(true),
          body: JSON.stringify({ comanda_id: comanda.id, items: itemsLocal }),
        })
      }
      const payload = comanda?.id ? { comanda_id: comanda.id } : {}
      const res = await fetch(`${API}/cuenta/cerrar`, {
        method: 'POST', headers: getHeaders(true),
        body: JSON.stringify({ mesa_id: mesaId, ...payload }),
      })
      const data = await res.json()
      if (data.ok !== false) volverAMesas()
      else {
        await fetch(`${API}/mesa/liberar`, {
          method: 'POST', headers: getHeaders(true),
          body: JSON.stringify({ mesa_id: mesaId }),
        })
        volverAMesas()
      }
    } catch (_) { mostrarMsg('err', 'Error al liberar la mesa') }
    setLiberandoMesa(false)
  }

  const eliminarComandaMesa = async (mesaObj) => {
    if (!window.confirm(`¿Eliminar la comanda de Mesa ${mesaObj.numero}?\nEsta acción no se puede deshacer.`)) return
    setEliminandoComanda(true)
    try {
      let comandaId = mesaObj.comanda_id
      if (!comandaId) {
        const r = await fetch(`${API}/comanda-activa?mesa=${mesaObj.id}`, { headers: getHeaders() })
        const d = await r.json()
        comandaId = d.comanda?.id
      }
      if (!comandaId) { mostrarMsg('err', 'No se encontró la comanda'); setEliminandoComanda(false); return }
      const res  = await fetch(`${API}/comanda/eliminar`, {
        method: 'POST', headers: getHeaders(true),
        body: JSON.stringify({ comanda_id: comandaId }),
      })
      const data = await res.json()
      if (data.ok) { await cargarMesas(); mostrarMsg('ok', `Comanda de Mesa ${mesaObj.numero} eliminada`) }
      else mostrarMsg('err', data.message || 'Error al eliminar comanda')
    } catch (_) { mostrarMsg('err', 'Error de red') }
    setEliminandoComanda(false)
  }

  const volverAMesas = () => {
    if (configMesaId) return
    setMesaId(null)
    setMesas([])
    cargarMesas()
  }

  const handleLogout = () => {
    ['rustica_token','rustica_api_url','rustica_user_role','rustica_es_gerente','rustica_is_staff','rustica_user_display_name']
      .forEach(k => localStorage.removeItem(k))
    setAuthTrigger(prev => prev + 1)
  }

  if (!isEmbedded && !isLoggedHeadless) {
    return <LoginScreen onLoginSuccess={() => setAuthTrigger(prev => prev + 1)} />
  }

  // ── Derivados ────────────────────────────────────────────────────────────────
  const total            = itemsLocal.reduce((s, i) => s + i.precio * i.cantidad, 0)
  const enCocina         = comanda?.estado === 'en_cocina'
  const listoParaServir  = comanda?.estado === 'listo'
  const cuentaSolicitada = comanda?.estado === 'cuenta_solicitada'
  const comandaBloqueada = cuentaSolicitada

  const mesasFiltradas = mesas.filter(m => {
    const cumpleZona     = zonaFiltro === 'todas' || (m.zona || '').toLowerCase().replace(' ', '-') === zonaFiltro
    const cumpleBusqueda = m.cliente ? m.cliente.toLowerCase().includes(busqueda.toLowerCase()) : busqueda === ''
    return cumpleZona && cumpleBusqueda
  })

  const userDisplayName = localStorage.getItem('rustica_user_display_name') || 'Mesero'

  // ─────────────────────────────────────────────────────────────────────────────
  // RENDER 1: Cuadrícula de mesas
  // ─────────────────────────────────────────────────────────────────────────────
  if (!mesaId) {
    return (
      <div className="min-h-screen bg-rustica-dark text-rustica-light p-6 font-sans antialiased">
        <header className="flex flex-col sm:flex-row justify-between items-center mb-8 pb-4 border-b border-stone-200 gap-4">
          <div>
            <h1 className="font-serif text-3xl text-rustica-gold font-bold tracking-tight">
              La Rustica Terrazza — Control de Mesas
            </h1>
            <p className="text-xs text-stone-500 mt-1">
              Selecciona una mesa para gestionar pedidos y comandas
              {!isEmbedded && <span className="text-rustica-gold"> · 👤 {userDisplayName} ({esGerente ? 'Gerente' : 'Mesero'})</span>}
            </p>
          </div>
          {!isEmbedded && (
            <button onClick={handleLogout} className="py-1.5 px-3 bg-rose-100/60 border border-rose-200/60 hover:bg-rose-200/60 text-rose-600 text-xs font-bold rounded-lg transition-all">
              Cerrar Sesión
            </button>
          )}
        </header>

        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
          <div className="flex flex-wrap gap-2 w-full md:w-auto">
            {['todas', 'salon-principal', 'la-terrazza', 'zona-vip'].map(zona => (
              <button
                key={zona}
                onClick={() => setZonaFiltro(zona)}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${zonaFiltro === zona ? 'bg-rustica-gold text-neutral-900 shadow-lg' : 'bg-rustica-card text-stone-500 hover:text-rustica-light hover:bg-stone-100 border border-stone-200'}`}
              >
                {zona === 'todas' ? 'Todas' : zona.replace('-', ' ').replace(/\b\w/g, c => c.toUpperCase())}
              </button>
            ))}
          </div>
          <div className="w-full md:w-72">
            <input
              type="text"
              placeholder="Buscar cliente ocupante..."
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              className="w-full px-4 py-2 bg-white text-stone-900 border border-stone-300 rounded-lg text-sm focus:outline-none focus:border-rustica-gold transition-colors"
            />
          </div>
        </div>

        {loadMesas ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 rounded-full border-2 border-stone-200 border-t-rustica-gold animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {mesasFiltradas.map(mesa => {
              const tieneReservas = mesa.reservas_hoy && mesa.reservas_hoy.length > 0
              const isActive = ['waiting','processing','eating','paying','ocupada'].includes(mesa.estado)
              const ESTADO_META = {
                waiting:    { bg: 'border-blue-300 bg-blue-50',       badge: 'bg-blue-100 text-blue-700 border-blue-300',       icon: '🪑', label: 'Leyendo carta' },
                ocupada:    { bg: 'border-blue-300 bg-blue-50',       badge: 'bg-blue-100 text-blue-700 border-blue-300',       icon: '🪑', label: 'Ocupada' },
                processing: { bg: 'border-orange-300 bg-orange-50',   badge: 'bg-orange-100 text-orange-700 border-orange-300', icon: '🍳', label: 'En cocina' },
                eating:     { bg: 'border-teal-300 bg-teal-50',       badge: 'bg-teal-100 text-teal-700 border-teal-300',       icon: '🍽', label: 'Comiendo' },
                paying:     { bg: 'border-purple-300 bg-purple-50',   badge: 'bg-purple-100 text-purple-700 border-purple-300', icon: '💳', label: 'Pagando' },
              }
              const meta       = ESTADO_META[mesa.estado]
              let bgClass      = meta?.bg ?? 'border-stone-200 bg-rustica-card'
              let badgeText    = meta ? `${meta.icon} ${meta.label}` : 'Libre'
              let badgeColor   = meta?.badge ?? 'bg-emerald-100 text-emerald-600 border-emerald-300'

              if (!isActive && tieneReservas) {
                bgClass    = 'border-amber-300 bg-amber-50'
                badgeText  = 'Reservada'
                badgeColor = 'bg-amber-100 text-amber-700 border-amber-300'
              }

              return (
                <div
                  key={mesa.id}
                  onClick={() => {
                    if (!isActive && tieneReservas) setShowReservaModal(mesa)
                    else if (!isActive) setShowManualModal(mesa)
                  }}
                  className={`p-4 rounded-xl border transition-all duration-200 ${isActive ? 'cursor-default' : 'cursor-pointer hover:-translate-y-1 hover:shadow-lg'} ${bgClass}`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-serif text-2xl font-bold text-rustica-light">#{mesa.numero}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badgeColor}`}>{badgeText}</span>
                  </div>
                  <p className="text-stone-400 text-xs">Cap. {mesa.capacidad} pers{mesa.es_vip && <span className="text-rustica-gold ml-1">★ VIP</span>}</p>

                  {isActive && (
                    <div className="mt-3 space-y-2">
                      <button
                        onClick={e => { e.stopPropagation(); setMesaId(mesa.id) }}
                        className="w-full flex items-center justify-between gap-2 px-3 py-2.5 bg-white border-2 border-rustica-gold/40 hover:border-rustica-gold hover:bg-rustica-gold/5 rounded-lg transition-all group"
                      >
                        <span className="text-rustica-light text-xs font-bold truncate group-hover:text-rustica-gold transition-colors">
                          👤 {mesa.cliente || 'Ver comanda'}
                        </span>
                        <span className="text-rustica-gold text-xs font-bold shrink-0">
                          ${mesa.total_cuenta?.toLocaleString('es-CO') ?? '0'}
                        </span>
                      </button>
                      {esGerente && (
                        <button
                          onClick={e => { e.stopPropagation(); eliminarComandaMesa({ ...mesa, comanda_id: mesa.comanda_id || mesa.id }) }}
                          disabled={eliminandoComanda}
                          className="w-full py-1.5 text-[10px] font-bold text-rose-500 border border-rose-200 hover:bg-rose-50 rounded-lg transition-all disabled:opacity-50"
                        >
                          🗑 Eliminar comanda
                        </button>
                      )}
                    </div>
                  )}

                  {!isActive && tieneReservas && (
                    <div className="mt-3 pt-3 border-t border-stone-200">
                      <p className="text-amber-500 text-[10px] font-bold">🕒 Reserva hoy:</p>
                      {mesa.reservas_hoy.map((r, i) => (
                        <p key={i} className="text-stone-500 text-[10px] truncate">{r.hora} - {r.nombre}</p>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* Modal: iniciar comanda manual */}
        {showManualModal && (
          <div className="fixed inset-0 bg-black/60 flex items-end sm:items-center justify-center p-4 z-50 backdrop-blur-sm" onClick={() => { setShowManualModal(null); setNombreClienteInput(''); setPersonasInput(1) }}>
            <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>

              {/* Header del modal */}
              <div className="bg-stone-900 px-6 py-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-stone-400 text-xs font-semibold uppercase tracking-widest mb-0.5">Nueva comanda</p>
                    <h3 className="text-white text-2xl font-bold font-serif">Mesa {showManualModal.numero}</h3>
                  </div>
                  <span className="text-4xl">🪑</span>
                </div>
              </div>

              {/* Cuerpo */}
              <div className="px-6 py-5 space-y-5">

                {/* Nombre */}
                <div>
                  <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">Nombre del cliente</label>
                  <input
                    type="text"
                    placeholder="Ej: Juan Pérez"
                    value={nombreClienteInput}
                    onChange={e => setNombreClienteInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && nombreClienteInput.trim() && iniciarComandaManual(showManualModal.id, nombreClienteInput, personasInput)}
                    className="w-full px-4 py-3.5 bg-stone-50 text-stone-900 border-2 border-stone-200 rounded-xl text-base font-semibold focus:outline-none focus:border-amber-500 focus:bg-white transition-all placeholder:text-stone-300"
                    autoFocus
                  />
                </div>

                {/* Personas */}
                <div>
                  <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-3">Número de personas</label>
                  <div className="flex items-center justify-between bg-stone-50 border-2 border-stone-200 rounded-xl p-2">
                    <button
                      onClick={() => setPersonasInput(p => Math.max(1, p - 1))}
                      className="w-12 h-12 rounded-lg bg-white border border-stone-200 text-stone-700 font-bold text-2xl hover:bg-stone-100 hover:border-stone-300 transition-all active:scale-95 shadow-sm"
                    >
                      −
                    </button>
                    <div className="text-center">
                      <span className="text-4xl font-black text-stone-900 leading-none">{personasInput}</span>
                      <p className="text-xs text-stone-400 mt-1">{personasInput === 1 ? 'persona' : 'personas'}</p>
                    </div>
                    <button
                      onClick={() => setPersonasInput(p => Math.min(20, p + 1))}
                      className="w-12 h-12 rounded-lg bg-white border border-stone-200 text-stone-700 font-bold text-2xl hover:bg-stone-100 hover:border-stone-300 transition-all active:scale-95 shadow-sm"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* Footer con acciones */}
              <div className="px-6 pb-6 flex gap-3">
                <button
                  onClick={() => { setShowManualModal(null); setNombreClienteInput(''); setPersonasInput(1) }}
                  className="flex-1 py-3.5 bg-stone-100 hover:bg-stone-200 text-stone-600 rounded-xl font-bold text-sm transition-all"
                >
                  Cancelar
                </button>
                <button
                  disabled={!nombreClienteInput.trim() || creandoComanda}
                  onClick={() => iniciarComandaManual(showManualModal.id, nombreClienteInput, personasInput)}
                  className="flex-[2] py-3.5 bg-amber-500 hover:bg-amber-400 text-white rounded-xl font-bold text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-amber-200 active:scale-95"
                >
                  {creandoComanda ? 'Iniciando...' : `Iniciar comanda`}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal: reserva existente */}
        {showReservaModal && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 backdrop-blur-sm" onClick={() => setShowReservaModal(null)}>
            <div className="bg-rustica-card rounded-2xl p-6 w-full max-w-[380px] border border-stone-200" onClick={e => e.stopPropagation()}>
              <h3 className="text-rustica-gold text-xl font-bold font-serif mb-2">Reservas para Mesa {showReservaModal.numero}</h3>
              <p className="text-xs text-stone-500 mb-4">Selecciona una reservación de hoy para iniciar el servicio.</p>
              <div className="space-y-2 mb-6 max-h-[160px] overflow-y-auto">
                {showReservaModal.reservas_hoy.map(res => (
                  <div
                    key={res.id}
                    onClick={() => setSelectedResId(res.id.toString())}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${selectedResId === res.id.toString() ? 'border-rustica-gold bg-rustica-gold/10' : 'border-stone-200 bg-stone-50 hover:bg-stone-100'}`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-rustica-light text-xs font-bold">{res.nombre}</span>
                      <span className="text-rustica-gold text-xs font-bold">{res.hora}</span>
                    </div>
                    <p className="text-[10px] text-stone-500 mt-1">Personas: {res.personas}</p>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <button onClick={() => setShowReservaModal(null)} className="flex-1 py-2 bg-transparent border border-stone-300 rounded-lg text-xs font-bold transition-all">Cancelar</button>
                <button disabled={!selectedResId || convirtiendoReserva} onClick={() => convertirReserva(showReservaModal.id, selectedResId)} className="flex-1 py-2 bg-rustica-gold text-neutral-900 rounded-lg text-xs font-bold transition-all disabled:opacity-50">
                  {convirtiendoReserva ? 'Sentando...' : 'Sentar y Servir'}
                </button>
              </div>
              <div className="relative flex items-center justify-center my-4">
                <div className="border-t border-stone-200 w-full" />
                <span className="absolute bg-rustica-card px-3 text-[10px] text-stone-400 font-bold uppercase">o crear manual</span>
              </div>
              <button onClick={() => { setShowReservaModal(null); setShowManualModal(showReservaModal) }} className="w-full py-2 bg-stone-50 border border-stone-200 hover:border-stone-300 text-rustica-light rounded-lg text-xs font-bold transition-all">
                Crear comanda manualmente
              </button>
            </div>
          </div>
        )}
      </div>
    )
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // RENDER 2: Área de captura de comanda
  // ─────────────────────────────────────────────────────────────────────────────
  const sinComanda = !loadCmd && !comanda

  return (
    <div className="min-h-screen bg-stone-50 text-stone-800 font-sans antialiased flex flex-col">

      {/* Header */}
      <header className="bg-white border-b border-stone-200 px-4 py-3 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-3">
          {!configMesaId && (
            <button onClick={volverAMesas} className="py-1.5 px-3 bg-stone-100 border border-stone-200 hover:border-stone-300 text-stone-600 rounded-lg text-xs font-bold transition-all flex items-center gap-1">
              ← Volver
            </button>
          )}
          <div>
            <h2 className="font-serif text-xl text-stone-900 font-bold leading-tight">Mesa #{mesaId}</h2>
            {comanda?.cliente && (
              <span className="text-stone-500 text-xs block leading-tight">
                👤 {comanda.cliente}{comanda.personas > 1 && <span className="ml-1 text-stone-400">· {comanda.personas} pers.</span>}
              </span>
            )}
          </div>
        </div>
        <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${
          cuentaSolicitada  ? 'bg-purple-100 text-purple-700 border-purple-300' :
          listoParaServir   ? 'bg-teal-100 text-teal-700 border-teal-300' :
          enCocina          ? 'bg-orange-100 text-orange-700 border-orange-300' :
          itemsLocal.length ? 'bg-amber-50 text-amber-700 border-amber-200' :
                              'bg-stone-100 text-stone-400 border-stone-200'
        }`}>
          {cuentaSolicitada ? '💳 Pagando' : listoParaServir ? '🍽 Listo — servir' : enCocina ? '⏳ En cocina' : itemsLocal.length > 0 ? `${itemsLocal.length} items` : 'Sin comanda'}
        </span>
      </header>

      {/* Tabs */}
      {!sinComanda && (
        <div className="bg-white border-b border-stone-200 flex shrink-0">
          <button
            onClick={() => { setVista('buscar'); setTimeout(() => searchRef.current?.focus(), 50) }}
            className={`flex-1 py-3 text-sm font-bold border-b-2 transition-all ${vista === 'buscar' ? 'border-amber-500 text-amber-700 bg-amber-50/30' : 'border-transparent text-stone-400 hover:text-stone-600'}`}
          >
            🔍 Agregar productos
          </button>
          <button
            onClick={() => setVista('comanda')}
            className={`flex-1 py-3 text-sm font-bold border-b-2 transition-all relative ${vista === 'comanda' ? 'border-amber-500 text-amber-700 bg-amber-50/30' : 'border-transparent text-stone-400 hover:text-stone-600'}`}
          >
            📋 Comanda
            {itemsLocal.length > 0 && (
              <span className="ml-1.5 inline-flex items-center justify-center w-5 h-5 bg-amber-500 text-white text-[10px] font-bold rounded-full">
                {itemsLocal.length}
              </span>
            )}
          </button>
        </div>
      )}

      {/* Notificación */}
      {msg && (
        <div className={`px-4 py-2.5 text-xs font-bold text-center shrink-0 ${msg.tipo === 'ok' ? 'bg-emerald-50 text-emerald-700 border-b border-emerald-200' : 'bg-rose-50 text-rose-600 border-b border-rose-200'}`}>
          {msg.texto}
        </div>
      )}

      {/* Cargando comanda */}
      {loadCmd && (
        <div className="flex-1 flex justify-center items-center">
          <div className="w-8 h-8 rounded-full border-2 border-stone-200 border-t-amber-500 animate-spin" />
        </div>
      )}

      {/* Sin comanda: iniciar */}
      {!loadCmd && sinComanda && (
        <div className="flex-1 flex flex-col items-center justify-center p-6">
          <p className="text-5xl mb-4">🪑</p>
          <h2 className="font-serif text-2xl text-stone-800 font-bold mb-1">Sin comanda activa</h2>
          <p className="text-sm text-stone-400 mb-8 text-center max-w-xs">Ingresa el nombre del cliente para comenzar a tomar el pedido.</p>
          <div className="w-full max-w-[280px]">
            <input
              type="text"
              placeholder="Nombre del cliente"
              value={nombreClienteInput}
              onChange={e => setNombreClienteInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && nombreClienteInput.trim() && iniciarComandaManual(mesaId, nombreClienteInput)}
              className="w-full px-4 py-3 bg-white text-stone-900 border border-stone-300 rounded-xl text-sm mb-3 focus:outline-none focus:border-amber-500 transition-colors font-semibold text-center"
              autoFocus
            />
            <button
              onClick={() => iniciarComandaManual(mesaId, nombreClienteInput)}
              disabled={!nombreClienteInput.trim() || creandoComanda}
              className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-white font-bold text-sm rounded-xl shadow-lg transition-all disabled:opacity-50"
            >
              {creandoComanda ? 'Iniciando...' : 'Iniciar comanda'}
            </button>
          </div>
        </div>
      )}

      {/* ── VISTA: BUSCAR ───────────────────────────────────────────────────────── */}
      {!loadCmd && !sinComanda && vista === 'buscar' && (
        <div className="flex-1 flex flex-col overflow-hidden">

          {/* Buscador */}
          <div className="bg-white px-4 pt-4 pb-3 border-b border-stone-100 shrink-0">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-base pointer-events-none">🔍</span>
              <input
                ref={searchRef}
                type="text"
                placeholder="Buscar en el menú…"
                value={busquedaMenu}
                onChange={e => setBusquedaMenu(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-900 focus:outline-none focus:border-amber-500 focus:bg-white transition-all font-medium"
              />
              {busquedaMenu && (
                <button
                  onClick={() => setBusquedaMenu('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 font-bold text-lg leading-none"
                >
                  ×
                </button>
              )}
            </div>
          </div>

          {/* Chips de categoría */}
          <div className="bg-white px-4 py-2.5 flex gap-2 overflow-x-auto scrollbar-hide border-b border-stone-100 shrink-0">
            <button
              onClick={() => setCategoriaActiva('')}
              className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-bold border transition-all ${
                !categoriaActiva ? 'bg-amber-500 text-white border-amber-500' : 'bg-white text-stone-500 border-stone-200 hover:border-amber-400'
              }`}
            >
              Todos
            </button>
            {categorias.map(cat => (
              <button
                key={cat.slug}
                onClick={() => setCategoriaActiva(prev => prev === cat.slug ? '' : cat.slug)}
                className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-bold border transition-all whitespace-nowrap ${
                  categoriaActiva === cat.slug ? 'bg-amber-500 text-white border-amber-500' : 'bg-white text-stone-500 border-stone-200 hover:border-amber-400'
                }`}
              >
                {getCatIcon(cat.slug)} {cat.categoria}
              </button>
            ))}
          </div>

          {/* Lista de productos */}
          <div className="flex-1 overflow-y-auto px-4 pt-3 pb-28">
            {loadMenu ? (
              <div className="flex justify-center py-16">
                <div className="w-6 h-6 rounded-full border-2 border-stone-200 border-t-amber-500 animate-spin" />
              </div>
            ) : productosFiltrados.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-4xl mb-3">🔍</p>
                <p className="text-stone-500 font-semibold">Sin resultados</p>
                <p className="text-stone-400 text-sm mt-1">
                  {busquedaMenu ? `No hay productos para "${busquedaMenu}"` : 'No hay productos en esta categoría'}
                </p>
                {(busquedaMenu || categoriaActiva) && (
                  <button onClick={() => { setBusquedaMenu(''); setCategoriaActiva('') }} className="mt-4 text-amber-600 text-sm font-bold hover:underline">
                    Ver todo el menú
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                {productosFiltrados.map(item => {
                  const enComanda = itemsLocal.find(i => i.producto_id === item.id)
                  return (
                    <div
                      key={item.id}
                      className={`bg-white rounded-xl border transition-all ${enComanda ? 'border-amber-300 shadow-sm' : 'border-stone-200 hover:border-stone-300'}`}
                    >
                      <div className="flex items-stretch gap-0">
                        {/* Imagen o placeholder */}
                        <div
                          className="flex items-center justify-center w-16 shrink-0 rounded-l-xl overflow-hidden bg-stone-50 cursor-pointer"
                          onClick={() => setModal({ ...item, categoria: item.catSlug })}
                        >
                          {item.imagen ? (
                            <img src={item.imagen} alt={item.nombre} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-2xl">{getCatIcon(item.catSlug)}</span>
                          )}
                        </div>

                        {/* Info producto */}
                        <div
                          className="flex-1 px-3 py-3 cursor-pointer min-w-0"
                          onClick={() => setModal({ ...item, categoria: item.catSlug })}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <p className="font-bold text-sm text-stone-800 leading-tight">{item.nombre}</p>
                            {enComanda && (
                              <span className="shrink-0 text-[10px] bg-amber-100 text-amber-700 font-bold px-1.5 py-0.5 rounded-full">
                                ×{enComanda.cantidad}
                              </span>
                            )}
                          </div>
                          {item.desc && (
                            <p className="text-xs text-stone-400 mt-0.5 line-clamp-2 leading-snug">{item.desc}</p>
                          )}
                          <div className="flex items-center gap-2 mt-1.5">
                            <span className="text-sm font-bold text-amber-700">${parseFloat(item.precio || 0).toLocaleString('es-CO')}</span>
                            {item.tiempo_prep > 0 && (
                              <span className="text-[10px] text-stone-400">🕒 {item.tiempo_prep} min</span>
                            )}
                          </div>
                        </div>

                        {/* Controles cantidad */}
                        {enComanda ? (
                          <div className="shrink-0 flex flex-col items-center justify-center rounded-r-xl overflow-hidden border-l border-amber-200 bg-amber-50 w-14">
                            <button
                              onClick={() => quickAdd(item)}
                              className="flex-1 w-full flex items-center justify-center text-amber-600 hover:bg-amber-100 font-bold text-xl transition-all active:scale-95"
                            >
                              +
                            </button>
                            <span className="text-xs font-black text-amber-700 leading-none py-0.5 select-none">
                              {enComanda.cantidad}
                            </span>
                            <button
                              onClick={() => quickRemove(item.id)}
                              className="flex-1 w-full flex items-center justify-center text-rose-500 hover:bg-rose-50 font-bold text-xl transition-all active:scale-95"
                            >
                              −
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => quickAdd(item)}
                            className="shrink-0 w-14 flex items-center justify-center bg-amber-500 hover:bg-amber-400 text-white rounded-r-xl font-bold text-2xl transition-all active:scale-95"
                            title="Agregar al pedido"
                          >
                            +
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Barra flotante de comanda */}
          {itemsLocal.length > 0 && (
            <div className="fixed bottom-0 left-0 right-0 bg-stone-900 border-t border-stone-700 px-4 py-3 flex items-center justify-between gap-3 z-30">
              <div>
                <p className="text-white text-sm font-bold">{itemsLocal.length} ítem{itemsLocal.length !== 1 ? 's' : ''}</p>
                <p className="text-stone-400 text-xs">${total.toLocaleString('es-CO')} total</p>
              </div>
              <button
                onClick={() => setVista('comanda')}
                className="bg-amber-500 hover:bg-amber-400 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all active:scale-95 whitespace-nowrap"
              >
                Ver comanda →
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── VISTA: COMANDA ──────────────────────────────────────────────────────── */}
      {!loadCmd && !sinComanda && vista === 'comanda' && (
        <div className="flex-1 overflow-y-auto px-4 py-4 pb-8">
          {/* Botón volver al buscador */}
          <button
            onClick={() => { setVista('buscar'); setTimeout(() => searchRef.current?.focus(), 50) }}
            className="mb-4 text-amber-600 text-sm font-bold hover:underline flex items-center gap-1"
          >
            ← Seguir agregando productos
          </button>

          {/* Banners de estado */}
          {listoParaServir && !cuentaSolicitada && (
            <div className="p-4 bg-teal-50 border-2 border-teal-400 rounded-xl text-center mb-4 animate-pulse">
              <p className="text-teal-700 text-sm font-bold">🍽 ¡Pedido listo! — Lleva los platos a la mesa</p>
            </div>
          )}
          {enCocina && !cuentaSolicitada && (
            <div className="p-3 bg-orange-50 border border-orange-300 rounded-xl text-center mb-4">
              <p className="text-orange-700 text-xs font-semibold">🍳 Pedido en cocina — puedes agregar más ítems</p>
            </div>
          )}
          {cuentaSolicitada && (
            <div className="p-4 bg-purple-50 border border-purple-300 rounded-xl text-center mb-4">
              <p className="text-purple-700 text-sm font-bold">💳 Cuenta en proceso de facturación</p>
              <p className="text-stone-500 text-xs mt-1">El cajero está procesando el pago.</p>
            </div>
          )}

          {/* Lista de ítems */}
          {itemsLocal.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-4xl mb-3">📋</p>
              <p className="text-stone-500 font-semibold">Comanda vacía</p>
              <p className="text-stone-400 text-sm mt-1">Agrega productos desde el buscador.</p>
              <button onClick={() => setVista('buscar')} className="mt-4 bg-amber-500 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all">
                🔍 Ir al menú
              </button>
            </div>
          ) : (
            <>
              <div className="bg-white rounded-xl border border-stone-200 overflow-hidden mb-4">
                {itemsLocal.map((item, idx) => (
                  <div key={idx} className={`flex items-center gap-3 px-4 py-3 ${idx > 0 ? 'border-t border-stone-100' : ''}`}>
                    {/* Nombre + notas */}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-stone-800 truncate">{item.nombre}</p>
                      {item.notas && <p className="text-[11px] text-stone-400 italic mt-0.5 truncate">↳ {item.notas}</p>}
                      {item.modificadores?.termino && <span className="text-[10px] text-amber-700 font-bold uppercase">{item.modificadores.termino}</span>}
                      {item.modificadores?.tamano  && <span className="text-[10px] text-blue-600 font-bold uppercase ml-1">{item.modificadores.tamano}</span>}
                    </div>

                    {/* Controles cantidad */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button disabled={comandaBloqueada} onClick={() => cambiarCantidad(idx, item.cantidad - 1)} className="w-7 h-7 flex items-center justify-center bg-stone-100 border border-stone-200 rounded-lg hover:bg-stone-200 font-bold text-sm disabled:opacity-50 transition">−</button>
                      <span className="text-sm font-bold w-6 text-center">{item.cantidad}</span>
                      <button disabled={comandaBloqueada} onClick={() => cambiarCantidad(idx, item.cantidad + 1)} className="w-7 h-7 flex items-center justify-center bg-stone-100 border border-stone-200 rounded-lg hover:bg-stone-200 font-bold text-sm disabled:opacity-50 transition">+</button>
                    </div>

                    {/* Precio */}
                    {esGerente ? (
                      <div className="flex items-center bg-stone-50 border border-stone-200 rounded-lg px-2 shrink-0">
                        <span className="text-stone-400 text-xs">$</span>
                        <input
                          type="number"
                          disabled={enCocina}
                          value={item.precio}
                          onChange={e => cambiarPrecio(idx, parseFloat(e.target.value) || 0)}
                          className="w-16 bg-transparent text-amber-700 font-bold text-xs text-right focus:outline-none p-1"
                        />
                      </div>
                    ) : (
                      <span className="text-amber-700 text-sm font-bold min-w-[60px] text-right shrink-0">
                        ${(item.precio * item.cantidad).toLocaleString('es-CO')}
                      </span>
                    )}

                    {/* Eliminar */}
                    <button disabled={comandaBloqueada} onClick={() => eliminarItem(idx)} className="text-stone-300 hover:text-rose-500 font-bold text-lg leading-none disabled:opacity-30 transition shrink-0">×</button>
                  </div>
                ))}
              </div>

              {/* Total */}
              <div className="flex justify-between items-center px-4 py-3 bg-white rounded-xl border border-stone-200 mb-5">
                <span className="font-semibold text-stone-500 text-sm">Total acumulado</span>
                <span className="text-amber-700 text-2xl font-bold">${total.toLocaleString('es-CO')}</span>
              </div>

              {/* Acciones */}
              {!cuentaSolicitada && (
                <div className="flex flex-col gap-2">
                  <div className="flex gap-2">
                    <button
                      onClick={guardarCambios}
                      disabled={guardando || itemsLocal.length === 0}
                      className="flex-1 py-3 bg-white border border-amber-500 hover:bg-amber-50 text-amber-700 rounded-xl font-bold text-sm transition-all disabled:opacity-50"
                    >
                      {guardando ? 'Guardando…' : 'Guardar'}
                    </button>
                    <button
                      onClick={enviarAcocina}
                      disabled={enviando || !comanda?.id || itemsLocal.length === 0}
                      className="flex-[2] py-3 bg-amber-500 hover:bg-amber-400 text-white rounded-xl font-bold text-sm shadow-md transition-all disabled:opacity-50"
                    >
                      {enviando ? 'Enviando…' : enCocina ? '🍳 Reenviar a Cocina' : '🍳 Enviar a Cocina'}
                    </button>
                  </div>
                  <button
                    onClick={solicitarCuenta}
                    disabled={solicitandoCuenta || !comanda?.id || itemsLocal.length === 0}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-sm shadow-md transition-all disabled:opacity-50"
                  >
                    {solicitandoCuenta ? 'Solicitando…' : '💳 Solicitar Cuenta'}
                  </button>
                </div>
              )}

              {/* Cancelar comanda */}
              <div className="mt-3 pt-3 border-t border-stone-100">
                <button
                  onClick={cancelarComanda}
                  disabled={cancelandoComanda || !comanda?.id}
                  className="w-full py-2.5 text-xs font-bold text-rose-500 border border-rose-200 hover:bg-rose-50 rounded-xl transition-all disabled:opacity-50"
                >
                  {cancelandoComanda ? 'Cancelando…' : '✕ Cancelar comanda — cliente se retira'}
                </button>
              </div>
            </>
          )}
        </div>
      )}

      <ModificadorModal
        producto={modal}
        onConfirmar={agregarDesdeModal}
        onCancelar={() => setModal(null)}
      />
    </div>
  )
}
