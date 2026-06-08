import { useState, useEffect, useRef } from 'react'

const POLL_MS = 5000

function ComandaCard({ comanda, esNueva, onListo }) {
  const card = {
    background: '#2a2a2a', borderRadius: 12, padding: 16,
    borderLeft: `4px solid ${esNueva ? '#28a745' : '#c9a84c'}`,
    animation: esNueva ? 'pulse 1s ease-in-out 3' : 'none',
  }
  const tiempoTranscurrido = comanda.hora_envio
    ? Math.floor((Date.now() / 1000 - comanda.hora_envio) / 60) + ' min'
    : '—'

  return (
    <div style={card}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
        <span style={{ color: '#c9a84c', fontWeight: 700, fontSize: 18 }}>
          Mesa {comanda.mesa_numero}
        </span>
        <span style={{ color: '#888', fontSize: 13 }}>{tiempoTranscurrido}</span>
      </div>
      {(comanda.items || []).map((item, i) => (
        <div key={i} style={{ color: '#f5f0e8', padding: '4px 0', borderBottom: '1px solid #444' }}>
          <span style={{ fontWeight: 600 }}>{item.cantidad}× {item.nombre}</span>
          {item.modificadores?.termino && (
            <span style={{ color: '#c9a84c', fontSize: 12, marginLeft: 8 }}>
              [{item.modificadores.termino}]
            </span>
          )}
          {item.notas && <p style={{ color: '#888', fontSize: 12, margin: '2px 0 0' }}>{item.notas}</p>}
        </div>
      ))}
      <button onClick={() => onListo(comanda.id)} style={{
        marginTop: 12, width: '100%', padding: '10px 0',
        background: '#28a745', border: 'none', borderRadius: 8,
        color: '#fff', fontWeight: 700, fontSize: 15, cursor: 'pointer',
      }}>
        Listo
      </button>
    </div>
  )
}

export default function CocinaApp() {
  const [comandas, setComandas]   = useState([])
  const [lastPoll, setLastPoll]   = useState(null)
  const [nuevasIds, setNuevasIds] = useState([])
  const prevIds = useRef(new Set())

  useEffect(() => {
    const poll = async () => {
      try {
        const res  = await fetch('/wp-json/rustica/v1/cocina/comandas-activas', {
          headers: { 'X-WP-Nonce': window.RusticaConfig?.nonce || '' }
        })
        const data = await res.json()
        const currIds = new Set(data.comandas.map(c => c.id))
        const nuevas  = [...currIds].filter(id => !prevIds.current.has(id))

        if (nuevas.length > 0) {
          setNuevasIds(nuevas)
          new Audio('/wp-content/plugins/rustica-system/assets/ping.mp3')
            .play().catch(() => {})
          setTimeout(() => setNuevasIds([]), 4000)
        }

        prevIds.current = currIds
        setComandas(data.comandas)
        setLastPoll(new Date().toLocaleTimeString('es', {
          hour: '2-digit', minute: '2-digit', second: '2-digit'
        }))
      } catch (e) {
        // El polling continúa silenciosamente ante errores de red transitorios
      }
    }

    poll()
    const interval = setInterval(poll, POLL_MS)
    return () => clearInterval(interval)
  }, [])

  const marcarListo = async (cmdId) => {
    await fetch('/wp-json/rustica/v1/cocina/marcar-listo', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json', 'X-WP-Nonce': window.RusticaConfig?.nonce || '' },
      body:    JSON.stringify({ comanda_id: cmdId }),
    })
    setComandas(prev => prev.filter(c => c.id !== cmdId))
  }

  return (
    <div style={{ minHeight: '100vh', background: '#1a1a1a', color: '#f5f0e8', padding: '1rem', fontFamily: 'Inter, sans-serif' }}>
      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.6} }
      `}</style>
      <header style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: 24, borderBottom: '2px solid #c9a84c', paddingBottom: 12,
      }}>
        <h1 style={{ fontFamily: 'Playfair Display, serif', color: '#c9a84c', margin: 0 }}>
          Cocina — La Rustica Terrazza
        </h1>
        <span style={{ color: '#888', fontSize: 14 }}>
          Actualizado: {lastPoll} (c/5s) · {comandas.length} comanda(s)
        </span>
      </header>

      {comandas.length === 0
        ? <p style={{ textAlign: 'center', color: '#888', fontSize: 18, marginTop: 80 }}>
            Sin comandas pendientes
          </p>
        : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 16 }}>
            {comandas.map(cmd => (
              <ComandaCard
                key={cmd.id}
                comanda={cmd}
                esNueva={nuevasIds.includes(cmd.id)}
                onListo={marcarListo}
              />
            ))}
          </div>
        )
      }
    </div>
  )
}
