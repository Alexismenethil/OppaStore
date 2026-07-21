# product-detail

## Purpose

Definir el detalle público as-built de productos y la selección de cantidades.

## Requirements

### Requirement: RF18 — Detalle público por slug

El sistema SHALL resolver por slug únicamente productos activos y SHALL mostrar nombre, descripción, categoría, precio, disponibilidad, imagen principal y galería disponible. (HU03, HU06; RB10, RB18, RB19; CP10, CP18)

#### Scenario: Slug identifica un producto activo
- **WHEN** el visitante abre `/producto/<slug>`
- **THEN** visualiza la ficha completa y enlaces de imágenes válidas del producto
- **AUTOMATED TESTS** `backend/tests/products.test.ts`, `frontend/tests/features/catalogHooks.test.tsx`, `frontend/tests/components/DetalleProducto.test.tsx`

#### Scenario: Slug no existe o corresponde a un inactivo
- **WHEN** el detalle público solicita ese slug
- **THEN** el backend responde 404 y la vista muestra el estado de producto no encontrado
- **AUTOMATED TESTS** `backend/tests/products.test.ts`, `frontend/tests/features/catalogHooks.test.tsx`, `frontend/tests/components/DetalleProducto.test.tsx`

#### Scenario: Falla la API y existe respaldo activo
- **WHEN** la consulta remota del detalle falla
- **THEN** el frontend usa el producto activo del catálogo semilla con el mismo slug
- **AUTOMATED TESTS** `frontend/tests/features/catalogHooks.test.tsx`

### Requirement: RF19 — Información específica disponible

El detalle SHALL mostrar únicamente la información específica presente: tipo de piel, modo de uso, advertencia y vencimiento para skincare; alérgenos y vencimiento para snacks; y llegada estimada para preventas. (HU06, HU10; RB03, RB13, RB14; CA04, CA09; CP10, CP18)

#### Scenario: Producto contiene información específica
- **WHEN** el visitante abre su detalle
- **THEN** visualiza cada campo disponible con su etiqueta y las fechas en formato largo
- **AUTOMATED TESTS** `frontend/tests/components/InfoEspecifica.test.tsx`, `frontend/tests/components/DetalleProducto.test.tsx`, `frontend/tests/domain/dates.test.ts`

#### Scenario: Producto no contiene información específica
- **WHEN** el visitante abre su detalle
- **THEN** la sección de detalles específicos no se renderiza
- **AUTOMATED TESTS** `frontend/tests/components/InfoEspecifica.test.tsx`

### Requirement: RF20–RF21 — Selección de cantidad limitada por stock

El detalle SHALL permitir seleccionar y agregar una cantidad dentro de `1..stock`; SHALL impedir agregar agotados, inactivos o cantidades cuya suma con el carrito exceda el stock. (HU03, HU04; RB01, RB02, RB07; CA01, CA02; CP04, CP05, CP06)

#### Scenario: Comprador selecciona una cantidad válida
- **WHEN** elige una cantidad entre uno y el stock y pulsa agregar
- **THEN** el carrito incorpora esa cantidad y muestra confirmación
- **AUTOMATED TESTS** `frontend/tests/components/DetalleProducto.test.tsx`, `frontend/tests/features/CartContext.test.tsx`

#### Scenario: La suma excedería el stock
- **WHEN** el carrito ya contiene unidades y el comprador intenta superar la disponibilidad desde el detalle
- **THEN** el sistema conserva el carrito y muestra el motivo de validación
- **AUTOMATED TESTS** `frontend/tests/components/DetalleProducto.test.tsx`, `frontend/tests/features/CartContext.test.tsx`, `frontend/tests/domain/cart.test.ts`

