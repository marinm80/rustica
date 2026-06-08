import { useState, useEffect, useRef } from 'react'

export function useComanda(mesaId, intervalo = 7000) {
  const [comanda, setComanda] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  useEffect(() => {
    if (!mesaId) return
    let activo = true

    const fetchComanda = async () => {
      try {
        const res  = await fetch(`/wp-json/rustica/v1/comanda-activa?mesa=${mesaId}`, {
          headers: { 'X-WP-Nonce': window.RusticaConfig?.nonce || '' }
        })
        const data = await res.json()
        if (activo) { setComanda(data.comanda); setLoading(false) }
      } catch (e) {
        if (activo) setError(e.message)
      }
    }

    fetchComanda()
    const id = setInterval(fetchComanda, intervalo)
    return () => { activo = false; clearInterval(id) }
  }, [mesaId, intervalo])

  return { comanda, loading, error }
}
