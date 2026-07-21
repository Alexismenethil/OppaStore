# orders

## Purpose

Definir la validación y persistencia as-built de pedidos antes de su coordinación por WhatsApp.

## Requirements

### Requirement: RF28 — Validación autoritativa del pedido

El endpoint público de pedidos SHALL aceptar checkout invitado o un `usuarioId` UUID opcional, SHALL exigir al menos una línea con cantidad entera positiva y SHALL volver a obtener desde la base de datos productos activos, precios y stock antes de calcular el pedido. (HU05; RB01, RB07, RB20, RB22; CA11; CP06, CP19, CP20)

#### Scenario: Pedido válido de invitado
- **WHEN** el cliente envía datos válidos y productos activos con stock suficiente sin `usuarioId`
- **THEN** el servidor acepta el pedido y calcula importes desde los datos persistidos
- **AUTOMATED TESTS** `backend/tests/orders.test.ts`, `frontend/tests/lib/apiOrdersConfig.test.ts`

#### Scenario: Producto no existe o está inactivo
- **WHEN** una línea referencia ese producto
- **THEN** el servidor responde 400 indicando que no está disponible y no crea el pedido
- **AUTOMATED TESTS** `backend/tests/orders.test.ts`

#### Scenario: Cantidad supera el stock
- **WHEN** una línea solicita más unidades que las disponibles
- **THEN** el servidor responde 400 con el stock disponible y no crea el pedido
- **AUTOMATED TESTS** `backend/tests/orders.test.ts`

#### Scenario: Cuerpo o destino es inválido
- **WHEN** faltan líneas, el método no es soportado o delivery no tiene destino completo
- **THEN** el servidor responde 400 con detalles de validación
- **AUTOMATED TESTS** `backend/tests/orders.test.ts`

### Requirement: RB22 — Persistencia con snapshot y estado inicial

El servidor SHALL crear cada pedido aceptado con estado `pendiente`, total redondeado, mensaje WhatsApp y líneas que conserven producto, nombre, precio unitario, cantidad y subtotal del momento de compra. (RF28, RF48; HU05, HU16; CA11; CP20)

#### Scenario: Pedido se registra
- **WHEN** todas las validaciones se satisfacen
- **THEN** la base de datos contiene el pedido `pendiente` y sus ítems con snapshots, y la respuesta 201 contiene pedido y mensaje
- **AUTOMATED TESTS** `backend/tests/orders.test.ts`, `backend/tests/admin.test.ts`, `frontend/tests/lib/apiOrdersConfig.test.ts`

### Requirement: Ausencia de pago automático

El backend SHALL terminar el flujo de pedido devolviendo un mensaje de coordinación y no SHALL exponer endpoints de pasarela o pago. (RF29; HU05; RB11, RB12; CP14, CP15)

#### Scenario: Cliente o auditor consulta rutas de pago
- **WHEN** solicita una ruta de pago asociada al API
- **THEN** no existe un endpoint de cobro y la coordinación permanece en WhatsApp
- **AUTOMATED TESTS** `backend/tests/health.test.ts`, `backend/tests/orders.test.ts`

