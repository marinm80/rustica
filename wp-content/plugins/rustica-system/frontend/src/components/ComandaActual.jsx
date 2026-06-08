export default function ComandaActual({ comanda, onEnviar }) {
  if (!comanda || !comanda.items?.length) {
    return <p style={{ color: '#888', textAlign: 'center' }}>Comanda vacía</p>
  }

  const total = comanda.items.reduce((s, i) => s + i.subtotal, 0)

  return (
    <div style={{ background: '#2a2a2a', borderRadius: 12, padding: 16 }}>
      <h3 style={{ color: '#c9a84c', marginTop: 0 }}>Comanda actual</h3>
      {comanda.items.map((item, i) => (
        <div key={i} style={{
          display: 'flex', justifyContent: 'space-between',
          borderBottom: '1px solid #444', padding: '6px 0', color: '#f5f0e8'
        }}>
          <span>{item.cantidad}× {item.nombre}
            {item.notas && <em style={{ color: '#888', fontSize: 12 }}> ({item.notas})</em>}
          </span>
          <span>${Number(item.subtotal).toLocaleString('es-CO')}</span>
        </div>
      ))}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12, color: '#f5f0e8', fontWeight: 700 }}>
        <span>Total</span>
        <span style={{ color: '#c9a84c' }}>${Number(total).toLocaleString('es-CO')}</span>
      </div>
      {comanda.estado === 'abierta' && (
        <button onClick={() => onEnviar?.(comanda.id)} style={{
          marginTop: 12, width: '100%', padding: '10px 0',
          background: '#c9a84c', border: 'none', borderRadius: 8,
          color: '#1a1a1a', fontWeight: 700, fontSize: 15, cursor: 'pointer',
        }}>
          Enviar a cocina
        </button>
      )}
      {comanda.estado === 'en_cocina' && (
        <p style={{ color: '#c9a84c', textAlign: 'center', marginTop: 10 }}>En cocina…</p>
      )}
    </div>
  )
}
