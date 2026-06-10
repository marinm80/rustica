import { createContext, useEffect, useReducer } from 'react'
import { readSession, writeSession, clearSession } from './session.js'
import { apiClient } from '../api/apiClient.js'
import { API_BASE } from '../config/env.js'

export const AuthContext = createContext(null)

const INITIAL = { status: 'loading', token: null, user: null }

function reducer(state, action) {
  switch (action.type) {
    case 'HYDRATE':
      return action.token
        ? { status: 'authenticated', token: action.token, user: action.user }
        : { status: 'anonymous', token: null, user: null }
    case 'LOGIN':
      return { status: 'authenticated', token: action.token, user: action.user }
    case 'LOGOUT':
      return { status: 'anonymous', token: null, user: null }
    default:
      return state
  }
}

function buildUser(session) {
  return {
    displayName: session.displayName,
    role: session.userRole,
    isManager: session.esGerente === '1',
    isStaff: session.isStaff === '1',
  }
}

function resolveRedirectFor(user) {
  if (!user || !user.isStaff) return '/acceso-denegado'
  if (user.isManager) {
    const s = readSession()
    const validTools = ['/comandas', '/cocina', '/reservas']
    const last = s.lastTool ? `/${s.lastTool}` : null
    return validTools.includes(last) ? last : '/dashboard'
  }
  if (user.role === 'mesero') return '/comandas'
  if (user.role === 'cocina') return '/cocina'
  return '/acceso-denegado'
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, INITIAL)

  // Rehidratación al montar: evita el parpadeo de "loading" en sesiones ya existentes
  useEffect(() => {
    const s = readSession()
    dispatch({ type: 'HYDRATE', token: s.token, user: s.token ? buildUser(s) : null })
  }, [])

  async function login(username, password) {
    // Siempre usar API_BASE del env para auth (no localStorage) — evita exfiltración de credenciales via open-redirect CWE-601
    let tokenRes
    try {
      tokenRes = await fetch(`${API_BASE}/jwt-auth/v1/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })
    } catch {
      const err = new Error('Error de red al conectar con el servidor')
      err.code = 'network_error'
      throw err
    }
    if (!tokenRes.ok) {
      const body = await tokenRes.json().catch(() => ({}))
      const err = new Error(body.message ?? 'Credenciales incorrectas')
      err.code = 'auth_error'
      throw err
    }
    const { token, user_display_name } = await tokenRes.json()
    writeSession({ token, apiUrl: API_BASE, displayName: user_display_name })

    try {
      const me = await apiClient('/rustica/v1/auth/me')
      writeSession({
        userRole: me.user_role,
        esGerente: me.es_gerente ? '1' : '0',
        isStaff: me.is_staff ? '1' : '0',
      })
    } catch {
      clearSession()
      const err = new Error('No fue posible verificar tu cuenta. Inténtalo de nuevo.')
      err.code = 'network_error'
      throw err
    }

    const user = buildUser(readSession())
    dispatch({ type: 'LOGIN', token, user })
    return { redirectTo: resolveRedirectFor(user) }
  }

  function logout() {
    clearSession()
    dispatch({ type: 'LOGOUT' })
  }

  const value = {
    ...state,
    isAuthenticated: Boolean(state.token),
    login,
    logout,
    resolveRedirect: () => resolveRedirectFor(state.user),
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
