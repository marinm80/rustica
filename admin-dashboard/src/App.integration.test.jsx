import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { server } from './test/setup.js'
import { handlersGerente } from './test/mocks/handlers.js'
import { AuthProvider } from './auth/AuthContext.jsx'
import { App } from './App.jsx'
import { writeSession } from './auth/session.js'

function renderApp(initialPath = '/') {
  return render(
    <AuthProvider>
      <MemoryRouter initialEntries={[initialPath]}>
        <App />
      </MemoryRouter>
    </AuthProvider>
  )
}

test('gerente con sesión activa llega a /dashboard al cargar', async () => {
  server.use(...handlersGerente)
  writeSession({
    token: 'gerente-tok',
    apiUrl: 'http://localhost/wp-json',
    userRole: 'administrator',
    esGerente: '1',
    isStaff: '1',
    displayName: 'Gerente Test',
  })
  renderApp('/')
  await waitFor(() => expect(screen.getByText(/panel de operación/i)).toBeInTheDocument())
})

test('gerente visita /cocina y se persiste lastTool', async () => {
  server.use(...handlersGerente)
  writeSession({
    token: 'gerente-tok',
    apiUrl: 'http://localhost/wp-json',
    userRole: 'administrator',
    esGerente: '1',
    isStaff: '1',
    displayName: 'Gerente Test',
  })
  renderApp('/cocina')
  await waitFor(() => expect(screen.getByTestId('cocina-app-stub')).toBeInTheDocument())
  expect(localStorage.getItem('rustica_last_tool')).toBe('cocina')
})

test('gerente con lastTool=cocina redirige a /cocina al recargar', async () => {
  server.use(...handlersGerente)
  writeSession({
    token: 'gerente-tok',
    apiUrl: 'http://localhost/wp-json',
    userRole: 'administrator',
    esGerente: '1',
    isStaff: '1',
    displayName: 'Gerente Test',
    lastTool: 'cocina',
  })
  renderApp('/')
  await waitFor(() => expect(screen.getByTestId('cocina-app-stub')).toBeInTheDocument())
})

test('mesero con sesión activa llega a /comandas al cargar', async () => {
  writeSession({
    token: 'mesero-tok',
    apiUrl: 'http://localhost/wp-json',
    userRole: 'mesero',
    esGerente: '0',
    isStaff: '1',
    displayName: 'Mesero Test',
  })
  renderApp('/')
  await waitFor(() => expect(screen.getByTestId('mesero-app-stub')).toBeInTheDocument())
})

test('sin sesión redirige a /login', async () => {
  renderApp('/')
  await waitFor(() => expect(screen.getByRole('button', { name: /ingresar/i })).toBeInTheDocument())
})
