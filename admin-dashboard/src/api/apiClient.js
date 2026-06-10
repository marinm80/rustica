import { readSession } from '../auth/session.js'
import { API_BASE } from '../config/env.js'

export const UNAUTHORIZED_EVENT = 'rustica:unauthorized'

export async function apiClient(path, options = {}) {
  const { token, apiUrl } = readSession()
  const base = apiUrl ?? API_BASE
  const url = `${base}${path}`

  const headers = { 'Content-Type': 'application/json', ...options.headers }
  if (token) headers['Authorization'] = `Bearer ${token}`

  let response
  try {
    response = await fetch(url, { ...options, headers })
  } catch (networkError) {
    throw new Error(`Network error: ${networkError.message}`)
  }

  if (response.status === 401 || response.status === 403) {
    window.dispatchEvent(new Event(UNAUTHORIZED_EVENT))
    throw new Error(`Unauthorized: ${response.status}`)
  }

  if (!response.ok) {
    throw new Error(`HTTP error: ${response.status}`)
  }

  return response.json()
}
