export default function MesaCard({ mesa, onSeleccionar, seleccionada }) {
  const colores = {
    libre:    '#28a745',
    ocupada:  '#dc3545',
    reservada:'#c9a84c',
  }
  const estado = mesa.estado || 'libre'

  return (
    <div
      onClick={() => onSeleccionar?.(mesa)}
      style={{
        border: seleccionada ? '3px solid #c9a84c' : '2px solid #444',
        borderRadius: 12,
        padding: 16,
        cursor: 'pointer',
        background: seleccionada ? '#2a2a2a' : '#1e1e1e',
        transition: 'all .2s',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontFamily: 'Playfair Display, serif', fontSize: 20, color: '#f5f0e8' }}>
          Mesa {mesa.numero}
        </span>
        <span style={{
          background: colores[estado],
          color: '#fff',
          borderRadius: 20,
          padding: '2px 10px',
          fontSize: 12,
          fontWeight: 600,
        }}>
          {estado}
        </span>
      </div>
      <p style={{ color: '#999', fontSize: 13, margin: '6px 0 0' }}>
        Cap. {mesa.capacidad} · {mesa.zona}
        {mesa.es_vip && <span style={{ color: '#c9a84c', marginLeft: 6 }}>★ VIP</span>}
      </p>
    </div>
  )
}
