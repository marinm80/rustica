import { useState } from 'react'
import { useComanda } from '../hooks/useComanda'
import MenuGrid from '../components/MenuGrid'
import ComandaActual from '../components/ComandaActual'
import ModificadorModal from '../components/ModificadorModal'

const nonce = () => window.RusticaConfig?.nonce || ''

export default function MeseroApp() {
  const mesaId = window.RusticaConfig?.mesa_id || null
  const { comanda, loading } = useComanda(mesaId)
  const [productoModal, setProductoModal] = useState(null)
  const [tab, setTab] = useState('menu') // 'menu' | 'comanda'

  const agregarItem = async ({ producto, cantidad, modificadores, notas }) => {
    await fetch('/wp-json/rustica/v1/comanda/agregar-item', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-WP-Nonce': nonce() },
      body: JSON.stringify({
        mesa_id:      mesaId,
        producto_id:  producto.id,
        cantidad,
        modificadores,
        notas,
      }),
    })
    setProductoModal(null)
    setTab('comanda')
  }

  const enviarComanda = async (comandaId) => {
    await fetch('/wp-json/rustica/v1/comanda/enviar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-WP-Nonce': nonce() },
      body: JSON.stringify({ comanda_id: comandaId }),
    })
  }

  const estiloApp = {
    minHeight: '100vh', background: '#1a1a1a', color: '#f5f0e8',
    fontFamily: 'Inter, sans-serif', padding: 16,
  }
  const tabBar = {
    display: 'flex', gap: 8, marginBottom: 16,
    borderBottom: '2px solid #333', paddingBottom: 8,
  }
  const tabBtn = (activo) => ({
    padding: '8px 20px', borderRadius: 8, border: 'none', cursor: 'pointer',
    background: activo ? '#c9a84c' : '#2a2a2a',
    color:      activo ? '#1a1a1a' : '#f5f0e8',
    fontWeight: activo ? 700 : 400,
  })

  return (
    <div style={estiloApp}>
      <header style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2 style={{ fontFamily: 'Playfair Display, serif', color: '#c9a84c', margin: 0 }}>
          Mesero — Mesa {mesaId}
        </h2>
        <span style={{ fontSize: 12, color: '#888' }}>
          {comanda ? `${comanda.items?.length || 0} items` : 'Sin comanda'}
        </span>
      </header>

      <div style={tabBar}>
        <button style={tabBtn(tab === 'menu')}    onClick={() => setTab('menu')}>Menú</button>
        <button style={tabBtn(tab === 'comanda')} onClick={() => setTab('comanda')}>
          Comanda {comanda?.items?.length ? `(${comanda.items.length})` : ''}
        </button>
      </div>

      {tab === 'menu' && (
        <MenuGrid onAgregar={p => setProductoModal(p)} />
      )}

      {tab === 'comanda' && (
        loading
          ? <p>Cargando…</p>
          : <ComandaActual comanda={comanda} onEnviar={enviarComanda} />
      )}

      <ModificadorModal
        producto={productoModal}
        onConfirmar={agregarItem}
        onCancelar={() => setProductoModal(null)}
      />
    </div>
  )
}
