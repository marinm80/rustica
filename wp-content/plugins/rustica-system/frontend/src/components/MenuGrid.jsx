import { useMenu } from '../hooks/useMenu'

export default function MenuGrid({ onAgregar }) {
  const { productos, loading, error } = useMenu()

  if (loading) return <p style={{ color: '#f5f0e8' }}>Cargando menú…</p>
  if (error)   return <p style={{ color: '#dc3545' }}>Error: {error}</p>

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 12 }}>
      {productos.map(p => (
        <div key={p.id} style={{
          background: '#2a2a2a', borderRadius: 10, overflow: 'hidden',
          border: '1px solid #444', cursor: 'pointer',
        }}
          onClick={() => onAgregar?.(p)}
        >
          {p.images?.[0] && (
            <img src={p.images[0].src} alt={p.name}
              style={{ width: '100%', height: 120, objectFit: 'cover' }} />
          )}
          <div style={{ padding: 10 }}>
            <p style={{ color: '#f5f0e8', margin: 0, fontWeight: 600, fontSize: 14 }}>{p.name}</p>
            <p style={{ color: '#c9a84c', margin: '4px 0 0', fontSize: 15, fontWeight: 700 }}>
              ${Number(p.price).toLocaleString('es-CO')}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
