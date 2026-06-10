import { render, screen, act, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { server } from '../test/setup.js'
import { handlers401Token, handlersGerente, handlersCocina } from '../test/mocks/handlers.js'
import { AuthProvider, AuthContext } from './AuthContext.jsx'
import { useContext } from 'react'

// Helper: componente que expone el contexto para testear
function AuthConsumer() {
  const auth = useContext(AuthContext)
  return (
    <div>
      <span data-testid="status">{auth.status}</span>
      <span data-testid="role">{auth.user?.role ?? 'null'}</span>
      <span data-testid="isManager">{String(auth.user?.isManager)}</span>
      <span data-testid="isAuthenticated">{String(auth.isAuthenticated)}</span>
      <button onClick={() => auth.login('user', 'pass').then(r => {
        document.getElementById('redirect').textContent = r.redirectTo
      })}>
        login
      </button>
      <button onClick={auth.logout}>logout</button>
      <span id="redirect"></span>
    </div>
  )
}

function renderWithAuth() {
  return render(
    <AuthProvider>
      <AuthConsumer />
    </AuthProvider>
  )
}

// Tests de login por rol
test('ingreso mesero redirige a /comandas', async () => {
  // handlers default = mesero
  renderWithAuth()
  await userEvent.click(screen.getByText('login'))
  await waitFor(() => expect(document.getElementById('redirect').textContent).toBe('/comandas'))
  expect(screen.getByTestId('role').textContent).toBe('mesero')
  expect(screen.getByTestId('isAuthenticated').textContent).toBe('true')
})

test('ingreso cocina redirige a /cocina', async () => {
  server.use(...handlersCocina)
  renderWithAuth()
  await userEvent.click(screen.getByText('login'))
  await waitFor(() => expect(document.getElementById('redirect').textContent).toBe('/cocina'))
  expect(screen.getByTestId('role').textContent).toBe('cocina')
})

test('ingreso gerente redirige a /dashboard', async () => {
  server.use(...handlersGerente)
  renderWithAuth()
  await userEvent.click(screen.getByText('login'))
  await waitFor(() => expect(document.getElementById('redirect').textContent).toBe('/dashboard'))
  expect(screen.getByTestId('isManager').textContent).toBe('true')
})

test('credenciales incorrectas lanza error y no persiste sesión', async () => {
  server.use(...handlers401Token)
  renderWithAuth()
  let error = null
  const auth = { login: null }
  function Capturer() {
    const ctx = useContext(AuthContext)
    auth.login = ctx.login
    return null
  }
  render(<AuthProvider><Capturer /></AuthProvider>)
  try {
    await act(async () => { await auth.login('bad', 'bad') })
  } catch(e) {
    error = e
  }
  expect(error).toBeTruthy()
  expect(localStorage.getItem('rustica_token')).toBeNull()
})

test('rehidrata sesión desde localStorage al montar', async () => {
  localStorage.setItem('rustica_token', 'tok')
  localStorage.setItem('rustica_user_role', 'mesero')
  localStorage.setItem('rustica_is_staff', '1')
  localStorage.setItem('rustica_es_gerente', '0')
  renderWithAuth()
  await waitFor(() => expect(screen.getByTestId('status').textContent).toBe('authenticated'))
  expect(screen.getByTestId('isAuthenticated').textContent).toBe('true')
})

test('sin token el estado inicial es anonymous', async () => {
  renderWithAuth()
  await waitFor(() => expect(screen.getByTestId('status').textContent).toBe('anonymous'))
  expect(screen.getByTestId('isAuthenticated').textContent).toBe('false')
})

test('logout limpia localStorage y devuelve estado anonymous', async () => {
  localStorage.setItem('rustica_token', 'tok')
  renderWithAuth()
  await waitFor(() => expect(screen.getByTestId('isAuthenticated').textContent).toBe('true'))
  await userEvent.click(screen.getByText('logout'))
  await waitFor(() => expect(screen.getByTestId('isAuthenticated').textContent).toBe('false'))
  expect(localStorage.getItem('rustica_token')).toBeNull()
  expect(localStorage.getItem('rustica_api_url')).toBeNull()
})
