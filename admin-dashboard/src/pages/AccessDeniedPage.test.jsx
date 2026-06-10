import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { AuthContext } from '../auth/AuthContext.jsx'
import { AccessDeniedPage } from './AccessDeniedPage.jsx'

test('muestra mensaje y botón de logout', () => {
  const auth = {
    user: null, token: null, isAuthenticated: false, status: 'authenticated',
    login: vi.fn(), logout: vi.fn(), resolveRedirect: vi.fn(),
  }
  render(
    <AuthContext.Provider value={auth}>
      <MemoryRouter><AccessDeniedPage /></MemoryRouter>
    </AuthContext.Provider>
  )
  expect(screen.getByText(/permisos operativos/i)).toBeInTheDocument()
  expect(screen.getByTestId('btn-acceso-denegado-logout')).toBeInTheDocument()
})

test('click en logout invoca logout()', async () => {
  const auth = {
    user: null, token: null, isAuthenticated: false, status: 'authenticated',
    login: vi.fn(), logout: vi.fn(), resolveRedirect: vi.fn(),
  }
  render(
    <AuthContext.Provider value={auth}>
      <MemoryRouter><AccessDeniedPage /></MemoryRouter>
    </AuthContext.Provider>
  )
  await userEvent.click(screen.getByTestId('btn-acceso-denegado-logout'))
  expect(auth.logout).toHaveBeenCalled()
})
