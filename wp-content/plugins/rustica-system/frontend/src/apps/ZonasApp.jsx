/**
 * ZonasApp — Tarjetas interactivas de zonas del restaurante.
 *
 * Muestra el conteo de mesas libres por zona consultando GET /rustica/v1/zonas.
 * Se actualiza automáticamente cuando:
 *   - Se monta el componente.
 *   - Se recibe el evento DOM 'rustica:reservacion_completada' (emitido por ReservasApp).
 *
 * Al hacer clic en una zona disponible:
 *   - Emite el evento 'rustica:zona' para que ReservasApp preseleccione la zona.
 *   - Hace scroll suave hasta la sección #reservas.
 */
import { useState, useEffect, useCallback } from 'react'

// Resolver la URL de la API dinámicamente según el contexto (WP o Headless)
const getApiUrl = () => {
  if (window.RusticaConfig?.apiUrl) {
    return window.RusticaConfig.apiUrl
  }
  const savedUrl = localStorage.getItem('rustica_api_url')
  return savedUrl ? `${savedUrl}/rustica/v1` : 'http://localhost:8080/wp-json/rustica/v1'
}

export default function ZonasApp() {
  const [zonas, setZonas]     = useState([])
  const [loading, setLoading] = useState(true)

  const cargarZonas = useCallback(async () => {
    try {
      const API = getApiUrl()
      const res  = await fetch(`${API}/zonas`)
      const data = await res.json()
      setZonas(data.zonas || [])
    } catch (e) {
      console.error('ZonasApp: error al cargar zonas', e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    cargarZonas()

    // Refresca el conteo cada vez que se confirma una reserva en ReservasApp
    const handler = () => cargarZonas()
    document.addEventListener('rustica:reservacion_completada', handler)
    return () => document.removeEventListener('rustica:reservacion_completada', handler)
  }, [cargarZonas])

  const seleccionarZona = (slug) => {
    window.RusticaZonaPreseleccionada = slug
    document.dispatchEvent(new CustomEvent('rustica:zona', { detail: { zona: slug } }))
    const target = document.getElementById('reservas')
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="w-8 h-8 rounded-full border-2 border-stone-200 border-t-rustica-gold animate-spin" />
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 font-sans">
      {zonas.map(zona => {
        const sinMesas = zona.mesas_libres === 0

        return (
          <div
            key={zona.slug}
            onClick={() => !sinMesas && seleccionarZona(zona.slug)}
            className={`relative p-6 bg-rustica-card border rounded-2xl transition-all duration-300 transform ${
              sinMesas 
                ? 'border-stone-200 opacity-50 cursor-not-allowed' 
                : 'border-rustica-gold/20 hover:border-rustica-gold hover:-translate-y-1 hover:shadow-2xl hover:shadow-rustica-gold/10 cursor-pointer'
            }`}
          >
            {/* Badge "Reservar" solo si hay mesas */}
            {!sinMesas && (
              <span className="absolute top-4 right-4 bg-rustica-gold hover:bg-yellow-600 text-neutral-900 text-[10px] font-bold px-3 py-1 rounded-full shadow-md transition-colors">
                Reservar →
              </span>
            )}

            <h4 className="text-rustica-gold font-serif text-xl font-bold mb-2 pr-16">
              {zona.nombre}
            </h4>

            <p className="text-stone-500 text-sm mb-6 leading-relaxed">
              {zona.desc}
            </p>

            {/* Indicador de mesas — barra + conteo */}
            <div className="mt-auto">
              <div className="flex justify-between items-center mb-2 text-xs">
                <span className="text-stone-400 font-medium">Mesas disponibles</span>
                <span className={`font-bold ${sinMesas ? 'text-rose-500' : 'text-rustica-gold'}`}>
                  {sinMesas ? 'Agotado' : `${zona.mesas_libres} / ${zona.total_mesas}`}
                </span>
              </div>

              {/* Barra de progreso visual */}
              <div className="h-1.5 bg-stone-50 rounded-full overflow-hidden border border-stone-200">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${
                    sinMesas ? 'bg-rose-600' : 'bg-rustica-gold'
                  }`}
                  style={{
                    width: `${zona.total_mesas > 0 ? (zona.mesas_libres / zona.total_mesas) * 100 : 0}%`,
                  }} 
                />
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
