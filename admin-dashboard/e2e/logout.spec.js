import { test, expect } from '@playwright/test'

test('logout limpia sesión y redirige a /login', async ({ page }) => {
  // Setup: inyectar sesión directamente en localStorage
  await page.goto('/login')
  await page.evaluate(() => {
    localStorage.setItem('rustica_token', 'fake-will-expire')
    localStorage.setItem('rustica_api_url', 'http://localhost:8080/wp-json')
    localStorage.setItem('rustica_user_role', 'mesero')
    localStorage.setItem('rustica_is_staff', '1')
    localStorage.setItem('rustica_es_gerente', '0')
    localStorage.setItem('rustica_user_display_name', 'Test Mesero')
  })
  await page.goto('/comandas')
  await page.click('[data-testid="btn-logout"]')
  await expect(page).toHaveURL(/\/login/)
  const token = await page.evaluate(() => localStorage.getItem('rustica_token'))
  expect(token).toBeNull()
})
