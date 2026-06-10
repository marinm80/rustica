import { useState, useEffect } from 'react'
import MeseroApp from './apps/MeseroApp'
import CocinaApp from './apps/CocinaApp'
import ReservasApp from './apps/ReservasApp'
import ZonasApp from './apps/ZonasApp'
import LoginScreen from './components/LoginScreen'

export default function App() {
  const [currentApp, setCurrentApp] = useState('dashboard')
  const [authTrigger, setAuthTrigger] = useState(0)
  const [userName, setUserName] = useState('')
  const [userRole, setUserRole] = useState('')
  const [apiUrl, setApiUrl] = useState('')
  const [connStatus, setConnStatus] = useState('checking') // 'checking', 'ok', 'error'
  const [initialMesaId, setInitialMesaId] = useState(null)

  // Verificar si tenemos token en localStorage
  const token = localStorage.getItem('rustica_token')
  const savedApiUrl = localStorage.getItem('rustica_api_url')
  const isLoggedIn = !!token

  useEffect(() => {
    setUserName(localStorage.getItem('rustica_user_display_name') || '')
    setUserRole(localStorage.getItem('rustica_user_role') || 'personal')
    setApiUrl(localStorage.getItem('rustica_api_url') || '')
  }, [authTrigger, isLoggedIn])

  // Comprobar la conexión con la API de WordPress
  useEffect(() => {
    if (!isLoggedIn || !savedApiUrl) {
      setConnStatus('error')
      return
    }

    setConnStatus('checking')
    fetch(`${savedApiUrl}/rustica/v1/mesas`)
      .then(res => {
        if (res.ok) {
          setConnStatus('ok')
        } else {
          setConnStatus('error')
        }
      })
      .catch(() => {
        setConnStatus('error')
      })
  }, [savedApiUrl, authTrigger, isLoggedIn])

  // Escuchar el evento de navegación interna (ej: ReservasApp -> Sentar Cliente -> Redirigir a Mesero)
  useEffect(() => {
    const handleNavigation = (e) => {
      const { app, mesaId } = e.detail
      if (app === 'mesero') {
        setInitialMesaId(mesaId)
        setCurrentApp('mesero')
      }
    }

    window.addEventListener('rustica:navigate', handleNavigation)
    return () => window.removeEventListener('rustica:navigate', handleNavigation)
  }, [])

  // Cerrar Sesión
  const handleLogout = () => {
    localStorage.removeItem('rustica_token')
    localStorage.removeItem('rustica_api_url')
    localStorage.removeItem('rustica_user_role')
    localStorage.removeItem('rustica_es_gerente')
    localStorage.removeItem('rustica_is_staff')
    localStorage.removeItem('rustica_user_display_name')
    setAuthTrigger(prev => prev + 1)
    setCurrentApp('dashboard')
  }

  // Si no está autenticado, cargamos la pantalla de Login centralizada
  if (!isLoggedIn) {
    return <LoginScreen onLoginSuccess={() => setAuthTrigger(prev => prev + 1)} />
  }

  // Renderizar la aplicación correspondiente
  const renderAppContent = () => {
    switch (currentApp) {
      case 'mesero':
        return <MeseroApp initialMesaId={initialMesaId} />
      case 'cocina':
        return <CocinaApp />
      case 'reservas':
        return <ReservasApp />
      case 'zonas':
        return <ZonasApp />
      case 'dashboard':
      default:
        return renderDashboard()
    }
  }

  // Renderizar el Dashboard principal (Menú/Hub de Apps)
  const renderDashboard = () => {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Encabezado del Dashboard */}
        <div className="bg-neutral-900 border border-neutral-800 p-8 rounded-3xl shadow-xl mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <h2 className="text-3xl font-serif font-bold text-rustica-gold">
              ¡Hola, {userName || 'Personal'}!
            </h2>
            <p className="text-sm text-neutral-400 mt-1">
              Bienvenido al Panel de Control de La Rustica Terrazza. Gestiona comandas, cocina y reservas.
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            {/* Indicador de Estado de Conexión a la API */}
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-semibold ${
              connStatus === 'ok' 
                ? 'bg-emerald-950/30 border-emerald-800 text-emerald-400' 
                : connStatus === 'checking'
                ? 'bg-amber-950/30 border-amber-800 text-amber-400'
                : 'bg-rose-950/30 border-rose-800 text-rose-400'
            }`}>
              <span className={`w-2 h-2 rounded-full ${
                connStatus === 'ok' ? 'bg-emerald-400 animate-pulse' : connStatus === 'checking' ? 'bg-amber-400 animate-spin' : 'bg-rose-400'
              }`} />
              {connStatus === 'ok' && 'API de WordPress Conectada'}
              {connStatus === 'checking' && 'Verificando Conexión...'}
              {connStatus === 'error' && 'Error al Conectar con la API'}
            </div>
            
            <div className="bg-neutral-950 border border-neutral-800 px-4 py-2 rounded-full text-xs font-mono text-neutral-400">
              ROL: <span className="text-rustica-gold font-bold uppercase">{userRole}</span>
            </div>
          </div>
        </div>

        {/* Grid de Aplicaciones */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Tarjeta Mesero */}
          <div 
            onClick={() => { setInitialMesaId(null); setCurrentApp('mesero'); }}
            className="group relative bg-neutral-900 border border-neutral-800 rounded-3xl p-8 hover:border-rustica-gold transition-all duration-300 cursor-pointer overflow-hidden shadow-lg hover:-translate-y-1 hover:shadow-2xl hover:shadow-rustica-gold/5"
          >
            <div className="flex items-start justify-between">
              <span className="text-5xl group-hover:scale-110 transition-transform duration-300">📱</span>
              <span className="text-xs font-semibold px-3 py-1 bg-rustica-gold/10 text-rustica-gold border border-rustica-gold/20 rounded-full">
                Servicio
              </span>
            </div>
            <h3 className="text-2xl font-serif font-bold text-neutral-100 mt-6 group-hover:text-rustica-gold transition-colors">
              Tablet de Mesero
            </h3>
            <p className="text-sm text-neutral-400 mt-2 leading-relaxed">
              Permite ver la cuadrícula de mesas en tiempo real (libre, ocupada, reservada), gestionar comandas activas, registrar consumos y cambiar precios (exclusivo para Gerente).
            </p>
            <div className="mt-8 flex items-center text-xs font-bold text-rustica-gold group-hover:translate-x-1.5 transition-transform">
              Ingresar a la aplicación <span className="ml-1">→</span>
            </div>
          </div>

          {/* Tarjeta Cocina */}
          <div 
            onClick={() => setCurrentApp('cocina')}
            className="group relative bg-neutral-900 border border-neutral-800 rounded-3xl p-8 hover:border-rustica-gold transition-all duration-300 cursor-pointer overflow-hidden shadow-lg hover:-translate-y-1 hover:shadow-2xl hover:shadow-rustica-gold/5"
          >
            <div className="flex items-start justify-between">
              <span className="text-5xl group-hover:scale-110 transition-transform duration-300">🍳</span>
              <span className="text-xs font-semibold px-3 py-1 bg-orange-500/10 text-orange-400 border border-orange-500/20 rounded-full">
                Preparación
              </span>
            </div>
            <h3 className="text-2xl font-serif font-bold text-neutral-100 mt-6 group-hover:text-rustica-gold transition-colors">
              Monitor de Cocina
            </h3>
            <p className="text-sm text-neutral-400 mt-2 leading-relaxed">
              Pantalla KDS (Kitchen Display System) para el personal de cocina. Recibe comisiones enviadas a preparación, emite avisos sonoros e interactúa para marcar comandas listas.
            </p>
            <div className="mt-8 flex items-center text-xs font-bold text-rustica-gold group-hover:translate-x-1.5 transition-transform">
              Ingresar a la aplicación <span className="ml-1">→</span>
            </div>
          </div>

          {/* Tarjeta Reservas */}
          <div 
            onClick={() => setCurrentApp('reservas')}
            className="group relative bg-neutral-900 border border-neutral-800 rounded-3xl p-8 hover:border-rustica-gold transition-all duration-300 cursor-pointer overflow-hidden shadow-lg hover:-translate-y-1 hover:shadow-2xl hover:shadow-rustica-gold/5"
          >
            <div className="flex items-start justify-between">
              <span className="text-5xl group-hover:scale-110 transition-transform duration-300">📅</span>
              <span className="text-xs font-semibold px-3 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full">
                Reservaciones
              </span>
            </div>
            <h3 className="text-2xl font-serif font-bold text-neutral-100 mt-6 group-hover:text-rustica-gold transition-colors">
              Panel de Reservaciones
            </h3>
            <p className="text-sm text-neutral-400 mt-2 leading-relaxed">
              Dashboard de administración de reservas. Modifica fechas, pax y asignación de mesas con control de solapamiento. Permite registrar clientes walk-in y sentar a los comensales.
            </p>
            <div className="mt-8 flex items-center text-xs font-bold text-rustica-gold group-hover:translate-x-1.5 transition-transform">
              Ingresar a la aplicación <span className="ml-1">→</span>
            </div>
          </div>

          {/* Tarjeta Zonas */}
          <div 
            onClick={() => setCurrentApp('zonas')}
            className="group relative bg-neutral-900 border border-neutral-800 rounded-3xl p-8 hover:border-rustica-gold transition-all duration-300 cursor-pointer overflow-hidden shadow-lg hover:-translate-y-1 hover:shadow-2xl hover:shadow-rustica-gold/5"
          >
            <div className="flex items-start justify-between">
              <span className="text-5xl group-hover:scale-110 transition-transform duration-300">🔍</span>
              <span className="text-xs font-semibold px-3 py-1 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-full">
                Vista de Clientes
              </span>
            </div>
            <h3 className="text-2xl font-serif font-bold text-neutral-100 mt-6 group-hover:text-rustica-gold transition-colors">
              Monitor de Zonas (Mesas Libres)
            </h3>
            <p className="text-sm text-neutral-400 mt-2 leading-relaxed">
              Muestra el conteo de mesas disponibles por zona en tiempo real. Utilizado de cara al público para previsualizar el estado del restaurante.
            </p>
            <div className="mt-8 flex items-center text-xs font-bold text-rustica-gold group-hover:translate-x-1.5 transition-transform">
              Ingresar a la aplicación <span className="ml-1">→</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-neutral-950">
      {/* Barra de Navegación Principal Headless */}
      <header className="sticky top-0 z-50 bg-neutral-900/90 backdrop-blur-md border-b border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo y Conexión */}
          <div className="flex items-center gap-4 cursor-pointer" onClick={() => setCurrentApp('dashboard')}>
            <span className="text-2xl">🍽️</span>
            <div>
              <h1 className="font-serif font-bold text-lg text-rustica-gold leading-none">
                La Rustica
              </h1>
              <span className="text-[9px] text-neutral-400 uppercase tracking-widest font-bold">
                Portal de Personal
              </span>
            </div>
          </div>

          {/* Selector Rápido de Aplicaciones en Desktop */}
          <nav className="hidden md:flex items-center gap-1">
            <button 
              onClick={() => setCurrentApp('dashboard')}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-xl transition-all ${
                currentApp === 'dashboard' 
                  ? 'bg-neutral-800 text-rustica-gold' 
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-950/40'
              }`}
            >
              Inicio
            </button>
            <button 
              onClick={() => { setInitialMesaId(null); setCurrentApp('mesero'); }}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-xl transition-all ${
                currentApp === 'mesero' 
                  ? 'bg-neutral-800 text-rustica-gold' 
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-950/40'
              }`}
            >
              Mesero
            </button>
            <button 
              onClick={() => setCurrentApp('cocina')}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-xl transition-all ${
                currentApp === 'cocina' 
                  ? 'bg-neutral-800 text-rustica-gold' 
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-950/40'
              }`}
            >
              Cocina
            </button>
            <button 
              onClick={() => setCurrentApp('reservas')}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-xl transition-all ${
                currentApp === 'reservas' 
                  ? 'bg-neutral-800 text-rustica-gold' 
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-950/40'
              }`}
            >
              Reservas
            </button>
            <button 
              onClick={() => setCurrentApp('zonas')}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-xl transition-all ${
                currentApp === 'zonas' 
                  ? 'bg-neutral-800 text-rustica-gold' 
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-950/40'
              }`}
            >
              Zonas
            </button>
          </nav>

          {/* Información del Usuario y Logout */}
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <div className="text-xs font-bold text-neutral-200">{userName}</div>
              <div className="text-[10px] text-rustica-gold font-mono uppercase font-bold">{userRole}</div>
            </div>
            <button 
              onClick={handleLogout}
              className="px-4 py-2 text-xs font-bold bg-neutral-950 border border-neutral-850 hover:border-rose-900/60 hover:text-rose-400 text-neutral-300 rounded-xl transition-all"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      </header>

      {/* Cuerpo principal de la APP */}
      <main className="flex-1 bg-neutral-950">
        {renderAppContent()}
      </main>

      {/* Footer del Portal */}
      <footer className="border-t border-neutral-900 bg-neutral-950 py-6 text-center text-[10px] text-neutral-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <p>© 2026 La Rustica Terrazza. Todos los derechos reservados.</p>
          <p className="font-mono">Servidor API: <span className="text-neutral-400">{apiUrl}</span></p>
        </div>
      </footer>
    </div>
  )
}
