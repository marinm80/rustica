import ReservasApp from '@rustica-apps/apps/ReservasApp'
import { writeSession } from '../auth/session.js'
import { useEffect } from 'react'
import { useAuth } from '../auth/useAuth.js'

export function ReservasPage() {
  const { user } = useAuth()

  useEffect(() => {
    if (user?.isManager) writeSession({ lastTool: 'reservas' })
  }, [user])

  return <ReservasApp />
}
