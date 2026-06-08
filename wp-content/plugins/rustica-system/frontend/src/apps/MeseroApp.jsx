/**
 * MeseroApp — Tablet del mesero para gestionar la comanda de una mesa.
 *
 * Flujo:
 *   1. Menú agrupado por categoría desde GET /rustica/v1/menu
 *   2. Clic en un platillo → ModificadorModal (cantidad, término, notas)
 *   3. El item se agrega localmente; el botón "Guardar" sincroniza con la API
 *   4. En la pestaña Comanda el mesero puede: + cantidad, - cantidad (mín 1), eliminar item
 *   5. "Enviar a cocina" bloquea la comanda y la manda al KDS
 *
 * window.RusticaConfig debe exponer: { nonce, mesa_id }
 */
import { useState, useEffect, useCallback } from 'react'
import ModificadorModal from '../components/ModificadorModal'

const API   = '/wp-json/rustica/v1'
const nonce = () => window.RusticaConfig?.nonce || ''

// ── Hooks internos ──────────────────────────────────────────────────────────

function useMenu() {
  const [categorias, setCategorias] = useState([])
  const [loading, setLoading]       = useState(true)

  useEffect(() => {
    fetch(`${API}/menu`)
      .then(r => r.json())
      .then(d => { setCategorias(d.menu || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  return { categorias, loading }
}

function useComanda(mesaId) {
  const [comanda, setComanda]   = useState(null)
  const [loading, setLoading]   = useState(true)

  const refetch = useCallback(async () => {
    if (!mesaId) return
    try {
      const r = await fetch(`${API}/comanda-activa?mesa=${mesaId}`, {
        headers: { 'X-WP-Nonce': nonce() },
      })
      const d = await r.json()
      setComanda(d.comanda)
    } catch (_) {}
    setLoading(false)
  }, [mesaId])

  useEffect(() => { refetch() }, [refetch])

  return { comanda, loading, refetch }
}

// ── Estilos reutilizables ───────────────────────────────────────────────────

const S = {
  app:    { minHeight: '100vh', background: '#1a1a1a', color: '#f5f0e8', fontFamily: 'Inter, sans-serif' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', borderBottom: '2px solid #222' },
  tabs:   { display: 'flex', gap: 0, borderBottom: '2px solid #222' },
  tab:    (a) => ({ flex: 1, padding: '12px', border: 'none', cursor: 'pointer', fontWeight: a ? 700 : 400, fontSize: 14, background: a ? '#c9a84c' : '#2a2a2a', color: a ? '#1a1a1a' : '#aaa', transition: 'all .2s' }),
  body:   { padding: 16 },
  card:   { background: '#2a2a2a', borderRadius: 10, overflow: 'hidden', cursor: 'pointer', border: '1px solid #333', transition: 'border-color .2s' },
  precio: { color: '#c9a84c', fontWeight: 700 },
  btn:    (c='#c9a84c', t='#1a1a1a') => ({ background: c, color: t, border: 'none', borderRadius: 8, padding: '10px 16px', fontWeight: 700, cursor: 'pointer', fontSize: 14 }),
  ctrlBtn:{ background: '#333', color: '#f5f0e8', border: 'none', borderRadius: 6, width: 28, height: 28, cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' },
}

// ── Componentes internos ────────────────────────────────────────────────────

function CategoriaMenu({ cat, onAgregar }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <h3 style={{ color: '#c9a84c', fontFamily: 'Playfair Display,serif', fontSize: 16, marginBottom: 12, borderBottom: '1px solid #333', paddingBottom: 6 }}>
        {cat.categoria}
      </h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(160px,1fr))', gap: 10 }}>
        {cat.items.map(item => (
          <div key={item.id} style={S.card}
            onClick={() => onAgregar(item)}
            onMouseEnter={e => e.currentTarget.style.borderColor = '#c9a84c'}
            onMouseLeave={e => e.currentTarget.style.borderColor = '#333'}
          >
            {item.imagen && (
              <img src={item.imagen} alt={item.nombre}
                style={{ width: '100%', height: 90, objectFit: 'cover' }} />
            )}
            <div style={{ padding: '10px 12px' }}>
              <p style={{ margin: '0 0 4px', fontWeight: 600, fontSize: 13, color: '#f5f0e8' }}>{item.nombre}</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={S.precio}>${item.precio.toLocaleString('es-CO')}</span>
                {item.tiempo_prep > 0 && (
                  <span style={{ fontSize: 11, color: '#666' }}>{item.tiempo_prep}m</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function ItemComanda({ item, index, onCambiar, onEliminar }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: '1px solid #2a2a2a' }}>
      <div style={{ flex: 1 }}>
        <p style={{ margin: 0, fontWeight: 600, fontSize: 14, color: '#f5f0e8' }}>{item.nombre}</p>
        {item.notas && <p style={{ margin: '2px 0 0', fontSize: 12, color: '#888' }}>{item.notas}</p>}
        {item.modificadores?.termino && (
          <span style={{ fontSize: 11, color: '#c9a84c' }}>{item.modificadores.termino}</span>
        )}
      </div>

      {/* Controles de cantidad */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <button style={S.ctrlBtn} onClick={() => onCambiar(index, item.cantidad - 1)}>−</button>
        <span style={{ minWidth: 20, textAlign: 'center', fontWeight: 700 }}>{item.cantidad}</span>
        <button style={S.ctrlBtn} onClick={() => onCambiar(index, item.cantidad + 1)}>+</button>
      </div>

      <span style={{ ...S.precio, minWidth: 70, textAlign: 'right' }}>
        ${(item.precio * item.cantidad).toLocaleString('es-CO')}
      </span>

      <button onClick={() => onEliminar(index)}
        style={{ background: 'none', border: 'none', color: '#e74c3c', cursor: 'pointer', fontSize: 18, lineHeight: 1, padding: '0 2px' }}>
        ×
      </button>
    </div>
  )
}

// ── App principal ───────────────────────────────────────────────────────────

export default function MeseroApp() {
  const mesaId = window.RusticaConfig?.mesa_id || null

  const { categorias, loading: loadMenu } = useMenu()
  const { comanda, loading: loadCmd, refetch } = useComanda(mesaId)

  const [tab, setTab]             = useState('menu')
  const [modal, setModal]         = useState(null)        // item del menú para el modal
  const [itemsLocal, setItems]    = useState([])          // items editados localmente
  const [guardando, setGuardando] = useState(false)
  const [enviando, setEnviando]   = useState(false)
  const [msg, setMsg]             = useState(null)        // { tipo, texto }

  // Sincroniza los items locales cuando llega la comanda del servidor
  useEffect(() => {
    if (comanda?.items) setItems(comanda.items)
  }, [comanda])

  const mostrarMsg = (tipo, texto) => {
    setMsg({ tipo, texto })
    setTimeout(() => setMsg(null), 3000)
  }

  // Agrega un item desde el modal de modificadores
  const agregarDesdeModal = ({ producto, cantidad, modificadores, notas }) => {
    setItems(prev => {
      const idx = prev.findIndex(i => i.producto_id === producto.id && !i.notas && !notas)
      if (idx >= 0) {
        const copia = [...prev]
        copia[idx] = { ...copia[idx], cantidad: copia[idx].cantidad + cantidad, subtotal: copia[idx].precio * (copia[idx].cantidad + cantidad) }
        return copia
      }
      return [...prev, {
        producto_id: producto.id,
        nombre:      producto.nombre || producto.name,
        precio:      producto.precio || parseFloat(producto.price),
        cantidad,
        subtotal:    (producto.precio || parseFloat(producto.price)) * cantidad,
        modificadores,
        notas,
        estado:      'pendiente',
      }]
    })
    setModal(null)
    setTab('comanda')
  }

  // Modifica cantidad de un item local (mínimo 1)
  const cambiarCantidad = (idx, nuevaCantidad) => {
    if (nuevaCantidad < 1) return
    setItems(prev => {
      const copia = [...prev]
      copia[idx] = { ...copia[idx], cantidad: nuevaCantidad, subtotal: copia[idx].precio * nuevaCantidad }
      return copia
    })
  }

  // Elimina un item de la comanda local
  const eliminarItem = (idx) => {
    setItems(prev => prev.filter((_, i) => i !== idx))
  }

  // Guarda los cambios en la API (crea la comanda si no existe, actualiza si existe)
  const guardarCambios = async () => {
    if (!mesaId || itemsLocal.length === 0) return
    setGuardando(true)
    try {
      if (comanda?.id) {
        // Actualizar comanda existente
        await fetch(`${API}/comanda/actualizar-items`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'X-WP-Nonce': nonce() },
          body:   JSON.stringify({ comanda_id: comanda.id, items: itemsLocal }),
        })
      } else {
        // Crear comanda nueva: agregar cada item uno por uno
        for (const item of itemsLocal) {
          await fetch(`${API}/comanda/agregar-item`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'X-WP-Nonce': nonce() },
            body:   JSON.stringify({
              mesa_id:      mesaId,
              producto_id:  item.producto_id,
              cantidad:     item.cantidad,
              modificadores:item.modificadores,
              notas:        item.notas,
            }),
          })
        }
      }
      await refetch()
      mostrarMsg('ok', 'Cambios guardados')
    } catch (e) {
      mostrarMsg('err', 'Error al guardar')
    }
    setGuardando(false)
  }

  // Envía la comanda a cocina
  const enviarAcocina = async () => {
    if (!comanda?.id) { mostrarMsg('err', 'Guarda los cambios antes de enviar'); return }
    setEnviando(true)
    await fetch(`${API}/comanda/enviar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-WP-Nonce': nonce() },
      body:   JSON.stringify({ comanda_id: comanda.id }),
    })
    await refetch()
    mostrarMsg('ok', 'Comanda enviada a cocina')
    setEnviando(false)
  }

  const total    = itemsLocal.reduce((s, i) => s + i.precio * i.cantidad, 0)
  const enCocina = comanda?.estado === 'en_cocina'

  return (
    <div style={S.app}>
      {/* Header */}
      <header style={S.header}>
        <span style={{ fontFamily: 'Playfair Display,serif', color: '#c9a84c', fontSize: 18 }}>
          Mesa {mesaId || '—'}
        </span>
        <span style={{ fontSize: 12, color: enCocina ? '#c9a84c' : '#666' }}>
          {enCocina ? '⏳ En cocina' : itemsLocal.length > 0 ? `${itemsLocal.length} items` : 'Sin comanda'}
        </span>
      </header>

      {/* Tabs */}
      <div style={S.tabs}>
        <button style={S.tab(tab === 'menu')}    onClick={() => setTab('menu')}>Menú</button>
        <button style={S.tab(tab === 'comanda')} onClick={() => setTab('comanda')}>
          Comanda {itemsLocal.length > 0 ? `(${itemsLocal.length})` : ''}
        </button>
      </div>

      {/* Notificación */}
      {msg && (
        <div style={{ padding: '10px 16px', background: msg.tipo === 'ok' ? '#1a3a1a' : '#3a1a1a', color: msg.tipo === 'ok' ? '#5cb85c' : '#e74c3c', fontSize: 13 }}>
          {msg.texto}
        </div>
      )}

      <div style={S.body}>

        {/* TAB: MENÚ */}
        {tab === 'menu' && (
          loadMenu
            ? <p style={{ color: '#888', textAlign: 'center', padding: 32 }}>Cargando menú…</p>
            : categorias.map(cat => (
                <CategoriaMenu key={cat.slug} cat={cat} onAgregar={setModal} />
              ))
        )}

        {/* TAB: COMANDA */}
        {tab === 'comanda' && (
          <div>
            {itemsLocal.length === 0 ? (
              <p style={{ color: '#666', textAlign: 'center', padding: 40 }}>
                La comanda está vacía. Agrega platillos desde el menú.
              </p>
            ) : (
              <>
                {itemsLocal.map((item, idx) => (
                  <ItemComanda
                    key={idx}
                    item={item}
                    index={idx}
                    onCambiar={enCocina ? null : cambiarCantidad}
                    onEliminar={enCocina ? null : eliminarItem}
                  />
                ))}

                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 0', borderTop: '2px solid #333', marginTop: 8 }}>
                  <span style={{ fontWeight: 700, fontSize: 16 }}>Total</span>
                  <span style={{ ...S.precio, fontSize: 18 }}>${total.toLocaleString('es-CO')}</span>
                </div>

                {!enCocina && (
                  <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
                    <button onClick={guardarCambios} disabled={guardando}
                      style={{ ...S.btn('#2a2a2a', '#c9a84c'), flex: 1, border: '1px solid #c9a84c' }}>
                      {guardando ? 'Guardando…' : 'Guardar cambios'}
                    </button>
                    <button onClick={enviarAcocina} disabled={enviando || !comanda?.id}
                      style={{ ...S.btn(), flex: 2 }}>
                      {enviando ? 'Enviando…' : 'Enviar a cocina'}
                    </button>
                  </div>
                )}

                {enCocina && (
                  <p style={{ textAlign: 'center', color: '#c9a84c', marginTop: 16, fontWeight: 600 }}>
                    Comanda enviada — esperando confirmación de cocina
                  </p>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* Modal de modificadores */}
      <ModificadorModal
        producto={modal}
        onConfirmar={agregarDesdeModal}
        onCancelar={() => setModal(null)}
      />
    </div>
  )
}
