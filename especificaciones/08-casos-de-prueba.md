# 08 — Casos de prueba (CP)

Cada caso indica precondición, pasos, resultado esperado, tipo y nivel de automatización.
CP01–CP15 provienen del planteamiento original; CP16–CP22 se añadieron para cubrir admin,
info de producto, login opcional, registro de pedido, control de acceso y persistencia.

**Tipos:** U = unitaria (Vitest) · C = componente (Testing Library) · E = E2E (Playwright) · M = manual.

---

### CP01 — Catálogo muestra solo productos activos
- **Precondición:** existen productos activos e inactivos en la data.
- **Pasos:** abrir `/catalogo`.
- **Esperado:** solo se listan productos con `activo = true`.
- **Tipo:** C, E · **Traza:** RF11 · RB10 · HU02

### CP02 — Filtro por categoría
- **Pasos:** en `/catalogo`, seleccionar la categoría "Skincare".
- **Esperado:** solo se muestran productos de esa categoría.
- **Tipo:** C, E · **Traza:** RF12 · HU02

### CP03 — Búsqueda por nombre
- **Pasos:** escribir "panda" en el buscador.
- **Esperado:** se muestran productos cuyo nombre contiene "panda" (sin distinción de mayúsculas).
- **Tipo:** U, C · **Traza:** RF13 · HU11

### CP04 — Agregar producto disponible al carrito
- **Precondición:** producto con stock > 0.
- **Pasos:** pulsar "Agregar al carrito".
- **Esperado:** el ítem entra al carrito; el contador aumenta en 1.
- **Tipo:** C, E · **Traza:** RF17, RF20 · RB04 · HU03

### CP05 — Bloqueo de producto agotado
- **Precondición:** producto con stock 0.
- **Pasos:** visualizar el producto en el catálogo.
- **Esperado:** etiqueta "Agotado"; botón de agregar deshabilitado.
- **Tipo:** U, C · **Traza:** RF14, RF17 · RB02, RB19 · CA01

### CP06 — Límite de cantidad según stock
- **Precondición:** producto con 3 unidades.
- **Pasos:** intentar fijar cantidad 4 (en detalle o carrito).
- **Esperado:** se impide; se muestra advertencia; la cantidad queda en 3.
- **Tipo:** U, C · **Traza:** RF20, RF26 · RB01, RB07 · CA02

### CP07 — Actualización del total del carrito
- **Precondición:** carrito con ítems.
- **Pasos:** aumentar y luego disminuir la cantidad de un ítem.
- **Esperado:** subtotal y total se recalculan al instante, en formato `S/ X.XX`.
- **Tipo:** U, C · **Traza:** RF25 · RB04, RB05, RB18 · CA06

### CP08 — Eliminación de producto del carrito
- **Pasos:** pulsar "Eliminar" en un ítem.
- **Esperado:** el ítem desaparece; el total se recalcula; el contador baja.
- **Tipo:** C, E · **Traza:** RF24 · RB07 · HU04

### CP09 — Generación del mensaje de WhatsApp
- **Precondición:** carrito con 2+ productos; datos de cliente completos.
- **Pasos:** pulsar "Enviar pedido por WhatsApp".
- **Esperado:** el texto generado incluye cada producto, cantidad, precio, total, y los campos Nombre, Distrito/Zona y Método de entrega; se abre `wa.me` con ese texto codificado.
- **Tipo:** U (generador), E (apertura) · **Traza:** RF27, RF29 · RB06, RB16 · CA03

### CP10 — Producto en preventa con fecha estimada
- **Precondición:** producto con `es_preventa = true` y `fecha_estimada_llegada`.
- **Pasos:** entrar al detalle.
- **Esperado:** etiqueta "Preventa" y fecha estimada visibles.
- **Tipo:** C · **Traza:** RF19, RF31, RF32 · RB03, RB19 · CA04

### CP11 — Producto con pocas unidades
- **Precondición:** producto con stock entre 1 y 5.
- **Pasos:** visualizar en el catálogo.
- **Esperado:** etiqueta "Pocas unidades".
- **Tipo:** U, C · **Traza:** RF14 · RB09, RB19 · CA07

### CP12 — Favoritos sin duplicados
- **Pasos:** marcar un producto como favorito dos veces.
- **Esperado:** aparece una sola vez en la lista de favoritos.
- **Tipo:** U, C · **Traza:** RF35 · RB08 · CA05

### CP13 — Diseño responsive en móvil
- **Pasos:** cargar Home, catálogo y carrito en viewport 375×812.
- **Esperado:** layout adaptado, sin desbordes, navegación y carrito usables.
- **Tipo:** E (Playwright móvil) · **Traza:** RNF01 · RB15

### CP14 — No existe pasarela de pagos
- **Pasos:** revisar el flujo de checkout y dependencias.
- **Esperado:** no hay integración de pago (Stripe/Mercado Pago/Culqi); el checkout termina en WhatsApp.
- **Tipo:** M + revisión de dependencias · **Traza:** RF29 · RB11

### CP15 — El flujo final es WhatsApp
- **Pasos:** completar un pedido de principio a fin.
- **Esperado:** el paso final abre WhatsApp con el pedido; el pago se coordina fuera del sistema.
- **Tipo:** E · **Traza:** RF29 · RB06, RB12

### CP16 — Admin crea/edita/cambia estado
- **Precondición:** sesión con correo en la allowlist.
- **Pasos:** crear un producto, editarlo y cambiar su estado/stock.
- **Esperado:** los cambios se guardan y se reflejan en el catálogo (si activo).
- **Tipo:** C, E, integración API · **Traza:** RF43, RF44, RF46, RF47 · HU08, HU09

### CP17 — Producto inactivo no aparece en el catálogo
- **Pasos:** desactivar un producto y recargar `/catalogo`.
- **Esperado:** el producto no aparece en el catálogo público; sigue existiendo en admin.
- **Tipo:** C, E · **Traza:** RF11, RF45 · RB10 · CA08

### CP18 — Detalle de skincare/snack
- **Precondición:** producto skincare (y otro snack) con info específica cargada.
- **Pasos:** abrir el detalle de cada uno.
- **Esperado:** skincare muestra tipo de piel/modo de uso/advertencia/vencimiento; snack muestra vencimiento y alérgenos si corresponde.
- **Tipo:** C · **Traza:** RF19 · RB13, RB14 · CA09

### CP19 — Login Google opcional y fusión de carrito
- **Precondición:** invitado con ítems en el carrito.
- **Pasos:** iniciar sesión con Google; observar el carrito.
- **Esperado:** el carrito de invitado se fusiona con el guardado sin exceder stock; comprar sin sesión sigue siendo posible.
- **Tipo:** E, integración API · **Traza:** RF38, RF40 · RB17, RB20, RB21 · CA10

### CP20 — Registro del pedido antes de WhatsApp
- **Precondición:** carrito con ítems y datos completos.
- **Pasos:** confirmar el envío por WhatsApp.
- **Esperado:** se crea un registro en `pedidos` con estado "pendiente" y sus `pedido_items` (con snapshot de precio) antes de abrir `wa.me`.
- **Tipo:** integración API, E · **Traza:** RF28 · RB22 · CA11

### CP21 — Acceso admin denegado sin allowlist
- **Precondición:** usuario autenticado con correo fuera de la allowlist.
- **Pasos:** solicitar un endpoint/ruta de admin.
- **Esperado:** respuesta 403; la UI no muestra el panel.
- **Tipo:** integración API, E · **Traza:** RF42 · RB23 · CA12

### CP22 — Persistencia del carrito tras recarga (invitado)
- **Precondición:** invitado con ítems en el carrito.
- **Pasos:** recargar la página.
- **Esperado:** el carrito conserva sus ítems (localStorage).
- **Tipo:** E · **Traza:** RF37, RF39 · RB17

---

## Resumen de cobertura por tipo

| Tipo | Casos |
|------|-------|
| Unitaria (Vitest) | CP03, CP05, CP06, CP07, CP09, CP11, CP12 |
| Componente (RTL) | CP01–CP12, CP16, CP17, CP18 |
| E2E (Playwright) | CP01, CP02, CP04, CP08, CP09, CP13, CP15, CP16, CP17, CP19, CP20, CP21, CP22 |
| Integración API | CP16, CP19, CP20, CP21 |
| Manual / revisión | CP14 |

---
_Control de cambios: v1.0 (2026-07-07) — versión inicial._
