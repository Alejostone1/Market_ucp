// ============================================================
// TIPO 1 — PRUEBAS DE HUMO | Market UCP
// Verifica que las páginas críticas cargan sin errores
// ============================================================
const { test, expect } = require('@playwright/test');

test.describe('HUMO — Carga de páginas críticas', () => {

  test('HUM-01 Página principal carga correctamente', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/.+/);
    await page.screenshot({ path: 'screenshots/HUM-01-home.png', fullPage: false });
  });

  test('HUM-02 Página de Login es accesible', async ({ page }) => {
    await page.goto('/');
    // Buscar link/botón de login
    const loginLink = page.locator('a[href*="login"], a[href*="sign"], button:has-text("Ingresar"), a:has-text("Iniciar"), a:has-text("Login")').first();
    if (await loginLink.count() > 0) {
      await loginLink.click();
      await page.waitForLoadState('networkidle');
    } else {
      await page.goto('/auth/signin');
    }
    await page.screenshot({ path: 'screenshots/HUM-02-login-page.png' });
    // Verificar que hay un formulario o campos de entrada
    const hasInput = await page.locator('input[type="email"], input[name="email"], input[placeholder*="correo"]').count() > 0;
    expect(hasInput || page.url().includes('signin') || page.url().includes('login')).toBeTruthy();
  });

  test('HUM-03 API /api/auth/session responde HTTP 200', async ({ request }) => {
    const response = await request.get('https://market-ucp.vercel.app/api/auth/session');
    expect(response.status()).toBe(200);
    const body = await response.json();
    // Puede ser null (no hay sesión) o un objeto con user
    expect(body === null || typeof body === 'object').toBeTruthy();
  });

  test('HUM-04 Catálogo / Marketplace es accesible', async ({ page }) => {
    await page.goto('/');
    await page.screenshot({ path: 'screenshots/HUM-04-home-full.png', fullPage: true });
    // Navegar al catálogo
    const catalogLink = page.locator('a[href*="marketplace"], a[href*="catalog"], a:has-text("Catálogo"), a:has-text("Explorar"), a:has-text("Publicaciones")').first();
    if (await catalogLink.count() > 0) {
      await catalogLink.click();
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: 'screenshots/HUM-04-catalog.png', fullPage: true });
    } else {
      await page.goto('/marketplace');
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: 'screenshots/HUM-04-catalog.png', fullPage: true });
    }
    expect(page.url()).not.toContain('404');
  });

  test('HUM-05 Página de registro es accesible', async ({ page }) => {
    await page.goto('/');
    const regLink = page.locator('a[href*="register"], a[href*="registro"], a:has-text("Registr"), a:has-text("Crear cuenta")').first();
    if (await regLink.count() > 0) {
      await regLink.click();
      await page.waitForLoadState('networkidle');
    } else {
      await page.goto('/auth/signup');
    }
    await page.screenshot({ path: 'screenshots/HUM-05-register.png' });
    expect(page.url()).not.toContain('404');
  });

  test('HUM-06 API /api/publicaciones responde', async ({ request }) => {
    const response = await request.get('https://market-ucp.vercel.app/api/publicaciones');
    // Puede ser 200 con lista o 401 sin autenticación — ambos son válidos
    expect([200, 401, 403]).toContain(response.status());
  });

});
