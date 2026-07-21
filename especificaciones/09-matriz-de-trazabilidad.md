# 09 — Matriz de trazabilidad

Trazabilidad **bidireccional** entre requisitos funcionales (RF), historias de usuario (HU),
reglas de negocio (RB), criterios de aceptación (CA) y casos de prueba (CP). Garantiza que
todo requisito tenga historia, criterio y prueba, y que ninguna prueba quede huérfana.

## 1. Matriz principal (por caso de prueba)

Forma clásica de auditoría: una fila por caso de prueba muestra toda la cadena de origen.

| CP | Qué valida | CA | RB | HU | RF | Módulo |
|----|-----------|----|----|----|----|--------|
| CP01 | Catálogo muestra solo activos | — | RB10 | HU02 | RF11 | Catálogo |
| CP02 | Filtro por categoría | — | — | HU02 | RF12 | Catálogo |
| CP03 | Búsqueda por nombre | — | — | HU11 | RF13 | Catálogo |
| CP04 | Agregar producto disponible | — | RB04 | HU03 | RF17, RF20 | Catálogo/Detalle |
| CP05 | Bloqueo de agotado | CA01 | RB02, RB19 | HU03, HU06 | RF14, RF17 | Catálogo/Detalle |
| CP06 | Límite de cantidad = stock | CA02 | RB01, RB07 | HU03, HU04 | RF20, RF26 | Detalle/Carrito |
| CP07 | Total se actualiza | CA06 | RB04, RB05, RB18 | HU04 | RF25 | Carrito |
| CP08 | Eliminar del carrito | — | RB07 | HU04 | RF24 | Carrito |
| CP09 | Genera mensaje WhatsApp | CA03 | RB06, RB16 | HU05 | RF27, RF29 | Carrito |
| CP10 | Preventa con fecha | CA04 | RB03, RB19 | HU06 | RF19, RF31, RF32 | Detalle/Drops |
| CP11 | Pocas unidades (1–5) | CA07 | RB09, RB19 | HU06 | RF14 | Catálogo |
| CP12 | Favoritos sin duplicados | CA05 | RB08 | HU07 | RF35 | Favoritos |
| CP13 | Responsive móvil | — | RB15 | (todas) | RNF01 | Global |
| CP14 | Sin pasarela de pagos | — | RB11 | HU05 | RF29 | Global |
| CP15 | Flujo final WhatsApp | — | RB06, RB12 | HU05 | RF29 | Carrito |
| CP16 | Admin crea/edita/estado | — | RB13, RB14 | HU08, HU09 | RF43, RF44, RF46, RF47 | Admin |
| CP17 | Inactivo oculto en catálogo | CA08 | RB10 | HU13 | RF11, RF45 | Admin/Catálogo |
| CP18 | Detalle skincare/snack | CA09 | RB13, RB14 | HU10 | RF19 | Detalle |
| CP19 | Login Google + fusión carrito | CA10 | RB17, RB20, RB21 | HU14 | RF38, RF40 | Sesión |
| CP20 | Pedido registrado antes de WhatsApp | CA11 | RB22 | HU05 | RF28 | Carrito |
| CP21 | Acceso admin denegado | CA12 | RB23 | HU08 | RF42 | Admin |
| CP22 | Persistencia carrito (invitado) | — | RB17 | HU15 | RF37, RF39 | Carrito/Sesión |

## 2. Cobertura de requisitos funcionales (RF → HU/RB/CP)

| RF | HU | RB | CP |
|----|----|----|----|
| RF01 header/menú | HU01 | — | CP13 (visual) |
| RF02 buscador | HU11 | — | CP03 |
| RF03 favoritos contador | HU07 | RB08 | CP12 |
| RF04 carrito contador | HU03 | RB04 | CP04 |
| RF05 botón WhatsApp header | HU05 | RB06 | CP15 |
| RF06–RF08 hero/categorías/destacados | HU01 | RB10, RB18 | CP01 |
| RF09 sección drops | HU06 | RB03 | CP10 |
| RF10 cómo comprar/footer | HU05 | RB12 | CP15 |
| RF11 listar activos | HU02, HU13 | RB10 | CP01, CP17 |
| RF12 filtro categoría | HU02 | — | CP02 |
| RF13 búsqueda nombre | HU11 | — | CP03 |
| RF14 etiqueta estado | HU06 | RB02, RB09, RB19 | CP05, CP11 |
| RF15 precio soles | HU01 | RB18 | CP07 |
| RF16 imagen | HU01 | — | CP01 |
| RF17 agregar al carrito | HU03 | RB01, RB02 | CP04, CP05 |
| RF18 detalle completo | HU06 | RB18, RB19 | CP10 |
| RF19 info específica por tipo | HU10 | RB03, RB13, RB14 | CP18, CP10 |
| RF20–RF21 agregar/selector cantidad | HU03 | RB01, RB07 | CP06 |
| RF22 listar ítems | HU04 | — | CP04 |
| RF23 aumentar/disminuir | HU04 | RB01, RB05, RB07 | CP06, CP07 |
| RF24 eliminar ítem | HU04 | RB07 | CP08 |
| RF25 subtotal/total | HU04 | RB04, RB05, RB18 | CP07 |
| RF26 validar stock | HU04 | RB01 | CP06 |
| RF27 generar mensaje | HU05 | RB06, RB16 | CP09 |
| RF28 registrar pedido | HU05 | RB22 | CP20 |
| RF29 abrir WhatsApp | HU05 | RB06, RB11, RB12 | CP09, CP14, CP15 |
| RF30–RF33 drops/preventa | HU06 | RB01, RB03 | CP10 |
| RF34–RF36 favoritos | HU07, HU12 | RB08 | CP12 |
| RF37 persistir favoritos | HU15 | RB17 | CP22 |
| RF38 login Google | HU14 | RB20 | CP19 |
| RF39–RF41 carrito guardado/merge/recuperar | HU14, HU15 | RB17, RB21 | CP19, CP22 |
| RF42 acceso admin | HU08 | RB23 | CP21 |
| RF43–RF44 crear/editar | HU08 | RB13, RB14 | CP16 |
| RF45 activar/desactivar | HU13 | RB10 | CP17 |
| RF46–RF47 stock/estado | HU09 | RB02, RB03, RB19 | CP16 |
| RF48 listar/ historial pedidos | HU16 | RB22 | CP16, CP20 |

## 3. Verificación de completitud

- **Resultado histórico de diseño:** RF01–RF48 y RB01–RB23 fueron asociados a uno o más CP;
  ningún CP quedó sin RF/HU de origen en la matriz planificada.
- **Corrección as-built:** “mapeado a CP” no equivale necesariamente a “cubierto por una prueba
  automatizada con el mismo identificador”. La tabla de §4 muestra la evidencia real.
- **HU sin CA propio:** la afirmación histórica “HU sin criterio/prueba: ninguna” no es exacta en
  su parte de criterios. HU02, HU11, HU12, HU15 y HU16, entre otras trazas indirectas, no tienen un
  CA nominal propio en el documento 07, aunque sí cuentan con pruebas relacionadas.
- **CP con nivel distinto al plan:** CP16, CP19 y CP21 estaban clasificados también como E2E, pero
  la evidencia actual es componente/cliente API/integración; no existe E2E dedicado de admin ni
  un login real contra Google.

> Esta matriz alimenta directamente la sección de **Resultados de la Fase de Análisis** y la
> **Validación de Funcionamiento (X4)** del informe final (ver [10-plan-de-pruebas-qa](10-plan-de-pruebas-qa.md)).

## 4. Trazabilidad hacia código y pruebas as-built

La columna “prueba automatizada” identifica archivos existentes, no solo casos planificados. Un
guion indica que el CP conserva validación manual o que su automatización nominal no existe como
flujo completo.

| CP | Cadena RF → HU → RB → CA | Prueba automatizada existente | Archivo implementado principal | Veredicto as-built |
|---|---|---|---|---|
| CP01 | RF11 → HU02/HU13 → RB10 → CA08 (para inactivo) | `backend/tests/products.test.ts`, `frontend/tests/features/catalogHooks.test.tsx`, `frontend/tests/e2e/catalogo.spec.ts` | `backend/src/routes/products.ts`, `frontend/src/features/catalog/CatalogoView.tsx` | Cubierta; E2E local auditado con fallos |
| CP02 | RF12 → HU02 → — → — | `catalog.test.ts`, `CatalogoView.test.tsx`, `CatalogControls.test.tsx`, `products.test.ts`, `catalogo.spec.ts` | `domain/catalog.ts`, `CatalogoView.tsx`, `routes/products.ts` | Cubierta; falta CA nominal |
| CP03 | RF13 → HU11 → — → — | `catalog.test.ts`, `CatalogoView.test.tsx`, `products.test.ts`, `catalogo.spec.ts` | `domain/catalog.ts`, `CatalogoView.tsx`, `routes/products.ts` | Cubierta; falta CA nominal |
| CP04 | RF17/RF20 → HU03 → RB01/RB02/RB04 → — | `cart.test.ts`, `CartContext.test.tsx`, `ProductCard.test.tsx`, `carrito.spec.ts` | `domain/cart.ts`, `CartContext.tsx`, `ProductCard.tsx`, `ProductoDetalle.tsx` | Cubierta; E2E local auditado con fallos |
| CP05 | RF14/RF17 → HU03/HU06 → RB02/RB19 → CA01 | `productStatus.test.ts`, `ProductGrid.test.tsx`, `DetalleProducto.test.tsx`, `carrito.spec.ts` | `domain/productStatus.ts`, `ProductCard.tsx`, `ProductoDetalle.tsx` | Cubierta; E2E local auditado con fallos |
| CP06 | RF20/RF26 → HU03/HU04 → RB01/RB07 → CA02 | `cart.test.ts`, `CartContext.test.tsx`, `CartDrawerHost.test.tsx`, `orders.test.ts`, `carrito.spec.ts` | `domain/cart.ts`, `CartDrawer.tsx`, `routes/orders.ts` | Cubierta; E2E local auditado con fallos |
| CP07 | RF25 → HU04 → RB04/RB05/RB18 → CA06 | `cart.test.ts`, `money.test.ts`, `CartDrawer.test.tsx`, `carrito.spec.ts` | `domain/cart.ts`, `domain/money.ts`, `CartDrawer.tsx` | Cubierta; E2E local auditado con fallos |
| CP08 | RF24 → HU04 → RB07 → — | `cart.test.ts`, `CartContext.test.tsx`, `CartDrawerHost.test.tsx`, `carrito.spec.ts` | `domain/cart.ts`, `CartContext.tsx`, `CartDrawer.tsx` | Cubierta; falta CA nominal y E2E local falló |
| CP09 | RF27/RF29 → HU05 → RB06/RB16 → CA03 | `whatsapp.test.ts`, `checkout.test.ts`, `CheckoutForm.test.tsx`, `CartDrawerHost.test.tsx`, `orders.test.ts`, `carrito.spec.ts` | `domain/whatsapp.ts`, `CheckoutForm.tsx`, `CartDrawerHost.tsx`, `routes/orders.ts` | Cubierta en unit/componente/integración; E2E local falló |
| CP10 | RF19/RF31/RF32 → HU06 → RB03/RB19 → CA04 | `productStatus.test.ts`, `DropCountdown.test.tsx`, `DetalleProducto.test.tsx` | `domain/productStatus.ts`, `DropCountdown.tsx`, `ProductoDetalle.tsx` | Cubierta |
| CP11 | RF14 → HU06 → RB09/RB19 → CA07 | `productStatus.test.ts`, `ProductGrid.test.tsx`, `catalogo.spec.ts` | `domain/productStatus.ts`, `StatusBadge.tsx` | Cubierta; E2E local auditado con fallos |
| CP12 | RF35 → HU07 → RB08 → CA05 | `favorites.test.ts`, `FavoritesContext.test.tsx`, `sync.test.ts` | `domain/favorites.ts`, `FavoritesContext.tsx`, `routes/sync.ts` | Cubierta |
| CP13 | RNF01 → todas → RB15 → — | `MobileTabBar.test.tsx`; Playwright ejecuta todos los escenarios también en proyecto `mobile` | `globals.css`, `Header.tsx`, `MobileTabBar.tsx`, layouts responsivos | Parcial: no hay aserción integral de desbordes y E2E local no pasó |
| CP14 | RF29 → HU05 → RB11 → — | `backend/tests/health.test.ts`, `orders.test.ts`; revisión de dependencias | `routes/orders.ts`, `CartDrawerHost.tsx` | Cubierta; ausencia de pasarela verificada |
| CP15 | RF29 → HU05 → RB06/RB12 → — | `whatsapp.test.ts`, `CartDrawerHost.test.tsx`; no existe escenario E2E nominal completo en los archivos actuales | `domain/whatsapp.ts`, `CartDrawerHost.tsx` | Parcial como E2E |
| CP16 | RF43/RF44/RF46/RF47 → HU08/HU09 → RB13/RB14 → — | `backend/tests/admin.test.ts`, `frontend/tests/lib/apiAdmin.test.ts` | `ProductoForm.tsx`, `routes/admin.ts` | Cubierta en integración/cliente API; sin E2E admin |
| CP17 | RF11/RF45 → HU13 → RB10 → CA08 | `admin.test.ts`, `products.test.ts`, `apiAdmin.test.ts` | `routes/admin.ts`, `routes/products.ts` | Cubierta en integración; sin E2E admin |
| CP18 | RF19 → HU10 → RB13/RB14 → CA09 | `InfoEspecifica.test.tsx`, `DetalleProducto.test.tsx`, `products.test.ts` | `InfoEspecifica.tsx`, `ProductoDetalle.tsx`, `routes/products.ts` | Cubierta |
| CP19 | RF38/RF40 → HU14 → RB17/RB20/RB21 → CA10 | `auth.test.ts`, `auth.redirect.test.ts`, `sync.test.ts`, `CartContext.test.tsx`, `apiAuthSync.test.ts` | `routes/auth.ts`, `routes/sync.ts`, `AuthContext.tsx`, `domain/cart.ts` | Parcial: sin OAuth Google E2E real |
| CP20 | RF28 → HU05 → RB22 → CA11 | `orders.test.ts`, `apiOrdersConfig.test.ts`, `CartDrawerHost.test.tsx` | `routes/orders.ts`, `CartDrawerHost.tsx` | Parcial respecto de CA11: existe fallback que abre WhatsApp si falla el registro |
| CP21 | RF42 → HU08 → RB23 → CA12 | `middleware.test.ts`, `admin.test.ts`, `adminAuth.test.ts`, `apiAdmin.test.ts` | `middleware/auth.ts`, `lib/adminAuth.ts`, `AdminShell.tsx` | Desviación: prueba 403 por `esAdmin`, no allowlist Google; sin E2E admin |
| CP22 | RF37/RF39 → HU15 → RB17 → — | `CartContext.test.tsx`, `FavoritesContext.test.tsx`, `sync.test.ts`, `apiAuthSync.test.ts`, `carrito.spec.ts` | `CartContext.tsx`, `FavoritesContext.tsx`, `routes/sync.ts` | Capacidad cubierta, pero el CP nominal solo describe carrito invitado; falta CA propio |

## 5. Cobertura automatizada y brechas

- Las suites Vitest actuales suman **526 pruebas en verde**: 379 frontend y 147 backend.
- La cobertura medida es frontend: **99.28% statements**, **96.43% branches**, **95.62%
  functions**, **99.28% lines**; backend: **90.31%**, **80.16%**, **100%** y **90.31%**,
  respectivamente.
- Los 22 escenarios Playwright se ejecutan en desktop y mobile (44 ejecuciones). La corrida local
  realizada para esta actualización terminó con 4 aprobadas, 29 fallidas y 11 omitidas; una
  repetición focalizada del catálogo obtuvo 1/8 en verde. La existencia de la traza no se reporta
  como aprobación E2E.
- Permanecen sin evidencia ejecutada Lighthouse, axe y SUS; Google OAuth, Cloudinary y despliegues
  Vercel/Render requieren validación externa.

---
_Control de cambios: v1.0 (2026-07-07) — versión inicial._

_v2.0 — Actualización as-built basada en la implementación, pruebas e historial Git._
