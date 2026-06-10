import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { AuthContext } from '../auth/AuthContext.jsx'
import { writeSession } from '../auth/session.js'
import { ComandasPage } from './ComandasPage.jsx'
import { CocinaPage } from './CocinaPage.jsx'
import { ReservasPage } from './ReservasPage.jsx'

function makeAuth(role = 'mesero', isManager = false) {
  return {
    status: 'authenticated', token: 'tok', isAuthenticated: true,
    user: { displayName: 'Test', role, isManager, isStaff: true },
    login: vi.fn(), logout: vi.fn(), resolveRedirect: vi.fn(),
  }
}

beforeEach(() => {
  writeSession({ token: 'tok', apiUrl: 'http://localhost/wp-json' })
})

test('ComandasPage renderiza el stub de MeseroApp', () => {
  render(
    <AuthContext.Provider value={makeAuth('mesero')}>
      <MemoryRouter><ComandasPage /></MemoryRouter>
    </AuthContext.Provider>
  )
  expect(screen.getByTestId('mesero-app-stub')).toBeInTheDocument()
})

test('CocinaPage renderiza el stub de CocinaApp', () => {
  render(
    <AuthContext.Provider value={makeAuth('cocina')}>
      <MemoryRouter><CocinaPage /></MemoryRouter>
    </AuthContext.Provider>
  )
  expect(screen.getByTestId('cocina-app-stub')).toBeInTheDocument()
})

test('ReservasPage renderiza el stub de ReservasApp', () => {
  render(
    <AuthContext.Provider value={makeAuth('administrator', true)}>
      <MemoryRouter><ReservasPage /></MemoryRouter>
    </AuthContext.Provider>
  )
  expect(screen.getByTestId('reservas-app-stub')).toBeInTheDocument()
})

test('CocinaPage persiste lastTool=cocina cuando el usuario es gerente', () => {
  render(
    <AuthContext.Provider value={makeAuth('administrator', true)}>
      <MemoryRouter><CocinaPage /></MemoryRouter>
    </AuthContext.Provider>
  )
  expect(localStorage.getItem('rustica_last_tool')).toBe('cocina')
})
