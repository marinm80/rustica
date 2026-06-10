import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { AuthContext } from '../auth/AuthContext.jsx'
import { TopBar } from './TopBar.jsx'

function makeAuth(role, isManager = false) {
  return {
    status: 'authenticated', token: 'tok', isAuthenticated: true,
    user: { displayName: 'Ana López', role, isManager, isStaff: true },
    login: vi.fn(), logout: vi.fn(), resolveRedirect: vi.fn(),
  }
}

test('muestra nombre, rol y botón de logout', () => {
  render(
    <AuthContext.Provider value={makeAuth('mesero')}>
      <MemoryRouter><TopBar /></MemoryRouter>
    </AuthContext.Provider>
  )
  expect(screen.getByTestId('topbar-name')).toHaveTextContent('Ana López')
  expect(screen.getByTestId('topbar-role')).toHaveTextContent('Mesero')
  expect(screen.getByTestId('btn-logout')).toBeInTheDocument()
})

test('gerente ve los 4 enlaces de navegación', () => {
  render(
    <AuthContext.Provider value={makeAuth('administrator', true)}>
      <MemoryRouter><TopBar /></MemoryRouter>
    </AuthContext.Provider>
  )
  expect(screen.getByRole('link', { name: /inicio/i })).toBeInTheDocument()
  expect(screen.getByRole('link', { name: /comandas/i })).toBeInTheDocument()
  expect(screen.getByRole('link', { name: /cocina/i })).toBeInTheDocument()
  expect(screen.getByRole('link', { name: /reservas/i })).toBeInTheDocument()
})

test('mesero no ve enlaces de navegación extra', () => {
  render(
    <AuthContext.Provider value={makeAuth('mesero')}>
      <MemoryRouter><TopBar /></MemoryRouter>
    </AuthContext.Provider>
  )
  expect(screen.queryByRole('link', { name: /cocina/i })).not.toBeInTheDocument()
})

test('click en logout invoca logout()', async () => {
  const auth = makeAuth('mesero')
  render(
    <AuthContext.Provider value={auth}>
      <MemoryRouter><TopBar /></MemoryRouter>
    </AuthContext.Provider>
  )
  await userEvent.click(screen.getByTestId('btn-logout'))
  expect(auth.logout).toHaveBeenCalled()
})
