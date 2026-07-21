## ADDED Requirements

### Requirement: RF11 — Catálogo público de productos activos

El sistema SHALL listar en el catálogo público únicamente productos con `activo = true`; un filtro sin coincidencias SHALL producir una lista vacía sin error. (HU02, HU13; RB10; CA08; CP01, CP17)

#### Scenario: Existen productos activos e inactivos
- **WHEN** el visitante solicita `/api/v1/products` o abre `/catalogo`
- **THEN** recibe y visualiza solo productos activos
- **AUTOMATED TESTS** `backend/tests/products.test.ts`, `frontend/tests/features/catalogHooks.test.tsx`, `frontend/tests/features/CatalogoView.test.tsx`, `frontend/tests/e2e/catalogo.spec.ts`

#### Scenario: La API del catálogo falla
- **WHEN** el frontend no puede obtener productos del backend
- **THEN** usa el catálogo semilla filtrado a productos activos y comunica que muestra datos de respaldo
- **AUTOMATED TESTS** `frontend/tests/features/catalogHooks.test.tsx`, `frontend/tests/features/CatalogoView.test.tsx`

### Requirement: RF12–RF13 — Filtro y búsqueda combinables

El catálogo SHALL filtrar por slug de categoría y buscar por coincidencia parcial del nombre sin distinguir mayúsculas; ambos criterios SHALL poder combinarse. (HU02, HU11; CP02, CP03)

#### Scenario: Visitante selecciona una categoría
- **WHEN** selecciona la categoría `skincare`
- **THEN** el catálogo muestra únicamente productos activos pertenecientes a `skincare`
- **AUTOMATED TESTS** `frontend/tests/domain/catalog.test.ts`, `frontend/tests/components/CatalogControls.test.tsx`, `frontend/tests/features/CatalogoView.test.tsx`, `backend/tests/products.test.ts`, `frontend/tests/e2e/catalogo.spec.ts`

#### Scenario: Visitante busca por una subcadena
- **WHEN** escribe una parte del nombre con cualquier combinación de mayúsculas
- **THEN** el catálogo muestra los productos activos cuyo nombre contiene esa subcadena
- **AUTOMATED TESTS** `frontend/tests/domain/catalog.test.ts`, `frontend/tests/features/CatalogoView.test.tsx`, `backend/tests/products.test.ts`, `frontend/tests/e2e/catalogo.spec.ts`

#### Scenario: Visitante limpia los filtros
- **WHEN** limpia categoría y búsqueda
- **THEN** el catálogo vuelve a mostrar todos los productos activos
- **AUTOMATED TESTS** `frontend/tests/components/CatalogControls.test.tsx`, `frontend/tests/features/CatalogoView.test.tsx`

### Requirement: RF14–RF17 — Presentación y compra desde el catálogo

Cada tarjeta SHALL mostrar imagen disponible, nombre, descripción, precio en formato `S/ X.XX` y estado derivado; SHALL permitir agregar solo productos activos con stock positivo. Preventa SHALL prevalecer como etiqueta, sin volver comprable un producto sin stock. (HU03, HU06; RB01, RB02, RB03, RB09, RB18, RB19; CA01, CA07; CP04, CP05, CP11)

#### Scenario: Producto tiene stock entre uno y cinco
- **WHEN** el catálogo renderiza el producto
- **THEN** muestra la etiqueta "Pocas unidades" y el botón de agregar habilitado
- **AUTOMATED TESTS** `frontend/tests/domain/productStatus.test.ts`, `frontend/tests/components/StatusBadge.test.tsx`, `frontend/tests/components/ProductGrid.test.tsx`

#### Scenario: Producto está agotado
- **WHEN** el catálogo renderiza un producto con stock cero
- **THEN** muestra "Agotado" y deshabilita la acción de agregar
- **AUTOMATED TESTS** `frontend/tests/domain/productStatus.test.ts`, `frontend/tests/components/ProductCard.test.tsx`, `frontend/tests/components/ProductGrid.test.tsx`, `frontend/tests/e2e/carrito.spec.ts`

#### Scenario: Producto disponible se agrega
- **WHEN** el visitante pulsa agregar en una tarjeta comprable
- **THEN** el carrito recibe una unidad y la interfaz confirma la operación solo si la validación fue exitosa
- **AUTOMATED TESTS** `frontend/tests/components/ProductCard.test.tsx`, `frontend/tests/components/ProductGrid.test.tsx`, `frontend/tests/features/CartContext.test.tsx`, `frontend/tests/e2e/home.spec.ts`

