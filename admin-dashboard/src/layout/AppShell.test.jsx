import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { AuthContext } from '../auth/AuthContext.jsx'
import { AppShell } from './AppShell.jsx'

function makeAuth() {
  return {
    status: 'authenticated', token: 'tok', isAuthenticated: true,
    user: { displayName: 'Test', role: 'mesero', isManager: false, isStaff: true },
    login: vi.fn(), logout: vi.fn(), resolveRedirect: vi.fn(),
  }
}

test('rustica:unauthorized dispara logout y navega a /login?expired=1', async () => {
  const auth = makeAuth()
  render(
    <AuthContext.Provider value={auth}>
      <MemoryRouter initialEntries={['/comandas']}>
        <Routes>
          <Route element={<AppShell />}>
            <Route path="/comandas" element={<div>Comandas</div>} />
          </Route>
          <Route path="/login" element={<div data-testid="login-page">Login</div>} />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>
  )
  expect(screen.getByText('Comandas')).toBeInTheDocument()
  window.dispatchEvent(new Event('rustica:unauthorized'))
  await waitFor(() => expect(auth.logout).toHaveBeenCalled())
})
