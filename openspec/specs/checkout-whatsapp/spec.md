# checkout-whatsapp

## Purpose

Definir el checkout as-built que valida al cliente, registra nominalmente el pedido y continúa por WhatsApp.

## Requirements

### Requirement: RF27 — Datos del cliente y método de entrega

El checkout SHALL exigir un nombre de al menos dos caracteres y uno de los métodos `recojo` o `delivery`; para delivery SHALL exigir provincia válida, distrito perteneciente a esa provincia y dirección o agencia de al menos dos caracteres. Para recojo SHALL normalizar el destino como `Recojo en tienda`. (HU05; RB12, RB16; CP09)

#### Scenario: Cliente elige recojo
- **WHEN** proporciona nombre válido y método `recojo`
- **THEN** el checkout acepta los datos sin exigir provincia, distrito o dirección
- **AUTOMATED TESTS** `frontend/tests/domain/checkout.test.ts`, `frontend/tests/components/CheckoutForm.test.tsx`, `backend/tests/orders.test.ts`

#### Scenario: Cliente completa delivery nacional
- **WHEN** selecciona provincia, un distrito perteneciente a ella y dirección válidos
- **THEN** el checkout normaliza y acepta el destino para registrar el pedido
- **AUTOMATED TESTS** `frontend/tests/domain/checkout.test.ts`, `frontend/tests/components/CheckoutForm.test.tsx`, `frontend/tests/components/CartDrawerHost.test.tsx`, `frontend/tests/e2e/carrito.spec.ts`, `backend/tests/orders.test.ts`

#### Scenario: Faltan datos requeridos
- **WHEN** el cliente intenta continuar con nombre, método o destino inválidos
- **THEN** el checkout muestra errores por campo y no llama al endpoint de pedidos
- **AUTOMATED TESTS** `frontend/tests/domain/checkout.test.ts`, `frontend/tests/components/CheckoutForm.test.tsx`, `frontend/tests/components/CartDrawerHost.test.tsx`, `frontend/tests/e2e/carrito.spec.ts`

### Requirement: RF27, RF29 — Mensaje y enlace WhatsApp

El sistema SHALL construir un mensaje con todos los productos, cantidades, precios unitarios, total, nombre y método; SHALL incluir provincia, distrito y dirección solo para delivery; y SHALL abrir un enlace `https://wa.me/<numero>?text=<mensaje codificado>` con el número normalizado a dígitos. No SHALL integrar una pasarela de pago. (HU05; RB06, RB11, RB12, RB16, RB18; CA03; CP09, CP14, CP15)

#### Scenario: Carrito contiene varios productos
- **WHEN** el cliente confirma datos válidos
- **THEN** el mensaje incluye todas las líneas, el total en soles y los datos aplicables de entrega
- **AUTOMATED TESTS** `frontend/tests/domain/whatsapp.test.ts`, `frontend/tests/components/CartDrawerHost.test.tsx`, `backend/tests/orders.test.ts`

#### Scenario: El navegador bloquea o cierra la pestaña reservada
- **WHEN** el checkout intenta abrir el enlace final
- **THEN** redirige la pestaña actual al mismo enlace de WhatsApp
- **AUTOMATED TESTS** `frontend/tests/components/CartDrawerHost.test.tsx`

#### Scenario: No existe un número configurado
- **WHEN** el cliente intenta enviar el pedido
- **THEN** el frontend avisa que WhatsApp no está configurado y no registra el pedido
- **AUTOMATED TESTS** `frontend/tests/components/CartDrawerHost.test.tsx`

### Requirement: RF28 — Registro nominal con fallback as-built

En el camino nominal, el frontend SHALL registrar el pedido y usar el mensaje autoritativo devuelto por el servidor antes de abrir WhatsApp. Si el registro falla, el frontend SHALL abrir WhatsApp con el mensaje generado localmente y SHALL informar que el pedido no se guardó. (HU05; RB22; CA11 con desviación as-built; CP20)

#### Scenario: El registro responde correctamente
- **WHEN** `POST /api/v1/orders` devuelve 201
- **THEN** el frontend abre WhatsApp con el mensaje del servidor
- **AUTOMATED TESTS** `frontend/tests/components/CartDrawerHost.test.tsx`, `frontend/tests/lib/apiOrdersConfig.test.ts`, `backend/tests/orders.test.ts`

#### Scenario: El registro falla
- **WHEN** el POST rechaza el pedido o no está disponible
- **THEN** el frontend abre WhatsApp con el mensaje local y muestra una advertencia de que el pedido no fue registrado
- **AUTOMATED TESTS** `frontend/tests/components/CartDrawerHost.test.tsx`

