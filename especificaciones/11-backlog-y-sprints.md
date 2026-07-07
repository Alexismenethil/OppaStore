# 11 — Product Backlog y planificación de sprints

Gestión ágil **Scrum + XP** con un único desarrollador de roles duales (Product Owner /
Scrum Team), tal como plantea la metodología del curso.

## 1. Product Backlog priorizado

| Orden | HU | Historia | Prioridad | Puntos | Sprint |
|-------|----|----------|-----------|--------|--------|
| 1 | HU02 | Filtrar por categoría | Alta | 5 | S1 |
| 2 | HU01 | Ver productos destacados | Alta | 3 | S1 |
| 3 | HU06 | Ver estado del producto | Alta | 3 | S1 |
| 4 | HU11 | Buscar por nombre | Media | 3 | S1 |
| 5 | HU03 | Agregar al carrito | Alta | 5 | S2 |
| 6 | HU04 | Modificar cantidades | Alta | 5 | S2 |
| 7 | HU05 | Enviar pedido por WhatsApp | Alta | 8 | S2 |
| 8 | HU10 | Info de skincare/snacks | Media | 3 | S2 |
| 9 | HU07 | Guardar favoritos | Media | 3 | S3 |
| 10 | HU12 | Ver y quitar favoritos | Media | 3 | S3 |
| 11 | HU14 | Login opcional con Google | Media | 5 | S3 |
| 12 | HU15 | Recuperar guardados | Baja | 5 | S3 |
| 13 | HU08 | Registrar productos (admin) | Alta | 8 | S4 |
| 14 | HU09 | Cambiar estado (admin) | Alta | 5 | S4 |
| 15 | HU13 | Desactivar producto | Media | 3 | S4 |
| 16 | HU16 | Historial de pedidos | Media | 3 | S4 |

**Total ≈ 74 puntos** + Sprint 0 de fundaciones.

## 2. Plan de sprints

### Sprint 0 — Fundaciones (infraestructura y diseño)
- **Objetivo:** proyecto ejecutable con identidad visual y datos semilla.
- **Entregables:**
  - Monorepo `frontend/` + `backend/` + `docker-compose.yml` (Postgres).
  - Next.js + Tailwind con **tokens del design system** "Green Panda".
  - Componentes base: `Button`, `Card`, `StatusBadge`, `ProductCard`, `CartDrawer`, `Header`, `Footer`.
  - Prisma con el esquema del DER + migración inicial + seed de categorías/productos.
  - Configuración de pruebas (Vitest, RTL, Playwright) y CI mínima.
- **Incremento:** Home estática con datos reales del seed.

### Sprint 1 — Catálogo y Home
- **Historias:** HU01, HU02, HU06, HU11.
- **RF:** RF01–RF17. **Pruebas:** CP01, CP02, CP03, CP05, CP11.
- **Incremento:** Home + Catálogo con filtro, búsqueda y estados derivados.

### Sprint 2 — Detalle, Carrito y WhatsApp (núcleo del MVP)
- **Historias:** HU03, HU04, HU05, HU10.
- **RF:** RF18–RF29. **Pruebas:** CP04, CP06, CP07, CP08, CP09, CP14, CP15, CP18, CP20.
- **Incremento:** flujo completo catálogo → carrito → **pedido registrado + WhatsApp**.

### Sprint 3 — Favoritos, Drops y sesión opcional
- **Historias:** HU07, HU12, HU14, HU15 (+ Drops RF30–RF33).
- **RF:** RF30–RF41. **Pruebas:** CP10, CP12, CP19, CP22.
- **Incremento:** favoritos sin duplicados, sección Drops y login Google opcional con merge de carrito.

### Sprint 4 — Admin y cierre de QA
- **Historias:** HU08, HU09, HU13, HU16.
- **RF:** RF42–RF48. **Pruebas:** CP16, CP17, CP21 + regresión completa + CP13 (responsive).
- **Incremento:** panel admin (allowlist), borrado lógico, historial de pedidos, suite QA completa con cobertura y reporte E2E.

## 3. Eventos y artefactos Scrum

- **Sprint Planning:** selección de historias del backlog para cada sprint.
- **Daily (autogestión):** bitácora breve de avance/bloqueos.
- **Sprint Review:** demo del incremento contra criterios de aceptación.
- **Sprint Retrospective:** mejoras de proceso.
- **Artefactos:** Product Backlog (este documento), Sprint Backlog (por sprint), Incremento (build desplegable).

## 4. Prácticas XP aplicadas

- **TDD/pruebas primero** en la capa de dominio (reglas de negocio).
- **Integración continua** (CI en cada push).
- **Refactorización continua** apoyada por la cobertura.
- **Diseño simple** y estándares de código (ESLint + TS strict).

## 5. Definition of Ready / Definition of Done

**Ready (para entrar a un sprint):** la historia tiene RF, RB, CA y CP asociados y está estimada.

**Done (para cerrar una historia):** código + pruebas en verde, cobertura de dominio ≥ 80 %,
criterios de aceptación satisfechos, sin errores de lint/TS, incremento desplegable.

---
_Control de cambios: v1.0 (2026-07-07) — versión inicial._
