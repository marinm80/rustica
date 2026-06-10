import CocinaApp from '@rustica-apps/apps/CocinaApp'
import { writeSession } from '../auth/session.js'
import { useEffect } from 'react'
import { useAuth } from '../auth/useAuth.js'

export function CocinaPage() {
  const { user } = useAuth()

  useEffect(() => {
    if (user?.isManager) writeSession({ lastTool: 'cocina' })
  }, [user])

  return <CocinaApp />
}
