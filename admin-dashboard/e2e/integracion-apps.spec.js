import { test, expect } from '@playwright/test'

test('la sesión del dashboard está disponible para las apps (localStorage)', async ({ page }) => {
  // Login real con mesero
  await page.goto('/login')
  await page.fill('[aria-label="Usuario"]', process.env.MESERO_USER ?? 'mesero_test')
  await page.fill('[aria-label="Contraseña"]', process.env.MESERO_PASS ?? 'mesero123')
  await page.click('button[type="submit"]')
  await expect(page).toHaveURL(/\/comandas/)

  // Verificar que las claves del contrato están en localStorage
  const token = await page.evaluate(() => localStorage.getItem('rustica_token'))
  const apiUrl = await page.evaluate(() => localStorage.getItem('rustica_api_url'))
  expect(token).toBeTruthy()
  expect(apiUrl).toBeTruthy()
})
