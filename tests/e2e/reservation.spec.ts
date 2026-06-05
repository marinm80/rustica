import { test, expect } from '@playwright/test';

function getFutureDate(): string {
  const d = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  return d.toISOString().split('T')[0];
}

test.describe('Reservation Form', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    await page.locator('#reservas').scrollIntoViewIfNeeded();
  });

  // Scenario: Envío exitoso del formulario con datos válidos
  test('shows success alert on valid submission', async ({ page }) => {
    await page.fill('#res-name', 'Ana García');
    await page.fill('#res-email', 'ana@example.com');
    await page.fill('#res-phone', '612345678');
    await page.fill('#res-date', getFutureDate());
    await page.selectOption('#res-time', '13:00');
    await page.fill('#res-party', '4');

    await page.locator('#reservationForm button[type="submit"]').click();

    const alert = page.locator('#reservationAlert .alert-success');
    await expect(alert).toBeVisible({ timeout: 2000 });
    await expect(alert).toContainText('Gracias');
  });

  // Scenario: El formulario bloquea el envío si el nombre está vacío
  test('blocks submission with empty name', async ({ page }) => {
    await page.fill('#res-email', 'ana@example.com');
    await page.fill('#res-phone', '612345678');
    await page.fill('#res-date', getFutureDate());
    await page.selectOption('#res-time', '13:00');
    await page.fill('#res-party', '4');

    await page.locator('#reservationForm button[type="submit"]').click();

    await expect(page.locator('#res-name')).toHaveClass(/is-invalid/);
    await expect(page.locator('#reservationAlert .alert-success')).not.toBeVisible();
  });

  // Scenario: El formulario rechaza una fecha pasada
  test('rejects past date', async ({ page }) => {
    await page.fill('#res-name', 'Ana');
    await page.fill('#res-email', 'ana@example.com');
    await page.fill('#res-phone', '612345678');
    await page.fill('#res-date', '2020-01-01');
    await page.selectOption('#res-time', '13:00');
    await page.fill('#res-party', '4');

    await page.locator('#reservationForm button[type="submit"]').click();
    await expect(page.locator('#res-date')).toHaveClass(/is-invalid/);
  });

  // Scenario: El formulario rechaza un tamaño de grupo mayor a 30
  test('rejects party size 31', async ({ page }) => {
    await page.fill('#res-name', 'Ana');
    await page.fill('#res-email', 'ana@example.com');
    await page.fill('#res-phone', '612345678');
    await page.fill('#res-date', getFutureDate());
    await page.selectOption('#res-time', '13:00');
    await page.fill('#res-party', '31');

    await page.locator('#reservationForm button[type="submit"]').click();
    await expect(page.locator('#res-party')).toHaveClass(/is-invalid/);
  });

  // Scenario: El formulario rechaza un formato de email inválido
  test('rejects invalid email format', async ({ page }) => {
    await page.fill('#res-name', 'Ana');
    await page.fill('#res-email', 'notanemail');
    await page.fill('#res-phone', '612345678');
    await page.fill('#res-date', getFutureDate());
    await page.selectOption('#res-time', '13:00');
    await page.fill('#res-party', '4');

    await page.locator('#reservationForm button[type="submit"]').click();
    await expect(page.locator('#res-email')).toHaveClass(/is-invalid/);
  });
});
