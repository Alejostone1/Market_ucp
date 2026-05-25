# Plan de Pruebas Automatizado — Marketplace UCP

Desarrollado por: Daniel Felipe Colorado Amaya
Correo: daniel.colorado@ucp.edu.co
GitHub: https://github.com/felipeco18
Fecha: Mayo 2026

## Herramienta
Playwright + Chromium — pruebas E2E automatizadas

## Estructura
- 01-smoke.spec.js — Pruebas de humo (6 tests)
- 02-auth.spec.js — HU-01 Login / HU-02 Registro (5 tests)
- 03-publicaciones.spec.js — HU-04/05/06 (5 tests)
- 04-admin.spec.js — HU-12/13/14 (7 tests)
- 05-api.spec.js — Endpoints REST (8 tests)
- 06-perfil-favoritos.spec.js — HU-03/08/09 (5 tests)
- 07-lighthouse.spec.js — Rendimiento y accesibilidad (4 tests)

## Ejecutar
npm install && npx playwright install chromium
npx playwright test
npx playwright show-report

## Resultados (25 mayo 2026)
34 pasados | 4 fallidos | 1 omitido | 2m 43s
