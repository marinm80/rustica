import { useState, useEffect, useCallback } from 'react'
import MesaCard from '../components/MesaCard'
import LoginScreen from '../components/LoginScreen'

const NOMBRES_ZONA = {
  'salon-principal': 'Salón Principal',
  'la-terrazza':     'La Terrazza',
  'zona-vip':        'Zona VIP',
}

// Resolver la URL de la API dinámicamente según el contexto (WP o Headless)
const getApiUrl = () => {
  if (window.RusticaConfig?.apiUrl) {
    return window.RusticaConfig.apiUrl
  }
  const savedUrl = localStorage.getItem('rustica_api_url')
  return savedUrl ? `${savedUrl}/rustica/v1` : 'http://localhost:8080/wp-json/rustica/v1'
}

// Resolver las cabeceras de autorización de forma dinámica (Nonce de WP o Bearer JWT)
const getHeaders = (hasJsonBody = false) => {
  const headers = {}
  if (hasJsonBody) {
    headers['Content-Type'] = 'application/json'
  }
  if (window.RusticaConfig?.nonce) {
    headers['X-WP-Nonce'] = window.RusticaConfig.nonce
  }
  const token = localStorage.getItem('rustica_token')
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  return headers
}

export default function ReservasApp() {
  const [authTrigger, setAuthTrigger] = useState(0)
  const [showLoginHeadless, setShowLoginHeadless] = useState(false)

  // Si no estamos dentro de WP y no tenemos token, requerir autenticación
  const isEmbedded = !!window.RusticaConfig
  const isLoggedHeadless = !isEmbedded && !!localStorage.getItem('rustica_token')
  const isStaff = isEmbedded
    ? (window.RusticaConfig?.is_staff || false)
    : (localStorage.getItem('rustica_is_staff') === '1')

  const esGerente = isEmbedded
    ? (window.RusticaConfig?.es_gerente || false)
    : (localStorage.getItem('rustica_es_gerente') === '1')

  const siteUrl = window.RusticaConfig?.siteUrl || ''

  // Navegación principal para Staff (Dashboard vs Formulario)
  const [activeTab, setActiveTab] = useState(isStaff ? 'dashboard' : 'crear')

  // ───────────────────────────────────────────────────────────────────────────
  // ESTADOS DEL CLIENTE (Wizard de Reservación)
  // ───────────────────────────────────────────────────────────────────────────
  const [step, setStep]             = useState('fecha')
  const [fecha, setFecha]           = useState('')
  const [hora, setHora]             = useState('')
  const [personas, setPersonas]     = useState(2)
  const [zona, setZona]             = useState(window.RusticaZonaPreseleccionada || '')
  const [mesasDisponibles, setMesasDisponibles] = useState([])
  const [mesaSeleccionada, setMesa] = useState(null)
  const [form, setForm]             = useState({ nombre: '', email: '', telefono: '', notas: '' })
  const [resultado, setResultado]   = useState(null)
  const [loading, setLoading]       = useState(false)

  // ───────────────────────────────────────────────────────────────────────────
  // ESTADOS DEL STAFF (Panel de Gestión)
  // ───────────────────────────────────────────────────────────────────────────
  const [reservaciones, setReservaciones] = useState([])
  const [mesasFisicas, setMesasFisicas]   = useState([])
  const [loadReservas, setLoadReservas]   = useState(false)
  const [filtroTexto, setFiltroTexto]     = useState('')
  const [filtroFecha, setFiltroFecha]     = useState('')
  const [filtroEstado, setFiltroEstado]   = useState('activas') // 'activas' o 'procesadas'
  const [editReserva, setEditReserva]     = useState(null)      // Reserva siendo editada
  const [editForm, setEditForm]           = useState({})
  const [editError, setEditError]         = useState(null)
  const [guardandoEdit, setGuardandoEdit] = useState(false)

  const API = getApiUrl()

  // Escuchar clics en las zonas del landing
  useEffect(() => {
    const handler = (e) => {
      setZona(e.detail.zona)
      setStep('fecha')
      setActiveTab('crear')
    }
    document.addEventListener('rustica:zona', handler)
    return () => document.removeEventListener('rustica:zona', handler)
  }, [])

  // Cargar reservaciones y mesas físicas para el staff
  const cargarDatosStaff = useCallback(async () => {
    if (!isStaff) return
    setLoadReservas(true)
    try {
      const [resRes, resMesas] = await Promise.all([
        fetch(`${API}/reservaciones`, { headers: getHeaders() }),
        fetch(`${API}/mesas`, { headers: getHeaders() })
      ])
      if (resRes.status === 401 && !isEmbedded) {
        handleLogout()
        return
      }
      const dataRes = await resRes.json()
      const dataMesas = await resMesas.json()
      setReservaciones(dataRes.reservaciones || [])
      setMesasFisicas(dataMesas || [])
    } catch (_) {}
    setLoadReservas(false)
  }, [isStaff, API])

  useEffect(() => {
    cargarDatosStaff()
  }, [cargarDatosStaff, activeTab, authTrigger])

  // Buscar mesas libres (Wizard Cliente)
  const buscarMesas = async () => {
    if (!fecha || !hora) return
    setLoading(true)
    const params = new URLSearchParams({ fecha, hora, personas })
    if (zona) params.append('zona', zona)
    const res  = await fetch(`${API}/mesas/disponibles?${params}`)
    const data = await res.json()
    setMesasDisponibles(data.disponibles || [])
    setStep('mesa')
    setLoading(false)
  }

  // Confirmar reserva (Wizard Cliente)
  const confirmarReserva = async () => {
    setLoading(true)
    const res = await fetch(`${API}/reservacion`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ mesa_id: mesaSeleccionada.id, fecha, hora, personas, ...form }),
    })
    const data = await res.json()
    setResultado(data)
    setStep('confirmacion')
    setLoading(false)

    // Notificar a ZonasApp
    document.dispatchEvent(new CustomEvent('rustica:reservacion_completada'))
  }

  const resetearWizard = () => {
    setStep('fecha'); setFecha(''); setHora('')
    setMesa(null); setResultado(null); setZona('')
    setForm({ nombre: '', email: '', telefono: '', notas: '' })
    window.RusticaZonaPreseleccionada = ''
  }

  // ───────────────────────────────────────────────────────────────────────────
  // ACCIONES DEL STAFF
  // ───────────────────────────────────────────────────────────────────────────
  const sentarCliente = async (reservaId, mesaId) => {
    if (window.confirm('¿Desea registrar al cliente como sentado e iniciar su comanda?')) {
      try {
        const res = await fetch(`${API}/reservacion/convertir-comanda`, {
          method:  'POST',
          headers: getHeaders(true),
          body:    JSON.stringify({ reservacion_id: reservaId, mesa_id: mesaId }),
        })
        if (res.status === 401 && !isEmbedded) {
          handleLogout()
          return
        }
        const data = await res.json()
        if (data.ok) {
          // Redirigir a la tablet del mesero para esa mesa
          if (isEmbedded) {
            window.location.href = `${siteUrl}/mesero/?mesa=${mesaId}`
          } else {
            // Si corre headless, despachamos un evento para la SPA y también una alerta
            window.dispatchEvent(new CustomEvent('rustica:navigate', { 
              detail: { app: 'mesero', mesaId: parseInt(mesaId) } 
            }));
            cargarDatosStaff()
          }
        } else {
          alert(data.message || 'Error al sentar cliente')
        }
      } catch (_) {
        alert('Error al procesar la comanda')
      }
    }
  }

  const cancelarReservaDirecta = async (reservaId) => {
    if (window.confirm('¿Seguro que deseas cancelar esta reservación?')) {
      try {
        const res = await fetch(`${API}/reservacion/actualizar`, {
          method: 'POST',
          headers: getHeaders(true),
          body: JSON.stringify({ id: reservaId, estado: 'cancelada' })
        })
        if (res.status === 401 && !isEmbedded) { handleLogout(); return }
        if (res.ok) cargarDatosStaff()
      } catch (_) {
        alert('Error al cancelar la reservación')
      }
    }
  }

  const eliminarReservacion = async (reservaId, nombre) => {
    if (!window.confirm(`¿Eliminar permanentemente la reservación de "${nombre}"?\nEsta acción no se puede deshacer.`)) return
    try {
      const res = await fetch(`${API}/reservacion/eliminar`, {
        method: 'POST',
        headers: getHeaders(true),
        body: JSON.stringify({ reservacion_id: reservaId }),
      })
      if (res.status === 401 && !isEmbedded) { handleLogout(); return }
      const data = await res.json()
      if (data.ok) {
        cargarDatosStaff()
      } else {
        alert(data.message || 'Error al eliminar reservación')
      }
    } catch (_) {
      alert('Error de red al eliminar reservación')
    }
  }

  const abrirEditor = (reserva) => {
    setEditReserva(reserva)
    setEditForm({
      id:       reserva.id,
      nombre:   reserva.nombre,
      fecha:    reserva.fecha,
      hora:     reserva.hora,
      personas: reserva.personas,
      notas:    reserva.notas,
      mesa_id:  reserva.mesa_id,
      estado:   reserva.estado
    })
    setEditError(null)
  }

  const guardarEdicion = async () => {
    setGuardandoEdit(true)
    setEditError(null)
    try {
      const res = await fetch(`${API}/reservacion/actualizar`, {
        method:  'POST',
        headers: getHeaders(true),
        body:    JSON.stringify(editForm)
      })
      if (res.status === 401 && !isEmbedded) {
        handleLogout()
        return
      }
      const data = await res.json()
      if (res.ok) {
        setEditReserva(null)
        cargarDatosStaff()
      } else {
        setEditError(data.message || 'Error al actualizar reservación')
      }
    } catch (_) {
      setEditError('Error de red al actualizar reservación')
    }
    setGuardandoEdit(false)
  }

  const guardarYSentar = async () => {
    if (!editForm.mesa_id) {
      setEditError('Debes asignar una mesa antes de sentar al cliente.')
      return
    }
    setGuardandoEdit(true)
    setEditError(null)
    try {
      // 1. Guardar cambios de la reserva (incluyendo mesa asignada)
      const resEdit = await fetch(`${API}/reservacion/actualizar`, {
        method:  'POST',
        headers: getHeaders(true),
        body:    JSON.stringify(editForm)
      })
      if (resEdit.status === 401 && !isEmbedded) { handleLogout(); return }
      if (!resEdit.ok) {
        const d = await resEdit.json()
        setEditError(d.message || 'Error al guardar la reservación')
        setGuardandoEdit(false)
        return
      }
      // 2. Convertir a comanda
      const resCmd = await fetch(`${API}/reservacion/convertir-comanda`, {
        method:  'POST',
        headers: getHeaders(true),
        body:    JSON.stringify({ reservacion_id: editForm.id, mesa_id: editForm.mesa_id }),
      })
      if (resCmd.ok) {
        setEditReserva(null)
        const siteUrl = window.location.origin
        if (isEmbedded) {
          window.dispatchEvent(new CustomEvent('rustica:navigate', { detail: { app: 'mesero', mesaId: parseInt(editForm.mesa_id) } }))
        } else {
          window.location.href = `${siteUrl}/mesero/?mesa=${editForm.mesa_id}`
        }
      } else {
        const d = await resCmd.json()
        setEditError(d.message || 'Error al iniciar la comanda')
      }
    } catch (_) {
      setEditError('Error de red')
    }
    setGuardandoEdit(false)
  }

  const handleLogout = () => {
    localStorage.removeItem('rustica_token')
    localStorage.removeItem('rustica_api_url')
    localStorage.removeItem('rustica_user_role')
    localStorage.removeItem('rustica_es_gerente')
    localStorage.removeItem('rustica_is_staff')
    localStorage.removeItem('rustica_user_display_name')
    setActiveTab('crear')
    setAuthTrigger(prev => prev + 1)
  }

  // Filtrado de reservaciones
  const reservacionesFiltradas = reservaciones.filter(r => {
    const coincideTexto = (r.nombre || '').toLowerCase().includes(filtroTexto.toLowerCase()) || 
                         (r.email && (r.email || '').toLowerCase().includes(filtroTexto.toLowerCase())) ||
                         (r.telefono && (r.telefono || '').includes(filtroTexto))
    const coincideFecha = !filtroFecha || r.fecha === filtroFecha

    let coincideEstado = false
    if (filtroEstado === 'activas') {
      coincideEstado = r.estado === 'confirmada' || r.estado === 'pendiente'
    } else {
      coincideEstado = r.estado === 'sentado' || r.estado === 'cancelada'
    }

    return coincideTexto && coincideFecha && coincideEstado
  })

  // Si el usuario headless seleccionó iniciar sesión
  if (showLoginHeadless && !isEmbedded) {
    return (
      <LoginScreen 
        onLoginSuccess={() => {
          setShowLoginHeadless(false);
          setActiveTab('dashboard');
          setAuthTrigger(prev => prev + 1);
        }} 
      />
    )
  }

  const userDisplayName = localStorage.getItem('rustica_user_display_name') || 'Personal'

  return (
    <div className="w-full max-w-4xl mx-auto py-2 font-sans antialiased text-rustica-light">
      
      {/* Barra de cabecera con botón de acceso/cierre sesión para headless */}
      {!isEmbedded && (
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-stone-200">
          <span className="text-xs text-stone-500 font-bold uppercase tracking-wider">
            {isStaff ? `👤 Personal: ${userDisplayName}` : 'Portal Reservaciones'}
          </span>
          {isStaff ? (
            <button 
              onClick={handleLogout}
              className="py-1.5 px-3.5 bg-rose-100/60 border border-rose-200/60 hover:bg-rose-200/60 text-rose-600 text-xs font-bold rounded-lg transition-all"
            >
              Cerrar Sesión
            </button>
          ) : (
            <button 
              onClick={() => setShowLoginHeadless(true)}
              className="py-1.5 px-3.5 bg-stone-50 border border-stone-200 hover:border-stone-300 text-rustica-gold text-xs font-bold rounded-lg transition-all"
            >
              🔐 Acceso Personal
            </button>
          )}
        </div>
      )}

      {/* Navegación de pestañas Staff */}
      {isStaff && (
        <div className="flex border-b border-stone-200 mb-6 gap-2">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`py-3 px-6 text-sm font-bold border-b-2 transition-all ${
              activeTab === 'dashboard' 
                ? 'border-rustica-gold text-rustica-gold bg-stone-50/20' 
                : 'border-transparent text-stone-500 hover:text-rustica-light'
            }`}
          >
            📋 Gestionar Reservas
          </button>
          <button
            onClick={() => { setActiveTab('crear'); resetearWizard(); }}
            className={`py-3 px-6 text-sm font-bold border-b-2 transition-all ${
              activeTab === 'crear' 
                ? 'border-rustica-gold text-rustica-gold bg-stone-50/20' 
                : 'border-transparent text-stone-500 hover:text-rustica-light'
            }`}
          >
            ➕ Nueva Reserva
          </button>
        </div>
      )}

      {/* PESTAÑA 1: DASHBOARD STAFF */}
      {isStaff && activeTab === 'dashboard' && (
        <div className="space-y-6">
          
          {/* Barra de Filtros */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-rustica-card p-4 rounded-xl border border-stone-200 shadow-lg">
            <div>
              <label className="block text-[10px] uppercase font-bold text-stone-500 mb-1.5">Buscador</label>
              <input
                type="text"
                placeholder="Nombre, email, tel..."
                value={filtroTexto}
                onChange={e => setFiltroTexto(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-xs text-stone-900 focus:outline-none focus:border-rustica-gold transition-colors"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase font-bold text-stone-500 mb-1.5">Fecha</label>
              <input
                type="date"
                value={filtroFecha}
                onChange={e => setFiltroFecha(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-xs text-stone-900 focus:outline-none focus:border-rustica-gold transition-colors"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase font-bold text-stone-500 mb-1.5">Estado</label>
              <div className="flex gap-1.5">
                <button
                  onClick={() => setFiltroEstado('activas')}
                  className={`flex-1 py-2 rounded-lg text-[10px] font-bold border transition-all ${
                    filtroEstado === 'activas'
                      ? 'bg-rustica-gold text-neutral-900 border-rustica-gold shadow-lg shadow-rustica-gold/10'
                      : 'bg-stone-50 text-stone-500 border-stone-200 hover:text-rustica-light'
                  }`}
                >
                  Activas
                </button>
                <button
                  onClick={() => setFiltroEstado('procesadas')}
                  className={`flex-1 py-2 rounded-lg text-[10px] font-bold border transition-all ${
                    filtroEstado === 'procesadas'
                      ? 'bg-rustica-gold text-neutral-900 border-rustica-gold shadow-lg shadow-rustica-gold/10'
                      : 'bg-stone-50 text-stone-500 border-stone-200 hover:text-rustica-light'
                  }`}
                >
                  Procesadas
                </button>
              </div>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => { setFiltroTexto(''); setFiltroFecha(''); }}
                className="w-full py-2 bg-stone-50 hover:bg-stone-100 border border-stone-200 text-stone-500 hover:text-rustica-light rounded-lg text-xs font-bold transition-all"
              >
                Limpiar Filtros
              </button>
            </div>
          </div>

          {/* Listado de Reservaciones */}
          {loadReservas ? (
            <div className="flex justify-center py-20">
              <div className="w-8 h-8 rounded-full border-2 border-stone-200 border-t-rustica-gold animate-spin" />
            </div>
          ) : reservacionesFiltradas.length === 0 ? (
            <div className="text-center py-16 text-stone-400 bg-rustica-card border border-stone-200 rounded-xl">
              <p className="text-3xl mb-2">📅</p>
              <p className="text-sm font-bold text-stone-500">No se encontraron reservaciones</p>
              <p className="text-[11px] mt-0.5">Prueba cambiando los filtros o la fecha seleccionada.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reservacionesFiltradas.map(reserva => {
                const esActiva = reserva.estado === 'confirmada' || reserva.estado === 'pendiente'
                let badgeStyle = 'bg-amber-600/10 text-amber-500 border-amber-500/20'
                if (reserva.estado === 'sentado') badgeStyle = 'bg-emerald-100 text-emerald-600 border-emerald-300'
                if (reserva.estado === 'cancelada') badgeStyle = 'bg-rose-600/10 text-rose-500 border-rose-500/20'

                return (
                  <div key={reserva.id} className="bg-rustica-card border border-stone-200 rounded-xl p-5 shadow-xl relative hover:border-stone-300 transition-all duration-300">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <span className="text-rustica-gold font-serif text-lg font-bold block">{reserva.nombre}</span>
                        <span className="text-[10px] text-stone-500 font-medium">Mesa {reserva.mesa_numero} · Pax: {reserva.personas}</span>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badgeStyle} uppercase`}>
                        {reserva.estado}
                      </span>
                    </div>

                    <div className="space-y-1 text-xs text-stone-600 mb-4 bg-stone-50/60 p-3 rounded-lg border border-stone-200/60">
                      <p>🕒 <span className="font-semibold">{reserva.fecha} a las {reserva.hora}</span></p>
                      {reserva.email && <p>✉️ <span className="opacity-75">{reserva.email}</span></p>}
                      {reserva.telefono && <p>📞 <span className="opacity-75">{reserva.telefono}</span></p>}
                      {reserva.notas && <p className="italic text-stone-500 mt-2 border-t border-stone-200/50 pt-1.5">Nota: "{reserva.notas}"</p>}
                    </div>

                    {/* Acciones de Staff */}
                    <div className="flex gap-2 flex-wrap">
                      {esActiva && (
                        <button
                          onClick={() => sentarCliente(reserva.id, reserva.mesa_id)}
                          className="flex-[2] py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-md transition-all active:scale-95"
                        >
                          Atender / Sentar
                        </button>
                      )}
                      <button
                        onClick={() => abrirEditor(reserva)}
                        className="flex-1 py-2 bg-stone-50 hover:bg-stone-100 border border-stone-200 text-rustica-gold font-bold text-xs rounded-lg transition-all"
                      >
                        Editar
                      </button>
                      {esActiva && (
                        <button
                          onClick={() => cancelarReservaDirecta(reserva.id)}
                          className="px-3 py-2 bg-transparent hover:bg-rose-50 text-rose-500 font-bold text-xs rounded-lg transition-all border border-rose-200"
                        >
                          Cancelar
                        </button>
                      )}
                      {esGerente && (
                        <button
                          onClick={() => eliminarReservacion(reserva.id, reserva.nombre)}
                          className="px-3 py-2 bg-transparent hover:bg-rose-50 text-rose-600 font-bold text-xs rounded-lg transition-all border border-rose-300"
                          title="Eliminar permanentemente"
                        >
                          🗑
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* MODAL DE EDICIÓN / REASIGNACIÓN */}
          {editReserva && (
            <div className="fixed inset-0 bg-black/75 flex items-center justify-center p-4 z-50 backdrop-blur-sm" onClick={() => setEditReserva(null)}>
              <div className="bg-rustica-card rounded-2xl p-6 w-full max-w-[440px] border border-stone-200 shadow-2xl animate-in fade-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                <h3 className="text-rustica-gold text-xl font-serif font-bold mb-4">Editar Reservación</h3>

                {editError && (
                  <div className="p-3 mb-4 text-xs font-semibold bg-rose-950/50 border border-rose-900 text-rose-600 rounded-lg">
                    ⚠️ {editError}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="col-span-2">
                    <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-1">Nombre</label>
                    <input
                      type="text"
                      value={editForm.nombre}
                      onChange={e => setEditForm(prev => ({ ...prev, nombre: e.target.value }))}
                      className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-xs text-stone-900 focus:outline-none focus:border-rustica-gold transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-1">Fecha</label>
                    <input
                      type="date"
                      value={editForm.fecha}
                      onChange={e => setEditForm(prev => ({ ...prev, fecha: e.target.value }))}
                      className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-xs text-stone-900 focus:outline-none focus:border-rustica-gold transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-1">Hora</label>
                    <select
                      value={editForm.hora}
                      onChange={e => setEditForm(prev => ({ ...prev, hora: e.target.value }))}
                      className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-xs text-stone-900 focus:outline-none focus:border-rustica-gold transition-colors"
                    >
                      {['12:00','13:00','14:00','15:00','19:00','20:00','21:00','22:00'].map(h => (
                        <option key={h} value={h}>{h}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-1">Personas</label>
                    <input
                      type="number"
                      min="1"
                      max="20"
                      value={editForm.personas}
                      onChange={e => setEditForm(prev => ({ ...prev, personas: parseInt(e.target.value) || 2 }))}
                      className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-xs text-stone-900 focus:outline-none focus:border-rustica-gold transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-1">Asignar Mesa</label>
                    <select
                      value={editForm.mesa_id}
                      onChange={e => setEditForm(prev => ({ ...prev, mesa_id: parseInt(e.target.value) || 0 }))}
                      className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-xs text-stone-900 focus:outline-none focus:border-rustica-gold transition-colors"
                    >
                      {mesasFisicas.map(m => (
                        <option key={m.id} value={m.id}>
                          Mesa {m.numero} ({m.zona.replace('Salón Principal', 'Salón')})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-1">Observaciones</label>
                    <textarea
                      value={editForm.notas}
                      onChange={e => setEditForm(prev => ({ ...prev, notas: e.target.value }))}
                      className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-xs text-stone-900 focus:outline-none focus:border-rustica-gold transition-colors resize-none h-16"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-1">Estado</label>
                    <select
                      value={editForm.estado}
                      onChange={e => setEditForm(prev => ({ ...prev, estado: e.target.value }))}
                      className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-xs text-stone-900 focus:outline-none focus:border-rustica-gold transition-colors"
                    >
                      <option value="pendiente">Pendiente</option>
                      <option value="confirmada">Confirmada</option>
                      <option value="sentado">Sentado (Procesada)</option>
                      <option value="cancelada">Cancelada</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-col gap-2.5 mt-6">
                  <div className="flex gap-2.5">
                    <button
                      onClick={() => setEditReserva(null)}
                      className="flex-1 py-2.5 bg-transparent border border-stone-300 hover:border-stone-400 rounded-xl text-xs font-bold transition-all"
                    >
                      Cancelar
                    </button>
                    <button
                      disabled={guardandoEdit}
                      onClick={guardarEdicion}
                      className="flex-[2] py-2.5 bg-rustica-gold hover:bg-yellow-600 text-neutral-900 rounded-xl text-xs font-bold shadow-lg shadow-rustica-gold/10 transition-all disabled:opacity-50"
                    >
                      {guardandoEdit ? 'Guardando...' : 'Guardar Cambios'}
                    </button>
                  </div>
                  {(editForm.estado === 'confirmada' || editForm.estado === 'pendiente') && (
                    <button
                      disabled={guardandoEdit}
                      onClick={guardarYSentar}
                      className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-lg transition-all disabled:opacity-50"
                    >
                      {guardandoEdit ? 'Procesando...' : 'Guardar y Sentar — Iniciar Comanda'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* PESTAÑA 2: WIZARD DE RESERVACIÓN DE CLIENTES / CREAR RESERVA */}
      {(!isStaff || activeTab === 'crear') && (
        <div className="bg-rustica-card border border-stone-200 p-6 rounded-2xl shadow-2xl max-w-xl mx-auto">
          
          {/* Badge de zona preseleccionada */}
          {zona && step !== 'confirmacion' && (
            <div className="inline-flex items-center gap-2 bg-stone-50 text-rustica-gold rounded-full px-4 py-1.5 text-xs font-bold mb-4 border border-rustica-gold/20">
              <span>Zona: {NOMBRES_ZONA[zona] || zona}</span>
              <button 
                onClick={() => setZona('')} 
                className="text-stone-400 hover:text-rustica-gold font-bold ml-1 text-sm focus:outline-none"
              >
                ×
              </button>
            </div>
          )}

          {/* PASO 1: Fecha, hora, personas */}
          {step === 'fecha' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1.5">Fecha</label>
                <input 
                  type="date" 
                  className="w-full p-2.5 bg-white text-stone-900 border border-stone-300 rounded-lg focus:outline-none focus:border-rustica-gold transition-colors text-sm"
                  value={fecha}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={e => setFecha(e.target.value)} 
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1.5">Hora</label>
                <select 
                  className="w-full p-2.5 bg-white text-stone-900 border border-stone-300 rounded-lg focus:outline-none focus:border-rustica-gold transition-colors text-sm"
                  value={hora} 
                  onChange={e => setHora(e.target.value)}
                >
                  <option value="">Selecciona hora</option>
                  {['12:00','13:00','14:00','15:00','19:00','20:00','21:00','22:00'].map(h => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1.5">Personas</label>
                <select 
                  className="w-full p-2.5 bg-white text-stone-900 border border-stone-300 rounded-lg focus:outline-none focus:border-rustica-gold transition-colors text-sm"
                  value={personas} 
                  onChange={e => setPersonas(+e.target.value)}
                >
                  {[1,2,3,4,5,6,7,8].map(n => (
                    <option key={n} value={n}>{n} persona{n !== 1 ? 's' : ''}</option>
                  ))}
                </select>
              </div>

              <button 
                disabled={!fecha || !hora || loading}
                onClick={buscarMesas}
                className="w-full py-3 bg-rustica-gold hover:bg-yellow-600 text-neutral-900 font-bold text-sm rounded-xl shadow-lg shadow-rustica-gold/10 transition-all disabled:opacity-50 mt-4"
              >
                {loading ? 'Buscando mesas…' : 'Ver mesas disponibles'}
              </button>
            </div>
          )}

          {/* PASO 2: Selección de mesa */}
          {step === 'mesa' && (
            <div>
              {mesasDisponibles.length > 0 ? (
                <>
                  <p className="text-stone-500 text-xs mb-4">
                    Se encontraron <strong className="text-rustica-light">{mesasDisponibles.length}</strong> mesa(s) para el {fecha} a las {hora}
                    {zona && <span className="text-rustica-gold"> · {NOMBRES_ZONA[zona]}</span>}
                  </p>
                  <div className="grid grid-cols-2 gap-3 mb-6 max-h-[220px] overflow-y-auto pr-1">
                    {mesasDisponibles.map(m => (
                      <div
                        key={m.id}
                        onClick={() => setMesa(m)}
                        className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                          mesaSeleccionada?.id === m.id
                            ? 'border-rustica-gold bg-rustica-gold/15'
                            : 'border-stone-200 bg-stone-50/80 hover:bg-stone-100'
                        }`}
                      >
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-bold text-stone-800">Mesa {m.numero}</span>
                          {m.es_vip && <span className="text-[9px] bg-rustica-gold/15 text-rustica-gold px-1.5 py-0.5 rounded border border-rustica-gold/25 font-bold">VIP</span>}
                        </div>
                        <p className="text-[10px] text-stone-500">Cap. {m.capacidad} pers · {m.zona}</p>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center py-10 bg-rose-950/10 border border-rose-900/30 rounded-xl mb-6">
                  <p className="text-3xl mb-2">😢</p>
                  <h4 className="text-sm font-bold text-rose-500">Sin mesas disponibles</h4>
                  <p className="text-xs text-stone-500 max-w-xs mx-auto mt-1">No hay mesas libres para esa hora y cantidad de personas en esta zona. Intenta con otro horario.</p>
                </div>
              )}

              <div className="flex gap-2">
                <button 
                  onClick={() => setStep('fecha')}
                  className="flex-1 py-2.5 bg-transparent border border-stone-300 hover:border-stone-400 rounded-xl text-xs font-bold transition-all"
                >
                  Volver
                </button>
                {mesasDisponibles.length > 0 && (
                  <button 
                    disabled={!mesaSeleccionada}
                    onClick={() => setStep('datos')}
                    className="flex-[2] py-2.5 bg-rustica-gold hover:bg-yellow-600 text-neutral-900 rounded-xl font-bold text-xs shadow-lg shadow-rustica-gold/10 transition-all disabled:opacity-50"
                  >
                    Continuar {mesaSeleccionada ? `— Mesa ${mesaSeleccionada.numero}` : ''}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* PASO 3: Datos del cliente */}
          {step === 'datos' && (
            <div className="space-y-4">
              <div className="bg-stone-50/80 border border-stone-200 rounded-xl p-3 text-xs text-stone-500 space-y-1">
                <p>Mesa seleccionada: <strong className="text-stone-700">Mesa {mesaSeleccionada?.numero} ({mesaSeleccionada?.zona})</strong></p>
                <p>Fecha y Hora: <strong className="text-stone-700">{fecha} {hora}</strong></p>
                <p>Personas: <strong className="text-stone-700">{personas} pers</strong></p>
                {mesaSeleccionada?.es_vip && <p className="text-rustica-gold font-bold">★ Mesa VIP — requiere depósito del 30%</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1.5">Nombre Completo</label>
                <input
                  type="text"
                  placeholder="Tu nombre completo"
                  className="w-full p-2.5 bg-white text-stone-900 border border-stone-300 rounded-lg focus:outline-none focus:border-rustica-gold transition-colors text-sm"
                  value={form.nombre}
                  onChange={e => setForm(prev => ({ ...prev, nombre: e.target.value }))}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1.5">Correo Electrónico</label>
                <input
                  type="email"
                  placeholder="correo@ejemplo.com"
                  className="w-full p-2.5 bg-white text-stone-900 border border-stone-300 rounded-lg focus:outline-none focus:border-rustica-gold transition-colors text-sm"
                  value={form.email}
                  onChange={e => setForm(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1.5">Teléfono</label>
                <input
                  type="text"
                  placeholder="+57 300 000 0000"
                  className="w-full p-2.5 bg-white text-stone-900 border border-stone-300 rounded-lg focus:outline-none focus:border-rustica-gold transition-colors text-sm"
                  value={form.telefono}
                  onChange={e => setForm(prev => ({ ...prev, telefono: e.target.value }))}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1.5">Notas especiales (opcional)</label>
                <textarea
                  placeholder="Alergias, ocasión especial, requerimientos particulares…"
                  className="w-full p-2.5 bg-white text-stone-900 border border-stone-300 rounded-lg focus:outline-none focus:border-rustica-gold transition-colors text-sm resize-none h-20"
                  value={form.notas}
                  onChange={e => setForm(prev => ({ ...prev, notas: e.target.value }))}
                />
              </div>

              <div className="flex gap-2">
                <button 
                  onClick={() => setStep('mesa')}
                  className="flex-1 py-2.5 bg-transparent border border-stone-300 hover:border-stone-400 rounded-xl text-xs font-bold transition-all"
                >
                  Volver
                </button>
                <button 
                  disabled={!form.nombre || !form.email || loading}
                  onClick={confirmarReserva}
                  className="flex-[2] py-2.5 bg-rustica-gold hover:bg-yellow-600 text-neutral-900 rounded-xl font-bold text-xs shadow-lg shadow-rustica-gold/10 transition-all disabled:opacity-50"
                >
                  {loading ? 'Confirmando…' : 'Confirmar Reserva'}
                </button>
              </div>
            </div>
          )}

          {/* PASO 4: Confirmación final */}
          {step === 'confirmacion' && resultado && (
            <div className="text-center py-6 space-y-4">
              {resultado.checkout_url ? (
                <>
                  <p className="text-5xl">💳</p>
                  <h3 className="text-rustica-gold text-2xl font-bold font-serif">Reserva VIP Pendiente de Pago</h3>
                  <p className="text-sm text-stone-600 max-w-sm mx-auto">Se requiere completar el pago del 30% del consumo mínimo de la mesa para confirmar la reservación.</p>
                  <a 
                    href={resultado.checkout_url} 
                    className="inline-block w-full py-3 bg-rustica-gold hover:bg-yellow-600 text-neutral-900 font-bold text-sm rounded-xl shadow-lg transition-all text-center"
                  >
                    Proceder al Pago
                  </a>
                </>
              ) : (
                <>
                  <p className="text-5xl text-emerald-600">✓</p>
                  <h3 className="text-emerald-600 text-2xl font-bold font-serif">¡Reservación Confirmada!</h3>
                  <p className="text-sm text-stone-600">Hemos enviado un correo de confirmación a <strong className="text-rustica-light">{form.email}</strong>.</p>
                  <div className="bg-stone-50/80 border border-stone-200 rounded-xl p-4 text-xs text-stone-500 space-y-1 max-w-xs mx-auto">
                    <p>Mesa: <strong>Mesa {mesaSeleccionada?.numero}</strong></p>
                    <p>Zona: <strong>{mesaSeleccionada?.zona}</strong></p>
                    <p>Fecha y Hora: <strong>{fecha} a las {hora}</strong></p>
                  </div>
                  <button 
                    onClick={resetearWizard}
                    className="w-full py-3 bg-stone-50 border border-stone-200 hover:border-stone-300 text-rustica-gold font-bold text-sm rounded-xl transition-all"
                  >
                    Hacer otra reservación
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
