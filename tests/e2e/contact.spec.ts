import { test, expect } from '@playwright/test';

function getFutureDate(): string {
  const d = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  return d.toISOString().split('T')[0];
}

test.describe('Contact & Events Form', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    await page.locator('#contacto').scrollIntoViewIfNeeded();
  });

  // Scenario: La sección de contacto muestra los 4 elementos de información con sus iconos
  test('shows contact info with icons', async ({ page }) => {
    await expect(page.locator('.contact-info-item')).toHaveCount(4);
    await expect(page.locator('.contact-info-icon .fa-location-dot')).toBeVisible();
    await expect(page.locator('.contact-info-icon .fa-phone')).toBeVisible();
    await expect(page.locator('.contact-info-icon .fa-envelope')).toBeVisible();
    await expect(page.locator('.contact-info-icon .fa-clock')).toBeVisible();
  });

  // Scenario: El formulario de eventos muestra éxito con datos válidos
  test('events form shows success on valid submit', async ({ page }) => {
    await page.fill('#evt-name', 'Carlos');
    await page.fill('#evt-email', 'carlos@example.com');
    await page.selectOption('#evt-type', 'Boda');
    await page.fill('#evt-date', getFutureDate());
    await page.fill('#evt-guests', '80');
    await page.fill('#evt-message', 'Quiero información sobre bodas en vuestro espacio.');

    await page.locator('#eventsForm button[type="submit"]').click();

    const alert = page.locator('#eventsAlert .alert-success');
    await expect(alert).toBeVisible({ timeout: 2000 });
    await expect(alert).toContainText('Gracias');
  });

  // Scenario: El formulario de eventos bloquea el envío si el mensaje está vacío
  test('events form blocks empty message', async ({ page }) => {
    await page.fill('#evt-name', 'Carlos');
    await page.fill('#evt-email', 'carlos@example.com');
    await page.selectOption('#evt-type', 'Corporativo');
    await page.fill('#evt-date', getFutureDate());
    await page.fill('#evt-guests', '20');
    // evt-message vacío — no se rellena deliberadamente

    await page.locator('#eventsForm button[type="submit"]').click();
    await expect(page.locator('#evt-message')).toHaveClass(/is-invalid/);
  });

  // Scenario: El footer muestra 3 enlaces de redes sociales y el copyright de Rústica
  test('footer has social links and copyright', async ({ page }) => {
    await page.locator('footer').scrollIntoViewIfNeeded();
    await expect(page.locator('.footer-social a')).toHaveCount(3);
    await expect(page.locator('.footer-copyright')).toContainText('Rústica');
  });
});
