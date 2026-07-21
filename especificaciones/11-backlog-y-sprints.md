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

## 6. Estado real de implementación

Esta sección es retrospectiva. Los puntos y sprints anteriores se conservan como planificación
histórica; los estados siguientes se obtienen del código, las pruebas y commits identificables. No
se infieren fechas ni responsables.

| HU | Estado as-built | Tareas completadas | Archivos asociados | Pruebas asociadas | Evidencia Git clara |
|---|---|---|---|---|---|
| HU01 | Completada | Home, hero, categorías, destacados activos/por ventas y tarjetas con precio/estado | `app/page.tsx`, `ProductCard.tsx`, `StatusBadge.tsx`, `routes/products.ts`, `routes/site.ts` | `home.spec.ts`, `ProductCard.test.tsx`, `StatusBadge.test.tsx`, `products.test.ts`, `site.test.ts` | `d0ba278`, `69a53f6`, `de69fd9`; titular posterior `0f18fdd` |
| HU02 | Completada | Filtro de catálogo por categoría y parámetro URL | `CatalogoView.tsx`, `CatalogControls.tsx`, `domain/catalog.ts`, `routes/products.ts` | `catalog.test.ts`, `CatalogoView.test.tsx`, `CatalogControls.test.tsx`, `products.test.ts`, `catalogo.spec.ts` | `69a53f6` |
| HU03 | Completada | Agregar desde tarjeta/detalle y bloquear agotado o exceso de stock | `domain/cart.ts`, `ProductCard.tsx`, `ProductoDetalle.tsx`, `CartContext.tsx` | `cart.test.ts`, `CartContext.test.tsx`, `DetalleProducto.test.tsx`, `carrito.spec.ts` | `d0ba278`, `defd3f4`, `e96cd7c` |
| HU04 | Completada | Aumentar, disminuir, eliminar y recalcular subtotales/total | `domain/cart.ts`, `CartDrawer.tsx`, `CartContext.tsx` | `cart.test.ts`, `CartDrawer.test.tsx`, `CartContext.test.tsx`, `carrito.spec.ts` | `defd3f4`, `e96cd7c` |
| HU05 | Parcial | Formulario, validación, mensaje, POST de pedido y redirect `wa.me` | `domain/checkout.ts`, `domain/whatsapp.ts`, `CheckoutForm.tsx`, `CartDrawerHost.tsx`, `routes/orders.ts` | `checkout.test.ts`, `whatsapp.test.ts`, `CheckoutForm.test.tsx`, `CartDrawerHost.test.tsx`, `orders.test.ts`; E2E local con fallos | `e96cd7c`, corrección `4913813` |
| HU06 | Completada | Estado derivado, badges, preventa y fecha estimada | `domain/productStatus.ts`, `StatusBadge.tsx`, `DropCountdown.tsx`, `ProductoDetalle.tsx` | `productStatus.test.ts`, `StatusBadge.test.tsx`, `DropCountdown.test.tsx`, `DetalleProducto.test.tsx` | `d0ba278`, `defd3f4`, `e96cd7c` |
| HU07 | Completada | Alternar favorito sin duplicados y persistir | `domain/favorites.ts`, `FavoritesContext.tsx`, `ProductCard.tsx` | `favorites.test.ts`, `FavoritesContext.test.tsx`, `ProductCard.test.tsx` | `defd3f4`, `fc059ef` |
| HU08 | Parcial | Alta de productos, campos específicos, imágenes y autorización admin | `ProductoForm.tsx`, `ImageUploader.tsx`, `routes/admin.ts`, `AdminShell.tsx` | `admin.test.ts`, `lib.test.ts`, `apiAdmin.test.ts`, `AdminShell.test.tsx` | `de69fd9` |
| HU09 | Completada | Actualización de stock, activo/preventa y estado derivado | `ProductoForm.tsx`, `routes/admin.ts`, `domain/productStatus.ts` | `admin.test.ts`, `apiAdmin.test.ts`, `productStatus.test.ts` | `de69fd9` |
| HU10 | Completada | Información específica de skincare/snack en detalle | `InfoEspecifica.tsx`, `ProductoDetalle.tsx`, `routes/products.ts` | `InfoEspecifica.test.tsx`, `DetalleProducto.test.tsx`, `products.test.ts` | `e96cd7c` |
| HU11 | Completada | Búsqueda parcial sin distinguir mayúsculas y limpieza de filtros | `domain/catalog.ts`, `CatalogoView.tsx`, `routes/products.ts` | `catalog.test.ts`, `CatalogoView.test.tsx`, `products.test.ts`, `catalogo.spec.ts` | `69a53f6` |
| HU12 | Completada | Vista y retirada de favoritos | `app/favoritos/page.tsx`, `FavoritesContext.tsx` | `FavoritesContext.test.tsx`, `favorites.test.ts` | `defd3f4` |
| HU13 | Completada | Desactivación y borrado lógico cuando existe historial | `app/admin/productos/page.tsx`, `routes/admin.ts`, `routes/products.ts` | `admin.test.ts`, `apiAdmin.test.ts`, `products.test.ts` | `de69fd9` |
| HU14 | Parcial | OAuth Google opcional, JWT, fusión y checkout invitado | `routes/auth.ts`, `lib/jwt.ts`, `AuthContext.tsx`, `domain/cart.ts` | `auth.test.ts`, `auth.redirect.test.ts`, `middleware.test.ts`, `CartContext.test.tsx`, `apiAuthSync.test.ts`; sin E2E Google real | `fc059ef` |
| HU15 | Completada | Recuperación y sincronización de carrito/favoritos local y remota | `AuthContext.tsx`, `CartContext.tsx`, `FavoritesContext.tsx`, `routes/sync.ts` | `sync.test.ts`, `apiAuthSync.test.ts`, pruebas de ambos contextos | `fc059ef` |
| HU16 | Completada | Historial de pedidos y cambio manual de estado | `app/admin/pedidos/page.tsx`, `lib/api/admin.ts`, `routes/admin.ts` | `admin.test.ts`, `apiAdmin.test.ts` | `de69fd9` |

### Observaciones sobre “Done”

- Las **526 pruebas Vitest** (379 frontend y 147 backend), ambos typechecks y ambos builds pasan.
- Los 22 escenarios Playwright se proyectan a 44 ejecuciones por desktop/mobile; la corrida local
  auditada terminó con 4 aprobadas, 29 fallidas y 11 omitidas. Una repetición focalizada del
  catálogo obtuvo 1/8 en verde; por eso HU05 no se declara cerrada sin reserva.
- HU08 es parcial contra su especificación de acceso: el panel existe, pero usa correo/contraseña y
  JWT `esAdmin`, no la allowlist Google descrita por RB23/CA12.
- HU14 conserva estado parcial hasta validar OAuth contra Google en un E2E real.
- Las metas Lighthouse, axe y SUS del plan QA no tienen evidencia ejecutada en el repositorio.

---
_Control de cambios: v1.0 (2026-07-07) — versión inicial._

_v2.0 — Actualización as-built basada en la implementación, pruebas e historial Git._
