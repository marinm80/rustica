import { test, expect } from '@playwright/test';

test.describe('Gallery', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    await page.locator('#galeria').scrollIntoViewIfNeeded();
  });

  // Scenario: El tab "El Restaurante" está activo por defecto
  test('shows El Restaurante tab by default', async ({ page }) => {
    await expect(page.locator('#pane-restaurante')).toHaveClass(/show active/);
    await expect(page.locator('#pane-platos')).not.toHaveClass(/show active/);
  });

  // Scenario: Al hacer click en "Nuestros Platos" se activa ese tab
  test('switches to Nuestros Platos tab', async ({ page }) => {
    await page.locator('#tab-platos').click();
    await expect(page.locator('#pane-platos')).toHaveClass(/show active/, { timeout: 1500 });
    await expect(page.locator('#pane-restaurante')).not.toHaveClass(/active/);
  });

  // Scenario: Al hacer click en un item de la galería se abre el modal lightbox
  test('opens lightbox modal on gallery item click', async ({ page }) => {
    const firstItem = page.locator('#pane-restaurante .gallery-item').first();
    await firstItem.click();
    const modal = page.locator('#galleryModal');
    await expect(modal).toBeVisible({ timeout: 2000 });
  });

  // Scenario: El modal lightbox se puede cerrar
  test('closes lightbox modal', async ({ page }) => {
    await page.locator('#pane-restaurante .gallery-item').first().click();
    await expect(page.locator('#galleryModal')).toBeVisible({ timeout: 2000 });
    await page.locator('#galleryModal .btn-close').click();
    await expect(page.locator('#galleryModal')).toBeHidden({ timeout: 2000 });
  });

  // Scenario: Cada tab de la galería tiene exactamente 4 elementos
  test('gallery grid has 4 items per tab', async ({ page }) => {
    const restauranteItems = page.locator('#pane-restaurante .gallery-item');
    await expect(restauranteItems).toHaveCount(4);

    await page.locator('#tab-platos').click();
    const platosItems = page.locator('#pane-platos .gallery-item');
    await expect(platosItems).toHaveCount(4);
  });
});
