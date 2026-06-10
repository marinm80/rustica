import { readSession, writeSession, clearSession } from './session.js'

beforeEach(() => localStorage.clear())

test('writeSession persiste las claves del contrato', () => {
  writeSession({ token: 'abc', apiUrl: 'http://localhost:8080/wp-json', userRole: 'mesero' })
  expect(localStorage.getItem('rustica_token')).toBe('abc')
  expect(localStorage.getItem('rustica_api_url')).toBe('http://localhost:8080/wp-json')
  expect(localStorage.getItem('rustica_user_role')).toBe('mesero')
})

test('readSession rehidrata el objeto de sesión', () => {
  localStorage.setItem('rustica_token', 'tok')
  localStorage.setItem('rustica_api_url', 'http://test/wp-json')
  localStorage.setItem('rustica_user_display_name', 'Ana')
  localStorage.setItem('rustica_user_role', 'cocina')
  localStorage.setItem('rustica_es_gerente', '0')
  localStorage.setItem('rustica_is_staff', '1')
  const s = readSession()
  expect(s.token).toBe('tok')
  expect(s.apiUrl).toBe('http://test/wp-json')
  expect(s.displayName).toBe('Ana')
  expect(s.userRole).toBe('cocina')
  expect(s.esGerente).toBe('0')
  expect(s.isStaff).toBe('1')
})

test('readSession devuelve null para claves ausentes', () => {
  const s = readSession()
  expect(s.token).toBeNull()
  expect(s.lastTool).toBeNull()
})

test('clearSession borra TODAS las claves del contrato', () => {
  writeSession({ token: 'x', apiUrl: 'y', displayName: 'z', userRole: 'mesero', esGerente: '0', isStaff: '1', lastTool: 'cocina' })
  clearSession()
  expect(localStorage.getItem('rustica_token')).toBeNull()
  expect(localStorage.getItem('rustica_api_url')).toBeNull()
  expect(localStorage.getItem('rustica_user_display_name')).toBeNull()
  expect(localStorage.getItem('rustica_user_role')).toBeNull()
  expect(localStorage.getItem('rustica_es_gerente')).toBeNull()
  expect(localStorage.getItem('rustica_is_staff')).toBeNull()
  expect(localStorage.getItem('rustica_last_tool')).toBeNull()
})

test('writeSession solo actualiza las claves provistas (no borra el resto)', () => {
  writeSession({ token: 'tok1', userRole: 'mesero' })
  writeSession({ displayName: 'Carlos' })
  expect(localStorage.getItem('rustica_token')).toBe('tok1')
  expect(localStorage.getItem('rustica_user_display_name')).toBe('Carlos')
})
