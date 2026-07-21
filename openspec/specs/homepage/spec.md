# homepage

## Purpose

Definir la portada pública as-built de OppaStore y sus accesos a descubrimiento y compra.

## Requirements

### Requirement: RF01–RF05 — Navegación pública y accesos globales

La aplicación SHALL mostrar fuera del panel administrativo la marca OppaStore, navegación pública, acceso a cuenta, favoritos y carrito; los contadores SHALL reflejar favoritos únicos y unidades totales del carrito. (HU01, HU03, HU05; RB04, RB08; CP04, CP12, CP13)

#### Scenario: Visitante usa la navegación principal
- **WHEN** un visitante abre una ruta pública
- **THEN** visualiza la marca y enlaces a Inicio, Catálogo, Favoritos y Mi cuenta, y la ruta actual queda identificada
- **AUTOMATED TESTS** `frontend/tests/components/Header.test.tsx`, `frontend/tests/components/MobileTabBar.test.tsx`

#### Scenario: Los contadores reflejan el estado global
- **WHEN** el visitante agrega unidades al carrito o marca favoritos
- **THEN** la navegación muestra el total de unidades del carrito y el número de favoritos únicos
- **AUTOMATED TESTS** `frontend/tests/components/Header.test.tsx`, `frontend/tests/components/MobileTabBar.test.tsx`

### Requirement: RF06–RF10 — Contenido de la portada

La página principal SHALL mostrar hero con llamados al catálogo y al carrito de compra por WhatsApp, categorías navegables, un drop cuando exista uno con fecha, productos destacados, tres pasos de compra y contenido de confianza/footer. (HU01, HU05, HU06; RB03, RB10, RB12, RB18; CP01, CP10, CP15)

#### Scenario: Visitante abre la portada
- **WHEN** un visitante abre `/`
- **THEN** visualiza el titular vigente, llamados a ver productos y comprar por WhatsApp, categorías y la sección "Los más pedidos"
- **AUTOMATED TESTS** `frontend/tests/e2e/home.spec.ts`, `frontend/tests/components/Header.test.tsx`, `frontend/tests/components/Footer.test.tsx`

#### Scenario: Catálogo recibe la categoría navegable
- **WHEN** el visitante llega a `/catalogo` con el slug de categoría en la consulta
- **THEN** la vista inicializa el filtro y muestra únicamente los productos de esa categoría
- **AUTOMATED TESTS** `frontend/tests/features/CatalogoView.test.tsx`

### Requirement: Destacados activos y drop configurado

La portada SHALL obtener hasta cuatro productos destacados activos, priorizados por unidades de pedidos y completados con productos marcados o activos; SHALL mostrar el drop elegido en la configuración o, en su ausencia, el primer drop en preventa. (RF08, RF09, RF48; HU01, HU06; RB03, RB10; CP01, CP10)

#### Scenario: Existen ventas o destacados activos
- **WHEN** la portada solicita los productos más pedidos
- **THEN** muestra productos activos sin duplicados respetando el límite solicitado
- **AUTOMATED TESTS** `backend/tests/products.test.ts`, `backend/tests/admin.test.ts`, `frontend/tests/features/catalogHooks.test.tsx`, `frontend/tests/e2e/home.spec.ts`

#### Scenario: La API pública no está disponible
- **WHEN** falla la carga de catálogo o configuración para la portada
- **THEN** el frontend usa los productos activos y valores visuales de respaldo sin romper la vista
- **AUTOMATED TESTS** `frontend/tests/features/catalogHooks.test.tsx`, `frontend/tests/features/ConfigContext.test.tsx`

