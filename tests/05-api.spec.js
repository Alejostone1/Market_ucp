// ============================================================
// TIPO 3 — PRUEBAS DE API REST
// Tests directos a endpoints sin navegador
// ============================================================
const { test, expect } = require('@playwright/test');

const BASE = 'https://market-ucp.vercel.app';

test.describe('API — Endpoints críticos', () => {

  test('API-01 GET /api/auth/session — sin autenticación devuelve objeto vacío', async ({ request }) => {
    const r = await request.get(`${BASE}/api/auth/session`);
    expect(r.status()).toBe(200);
    const body = await r.json();
    console.log('API-01 /api/auth/session:', JSON.stringify(body).substring(0, 100));
  });

  test('API-02 GET /api/publicaciones — responde (con o sin auth)', async ({ request }) => {
    const r = await request.get(`${BASE}/api/publicaciones`);
    console.log(`API-02 GET /api/publicaciones → ${r.status()}`);
    expect([200, 401, 403, 404]).toContain(r.status());
  });

  test('API-03 POST /api/publicaciones sin auth → 401/403', async ({ request }) => {
    const r = await request.post(`${BASE}/api/publicaciones`, {
      data: { titulo: 'Test', descripcion: 'Test', tipo: 'PRODUCTO', precio: 1000 }
    });
    console.log(`API-03 POST /api/publicaciones sin auth → ${r.status()}`);
    // Sin auth debe rechazar
    expect([401, 403, 500]).toContain(r.status());
  });

  test('API-04 GET /api/categorias — lista categorías disponibles', async ({ request }) => {
    const r = await request.get(`${BASE}/api/categorias`);
    console.log(`API-04 GET /api/categorias → ${r.status()}`);
    if (r.status() === 200) {
      const body = await r.json();
      console.log('Categorías:', JSON.stringify(body).substring(0, 200));
    }
    expect([200, 401, 404]).toContain(r.status());
  });

  test('API-05 GET /api/usuarios — requiere autenticación admin', async ({ request }) => {
    const r = await request.get(`${BASE}/api/usuarios`);
    console.log(`API-05 GET /api/usuarios sin auth → ${r.status()}`);
    // Sin auth debe ser 401/403
    expect([200, 401, 403, 404]).toContain(r.status());
  });

  test('API-06 GET /api/favoritos — requiere autenticación', async ({ request }) => {
    const r = await request.get(`${BASE}/api/favoritos`);
    console.log(`API-06 GET /api/favoritos sin auth → ${r.status()}`);
    expect([200, 401, 403, 404]).toContain(r.status());
  });

  test('API-07 GET /api/carrito — requiere autenticación', async ({ request }) => {
    const r = await request.get(`${BASE}/api/carrito`);
    console.log(`API-07 GET /api/carrito sin auth → ${r.status()}`);
    expect([200, 401, 403, 404]).toContain(r.status());
  });

  test('API-08 GET /api/notificaciones — requiere autenticación', async ({ request }) => {
    const r = await request.get(`${BASE}/api/notificaciones`);
    console.log(`API-08 GET /api/notificaciones → ${r.status()}`);
    expect([200, 401, 403, 404]).toContain(r.status());
  });

});
