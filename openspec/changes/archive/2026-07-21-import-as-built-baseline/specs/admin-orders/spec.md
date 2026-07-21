## ADDED Requirements

### Requirement: RF48 — Historial administrativo de pedidos

El panel SHALL listar todos los pedidos en orden descendente de creación con cliente o marca de invitado, destino, método, total, estado, líneas con snapshots y usuario asociado cuando exista. (HU16; RB22; CP16, CP20)

#### Scenario: Existen pedidos registrados
- **WHEN** un administrador solicita `/api/v1/admin/orders`
- **THEN** recibe el historial completo con ítems y perfil mínimo del usuario asociado
- **AUTOMATED TESTS** `backend/tests/admin.test.ts`, `frontend/tests/lib/apiAdmin.test.ts`

#### Scenario: Historial conserva el detalle snapshot
- **WHEN** el administrador consulta un pedido registrado
- **THEN** la respuesta contiene sus líneas, cantidades, precios snapshot y subtotales
- **AUTOMATED TESTS** `backend/tests/admin.test.ts`

### Requirement: Transición manual de estado del pedido

El administrador SHALL poder cambiar el estado a `pendiente`, `coordinado`, `entregado` o `cancelado`; otros valores SHALL ser rechazados y un id inexistente SHALL responder 404. (RF48; HU16; RB22; CP16)

#### Scenario: Administrador elige un estado soportado
- **WHEN** envía el PATCH de estado para un pedido existente
- **THEN** el backend persiste el nuevo estado y devuelve el pedido actualizado
- **AUTOMATED TESTS** `backend/tests/admin.test.ts`, `frontend/tests/lib/apiAdmin.test.ts`

#### Scenario: Estado o pedido no es válido
- **WHEN** el estado está fuera del enum o el id no existe
- **THEN** el backend responde 400 o 404 respectivamente
- **AUTOMATED TESTS** `backend/tests/admin.test.ts`

### Requirement: Resumen operativo del panel

El panel SHALL mostrar totales de productos, activos, inactivos, agotados, stock bajo activo entre 1 y 5, pedidos, pendientes, usuarios y suma de pedidos no cancelados. (HU09, HU16; RB09, RB22)

#### Scenario: Administrador abre el tablero
- **WHEN** solicita `/api/v1/admin/summary`
- **THEN** recibe métricas coherentes y ventas excluyendo pedidos cancelados
- **AUTOMATED TESTS** `backend/tests/admin.test.ts`
