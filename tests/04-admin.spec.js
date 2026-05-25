// ============================================================
// TIPO 2 — PRUEBAS E2E: HU-12 Moderación / HU-13 Usuarios / HU-14 Dashboard
// ============================================================
const { test, expect } = require('@playwright/test');

const BASE = 'https://market-ucp.vercel.app';

async function loginAdmin(page) {
  const routes = ['/auth/signin', '/login', '/signin'];
  for (const r of routes) {
    await page.goto(BASE + r);
    await page.waitForLoadState('domcontentloaded');
    const hasEmail = await page.locator('input[type="email"], input[name="email"], input[placeholder*="correo"]').count();
    if (hasEmail > 0) {
      await page.locator('input[type="email"], input[name="email"], input[placeholder*="correo"]').first().fill('admin@ucp.edu.co');
      await page.locator('input[type="password"]').first().fill('password123');
      await page.locator('button[type="submit"], button:has-text("Ingresar"), button:has-text("Iniciar")').first().click();
      await page.waitForLoadState('networkidle');
      return;
    }
  }
}

test.describe('HU-14 — Dashboard de Administrador', () => {

  test('ADM-01 Dashboard admin carga con métricas', async ({ page }) => {
    await loginAdmin(page);
    // Navegar al panel admin
    const adminRoutes = ['/admin', '/admin/dashboard', '/dashboard/admin'];
    for (const r of adminRoutes) {
      await page.goto(BASE + r);
      await page.waitForLoadState('networkidle');
      const isAdmin = await page.locator('[class*="admin"], [class*="dashboard"], h1:has-text("Admin"), h1:has-text("Dashboard")').count();
      if (isAdmin > 0) break;
    }
    await page.screenshot({ path: 'screenshots/ADM-01-dashboard.png', fullPage: true });
    console.log('ADM-01: Dashboard admin URL: ' + page.url());
    expect(page.url()).not.toContain('404');
  });

  test('ADM-02 Gráficas en dashboard — verificar presencia (DEF-11)', async ({ page }) => {
    await loginAdmin(page);
    await page.goto(BASE + '/admin');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000); // Esperar renderización de gráficas

    const hasCharts = await page.locator('canvas, svg[class*="recharts"], [class*="chart"], [class*="grafica"]').count();
    await page.screenshot({ path: 'screenshots/ADM-02-charts.png', fullPage: true });
    console.log(`DEF-11: Gráficas encontradas en dashboard: ${hasCharts}`);
    // Este test documenta si las gráficas están o no — puede fallar indicando DEF-11
  });

  test('ADM-03 Exportar reporte — verificar opción (DEF-12)', async ({ page }) => {
    await loginAdmin(page);
    await page.goto(BASE + '/admin');
    await page.waitForLoadState('networkidle');

    const exportBtn = page.locator('button:has-text("Exportar"), a:has-text("Exportar"), button:has-text("Export"), button:has-text("PDF"), button:has-text("CSV")').first();
    const hasExport = await exportBtn.count() > 0;
    await page.screenshot({ path: 'screenshots/ADM-03-export-btn.png', fullPage: true });
    console.log(`DEF-12: Botón exportar encontrado: ${hasExport}`);
    // Documentar defecto — se espera que esté pero no está
  });

});

test.describe('HU-13 — Gestionar Usuarios del Sistema', () => {

  test('ADM-04 Panel de gestión de usuarios accesible', async ({ page }) => {
    await loginAdmin(page);
    const routes = ['/admin/usuarios', '/admin/users', '/admin/gestion-usuarios'];
    for (const r of routes) {
      await page.goto(BASE + r);
      await page.waitForLoadState('networkidle');
      const hasUsers = await page.locator('table, [class*="user"], [class*="usuario"]').count();
      if (hasUsers > 0) {
        await page.screenshot({ path: 'screenshots/ADM-04-users.png', fullPage: true });
        break;
      }
    }
    await page.screenshot({ path: 'screenshots/ADM-04-users-panel.png', fullPage: true });
    console.log('ADM-04: Gestión usuarios URL: ' + page.url());
  });

  test('ADM-05 Opción de bloquear usuario — DEFECTO DEF-06/DEF-13', async ({ page }) => {
    await loginAdmin(page);
    const routes = ['/admin/usuarios', '/admin/users', '/admin'];
    for (const r of routes) {
      await page.goto(BASE + r);
      await page.waitForLoadState('networkidle');
    }
    const blockBtn = page.locator('button:has-text("Bloquear"), button:has-text("Block"), [class*="block-user"]').first();
    const hasBlock = await blockBtn.count() > 0;
    await page.screenshot({ path: 'screenshots/ADM-05-block-option.png', fullPage: true });
    console.log(`DEF-06: Botón bloquear usuario encontrado: ${hasBlock}`);
    // Documentar: se espera que exista pero según el reporte manual no está
  });

});

test.describe('HU-12 — Moderación de Publicaciones', () => {

  test('ADM-06 Panel de moderación accesible', async ({ page }) => {
    await loginAdmin(page);
    const routes = ['/admin/moderacion', '/admin/publicaciones', '/admin/moderation'];
    for (const r of routes) {
      await page.goto(BASE + r);
      await page.waitForLoadState('networkidle');
      const hasMod = await page.locator('[class*="moderar"], [class*="moderacion"], button:has-text("Aprobar"), button:has-text("Rechazar")').count();
      if (hasMod > 0) {
        await page.screenshot({ path: 'screenshots/ADM-06-moderation.png', fullPage: true });
        console.log('Panel moderación encontrado en: ' + page.url());
        break;
      }
    }
    await page.screenshot({ path: 'screenshots/ADM-06-moderation-final.png', fullPage: true });
  });

  test('ADM-07 Rechazo sin nota justificativa — DEFECTO DEF-05', async ({ page }) => {
    await loginAdmin(page);
    // Intentar rechazar sin nota
    const routes = ['/admin/moderacion', '/admin/publicaciones'];
    for (const r of routes) {
      await page.goto(BASE + r);
      await page.waitForLoadState('networkidle');
      const rechazarBtn = page.locator('button:has-text("Rechazar"), button:has-text("Reject")').first();
      if (await rechazarBtn.count() > 0) {
        await rechazarBtn.click();
        await page.waitForTimeout(1000);
        await page.screenshot({ path: 'screenshots/ADM-07-reject-modal.png' });
        const hasNotaField = await page.locator('textarea, input[name*="nota"], input[placeholder*="justif"]').count() > 0;
        console.log(`DEF-05: Campo nota justificativa en rechazo: ${hasNotaField}`);
        break;
      }
    }
  });

});
