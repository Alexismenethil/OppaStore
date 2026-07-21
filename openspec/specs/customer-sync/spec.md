# customer-sync

## Purpose

Definir la sincronización as-built del carrito y favoritos de clientes autenticados.

## Requirements

### Requirement: RF39–RF41 — Recuperación y fusión del carrito autenticado

Al iniciar una sesión cliente, el frontend SHALL recuperar el carrito remoto, resolver sus productos contra el catálogo y fusionarlo con el carrito invitado sumando por producto sin exceder el stock; luego SHALL reemplazar el carrito remoto con el resultado. (HU14, HU15; RB17, RB21; CA10; CP19, CP22)

#### Scenario: Invitado y servidor contienen el mismo producto
- **WHEN** el cliente inicia sesión
- **THEN** la fusión conserva una línea con la suma limitada al stock
- **AUTOMATED TESTS** `frontend/tests/domain/cart.test.ts`, `frontend/tests/features/CartContext.test.tsx`, `frontend/tests/lib/apiAuthSync.test.ts`, `backend/tests/sync.test.ts`

#### Scenario: Usuario no tiene carrito remoto
- **WHEN** solicita `/api/v1/me/cart`
- **THEN** el servidor responde una lista vacía
- **AUTOMATED TESTS** `backend/tests/sync.test.ts`, `frontend/tests/lib/apiAuthSync.test.ts`

### Requirement: Persistencia remota defensiva del carrito

Las rutas `/me/cart` SHALL exigir JWT, aceptar como máximo 200 líneas enteras positivas, reemplazar el carrito completo, descartar productos inexistentes o inactivos y limitar cantidades al stock actual. (RF39–RF41; HU15; RB01, RB02, RB10, RB17, RB21; CP19)

#### Scenario: Falta o es inválido el JWT
- **WHEN** el cliente accede a una ruta `/me/cart`
- **THEN** el backend responde 401
- **AUTOMATED TESTS** `backend/tests/sync.test.ts`, `backend/tests/middleware.test.ts`

#### Scenario: El payload incluye exceso de stock e inactivos
- **WHEN** el usuario reemplaza su carrito remoto
- **THEN** el backend limita productos activos al stock y descarta productos inactivos o inexistentes
- **AUTOMATED TESTS** `backend/tests/sync.test.ts`

#### Scenario: El payload del carrito es inválido
- **WHEN** faltan `items`, una cantidad no es entera positiva o hay más de 200 líneas
- **THEN** el backend responde 400 y no persiste ese payload
- **AUTOMATED TESTS** `backend/tests/sync.test.ts`

### Requirement: Sincronización remota de favoritos

Las rutas `/me/favorites` SHALL exigir JWT, aceptar como máximo 500 ids, reemplazar la lista completa, eliminar duplicados, descartar ids inexistentes y conservar ids de productos inactivos que todavía existen. (RF37, RF41; HU07, HU15; RB08, RB17; CP12, CP22)

#### Scenario: Payload contiene ids duplicados e inexistentes
- **WHEN** el usuario reemplaza sus favoritos remotos
- **THEN** el backend persiste una sola vez cada producto existente
- **AUTOMATED TESTS** `backend/tests/sync.test.ts`, `frontend/tests/lib/apiAuthSync.test.ts`

#### Scenario: Dos usuarios consultan sus guardados
- **WHEN** cada uno usa su propio JWT
- **THEN** cada usuario recibe únicamente su carrito y favoritos
- **AUTOMATED TESTS** `backend/tests/sync.test.ts`

