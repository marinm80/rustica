/**
 * ReservasApp — Wizard de 4 pasos para reservar mesa en La Rustica Terrazza.
 *
 * Pasos: fecha/hora → selección de mesa → datos del cliente → confirmación.
 *
 * Puede recibir una zona preseleccionada desde el landing vía:
 *   - window.RusticaZonaPreseleccionada (set antes de montar el componente)
 *   - evento DOM 'rustica:zona' (disparado al hacer clic en una tarjeta de zona)
 *
 * Si la zona es VIP y la mesa tiene consumo_minimo, redirige al checkout de WooCommerce
 * para pagar el depósito del 30% antes de confirmar la reserva.
 */
import { useState, useEffect } from 'react'
import MesaCard from '../components/MesaCard'

const NOMBRES_ZONA = {
  'salon-principal': 'Salón Principal',
  'la-terrazza':     'La Terrazza',
  'zona-vip':        'Zona VIP',
}

export default function ReservasApp() {
  const [step, setStep]             = useState('fecha')
  const [fecha, setFecha]           = useState('')
  const [hora, setHora]             = useState('')
  const [personas, setPersonas]     = useState(2)
  const [zona, setZona]             = useState(window.RusticaZonaPreseleccionada || '')
  const [mesas, setMesas]           = useState([])
  const [mesaSeleccionada, setMesa] = useState(null)
  const [form, setForm]             = useState({ nombre: '', email: '', telefono: '', notas: '' })
  const [resultado, setResultado]   = useState(null)
  const [loading, setLoading]       = useState(false)

  // Escuchar clic en las tarjetas de zona del landing
  useEffect(() => {
    const handler = (e) => {
      setZona(e.detail.zona)
      setStep('fecha')
    }
    document.addEventListener('rustica:zona', handler)
    return () => document.removeEventListener('rustica:zona', handler)
  }, [])

  const buscarMesas = async () => {
    if (!fecha || !hora) return
    setLoading(true)
    const params = new URLSearchParams({ fecha, hora, personas })
    if (zona) params.append('zona', zona)
    const res  = await fetch(`/wp-json/rustica/v1/mesas/disponibles?${params}`)
    const data = await res.json()
    setMesas(data.disponibles || [])
    setStep('mesa')
    setLoading(false)
  }

  const confirmarReserva = async () => {
    setLoading(true)
    const res = await fetch('/wp-json/rustica/v1/reservacion', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ mesa_id: mesaSeleccionada.id, fecha, hora, personas, ...form }),
    })
    const data = await res.json()
    setResultado(data)
    setStep('confirmacion')
    setLoading(false)
  }

  const resetear = () => {
    setStep('fecha'); setFecha(''); setHora('')
    setMesa(null); setResultado(null); setZona('')
    window.RusticaZonaPreseleccionada = ''
  }

  const input = {
    width: '100%', padding: '10px 14px', borderRadius: 8,
    border: '1px solid #ddd', fontSize: 15, marginBottom: 12,
    boxSizing: 'border-box', fontFamily: 'Inter, sans-serif',
  }
  const btn = (primary = true) => ({
    padding: '12px 24px', borderRadius: 8, border: 'none', cursor: 'pointer',
    background: primary ? '#c9a84c' : '#6c757d',
    color:      primary ? '#1a1a1a' : '#fff',
    fontWeight: 700, fontSize: 15, width: '100%', marginTop: 8,
  })

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', maxWidth: 600, margin: '0 auto', padding: '8px 0' }}>

      {/* Badge de zona preseleccionada */}
      {zona && step !== 'confirmacion' && (
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: '#1a1a1a', color: '#c9a84c',
          borderRadius: 20, padding: '4px 14px', fontSize: 13,
          marginBottom: 16, fontWeight: 600,
        }}>
          {NOMBRES_ZONA[zona] || zona}
          <button onClick={() => setZona('')} style={{
            background: 'none', border: 'none', color: '#c9a84c',
            cursor: 'pointer', fontSize: 16, lineHeight: 1, padding: 0,
          }}>x</button>
        </div>
      )}

      {/* PASO 1: Fecha, hora, personas */}
      {step === 'fecha' && (
        <div>
          <label style={{ display: 'block', marginBottom: 4, fontWeight: 600 }}>Fecha</label>
          <input type="date" style={input} value={fecha}
            min={new Date().toISOString().split('T')[0]}
            onChange={e => setFecha(e.target.value)} />

          <label style={{ display: 'block', marginBottom: 4, fontWeight: 600 }}>Hora</label>
          <select style={input} value={hora} onChange={e => setHora(e.target.value)}>
            <option value="">Selecciona hora</option>
            {['12:00','13:00','14:00','15:00','19:00','20:00','21:00','22:00'].map(h => (
              <option key={h} value={h}>{h}</option>
            ))}
          </select>

          <label style={{ display: 'block', marginBottom: 4, fontWeight: 600 }}>Personas</label>
          <select style={input} value={personas} onChange={e => setPersonas(+e.target.value)}>
            {[1,2,3,4,5,6,7,8].map(n => <option key={n} value={n}>{n} persona{n !== 1 ? 's' : ''}</option>)}
          </select>

          <button style={btn()} onClick={buscarMesas} disabled={!fecha || !hora || loading}>
            {loading ? 'Buscando…' : 'Ver mesas disponibles'}
          </button>
        </div>
      )}

      {/* PASO 2: Selección de mesa */}
      {step === 'mesa' && (
        <div>
          {mesas.length > 0 ? (
            <>
              <p style={{ color: '#555', marginBottom: 16 }}>
                <strong>{mesas.length}</strong> mesa{mesas.length !== 1 ? 's' : ''} disponible{mesas.length !== 1 ? 's' : ''} para el {fecha} a las {hora}
                {zona && <span style={{ color: '#c9a84c' }}> · {NOMBRES_ZONA[zona]}</span>}
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(165px,1fr))', gap: 10, marginBottom: 16 }}>
                {mesas.map(m => (
                  <MesaCard key={m.id} mesa={m}
                    seleccionada={mesaSeleccionada?.id === m.id}
                    onSeleccionar={setMesa} />
                ))}
              </div>
            </>
          ) : (
            <div style={{
              textAlign: 'center', padding: '32px 16px',
              background: '#fff5f5', borderRadius: 12,
              border: '1px solid #fecaca', marginBottom: 16,
            }}>
              <p style={{ fontSize: 32, margin: '0 0 8px' }}>:(</p>
              <p style={{ color: '#dc3545', fontWeight: 700, margin: '0 0 4px' }}>
                Sin mesas disponibles
              </p>
              <p style={{ color: '#888', fontSize: 14, margin: 0 }}>
                No hay mesas{zona ? ` en ${NOMBRES_ZONA[zona]}` : ''} para esa fecha y hora.<br/>
                Intenta con otra hora o zona.
              </p>
            </div>
          )}

          <div style={{ display: 'flex', gap: 10 }}>
            <button style={{ ...btn(false), width: 'auto', padding: '10px 20px' }}
              onClick={() => setStep('fecha')}>Volver</button>
            {mesas.length > 0 && (
              <button style={btn()} disabled={!mesaSeleccionada}
                onClick={() => setStep('datos')}>
                Continuar{mesaSeleccionada ? ` — Mesa ${mesaSeleccionada.numero}` : ''}
              </button>
            )}
          </div>
        </div>
      )}

      {/* PASO 3: Datos del cliente */}
      {step === 'datos' && (
        <div>
          <div style={{
            background: '#f9f5eb', border: '1px solid #e8dfc0',
            borderRadius: 8, padding: '10px 14px', marginBottom: 16,
            fontSize: 14, color: '#555',
          }}>
            Mesa {mesaSeleccionada?.numero} · {mesaSeleccionada?.zona} · {fecha} {hora} · {personas} persona{personas !== 1 ? 's' : ''}
            {mesaSeleccionada?.es_vip && <strong style={{ color: '#c9a84c' }}> · VIP — requiere depósito del 30%</strong>}
          </div>

          {['nombre','email','telefono'].map(field => (
            <div key={field}>
              <label style={{ display: 'block', marginBottom: 4, fontWeight: 600, textTransform: 'capitalize' }}>
                {field === 'telefono' ? 'Teléfono' : field.charAt(0).toUpperCase() + field.slice(1)}
              </label>
              <input
                type={field === 'email' ? 'email' : 'text'}
                style={input}
                value={form[field]}
                onChange={e => setForm(prev => ({ ...prev, [field]: e.target.value }))}
                placeholder={
                  field === 'nombre'   ? 'Tu nombre completo' :
                  field === 'email'    ? 'correo@ejemplo.com'  :
                                        '+57 300 000 0000'
                }
              />
            </div>
          ))}

          <label style={{ display: 'block', marginBottom: 4, fontWeight: 600 }}>Notas (opcional)</label>
          <textarea style={{ ...input, resize: 'vertical', minHeight: 70 }}
            value={form.notas}
            onChange={e => setForm(prev => ({ ...prev, notas: e.target.value }))}
            placeholder="Alergias, ocasión especial, preferencias de mesa…" />

          <div style={{ display: 'flex', gap: 10 }}>
            <button style={{ ...btn(false), width: 'auto', padding: '10px 20px' }}
              onClick={() => setStep('mesa')}>Volver</button>
            <button style={btn()}
              disabled={!form.nombre || !form.email || loading}
              onClick={confirmarReserva}>
              {loading ? 'Procesando…' : 'Confirmar reserva'}
            </button>
          </div>
        </div>
      )}

      {/* PASO 4: Confirmación */}
      {step === 'confirmacion' && resultado && (
        <div style={{ textAlign: 'center', padding: '24px 8px' }}>
          {resultado.checkout_url ? (
            <>
              <p style={{ fontSize: 40, margin: '0 0 12px' }}>💳</p>
              <h3 style={{ color: '#1a1a1a', marginBottom: 8 }}>Mesa VIP reservada</h3>
              <p style={{ color: '#555', marginBottom: 20 }}>
                Completa el pago del depósito (30%) para confirmar tu reserva en Zona VIP.
              </p>
              <a href={resultado.checkout_url} style={{
                display: 'block', ...btn(), textDecoration: 'none', textAlign: 'center',
              }}>
                Ir al pago
              </a>
            </>
          ) : (
            <>
              <p style={{ fontSize: 40, margin: '0 0 12px' }}>✓</p>
              <h3 style={{ color: '#28a745', marginBottom: 8 }}>Reserva confirmada</h3>
              <p style={{ color: '#555', marginBottom: 4 }}>
                Enviamos la confirmación a <strong>{form.email}</strong>.
              </p>
              <p style={{ color: '#888', fontSize: 14, marginBottom: 20 }}>
                Mesa {mesaSeleccionada?.numero} · {mesaSeleccionada?.zona} · {fecha} {hora}
              </p>
              <button style={btn()} onClick={resetear}>
                Hacer otra reserva
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}
