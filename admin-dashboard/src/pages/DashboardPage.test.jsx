import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { DashboardPage } from './DashboardPage.jsx'

test('renderiza 3 tarjetas con enlaces a las herramientas', () => {
  render(<MemoryRouter><DashboardPage /></MemoryRouter>)
  expect(screen.getByRole('link', { name: /comandas/i })).toHaveAttribute('href', '/comandas')
  expect(screen.getByRole('link', { name: /cocina/i })).toHaveAttribute('href', '/cocina')
  expect(screen.getByRole('link', { name: /reservas/i })).toHaveAttribute('href', '/reservas')
})
