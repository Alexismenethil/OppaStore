# 10 — Plan de pruebas y aseguramiento de la calidad (QA)

## 1. Objetivo

Verificar que OppaStore cumple sus requisitos y reglas de negocio, y generar **evidencia
objetiva** de calidad para las variables **X4 – Funcionamiento** y **X5 – Usabilidad**,
alineadas a **ISO/IEC 25010:2023** y a la **Escala de Usabilidad del Sistema (SUS)**.

## 2. Alcance y niveles de prueba

| Nivel | Herramienta | Qué cubre | Ubicación |
|-------|-------------|-----------|-----------|
| **Unitaria** | Vitest | Reglas de negocio puras (carrito, estado, WhatsApp, dinero, favoritos) | `frontend/src/domain`, `backend/src/services` |
| **Componente** | Vitest + React Testing Library | Render y comportamiento de UI (tarjetas, badges, carrito, formularios) | `frontend/tests` |
| **Integración API** | Vitest/Supertest | Endpoints Express + Prisma (pedidos, auth, admin) | `backend/tests` |
| **E2E** | Playwright | Flujos completos de usuario (catálogo → carrito → WhatsApp), responsive, admin | `frontend/tests/e2e` |
| **No funcional** | Lighthouse, axe | Desempeño, accesibilidad, mobile-first | CI/manual |
| **Usabilidad** | Cuestionario SUS | Percepción de usuarios piloto | Muestra piloto |

## 3. Estrategia por regla de negocio (pirámide de pruebas)

La base son pruebas **unitarias** rápidas sobre la capa de dominio (una función pura por
regla), luego pruebas de **componente**, y en la cima pocos **E2E** de los flujos críticos.

| Regla | Prueba principal | Caso |
|-------|------------------|------|
| RB01 (stock máx.) | Unit `cart.updateQty` rechaza > stock | CP06 |
| RB02/RB19 (estado derivado) | Unit `estadoProducto()` | CP05, CP11 |
| RB04/RB05 (totales) | Unit `cart.totals` | CP07 |
| RB06/RB16 (mensaje WhatsApp) | Unit `construirMensaje()` | CP09 |
| RB07 (mín. 1) | Unit `cart.updateQty` no baja de 1 | CP06, CP08 |
| RB08 (favoritos únicos) | Unit `favorites.add` idempotente | CP12 |
| RB10 (inactivos ocultos) | Integración `GET /products` | CP01, CP17 |
| RB11/RB12 (sin pasarela) | Revisión de dependencias + E2E | CP14, CP15 |
| RB18 (formato soles) | Unit `formatearSoles()` | CP07 |
| RB21 (merge carrito) | Integración `PUT /me/cart` | CP19 |
| RB22 (registro pedido) | Integración `POST /orders` | CP20 |
| RB23 (allowlist admin) | Integración middleware admin | CP21 |

## 4. Criterios de entrada y salida

**Entrada:** especificaciones aprobadas, entorno con Docker/Postgres levantado, data semilla cargada.

**Salida (Definition of Done por historia):**
- Todos los CP asociados en verde.
- Cobertura de la capa de dominio ≥ 80 % (RNF13).
- Sin errores de lint/TypeScript.
- Criterios de aceptación (Gherkin) satisfechos.

## 5. Evidencia de la variable X4 — Funcionamiento (Ficha de Análisis Documental)

Se registra por dimensión funcional con veredicto binario **Cumple / No Cumple**, replicando
el instrumento de la tesis de referencia y categorizando por subcaracterísticas de
**Adecuación Funcional** (ISO/IEC 25010): *completitud, corrección y pertinencia funcional*.

| Dimensión | Ítem evaluado | CP | Resultado |
|-----------|---------------|----|-----------|
| D1 · Catálogo | Lista solo activos, filtra, busca | CP01–CP03 | ⬜ |
| D2 · Carrito | Agregar, límite de stock, totales, eliminar | CP04–CP08 | ⬜ |
| D3 · Checkout WhatsApp | Mensaje correcto, registro de pedido, apertura wa.me, sin pasarela | CP09, CP14, CP15, CP20 | ⬜ |
| D4 · Estados de producto | Agotado, pocas unidades, preventa | CP05, CP10, CP11 | ⬜ |
| D5 · Favoritos | Sin duplicados, listar | CP12 | ⬜ |
| D6 · Admin | Crear/editar/estado, inactivo oculto, acceso restringido | CP16, CP17, CP21 | ⬜ |
| D7 · Sesión opcional | Login Google, fusión y persistencia | CP19, CP22 | ⬜ |
| D8 · No funcional | Responsive móvil, info de producto | CP13, CP18 | ⬜ |

> La columna Resultado se completa al ejecutar la suite (captura del reporte Vitest/Playwright + cobertura como anexo).

## 6. Evidencia de la variable X5 — Usabilidad (SUS)

- **Instrumento:** cuestionario SUS de 10 ítems Likert (Brooke, 1996).
- **Muestra:** ~15–20 usuarios piloto de Ayacucho (público objetivo 15–30 años).
- **Cálculo:** fórmula estándar SUS → puntaje 0–100.
- **Meta:** SUS ≥ 80 ("Excelente"). Se reporta promedio y distribución.

## 7. Herramientas y automatización

- **CI (recomendado):** GitHub Actions ejecuta lint + unit + componente + integración en cada push; E2E en PR.
- **Reportes:** cobertura Vitest (HTML/LCOV), reporte Playwright (HTML con trazas y capturas).
- **Gestión de defectos:** issues etiquetados por módulo y severidad; se referencia el CP que lo detectó.

---
_Control de cambios: v1.0 (2026-07-07) — versión inicial._
