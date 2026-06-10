import MeseroApp from '@rustica-apps/apps/MeseroApp'
import { writeSession, readSession } from '../auth/session.js'
import { useEffect } from 'react'

export function ComandasPage() {
  useEffect(() => {
    if (readSession().esGerente === '1') writeSession({ lastTool: 'comandas' })
  }, [])

  return <MeseroApp />
}
