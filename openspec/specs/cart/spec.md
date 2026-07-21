# cart

## Purpose

Definir el comportamiento as-built del carrito local y su interfaz de edición.

## Requirements

### Requirement: RF22–RF24 — Gestión de líneas del carrito

El carrito SHALL mantener una sola línea por producto, sumar cantidades al volver a agregar, permitir aumentar, disminuir y eliminar, y restringir cada cantidad al rango `1..stock`. (HU03, HU04; RB01, RB02, RB05, RB07; CP04, CP06, CP08)

#### Scenario: Comprador agrega dos veces el mismo producto
- **WHEN** ambas adiciones caben en el stock
- **THEN** el carrito conserva una línea y suma sus cantidades
- **AUTOMATED TESTS** `frontend/tests/domain/cart.test.ts`, `frontend/tests/features/CartContext.test.tsx`

#### Scenario: Comprador llega a un límite de cantidad
- **WHEN** la cantidad es uno o alcanza el stock
- **THEN** el control correspondiente para disminuir o aumentar queda deshabilitado
- **AUTOMATED TESTS** `frontend/tests/components/CartDrawer.test.tsx`, `frontend/tests/components/CartDrawerHost.test.tsx`, `frontend/tests/e2e/carrito.spec.ts`

#### Scenario: Comprador elimina una línea
- **WHEN** pulsa eliminar en un ítem
- **THEN** el ítem desaparece y el estado vacío se muestra si no quedan líneas
- **AUTOMATED TESTS** `frontend/tests/domain/cart.test.ts`, `frontend/tests/components/CartDrawer.test.tsx`, `frontend/tests/components/CartDrawerHost.test.tsx`, `frontend/tests/e2e/carrito.spec.ts`

### Requirement: RF25–RF26 — Subtotales, total y validación inmediata

El carrito SHALL calcular cada subtotal como precio por cantidad, SHALL recalcular el total después de cada cambio y SHALL presentar montos redondeados a dos decimales con prefijo `S/`. (HU04; RB04, RB05, RB18; CA06; CP07)

#### Scenario: Cambia la cantidad de una línea
- **WHEN** el comprador aumenta o disminuye una cantidad válida
- **THEN** el subtotal, el total y el contador se actualizan inmediatamente
- **AUTOMATED TESTS** `frontend/tests/domain/cart.test.ts`, `frontend/tests/domain/money.test.ts`, `frontend/tests/components/CartDrawer.test.tsx`, `frontend/tests/e2e/carrito.spec.ts`

### Requirement: RB17 — Persistencia local y drawer accesible

El carrito invitado SHALL persistir en `localStorage`, SHALL recuperarse tras recarga o navegación y SHALL degradar a un carrito vacío si el dato almacenado es ilegible; el drawer SHALL poder abrirse, cerrarse con botón o Escape y bloquear el scroll de fondo mientras esté abierto. (RF04, RF22, RF37; HU03, HU15; RNF07, RNF09; CP22)

#### Scenario: Invitado recarga la página
- **WHEN** existe un carrito válido en `oppastore.carrito.v1`
- **THEN** el carrito se rehidrata con sus líneas y cantidades
- **AUTOMATED TESTS** `frontend/tests/features/CartContext.test.tsx`, `frontend/tests/lib/storage.test.ts`, `frontend/tests/e2e/carrito.spec.ts`

#### Scenario: El almacenamiento contiene JSON corrupto
- **WHEN** el proveedor del carrito intenta leerlo
- **THEN** la UI continúa con carrito vacío y registra una advertencia sin lanzar una excepción
- **AUTOMATED TESTS** `frontend/tests/features/CartContext.test.tsx`, `frontend/tests/lib/storage.test.ts`

#### Scenario: Usuario cierra el drawer
- **WHEN** pulsa cerrar o presiona Escape
- **THEN** el diálogo desaparece y el scroll del documento se restaura
- **AUTOMATED TESTS** `frontend/tests/components/CartDrawer.test.tsx`

