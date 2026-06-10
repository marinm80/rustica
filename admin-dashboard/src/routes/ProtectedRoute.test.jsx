import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { AuthContext } from '../auth/AuthContext.jsx'
import { ProtectedRoute } from './ProtectedRoute.jsx'

function makeAuth(overrides = {}) {
  return {
    status: 'anonymous',
    token: null,
    user: null,
    isAuthenticated: false,
    login: vi.fn(),
    logout: vi.fn(),
    resolveRedirect: () => '/login',
    ...overrides,
  }
}

function renderWithAuth(auth, initialPath = '/protected') {
  return render(
    <AuthContext.Provider value={auth}>
      <MemoryRouter initialEntries={[initialPath]}>
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route path="/protected" element={<div>Contenido protegido</div>} />
          </Route>
          <Route path="/login" element={<div>Pantalla login</div>} />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>
  )
}

test('sin token redirige a /login', async () => {
  renderWithAuth(makeAuth({ status: 'anonymous', isAuthenticated: false }))
  await waitFor(() => expect(screen.queryByText('Pantalla login')).toBeInTheDocument())
  expect(screen.queryByText('Contenido protegido')).not.toBeInTheDocument()
})

test('con token renderiza el contenido protegido', async () => {
  renderWithAuth(makeAuth({
    status: 'authenticated',
    token: 'tok',
    isAuthenticated: true,
    user: { role: 'mesero', isManager: false, isStaff: true },
  }))
  await waitFor(() => expect(screen.queryByText('Contenido protegido')).toBeInTheDocument())
  expect(screen.queryByText('Pantalla login')).not.toBeInTheDocument()
})

test('durante estado loading no redirige ni muestra contenido', () => {
  renderWithAuth(makeAuth({ status: 'loading', isAuthenticated: false }))
  expect(screen.queryByText('Contenido protegido')).not.toBeInTheDocument()
  expect(screen.queryByText('Pantalla login')).not.toBeInTheDocument()
})
