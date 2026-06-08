import { useState } from 'react'

export default function ModificadorModal({ producto, onConfirmar, onCancelar }) {
  const [cantidad, setCantidad]       = useState(1)
  const [termino, setTermino]         = useState('')
  const [acompanamiento, setAcomp]   = useState('')
  const [notas, setNotas]             = useState('')

  if (!producto) return null

  const overlay = {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,.7)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
  }
  const modal = {
    background: '#2a2a2a', borderRadius: 16, padding: 24, width: '90%', maxWidth: 400,
  }
  const label = { color: '#f5f0e8', display: 'block', marginBottom: 4, fontSize: 13 }
  const select = {
    width: '100%', padding: 8, background: '#1a1a1a', color: '#f5f0e8',
    border: '1px solid #444', borderRadius: 6, marginBottom: 12,
  }

  return (
    <div style={overlay} onClick={onCancelar}>
      <div style={modal} onClick={e => e.stopPropagation()}>
        <h3 style={{ color: '#c9a84c', marginTop: 0 }}>{producto.name}</h3>

        <label style={label}>Cantidad</label>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
          <button onClick={() => setCantidad(Math.max(1, cantidad - 1))}
            style={{ ...select, width: 36, textAlign: 'center', cursor: 'pointer' }}>−</button>
          <span style={{ color: '#f5f0e8', fontSize: 18, fontWeight: 700 }}>{cantidad}</span>
          <button onClick={() => setCantidad(cantidad + 1)}
            style={{ ...select, width: 36, textAlign: 'center', cursor: 'pointer' }}>+</button>
        </div>

        <label style={label}>Término (carnes)</label>
        <select style={select} value={termino} onChange={e => setTermino(e.target.value)}>
          <option value="">-- Sin especificar --</option>
          <option value="crudo">Crudo (Blue)</option>
          <option value="poco-hecho">Poco hecho</option>
          <option value="tres-cuartos">Tres cuartos</option>
          <option value="bien-hecho">Bien hecho</option>
        </select>

        <label style={label}>Acompañamiento</label>
        <select style={select} value={acompanamiento} onChange={e => setAcomp(e.target.value)}>
          <option value="">-- Sin cambio --</option>
          <option value="papas-fritas">Papas fritas</option>
          <option value="ensalada">Ensalada</option>
          <option value="arroz">Arroz</option>
          <option value="vegetales">Vegetales al vapor</option>
        </select>

        <label style={label}>Notas especiales</label>
        <textarea value={notas} onChange={e => setNotas(e.target.value)}
          placeholder="Sin cebolla, extra salsa…"
          style={{ ...select, resize: 'vertical', minHeight: 60 }} />

        <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
          <button onClick={onCancelar} style={{
            flex: 1, padding: 10, background: 'transparent',
            border: '1px solid #666', color: '#f5f0e8', borderRadius: 8, cursor: 'pointer',
          }}>Cancelar</button>
          <button onClick={() => onConfirmar({ producto, cantidad, modificadores: { termino, acompanamiento }, notas })}
            style={{
              flex: 2, padding: 10, background: '#c9a84c',
              border: 'none', color: '#1a1a1a', borderRadius: 8,
              fontWeight: 700, cursor: 'pointer',
            }}>
            Agregar · ${(Number(producto.price) * cantidad).toLocaleString('es-CO')}
          </button>
        </div>
      </div>
    </div>
  )
}
