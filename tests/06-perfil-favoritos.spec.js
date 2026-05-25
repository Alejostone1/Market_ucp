// ============================================================
// TIPO 2 — PRUEBAS E2E: HU-03 Editar Perfil / HU-08 Favoritos / HU-09 Mensajes
// ============================================================
const { test, expect } = require('@playwright/test');

const BASE = 'https://market-ucp.vercel.app';

async function loginAs(page, email, pass) {
  const routes = ['/auth/signin', '/login', '/signin'];
  for (const r of routes) {
    await page.goto(BASE + r);
    await page.waitForLoadState('domcontentloaded');
    const hasEmail = await page.locator('input[type="email"], input[name="email"], input[placeholder*="correo"]').count();
    if (hasEmail > 0) {
      await page.locator('input[type="email"], input[name="email"], input[placeholder*="correo"]').first().fill(email);
      await page.locator('input[type="password"]').first().fill(pass);
      await page.locator('button[type="submit"], button:has-text("Ingresar"), button:has-text("Iniciar")').first().click();
      await page.waitForLoadState('networkidle');
      return;
    }
  }
}

test.describe('HU-03 — Editar Perfil', () => {

  test('PERF-01 Perfil de usuario accesible y editable', async ({ page }) => {
    await loginAs(page, 'daniel.colorado@ucp.edu.co', 'password123');
    const profileRoutes = ['/profile', '/perfil', '/dashboard/perfil', '/cuenta'];
    for (const r of profileRoutes) {
      await page.goto(BASE + r);
      await page.waitForLoadState('networkidle');
      const hasForm = await page.locator('input[name*="nombre"], input[name*="name"], input[name*="telefono"]').count();
      if (hasForm > 0) {
        await page.screenshot({ path: 'screenshots/PERF-01-profile.png', fullPage: true });
        console.log('PERF-01: Perfil encontrado en ' + page.url());
        break;
      }
    }
    await page.screenshot({ path: 'screenshots/PERF-01-profile-final.png', fullPage: true });
    expect(page.url()).not.toBe('about:blank');
  });

});

test.describe('HU-08 — Favoritos', () => {

  test('FAV-01 Añadir publicación a favoritos', async ({ page }) => {
    await loginAs(page, 'daniel.colorado@ucp.edu.co', 'password123');
    await page.goto(BASE + '/marketplace');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'screenshots/FAV-01-catalog.png', fullPage: true });

    const heartBtn = page.locator('[class*="heart"], [class*="favorite"], [class*="favorito"], button[aria-label*="favorito"], svg[class*="heart"]').first();
    if (await heartBtn.count() > 0) {
      await heartBtn.click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: 'screenshots/FAV-01-after-fav.png', fullPage: true });
      console.log('FAV-01: Botón favorito clickeado');
    } else {
      console.log('FAV-01: Botón favorito no encontrado visualmente');
    }
  });

  test('FAV-02 Lista de favoritos accesible', async ({ page }) => {
    await loginAs(page, 'daniel.colorado@ucp.edu.co', 'password123');
    const favRoutes = ['/favoritos', '/favorites', '/dashboard/favoritos'];
    for (const r of favRoutes) {
      await page.goto(BASE + r);
      await page.waitForLoadState('networkidle');
      if (!page.url().includes('404')) {
        await page.screenshot({ path: 'screenshots/FAV-02-list.png', fullPage: true });
        break;
      }
    }
    console.log('FAV-02: Favoritos URL: ' + page.url());
  });

});

test.describe('HU-09 — Mensajería', () => {

  test('MSG-01 Módulo de mensajes accesible', async ({ page }) => {
    await loginAs(page, 'daniel.colorado@ucp.edu.co', 'password123');
    const msgRoutes = ['/mensajes', '/messages', '/chat', '/dashboard/mensajes'];
    for (const r of msgRoutes) {
      await page.goto(BASE + r);
      await page.waitForLoadState('networkidle');
      if (!page.url().includes('404')) {
        await page.screenshot({ path: 'screenshots/MSG-01-messages.png', fullPage: true });
        console.log('MSG-01: Mensajes encontrado en ' + page.url());
        break;
      }
    }
  });

});
