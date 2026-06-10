import { test, expect } from '@playwright/test'

// Precondición: WP en http://localhost:8080 con usuario 'mesero_test' / 'mesero123'
// y usuario 'gerente_test' / 'gerente123'

test.describe('Login por rol', () => {
  test.beforeEach(async ({ page }) => {
    await page.evaluate(() => localStorage.clear())
  })

  test('mesero inicia sesión y llega a /comandas', async ({ page }) => {
    await page.goto('/login')
    await page.fill('[aria-label="Usuario"]', process.env.MESERO_USER ?? 'mesero_test')
    await page.fill('[aria-label="Contraseña"]', process.env.MESERO_PASS ?? 'mesero123')
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL(/\/comandas/)
  })

  test('gerente inicia sesión y llega a /dashboard', async ({ page }) => {
    await page.goto('/login')
    await page.fill('[aria-label="Usuario"]', process.env.GERENTE_USER ?? 'gerente_test')
    await page.fill('[aria-label="Contraseña"]', process.env.GERENTE_PASS ?? 'gerente123')
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL(/\/dashboard/)
    await expect(page.getByText(/panel de operación/i)).toBeVisible()
  })

  test('credenciales incorrectas muestran mensaje de error', async ({ page }) => {
    await page.goto('/login')
    await page.fill('[aria-label="Usuario"]', 'usuario_invalido')
    await page.fill('[aria-label="Contraseña"]', 'contraseña_invalida')
    await page.click('button[type="submit"]')
    await expect(page.getByRole('alert')).toContainText(/incorrectas/i)
  })
})
