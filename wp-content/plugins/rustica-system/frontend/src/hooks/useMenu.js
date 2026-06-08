import { useState, useEffect } from 'react'

const cache = new Map()

export function useMenu() {
  const [productos, setProductos] = useState([])
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState(null)
  const KEY = 'rustica_menu'

  useEffect(() => {
    if (cache.has(KEY)) {
      setProductos(cache.get(KEY))
      setLoading(false)
      return
    }
    fetch('/wp-json/wc/v3/products?per_page=100&status=publish', {
      headers: { 'X-WP-Nonce': window.RusticaConfig?.nonce || '' }
    })
      .then(r => r.json())
      .then(data => {
        cache.set(KEY, data)
        setProductos(data)
        setLoading(false)
      })
      .catch(e => { setError(e.message); setLoading(false) })
  }, [])

  return { productos, loading, error }
}
