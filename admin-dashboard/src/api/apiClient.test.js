import { server } from '../test/setup.js'
import { http, HttpResponse } from 'msw'
import { writeSession } from '../auth/session.js'
import { apiClient } from './apiClient.js'

beforeEach(() => {
  writeSession({ token: 'test-token', apiUrl: 'http://localhost:8080/wp-json' })
})

test('inyecta Authorization Bearer en cada petición', async () => {
  let capturedAuth = null
  server.use(
    http.get('*/rustica/v1/mesas', ({ request }) => {
      capturedAuth = request.headers.get('Authorization')
      return HttpResponse.json([])
    })
  )
  await apiClient('/rustica/v1/mesas')
  expect(capturedAuth).toBe('Bearer test-token')
})

test('devuelve los datos JSON en respuesta OK', async () => {
  server.use(
    http.get('*/rustica/v1/mesas', () => HttpResponse.json([{ id: 1 }]))
  )
  const data = await apiClient('/rustica/v1/mesas')
  expect(data).toEqual([{ id: 1 }])
})

test('respuesta 401 emite rustica:unauthorized y lanza error', async () => {
  server.use(
    http.get('*/rustica/v1/algo', () =>
      HttpResponse.json({ code: 'jwt_auth_invalid_token' }, { status: 401 })
    )
  )
  const events = []
  window.addEventListener('rustica:unauthorized', () => events.push(1))
  await expect(apiClient('/rustica/v1/algo')).rejects.toThrow()
  expect(events).toHaveLength(1)
})

test('respuesta 403 también emite rustica:unauthorized', async () => {
  server.use(
    http.get('*/rustica/v1/algo', () =>
      HttpResponse.json({ code: 'rest_forbidden' }, { status: 403 })
    )
  )
  const events = []
  window.addEventListener('rustica:unauthorized', () => events.push(1))
  await expect(apiClient('/rustica/v1/algo')).rejects.toThrow()
  expect(events).toHaveLength(1)
})

test('error de red lanza error sin emitir rustica:unauthorized', async () => {
  server.use(
    http.get('*/rustica/v1/algo', () => HttpResponse.error())
  )
  const events = []
  window.addEventListener('rustica:unauthorized', () => events.push(1))
  await expect(apiClient('/rustica/v1/algo')).rejects.toThrow()
  expect(events).toHaveLength(0)
})
