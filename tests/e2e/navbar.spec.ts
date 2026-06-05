import { test, expect } from '@playwright/test';

test.describe('Navbar', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
  });

  // Scenario: Navbar transparente al cargar la página
  test('is transparent on load', async ({ page }) => {
    const navbar = page.locator('#navbar');
    await expect(navbar).toHaveClass(/navbar-transparent/);
    await expect(navbar).not.toHaveClass(/navbar-solid/);
  });

  // Scenario: Navbar se vuelve sólida al hacer scroll hacia abajo
  test('becomes solid after scrolling down', async ({ page }) => {
    await page.evaluate(() => window.scrollTo(0, 200));
    const navbar = page.locator('#navbar');
    await expect(navbar).toHaveClass(/navbar-solid/, { timeout: 2000 });
  });

  // Scenario: El enlace de navegación hace scroll suave a la sección correspondiente
  test('smooth scroll to section on nav link click', async ({ page }) => {
    await page.locator('a.nav-link[href="#reservas"]').click();
    const section = page.locator('#reservas');
    await expect(section).toBeInViewport({ timeout: 2000 });
  });

  // Scenario: El botón hamburguesa es visible en móvil
  test('hamburger menu visible on mobile', async ({ page, viewport }) => {
    if (!viewport || viewport.width > 991) test.skip();
    const toggler = page.locator('.navbar-toggler');
    await expect(toggler).toBeVisible();
  });

  // Scenario: El CTA del hero hace scroll hasta la sección de reservas
  test('hero CTA scrolls to reservas section', async ({ page }) => {
    await page.locator('.btn-rustica').first().click();
    await expect(page.locator('#reservas')).toBeInViewport({ timeout: 2000 });
  });
});
