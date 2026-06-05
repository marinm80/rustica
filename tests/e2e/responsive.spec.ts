import { test, expect } from '@playwright/test';

test.describe('Responsive Layout', () => {
  // Scenario: En móvil no hay desbordamiento horizontal
  test('mobile: no horizontal overflow', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    const viewportWidth = await page.evaluate(() => window.innerWidth);
    expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 1);
  });

  // Scenario: En móvil el botón hamburguesa es visible y el menú está colapsado
  test('mobile: hamburger menu visible', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('.navbar-toggler')).toBeVisible();
    await expect(page.locator('#navMenu')).not.toBeVisible();
  });

  // Scenario: En móvil el botón hamburguesa abre el menú de navegación
  test('mobile: hamburger opens nav menu', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    await page.locator('.navbar-toggler').click();
    await expect(page.locator('#navMenu')).toBeVisible({ timeout: 1500 });
  });

  // Scenario: En escritorio los enlaces de navegación son visibles sin el toggler
  test('desktop: nav links visible without toggler', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('.navbar-toggler')).not.toBeVisible();
    await expect(page.locator('a.nav-link[href="#reservas"]')).toBeVisible();
  });

  // Scenario: En escritorio la sección de menú muestra exactamente 4 tarjetas
  test('menu grid: 4 cards visible on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    await page.locator('#menu').scrollIntoViewIfNeeded();
    await expect(page.locator('.menu-card')).toHaveCount(4);
  });

  // Scenario: En escritorio la sección de contacto usa layout de dos columnas
  test('contact: two-column layout on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    await page.locator('#contacto').scrollIntoViewIfNeeded();
    const cols = page.locator('#contacto .row > [class*="col-lg"]');
    await expect(cols).toHaveCount(2);
  });
});
