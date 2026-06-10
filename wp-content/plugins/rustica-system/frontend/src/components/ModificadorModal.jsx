import { useState } from 'react'

const BEBIDAS_SLUGS = ['bebidas', 'bebida', 'drinks', 'licores', 'licor', 'vinos', 'vino', 'cervezas', 'cerveza', 'cocktails', 'cocktail']
const CARNES_SLUGS  = ['almuerzos', 'almuerzo', 'cenas', 'cena', 'parrilla', 'carnes']

function esCategoria(slug, lista) {
  if (!slug) return false
  return lista.some(s => slug.toLowerCase().includes(s))
}

export default function ModificadorModal({ producto, onConfirmar, onCancelar }) {
  const [cantidad, setCantidad] = useState(1)
  const [termino, setTermino]   = useState('')
  const [acomp, setAcomp]       = useState('')
  const [tamano, setTamano]     = useState('')
  const [hielo, setHielo]       = useState('')
  const [gas, setGas]           = useState('')
  const [notas, setNotas]       = useState('')

  if (!producto) return null

  const nombre   = producto.nombre || producto.name || ''
  const precio   = parseFloat(producto.precio || producto.price || 0)
  const categoria = producto.categoria || ''

  const esBebida = esCategoria(categoria, BEBIDAS_SLUGS)
  const esCarne  = esCategoria(categoria, CARNES_SLUGS)

  function buildModificadores() {
    if (esBebida) return { tamano, hielo, gas }
    if (esCarne)  return { termino, acompanamiento: acomp }
    return {}
  }

  const inputCls = 'w-full p-2.5 bg-white text-stone-900 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors'
  const labelCls = 'block mb-2 text-xs font-semibold uppercase tracking-wider text-stone-500'

  return (
    <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-[1000] p-4 backdrop-blur-sm" onClick={onCancelar}>
      <div className="bg-white rounded-2xl p-6 w-full max-w-[420px] border border-stone-200 shadow-2xl" onClick={e => e.stopPropagation()}>
        <h3 className="text-stone-900 text-xl font-bold font-serif mb-1">{nombre}</h3>
        {categoria && (
          <p className="text-xs text-stone-400 uppercase tracking-wider mb-4">{categoria}</p>
        )}

        {/* Cantidad */}
        <label className={labelCls}>Cantidad</label>
        <div className="flex items-center gap-4 mb-5">
          <button
            onClick={() => setCantidad(Math.max(1, cantidad - 1))}
            className="w-10 h-10 flex items-center justify-center bg-stone-100 text-stone-900 border border-stone-300 rounded-lg hover:bg-stone-200 transition-colors font-bold text-lg"
          >
            −
          </button>
          <span className="text-stone-900 text-2xl font-bold w-12 text-center">{cantidad}</span>
          <button
            onClick={() => setCantidad(cantidad + 1)}
            className="w-10 h-10 flex items-center justify-center bg-stone-100 text-stone-900 border border-stone-300 rounded-lg hover:bg-stone-200 transition-colors font-bold text-lg"
          >
            +
          </button>
        </div>

        {/* Bebidas */}
        {esBebida && (
          <>
            <label className={labelCls}>Tamaño</label>
            <select className={`${inputCls} mb-4`} value={tamano} onChange={e => setTamano(e.target.value)}>
              <option value="">-- Sin especificar --</option>
              <option value="pequeno">Pequeño</option>
              <option value="mediano">Mediano</option>
              <option value="grande">Grande</option>
            </select>

            <label className={labelCls}>Temperatura / Hielo</label>
            <select className={`${inputCls} mb-4`} value={hielo} onChange={e => setHielo(e.target.value)}>
              <option value="">-- Sin especificar --</option>
              <option value="frio-con-hielo">Frío con hielo</option>
              <option value="frio-sin-hielo">Frío sin hielo</option>
              <option value="natural">Natural (temperatura ambiente)</option>
              <option value="caliente">Caliente</option>
            </select>

            <label className={labelCls}>Gas (bebidas carbonatadas)</label>
            <select className={`${inputCls} mb-4`} value={gas} onChange={e => setGas(e.target.value)}>
              <option value="">-- Sin especificar --</option>
              <option value="con-gas">Con gas</option>
              <option value="sin-gas">Sin gas</option>
            </select>
          </>
        )}

        {/* Carnes / platos principales */}
        {esCarne && (
          <>
            <label className={labelCls}>Término (carnes)</label>
            <select className={`${inputCls} mb-4`} value={termino} onChange={e => setTermino(e.target.value)}>
              <option value="">-- Sin especificar --</option>
              <option value="crudo">Crudo (Blue)</option>
              <option value="poco-hecho">Poco hecho</option>
              <option value="tres-cuartos">Tres cuartos</option>
              <option value="bien-hecho">Bien hecho</option>
            </select>

            <label className={labelCls}>Acompañamiento</label>
            <select className={`${inputCls} mb-4`} value={acomp} onChange={e => setAcomp(e.target.value)}>
              <option value="">-- Sin cambio --</option>
              <option value="papas-fritas">Papas fritas</option>
              <option value="ensalada">Ensalada</option>
              <option value="arroz">Arroz</option>
              <option value="vegetales">Vegetales al vapor</option>
            </select>
          </>
        )}

        {/* Notas siempre presentes */}
        <label className={labelCls}>Notas especiales</label>
        <textarea
          value={notas}
          onChange={e => setNotas(e.target.value)}
          placeholder="Sin cebolla, extra salsa, alergias…"
          className={`${inputCls} mb-6 resize-none h-20`}
        />

        <div className="flex gap-3">
          <button
            onClick={onCancelar}
            className="flex-1 py-2.5 px-4 bg-transparent border border-stone-300 hover:border-stone-400 text-stone-700 rounded-xl font-semibold transition-all duration-200"
          >
            Cancelar
          </button>
          <button
            onClick={() => onConfirmar({ producto, cantidad, modificadores: buildModificadores(), notas })}
            className="flex-[2] py-2.5 px-4 bg-amber-500 hover:bg-amber-400 text-white rounded-xl font-bold shadow-lg transition-all duration-200"
          >
            Agregar · ${(precio * cantidad).toLocaleString('es-CO')}
          </button>
        </div>
      </div>
    </div>
  )
}
