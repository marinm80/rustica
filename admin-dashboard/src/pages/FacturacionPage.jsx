import FacturacionApp from '@rustica-apps/apps/FacturacionApp'
import { writeSession } from '../auth/session.js'
import { useEffect } from 'react'
import { useAuth } from '../auth/useAuth.js'

export function FacturacionPage() {
  const { user } = useAuth()

  useEffect(() => {
    if (user?.isManager) writeSession({ lastTool: 'facturacion' })
  }, [user])

  return <FacturacionApp />
}
