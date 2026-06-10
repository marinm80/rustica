import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { server } from '../test/setup.js'
import { handlers401Token } from '../test/mocks/handlers.js'
import { http, HttpResponse } from 'msw'
import { AuthProvider } from '../auth/AuthContext.jsx'
import { LoginPage } from './LoginPage.jsx'

function renderLogin(initialPath = '/login') {
  return render(
    <AuthProvider>
      <MemoryRouter initialEntries={[initialPath]}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/comandas" element={<div>Comandas</div>} />
          <Route path="/dashboard" element={<div>Dashboard</div>} />
        </Routes>
      </MemoryRouter>
    </AuthProvider>
  )
}

test('campos vacíos muestran aviso y no envían', async () => {
  renderLogin()
  await userEvent.click(screen.getByRole('button', { name: /ingresar/i }))
  expect(screen.getByRole('alert')).toHaveTextContent('obligatorios')
  expect(localStorage.getItem('rustica_token')).toBeNull()
})

test('401 muestra mensaje de credenciales incorrectas', async () => {
  server.use(...handlers401Token)
  renderLogin()
  await userEvent.type(screen.getByLabelText('Usuario'), 'bad')
  await userEvent.type(screen.getByLabelText('Contraseña'), 'bad')
  await userEvent.click(screen.getByRole('button', { name: /ingresar/i }))
  await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('incorrectas'))
  expect(localStorage.getItem('rustica_token')).toBeNull()
})

test('error de red muestra mensaje de conexión', async () => {
  server.use(http.post('*/jwt-auth/v1/token', () => HttpResponse.error()))
  renderLogin()
  await userEvent.type(screen.getByLabelText('Usuario'), 'user')
  await userEvent.type(screen.getByLabelText('Contraseña'), 'pass')
  await userEvent.click(screen.getByRole('button', { name: /ingresar/i }))
  await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('conectar'))
})

test('?expired=1 muestra aviso de sesión expirada', () => {
  renderLogin('/login?expired=1')
  expect(screen.getByRole('alert')).toHaveTextContent('expiró')
})
