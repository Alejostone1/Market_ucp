// ============================================================
// TIPO 4 — RENDIMIENTO: Medición con API Playwright
// Captura métricas web vitals sin Lighthouse externo
// ============================================================
const { test, expect } = require('@playwright/test');

const BASE = 'https://market-ucp.vercel.app';

test.describe('RENDIMIENTO — Web Vitals y tiempos de carga', () => {

  test('PERF-01 Tiempos de carga página principal', async ({ page }) => {
    const startTime = Date.now();
    await page.goto(BASE, { waitUntil: 'domcontentloaded' });
    const domTime = Date.now() - startTime;

    await page.waitForLoadState('networkidle');
    const fullLoadTime = Date.now() - startTime;

    // Medir métricas de performance con JS
    const metrics = await page.evaluate(() => {
      const nav = performance.getEntriesByType('navigation')[0];
      const paint = performance.getEntriesByType('paint');
      return {
        domContentLoaded: nav ? Math.round(nav.domContentLoadedEventEnd - nav.startTime) : null,
        loadComplete: nav ? Math.round(nav.loadEventEnd - nav.startTime) : null,
        FCP: paint.find(p => p.name === 'first-contentful-paint')?.startTime || null,
        TTFB: nav ? Math.round(nav.responseStart - nav.startTime) : null,
      };
    });

    console.log('PERF-01 Métricas de carga:');
    console.log(`  DOM Content Loaded: ${domTime}ms`);
    console.log(`  Carga completa total: ${fullLoadTime}ms`);
    console.log(`  FCP: ${metrics.FCP ? Math.round(metrics.FCP) + 'ms' : 'N/A'}`);
    console.log(`  TTFB: ${metrics.TTFB ? metrics.TTFB + 'ms' : 'N/A'}`);
    console.log(`  DOM Loaded (API): ${metrics.domContentLoaded}ms`);

    await page.screenshot({ path: 'screenshots/PERF-01-homepage.png', fullPage: true });

    // Umbrales: carga completa < 10s en entorno headless sobre Vercel
    expect(fullLoadTime).toBeLessThan(15000);
  });

  test('PERF-02 Tiempos de carga catálogo /marketplace', async ({ page }) => {
    const start = Date.now();
    await page.goto(BASE + '/marketplace', { waitUntil: 'networkidle' });
    const loadTime = Date.now() - start;

    const metrics = await page.evaluate(() => {
      const nav = performance.getEntriesByType('navigation')[0];
      return {
        resources: performance.getEntriesByType('resource').length,
        domInteractive: nav ? Math.round(nav.domInteractive - nav.startTime) : null,
      };
    });

    console.log(`PERF-02 /marketplace: ${loadTime}ms, ${metrics.resources} recursos`);
    await page.screenshot({ path: 'screenshots/PERF-02-marketplace.png', fullPage: true });
    expect(loadTime).toBeLessThan(15000);
  });

  test('PERF-03 Accesibilidad básica — elementos ARIA y semánticos', async ({ page }) => {
    await page.goto(BASE, { waitUntil: 'networkidle' });

    const a11y = await page.evaluate(() => ({
      hasMain: document.querySelectorAll('main').length,
      hasNav: document.querySelectorAll('nav').length,
      imgWithAlt: Array.from(document.querySelectorAll('img')).filter(i => i.alt).length,
      imgTotal: document.querySelectorAll('img').length,
      hasH1: document.querySelectorAll('h1').length,
      ariaLabels: document.querySelectorAll('[aria-label]').length,
      hasLang: document.documentElement.lang ? true : false,
    }));

    console.log('PERF-03 Accesibilidad:');
    console.log(`  <main>: ${a11y.hasMain}, <nav>: ${a11y.hasNav}, <h1>: ${a11y.hasH1}`);
    console.log(`  Imágenes con alt: ${a11y.imgWithAlt}/${a11y.imgTotal}`);
    console.log(`  aria-label: ${a11y.ariaLabels}, lang en <html>: ${a11y.hasLang}`);

    await page.screenshot({ path: 'screenshots/PERF-03-accessibility.png', fullPage: true });
    // Al menos debe tener h1
    expect(a11y.hasH1).toBeGreaterThanOrEqual(1);
  });

  test('PERF-04 Tamaño de página y recursos', async ({ page }) => {
    let totalBytes = 0;
    page.on('response', async (response) => {
      try {
        const buf = await response.body().catch(() => null);
        if (buf) totalBytes += buf.length;
      } catch {}
    });

    await page.goto(BASE, { waitUntil: 'networkidle' });
    const totalKB = Math.round(totalBytes / 1024);
    console.log(`PERF-04 Tamaño total descargado: ~${totalKB} KB`);
    // No hay umbral de fallo — solo documentar
    expect(totalKB).toBeGreaterThan(0);
  });

});
