# 12 — Especificación as-built y tareas verificadas

## 1. Naturaleza y alcance

Este documento es una **reconstrucción retrospectiva basada en evidencia** del sistema que quedó
implementado. Se elaboró contrastando las especificaciones 00–11 con `frontend/package.json`,
`backend/package.json`, el código de `frontend/src/` y `backend/src/`, las suites de pruebas, el
esquema y las migraciones Prisma, `docker-compose.yml`, la automatización de CI y
`git log --oneline --reverse`.

No reemplaza ni reescribe el historial original de SDD. Las especificaciones iniciales siguen
siendo la línea base; las tablas siguientes registran cómo se materializaron realmente, incluidas
las desviaciones. **OpenSpec se incorporó posteriormente** para gestionar modificaciones nuevas.
La evidencia disponible lo vincula al cambio archivado del titular de tendencias de Home
(`openspec/changes/archive/2026-07-20-reanme-title/`, commit `0f18fdd`); no existe evidencia para
afirmar que OpenSpec se utilizó originalmente para construir todos los módulos del MVP.

Estados usados: **Completada** cuando código y prueba verificable cubren el alcance indicado;
**Parcial** cuando existe implementación pero falta parte de la validación o difiere la decisión
as-built; **Pendiente** cuando la evidencia solo muestra una meta o actividad aún no ejecutada.

## 2. Matriz as-built por módulo

| Módulo | RF relacionados | HU relacionadas | RB relacionadas | Tareas realizadas | Tecnologías utilizadas | Archivos principales | Pruebas automatizadas | Estado |
|---|---|---|---|---|---|---|---|---|
| Home | RF01–RF10 | HU01, HU05, HU06 | RB03, RB06, RB10, RB12, RB18 | Maquetar landing, navegación, categorías, drop, destacados y contenido configurable; actualizar titular mediante OpenSpec | Next.js, React, TypeScript, Tailwind CSS, Framer Motion | `frontend/src/app/page.tsx`, `Header.tsx`, `Footer.tsx`, `DropCountdown.tsx`, `backend/src/routes/site.ts`, `products.ts` | `home.spec.ts`, pruebas de Header, Footer, DropCountdown, ProductCard, ConfigContext, `site.test.ts`, `products.test.ts` | Completada; validación E2E local actual no está íntegramente en verde |
| Catálogo | RF11–RF17 | HU02, HU06, HU11 | RB01, RB02, RB09, RB10, RB18, RB19 | Consultar activos, buscar, filtrar, derivar estado y agregar al carrito | Next.js, React, TypeScript, Express, Prisma, Zod | `CatalogoView.tsx`, `CatalogControls.tsx`, `ProductGrid.tsx`, `domain/catalog.ts`, `routes/products.ts` | `catalog.test.ts`, `CatalogoView.test.tsx`, `CatalogControls.test.tsx`, `ProductGrid.test.tsx`, `products.test.ts`, `catalogo.spec.ts` | Completada; E2E local con fallos en la ejecución auditada |
| Detalle de producto | RF18–RF21 | HU03, HU06, HU10 | RB01–RB03, RB07, RB13, RB14, RB18, RB19 | Resolver producto por slug, mostrar galería e información específica y validar cantidad | Next.js, React, TypeScript, Framer Motion, Express, Prisma | `app/producto/[slug]/page.tsx`, `ProductoDetalle.tsx`, `InfoEspecifica.tsx`, `useProducto.ts`, `routes/products.ts` | `DetalleProducto.test.tsx`, `InfoEspecifica.test.tsx`, `catalogHooks.test.tsx`, `products.test.ts`, `carrito.spec.ts` | Completada |
| Carrito | RF22–RF26 | HU03, HU04 | RB01, RB02, RB04, RB05, RB07, RB17, RB18 | Implementar dominio, contexto persistente, drawer, cantidades, eliminación y totales | React, TypeScript, Vitest, React Testing Library | `domain/cart.ts`, `CartContext.tsx`, `CartDrawer.tsx`, `CartDrawerHost.tsx`, `lib/storage.ts` | `cart.test.ts`, `CartContext.test.tsx`, `CartDrawer.test.tsx`, `CartDrawerHost.test.tsx`, `carrito.spec.ts` | Completada; E2E local no está íntegramente en verde |
| Checkout por WhatsApp | RF27–RF29 | HU05 | RB01, RB06, RB11, RB12, RB16, RB18, RB22 | Validar cliente/destino, registrar pedido, construir mensaje y abrir `wa.me`; conservar fallback si falla el registro | React, TypeScript, Express, Zod, Prisma | `domain/checkout.ts`, `domain/whatsapp.ts`, `CheckoutForm.tsx`, `CartDrawerHost.tsx`, `lib/api/orders.ts`, `routes/orders.ts` | `checkout.test.ts`, `whatsapp.test.ts`, `CheckoutForm.test.tsx`, `CartDrawerHost.test.tsx`, `orders.test.ts`, `carrito.spec.ts` | Completada con desviación: el fallback abre WhatsApp aunque falle el registro, por lo que RF28/CA11 no es invariante absoluta |
| Pedidos | RF28, RF48 | HU05, HU16 | RB22 | Persistir pedido e ítems con snapshot, estado inicial pendiente, listar y cambiar estado | Express, Zod, Prisma, PostgreSQL | `routes/orders.ts`, `routes/admin.ts`, `prisma/schema.prisma`, `app/admin/pedidos/page.tsx`, `lib/api/admin.ts` | `orders.test.ts`, `admin.test.ts`, `apiAdmin.test.ts`, `apiOrdersConfig.test.ts` | Completada |
| Favoritos | RF34–RF37 | HU07, HU12, HU15 | RB08, RB17 | Alternar sin duplicados, listar y persistir en navegador/servidor | React, TypeScript, Express, Prisma, PostgreSQL | `domain/favorites.ts`, `FavoritesContext.tsx`, `app/favoritos/page.tsx`, `routes/sync.ts` | `favorites.test.ts`, `FavoritesContext.test.tsx`, `sync.test.ts`, `apiAuthSync.test.ts` | Completada; CP22 solo describe carrito invitado y no toda esta cobertura |
| Autenticación Google | RF38 | HU14 | RB20 | Iniciar OAuth, intercambiar código, obtener perfil, crear/actualizar usuario y emitir JWT | Express, Google OAuth, JWT, Zod, React | `routes/auth.ts`, `lib/jwt.ts`, `lib/usuarios.ts`, `AuthContext.tsx`, `CuentaView.tsx`, `lib/api/auth.ts` | `auth.test.ts`, `auth.redirect.test.ts`, `middleware.test.ts`, `apiAuthSync.test.ts` | Parcial: flujo implementado y probado con dobles/ramas locales; no hay E2E real contra Google |
| Sincronización de carrito y favoritos | RF37, RF39–RF41 | HU14, HU15 | RB08, RB17, RB21 | Recuperar, fusionar, limitar por stock y persistir guardados autenticados | React, TypeScript, Express, Zod, Prisma | `AuthContext.tsx`, `domain/cart.ts`, `lib/api/sync.ts`, `routes/sync.ts` | `CartContext.test.tsx`, `FavoritesContext.test.tsx`, `apiAuthSync.test.ts`, `sync.test.ts` | Completada a nivel unitario/integración; CP19 no tiene un E2E Google completo |
| Panel administrador | RF42–RF48 | HU08, HU09, HU13, HU16 | RB01–RB03, RB09, RB10, RB13, RB14, RB19, RB22, RB23 | Implementar acceso, shell, tablero, productos, pedidos, usuarios y configuración | Next.js, React, TypeScript, Express, Zod, JWT, Prisma | `app/admin/**`, `features/admin/**`, `routes/admin.ts`, `middleware/auth.ts`, `lib/adminAuth.ts` | `admin.test.ts`, `adminAuth.test.ts`, `middleware.test.ts`, `AdminShell.test.tsx`, `apiAdmin.test.ts` | Parcial respecto de la especificación: implementa correo/contraseña, no allowlist Google |
| Gestión de productos | RF43–RF47 | HU08, HU09, HU13 | RB01–RB03, RB09, RB10, RB13, RB14, RB19 | Crear, editar, actualizar stock/banderas y eliminar física o lógicamente según historial | React, TypeScript, Express, Zod, Prisma | `ProductoForm.tsx`, `app/admin/productos/**`, `routes/admin.ts`, `lib/api/admin.ts` | `admin.test.ts`, `apiAdmin.test.ts`, `products.test.ts` | Completada; RF47 se materializa mediante stock y `esPreventa`, no mediante una etiqueta persistida |
| Gestión de categorías e imágenes | RF10, RF43 | HU08 | RB13, RB14 | Editar categoría/contenido, firmar subida directa y mantener galería; fallback a URL | React, Express, Zod, Cloudinary, Prisma | `app/admin/inicio/page.tsx`, `app/admin/config/page.tsx`, `ImageUploader.tsx`, `ProductoForm.tsx`, `routes/admin.ts`, `lib/cloudinary.ts` | `admin.test.ts`, `lib.test.ts`, `apiAdmin.test.ts`, `apiOrdersConfig.test.ts` | Parcial: integración y firma verificadas; no se validó una subida real a Cloudinary |
| Historial de pedidos | RF48 | HU16 | RB22 | Listar pedidos con ítems y cambiar estado manualmente | Next.js, React, Express, Prisma, PostgreSQL | `app/admin/pedidos/page.tsx`, `lib/api/admin.ts`, `routes/admin.ts` | `admin.test.ts`, `apiAdmin.test.ts` | Completada |
| Base de datos | RF28, RF37, RF39–RF48; RNF14 | HU05, HU08, HU14–HU16 | RB08, RB17, RB21, RB22 | Modelar datos, versionar dos migraciones, sembrar categorías/productos/configuración y ejecutar PostgreSQL local | Prisma, PostgreSQL, Docker | `prisma/schema.prisma`, `prisma/migrations/**`, `prisma/seed.ts`, `docker-compose.yml` | 147 pruebas backend, incluidas integración con Prisma/PostgreSQL | Completada para entorno local/CI |
| Despliegue | RNF12, RNF14; ADR-02 | Todas | — | Preparar scripts, variables, CORS y build; corregir salida ejecutable de Render; definir CI | Vercel (frontend), Render (backend), Docker, GitHub Actions | `README.md`, `.env.example`, `backend/src/index.ts`, `backend/package.json`, `.github/workflows/ci.yml` | typecheck y builds de ambos paquetes; CI ejecuta suites y E2E en PR | Parcial: el repositorio evidencia objetivos y preparación, no una URL/despliegue vivo verificable |
| Aseguramiento de calidad | RNF01, RNF07, RNF09, RNF10, RNF13, RNF15 | Todas | RB01–RB23 | Configurar unitarias, componentes, integración, cobertura, E2E, typecheck, builds y CI | Vitest, React Testing Library, Supertest, Playwright, TypeScript | `frontend/tests/**`, `backend/tests/**`, ambos `vitest.config.ts`, `playwright.config.ts`, `.github/workflows/ci.yml` | 379 frontend + 147 backend; 22 escenarios E2E en 2 proyectos = 44 ejecuciones | Parcial: unitarias/integración, cobertura, typecheck y build pasan; E2E local auditado tiene fallos y no hay evidencia ejecutada de Lighthouse, axe o SUS |

## 3. Tareas as-built por módulo

### 3.1 Home

- **Tarea:** Implementar Home con hero, navegación, categorías, drops, proceso de compra y destacados.
- **Objetivo:** cubrir RF01–RF10 y HU01 con una entrada mobile-first al catálogo.
- **Especificación de origen:** RF01–RF10; HU01, HU05, HU06; RB03, RB10, RB12, RB18; CP01, CP10, CP13, CP15.
- **Tecnología:** Next.js, React, TypeScript, Tailwind CSS, Framer Motion.
- **Archivos implementados:** `frontend/src/app/page.tsx`, `frontend/src/components/Header.tsx`, `Footer.tsx`, `DropCountdown.tsx`, `backend/src/routes/site.ts`, `products.ts`.
- **Prueba asociada:** `frontend/tests/e2e/home.spec.ts`, pruebas de Header/Footer/DropCountdown/ProductCard/ConfigContext; `backend/tests/site.test.ts`, `products.test.ts`.
- **Estado:** Completada.

- **Tarea:** Cambiar el titular de tendencias mediante el flujo OpenSpec incorporado después del MVP.
- **Objetivo:** sustituir la referencia fija a Ayacucho por “tu ciudad”.
- **Especificación de origen:** `openspec/specs/homepage-trends-headline/spec.md`.
- **Tecnología:** OpenSpec, Next.js, Playwright.
- **Archivos implementados:** `frontend/src/app/page.tsx`, `frontend/tests/e2e/home.spec.ts`, `openspec/changes/archive/2026-07-20-reanme-title/**`.
- **Prueba asociada:** caso del titular en `frontend/tests/e2e/home.spec.ts`.
- **Estado:** Completada; commit `0f18fdd`.

### 3.2 Catálogo

- **Tarea:** Implementar consulta, filtro y búsqueda del catálogo público.
- **Objetivo:** listar solo activos y permitir localizar productos por categoría o nombre.
- **Especificación de origen:** RF11–RF13; HU02, HU11; RB10; CP01–CP03.
- **Tecnología:** React, TypeScript, Express, Prisma.
- **Archivos implementados:** `CatalogoView.tsx`, `CatalogControls.tsx`, `domain/catalog.ts`, `lib/api/products.ts`, `backend/src/routes/products.ts`.
- **Prueba asociada:** `catalog.test.ts`, `CatalogoView.test.tsx`, `CatalogControls.test.tsx`, `products.test.ts`, `catalogo.spec.ts`.
- **Estado:** Completada; commit base `69a53f6`.

- **Tarea:** Mostrar precio, imagen, estado derivado y acción de carrito.
- **Objetivo:** materializar RF14–RF17 sin persistir etiquetas contradictorias.
- **Especificación de origen:** RF14–RF17; HU03, HU06; RB01, RB02, RB09, RB18, RB19; CP04, CP05, CP11.
- **Tecnología:** React, TypeScript, Tailwind CSS.
- **Archivos implementados:** `ProductGrid.tsx`, `ProductCard.tsx`, `StatusBadge.tsx`, `domain/productStatus.ts`, `domain/money.ts`.
- **Prueba asociada:** `ProductGrid.test.tsx`, `ProductCard.test.tsx`, `StatusBadge.test.tsx`, `productStatus.test.ts`, `money.test.ts`.
- **Estado:** Completada.

### 3.3 Detalle de producto

- **Tarea:** Implementar ficha por slug, galería, disponibilidad e información por tipo.
- **Objetivo:** cubrir RF18–RF21 y dar información específica de skincare, snack y preventa.
- **Especificación de origen:** RF18–RF21; HU03, HU06, HU10; RB01, RB03, RB13, RB14, RB18, RB19; CP06, CP10, CP18.
- **Tecnología:** Next.js, React, TypeScript, Framer Motion, Express, Prisma.
- **Archivos implementados:** `app/producto/[slug]/page.tsx`, `ProductoDetalle.tsx`, `InfoEspecifica.tsx`, `useProducto.ts`, `routes/products.ts`.
- **Prueba asociada:** `DetalleProducto.test.tsx`, `InfoEspecifica.test.tsx`, `catalogHooks.test.tsx`, `products.test.ts`.
- **Estado:** Completada; commit base `e96cd7c`.

### 3.4 Carrito

- **Tarea:** Implementar operaciones y cálculos del carrito con persistencia local.
- **Objetivo:** agregar, modificar y eliminar dentro del stock, recalcular totales y recuperar tras recarga.
- **Especificación de origen:** RF22–RF26; HU03, HU04; RB01, RB02, RB04, RB05, RB07, RB17, RB18; CP04–CP08, CP22.
- **Tecnología:** TypeScript, React, localStorage.
- **Archivos implementados:** `domain/cart.ts`, `CartContext.tsx`, `CartDrawer.tsx`, `lib/storage.ts`.
- **Prueba asociada:** `cart.test.ts`, `CartContext.test.tsx`, `CartDrawer.test.tsx`, `storage.test.ts`, `carrito.spec.ts`.
- **Estado:** Completada; commits base `defd3f4` y `e96cd7c`.

### 3.5 Checkout por WhatsApp

- **Tarea:** Validar datos del comprador y generar el mensaje/enlace WhatsApp.
- **Objetivo:** terminar la compra sin pasarela, con productos, importes y destino verificables.
- **Especificación de origen:** RF27, RF29; HU05; RB06, RB11, RB12, RB16, RB18; CA03; CP09, CP14, CP15.
- **Tecnología:** TypeScript, React, Zod en el servidor.
- **Archivos implementados:** `domain/checkout.ts`, `domain/whatsapp.ts`, `CheckoutForm.tsx`, `CartDrawerHost.tsx`.
- **Prueba asociada:** `checkout.test.ts`, `whatsapp.test.ts`, `CheckoutForm.test.tsx`, `CartDrawerHost.test.tsx`, `orders.test.ts`.
- **Estado:** Completada; corrección del redirect en `4913813`.

- **Tarea:** Registrar el pedido antes de redirigir a WhatsApp.
- **Objetivo:** conservar evidencia e historial del pedido.
- **Especificación de origen:** RF28–RF29; HU05; RB22; CA11; CP20.
- **Tecnología:** Express, Zod, Prisma, PostgreSQL.
- **Archivos implementados:** `lib/api/orders.ts`, `backend/src/routes/orders.ts`, `prisma/schema.prisma`.
- **Prueba asociada:** `apiOrdersConfig.test.ts`, `orders.test.ts`, `CartDrawerHost.test.tsx`.
- **Estado:** Parcial respecto del enunciado absoluto: el camino normal registra primero, pero existe fallback deliberado que abre WhatsApp si el POST falla.

### 3.6 Pedidos

- **Tarea:** Persistir pedidos y sus ítems con snapshot de precio y estado pendiente.
- **Objetivo:** soportar HU05 sin pago automático y conservar evidencia de la solicitud.
- **Especificación de origen:** RF28; HU05; RB22; CA11; CP20.
- **Tecnología:** Express, Zod, Prisma, PostgreSQL.
- **Archivos implementados:** `backend/src/routes/orders.ts`, `backend/prisma/schema.prisma`.
- **Prueba asociada:** `backend/tests/orders.test.ts`, `frontend/tests/lib/apiOrdersConfig.test.ts`.
- **Estado:** Completada; commit `e96cd7c`.

### 3.6.1 Historial de pedidos

- **Tarea:** Listar el historial administrativo y actualizar el estado manual del pedido.
- **Objetivo:** soportar HU16 y el seguimiento posterior al envío por WhatsApp.
- **Especificación de origen:** RF48; HU16; RB22; CP16, CP20.
- **Tecnología:** Next.js, React, Express, Prisma, PostgreSQL.
- **Archivos implementados:** `frontend/src/app/admin/pedidos/page.tsx`, `frontend/src/lib/api/admin.ts`, `backend/src/routes/admin.ts`.
- **Prueba asociada:** `backend/tests/admin.test.ts`, `frontend/tests/lib/apiAdmin.test.ts`.
- **Estado:** Completada; commit `de69fd9`.

### 3.7 Favoritos

- **Tarea:** Implementar favoritos únicos, lista y persistencia local/remota.
- **Objetivo:** cubrir HU07, HU12 y la recuperación de HU15.
- **Especificación de origen:** RF34–RF37; HU07, HU12, HU15; RB08, RB17; CA05; CP12, CP22.
- **Tecnología:** React, TypeScript, localStorage, Express, Prisma.
- **Archivos implementados:** `domain/favorites.ts`, `FavoritesContext.tsx`, `app/favoritos/page.tsx`, `lib/api/sync.ts`, `routes/sync.ts`.
- **Prueba asociada:** `favorites.test.ts`, `FavoritesContext.test.tsx`, `apiAuthSync.test.ts`, `sync.test.ts`.
- **Estado:** Completada; commits `defd3f4` y `fc059ef`.

### 3.8 Autenticación Google

- **Tarea:** Implementar sesión opcional Google OAuth y JWT.
- **Objetivo:** identificar al cliente y habilitar guardados sin bloquear el checkout invitado.
- **Especificación de origen:** RF38; HU14; RB20; CA10; CP19.
- **Tecnología:** Google OAuth, JWT, Express, React.
- **Archivos implementados:** `routes/auth.ts`, `lib/jwt.ts`, `lib/usuarios.ts`, `AuthContext.tsx`, `CuentaView.tsx`, `lib/api/auth.ts`.
- **Prueba asociada:** `auth.test.ts`, `auth.redirect.test.ts`, `middleware.test.ts`, `apiAuthSync.test.ts`.
- **Estado:** Parcial: implementación y ramas locales verificadas; falta un E2E real con Google y credenciales externas. Commit base `fc059ef`.

### 3.9 Sincronización de carrito y favoritos

- **Tarea:** Fusionar carrito invitado con carrito guardado y sincronizar favoritos.
- **Objetivo:** recuperar guardados sin duplicados ni cantidades superiores al stock.
- **Especificación de origen:** RF37, RF39–RF41; HU14, HU15; RB08, RB17, RB21; CA10; CP19, CP22.
- **Tecnología:** React, TypeScript, Express, Zod, Prisma.
- **Archivos implementados:** `AuthContext.tsx`, `domain/cart.ts`, `lib/api/sync.ts`, `routes/sync.ts`.
- **Prueba asociada:** `CartContext.test.tsx`, `FavoritesContext.test.tsx`, `apiAuthSync.test.ts`, `sync.test.ts`.
- **Estado:** Completada a nivel unitario/integración; validación Google E2E pendiente.

### 3.10 Panel administrador

- **Tarea:** Implementar autenticación y autorización del panel.
- **Objetivo:** impedir que una sesión cliente acceda a endpoints o vistas administrativas.
- **Especificación de origen:** RF42; HU08; RB23; CA12; CP21.
- **Tecnología:** JWT, Express, React, Zod.
- **Archivos implementados:** `lib/adminAuth.ts`, `middleware/auth.ts`, `routes/auth.ts`, `AdminShell.tsx`, `AuthContext.tsx`.
- **Prueba asociada:** `adminAuth.test.ts`, `middleware.test.ts`, `auth.test.ts`, `AdminShell.test.tsx`, `apiAdmin.test.ts`.
- **Estado:** Parcial por desviación: el as-built usa correo/contraseña configurables y claim `esAdmin`; RB23/CA12 describen allowlist de correos Google.

- **Tarea:** Implementar tablero, productos, pedidos, usuarios y configuración.
- **Objetivo:** cubrir la operación básica definida en RF43–RF48.
- **Especificación de origen:** RF43–RF48; HU08, HU09, HU13, HU16; CP16, CP17.
- **Tecnología:** Next.js, React, TypeScript, Express, Prisma.
- **Archivos implementados:** `frontend/src/app/admin/**`, `frontend/src/features/admin/**`, `backend/src/routes/admin.ts`.
- **Prueba asociada:** `admin.test.ts`, `apiAdmin.test.ts`, `AdminShell.test.tsx`.
- **Estado:** Completada a nivel de código e integración; no existe suite E2E admin dedicada. Commit base `de69fd9`.

### 3.11 Gestión de productos

- **Tarea:** Crear, editar, activar/desactivar, actualizar stock y preventa.
- **Objetivo:** administrar catálogo y conservar historial cuando el producto participa en pedidos.
- **Especificación de origen:** RF43–RF47; HU08, HU09, HU13; RB01–RB03, RB09, RB10, RB13, RB14, RB19; CP16, CP17.
- **Tecnología:** React, Express, Zod, Prisma.
- **Archivos implementados:** `ProductoForm.tsx`, `app/admin/productos/**`, `routes/admin.ts`, `lib/api/admin.ts`.
- **Prueba asociada:** `admin.test.ts`, `apiAdmin.test.ts`, `products.test.ts`.
- **Estado:** Completada; el “estado” se expresa as-built mediante stock, `activo` y `esPreventa`.

### 3.12 Categorías e imágenes

- **Tarea:** Editar categorías, imágenes y contenido del inicio; subir imágenes mediante firma Cloudinary.
- **Objetivo:** permitir mantenimiento visual sin exponer el secreto de Cloudinary.
- **Especificación de origen:** RF10, RF43; HU08; RB13, RB14; CP16.
- **Tecnología:** React, Express, Zod, Cloudinary, Prisma.
- **Archivos implementados:** `app/admin/inicio/page.tsx`, `app/admin/config/page.tsx`, `ImageUploader.tsx`, `ProductoForm.tsx`, `routes/admin.ts`, `lib/cloudinary.ts`.
- **Prueba asociada:** `admin.test.ts`, `lib.test.ts`, `apiAdmin.test.ts`, `apiOrdersConfig.test.ts`.
- **Estado:** Parcial: firma, contrato y fallback están probados; subida externa real no verificada.

### 3.13 Base de datos

- **Tarea:** Implementar el modelo relacional, migraciones, semilla y entorno PostgreSQL.
- **Objetivo:** persistir usuarios, categorías, productos, configuración, carrito, favoritos y pedidos.
- **Especificación de origen:** documento 02; RNF14; ADR-03 y ADR-08.
- **Tecnología:** Prisma, PostgreSQL 16, Docker.
- **Archivos implementados:** `backend/prisma/schema.prisma`, `migrations/20260707061617_init/migration.sql`, `migrations/20260708034342_sprint4_admin_content/migration.sql`, `seed.ts`, `docker-compose.yml`.
- **Prueba asociada:** `products.test.ts`, `orders.test.ts`, `sync.test.ts`, `auth.test.ts`, `admin.test.ts`, `site.test.ts`.
- **Estado:** Completada; migraciones y seed se ejecutaron durante esta auditoría.

### 3.14 Despliegue

- **Tarea:** Preparar frontend para Vercel y backend para Render.
- **Objetivo:** producir builds ejecutables, parametrizar URLs/secretos y restringir CORS.
- **Especificación de origen:** RNF12, RNF14; ADR-02; Sprint 4.
- **Tecnología:** Vercel, Render, Next.js, Node.js, Docker.
- **Archivos implementados:** `README.md`, `.env.example`, `backend/package.json`, `backend/src/index.ts`, `.github/workflows/ci.yml`.
- **Prueba asociada:** `npm run typecheck` y `npm run build` en frontend/backend; `health.test.ts`.
- **Estado:** Parcial: preparación y builds verificados; despliegue vivo no demostrable solo con el repositorio. Commits `de69fd9` y `6ff1982`.

### 3.15 Aseguramiento de calidad

- **Tarea:** Automatizar pruebas, cobertura, typecheck, build y CI.
- **Objetivo:** generar evidencia repetible de funcionamiento y mantenibilidad.
- **Especificación de origen:** RNF01, RNF07, RNF09, RNF10, RNF13, RNF15; documento 10; CP01–CP22.
- **Tecnología:** Vitest, React Testing Library, Supertest, Playwright, TypeScript, GitHub Actions.
- **Archivos implementados:** `frontend/tests/**`, `backend/tests/**`, `frontend/vitest.config.ts`, `backend/vitest.config.ts`, `frontend/playwright.config.ts`, `.github/workflows/ci.yml`.
- **Prueba asociada:** todas las suites descritas en §5.
- **Estado:** Parcial: unitarias/componentes/integración, cobertura, typecheck y builds pasan; la ejecución E2E local auditada no quedó íntegramente verde; Lighthouse, axe y SUS siguen sin evidencia ejecutada.

## 4. Tecnologías verificadas y uso real

| Tecnología | Evidencia y uso as-built |
|---|---|
| Next.js 14.2.5 | App Router, páginas públicas y administrativas y build del frontend (`frontend/package.json`, `frontend/src/app/**`). |
| React 18.3.1 | Componentes, contextos y formularios interactivos del frontend. |
| TypeScript 5.5.4 | Código y typecheck de ambos paquetes. |
| Tailwind CSS 3.4.9 | Tokens y estilos utilitarios (`tailwind.config.ts`, componentes/páginas). |
| Framer Motion 11.3.19 | Animaciones de Home, catálogo, detalle, navegación y transiciones. |
| Express 4.19.2 | API REST versionada y middleware backend. |
| Zod 3.23.8 | Validación de pedidos, login admin, productos, categorías, configuración y sincronización. |
| Prisma 5.x | Cliente, esquema, migraciones, semilla y acceso a PostgreSQL. El lock instalado genera Prisma Client 5.22.0. |
| PostgreSQL 16 | Persistencia relacional local/CI, levantada con `postgres:16-alpine`. |
| Docker | Servicio PostgreSQL reproducible en `docker-compose.yml`. |
| JWT | Tokens de cliente/admin y protección de `/me` y `/admin`. |
| Google OAuth | Login opcional de clientes mediante endpoints Google; no se validó contra un proveedor real en E2E. |
| Cloudinary | Firma backend y subida directa de imágenes desde admin; integración externa condicionada a variables. |
| Vitest | 379 pruebas frontend y 147 backend; cobertura V8. |
| React Testing Library | Pruebas de componentes, contextos y features frontend. |
| Supertest | Pruebas de integración de endpoints Express. |
| Playwright | 22 escenarios definidos, proyectados en desktop y mobile (44 ejecuciones). |
| Vercel | Objetivo de despliegue frontend documentado; no hay evidencia local de una URL viva. |
| Render | Objetivo de despliegue backend y script ejecutable corregido en `6ff1982`; no hay evidencia local de una URL viva. |

## 5. Pruebas, cobertura y verificaciones actuales

Resultados obtenidos durante la actualización as-built:

| Verificación | Cantidad/resultado |
|---|---|
| Frontend unitarias + componentes + features/API | **379/379** pruebas, **33/33** archivos, en verde |
| Backend unitarias + integración API | **147/147** pruebas, **11/11** archivos, en verde tras preparar PostgreSQL; un primer intento tuvo un timeout transitorio y la repetición completa pasó |
| Total Vitest | **526/526** pruebas en verde |
| E2E Playwright | **22 escenarios** × 2 proyectos (desktop/mobile) = **44 ejecuciones**; corrida completa: **4 pasaron, 29 fallaron y 11 se omitieron**, por lo que no se registra como suite aprobada |
| Cobertura frontend global medida | statements **99.28%**, branches **96.43%**, functions **95.62%**, lines **99.28%** |
| Cobertura frontend `src/domain/**` | **100%** en statements, branches, functions y lines |
| Cobertura backend global medida | statements **90.31%**, branches **80.16%**, functions **100%**, lines **90.31%** |
| Typecheck | frontend y backend en verde |
| Build de producción | `next build` y `prisma generate && tsc` en verde |

“Cobertura” no es una sola cifra: **statements** mide sentencias ejecutadas, **branches**
ramas de decisión recorridas, **functions** funciones invocadas y **lines** líneas ejecutadas.
Los porcentajes se refieren al alcance configurado en cada `vitest.config.ts`, no a todos los
archivos del repositorio.

## 6. Inconsistencias y pendientes explícitos

1. **RB23/ADR-05/CA12 frente al as-built:** la especificación exige allowlist de correos Google;
   el sistema implementa login admin independiente por correo/contraseña y autoriza con el claim
   JWT `esAdmin`. El 403 para una sesión cliente sí está probado, pero no la allowlist descrita.
2. **RF28/CA11 frente al fallback:** el flujo normal registra el pedido antes de WhatsApp, pero
   `CartDrawerHost.tsx` abre WhatsApp con mensaje local si el POST falla. La continuidad de compra
   contradice la lectura absoluta de “siempre registrar antes”.
3. **CP19:** no hay E2E real de Google OAuth. Existen pruebas de endpoints, redirecciones,
   middleware, fusión y sincronización con dobles/local, por lo que la validación externa queda
   parcial.
4. **CP16 y CP21:** la automatización real es principalmente componente/cliente API/integración;
   no existe archivo E2E dedicado al panel admin, aunque el documento 08 los clasifica también E2E.
5. **CP22 y RF37:** CP22 describe solo persistencia del carrito invitado, pero la matriz original
   lo usa también para favoritos y carrito autenticado. Esas capacidades sí tienen pruebas
   automatizadas, con otros nombres, pero la cadena CP declarada es imprecisa.
6. **Completitud histórica:** la afirmación “HU sin criterio/prueba: ninguna” no es exacta para CA:
   varias historias (por ejemplo HU02, HU11, HU12, HU15 y HU16) no tienen un CA propio en el
   documento 07, aunque sí poseen pruebas automatizadas relacionadas.
7. **E2E actual:** Playwright detecta 44 ejecuciones; la corrida completa produjo 4 aprobadas, 29
   fallidas y 11 omitidas. Una repetición focalizada del catálogo con API y PostgreSQL disponibles
   produjo 1 aprobada y 7 fallidas: la página quedó sin productos renderizados. No debe confundirse
   “caso definido” con “caso aprobado”.
8. **No funcional/manual:** no se halló evidencia ejecutada de Lighthouse ≥ 90, axe sin errores
   críticos ni encuesta SUS ≥ 80. Permanecen pendientes.
9. **Servicios externos y despliegue:** Google OAuth real, subida Cloudinary real y despliegues
   vivos en Vercel/Render requieren configuración/entornos externos no demostrables desde el repo.

## 7. Evidencia de evolución en Git

| Evidencia | Alcance identificable |
|---|---|
| `d0ba278` | Sprint 0: estructura, dominio inicial, Home, Prisma, seed y pruebas base |
| `69a53f6` | Sprint 1: catálogo, filtros, API, migración y pruebas |
| `defd3f4`, `1f28fef` | carrito, favoritos, navegación móvil y estados de UI |
| `e96cd7c` | Sprint 2: detalle, checkout y pedidos |
| `fc059ef` | Sprint 3: Google OAuth, JWT y sincronización |
| `de69fd9`, `6ff1982` | Sprint 4: admin, Cloudinary, contenido, despliegue y corrección del build Render |
| `4913813` | restauración del redirect de checkout WhatsApp y pruebas |
| `1a5f325` | CI automatizada |
| `7cccc63`, `0f18fdd` | incorporación posterior de OpenSpec y cambio especificado del titular de Home |

---
_Control de cambios: v2.0 — Actualización as-built basada en la implementación, pruebas e historial Git._
