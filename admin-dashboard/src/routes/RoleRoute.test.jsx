import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { AuthContext } from '../auth/AuthContext.jsx'
import { RoleRoute } from './RoleRoute.jsx'

function makeAuth(role, isManager = false, isStaff = true) {
  return {
    status: 'authenticated',
    token: 'tok',
    isAuthenticated: true,
    user: { role, isManager, isStaff, displayName: 'Test' },
    login: vi.fn(),
    logout: vi.fn(),
    resolveRedirect: () => isManager ? '/dashboard' : `/${role === 'mesero' ? 'comandas' : role}`,
  }
}

function renderWith(auth, allowedRoles, path = '/target') {
  return render(
    <AuthContext.Provider value={auth}>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route element={<RoleRoute allow={allowedRoles} />}>
            <Route path="/target" element={<div>Recurso protegido</div>} />
          </Route>
          <Route path="/comandas" element={<div>App Mesero</div>} />
          <Route path="/cocina" element={<div>App Cocina</div>} />
          <Route path="/dashboard" element={<div>Dashboard</div>} />
          <Route path="/acceso-denegado" element={<div>Acceso denegado</div>} />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>
  )
}

test('mesero en ruta no permitida redirige a /comandas', async () => {
  renderWith(makeAuth('mesero', false, true), ['cocina', 'gerente'])
  await waitFor(() => expect(screen.queryByText('App Mesero')).toBeInTheDocument())
  expect(screen.queryByText('Recurso protegido')).not.toBeInTheDocument()
})

test('cocina en ruta de mesero redirige a /cocina', async () => {
  renderWith(makeAuth('cocina', false, true), ['mesero', 'gerente'])
  await waitFor(() => expect(screen.queryByText('App Cocina')).toBeInTheDocument())
})

test('gerente accede a cualquier ruta permitida', async () => {
  renderWith(makeAuth('administrator', true, true), ['mesero', 'cocina', 'gerente'])
  await waitFor(() => expect(screen.queryByText('Recurso protegido')).toBeInTheDocument())
})

test('gerente en lista allow con clave gerente accede', async () => {
  renderWith(makeAuth('administrator', true, true), ['gerente'])
  await waitFor(() => expect(screen.queryByText('Recurso protegido')).toBeInTheDocument())
})

test('usuario sin isStaff redirige a /acceso-denegado', async () => {
  renderWith(makeAuth('subscriber', false, false), ['mesero'])
  await waitFor(() => expect(screen.queryByText('Acceso denegado')).toBeInTheDocument())
})
