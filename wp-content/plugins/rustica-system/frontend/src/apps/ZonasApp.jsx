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

export default function ZonasApp() {
  const [zonas, setZonas]     = useState([])
  const [loading, setLoading] = useState(true)

  const cargarZonas = useCallback(async () => {
    try {
      const res  = await fetch('/wp-json/rustica/v1/zonas')
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
      <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
        <div style={{
          width: 32, height: 32, borderRadius: '50%',
          border: '3px solid #333', borderTopColor: '#c9a84c',
          animation: 'spin .8s linear infinite',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    )
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 16 }}>
      {zonas.map(zona => {
        const sinMesas = zona.mesas_libres === 0

        return (
          <div
            key={zona.slug}
            onClick={() => !sinMesas && seleccionarZona(zona.slug)}
            style={{
              position:    'relative',
              padding:     24,
              border:      `1px solid ${sinMesas ? '#444' : 'rgba(201,168,76,.3)'}`,
              borderRadius: 12,
              cursor:      sinMesas ? 'not-allowed' : 'pointer',
              opacity:     sinMesas ? .5 : 1,
              transition:  'border-color .2s, transform .2s, box-shadow .2s',
            }}
            onMouseEnter={e => {
              if (sinMesas) return
              e.currentTarget.style.borderColor = '#c9a84c'
              e.currentTarget.style.transform   = 'translateY(-4px)'
              e.currentTarget.style.boxShadow   = '0 8px 24px rgba(201,168,76,.2)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'rgba(201,168,76,.3)'
              e.currentTarget.style.transform   = 'translateY(0)'
              e.currentTarget.style.boxShadow   = 'none'
            }}
          >
            {/* Badge "Reservar" solo si hay mesas */}
            {!sinMesas && (
              <span style={{
                position:     'absolute', top: 12, right: 14,
                background:   '#c9a84c',  color: '#1a1a1a',
                fontSize:     11, fontWeight: 700,
                padding:      '3px 10px', borderRadius: 20,
              }}>
                Reservar →
              </span>
            )}

            <h4 style={{
              color:       '#c9a84c',
              fontFamily:  'Playfair Display, serif',
              marginBottom: 8, marginTop: 0,
            }}>
              {zona.nombre}
            </h4>

            <p style={{ color: '#aaa', fontSize: 14, marginBottom: 16 }}>
              {zona.desc}
            </p>

            {/* Indicador de mesas — barra + conteo */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 12, color: '#888' }}>Mesas disponibles</span>
                <span style={{
                  fontSize:   13,
                  fontWeight: 700,
                  color:      sinMesas ? '#e74c3c' : '#c9a84c',
                }}>
                  {sinMesas ? 'Sin disponibilidad' : `${zona.mesas_libres} / ${zona.total_mesas}`}
                </span>
              </div>

              {/* Barra de progreso visual */}
              <div style={{ height: 4, background: '#333', borderRadius: 2, overflow: 'hidden' }}>
                <div style={{
                  height:      '100%',
                  borderRadius: 2,
                  background:   sinMesas ? '#e74c3c' : '#c9a84c',
                  width:        `${zona.total_mesas > 0 ? (zona.mesas_libres / zona.total_mesas) * 100 : 0}%`,
                  transition:  'width .5s ease',
                }} />
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
