# 06 — Historias de usuario (HU)

Formato del Anexo 4 de la tesis de referencia (ID, prioridad, descripción "Como… Quiero…
Para…", criterios de aceptación resumidos y estimación en puntos de historia). Los criterios
detallados en Gherkin están en [07-criterios-de-aceptacion](07-criterios-de-aceptacion.md).

## Resumen

| ID | Nombre | Rol | Prioridad | Puntos | RF |
|----|--------|-----|-----------|--------|----|
| HU01 | Ver productos destacados | Visitante | Alta | 3 | RF06–RF08 |
| HU02 | Filtrar por categoría | Visitante | Alta | 5 | RF11, RF12 |
| HU03 | Agregar al carrito | Comprador | Alta | 5 | RF17, RF20 |
| HU04 | Modificar cantidades en el carrito | Comprador | Alta | 5 | RF23–RF26 |
| HU05 | Enviar pedido por WhatsApp | Comprador | Alta | 8 | RF27–RF29 |
| HU06 | Ver estado del producto | Comprador | Alta | 3 | RF14, RF31, RF32 |
| HU07 | Guardar favoritos | Comprador | Media | 3 | RF34, RF35 |
| HU08 | Registrar productos | Administrador | Alta | 8 | RF43 |
| HU09 | Cambiar estado del producto | Administrador | Alta | 5 | RF46, RF47 |
| HU10 | Ver info de skincare/snacks | Comprador | Media | 3 | RF19 |
| HU11 | Buscar por nombre | Visitante | Media | 3 | RF13 |
| HU12 | Ver y quitar favoritos | Comprador | Media | 3 | RF36 |
| HU13 | Desactivar producto (borrado lógico) | Administrador | Media | 3 | RF45 |
| HU14 | Iniciar sesión opcional con Google | Comprador | Media | 5 | RF38, RF40 |
| HU15 | Recuperar carrito/favoritos guardados | Comprador | Baja | 5 | RF39, RF41 |
| HU16 | Ver historial de pedidos | Administrador | Media | 3 | RF48 |

> Total estimado ≈ 74 puntos de historia, distribuidos en 5 sprints ([11-backlog-y-sprints](11-backlog-y-sprints.md)).

---

## Detalle de historias clave

### HU01 — Ver productos destacados
- **ID:** HU01 · **Prioridad:** Alta · **Estimación:** 3 pts
- **Descripción:** Como **visitante**, quiero **ver productos destacados en la página principal**, para **descubrir rápidamente productos de tendencia**.
- **Criterios de aceptación:** la Home muestra hero, categorías y una sección "Los más pedidos" con productos activos; cada tarjeta muestra imagen, nombre, precio (`S/ X.XX`) y etiqueta de estado.
- **RF:** RF06, RF07, RF08 · **RB:** RB10, RB18

### HU03 — Agregar al carrito
- **ID:** HU03 · **Prioridad:** Alta · **Estimación:** 5 pts
- **Descripción:** Como **comprador**, quiero **agregar productos al carrito**, para **preparar mi pedido**.
- **Criterios de aceptación:** al pulsar "Agregar al carrito", el ítem aparece en el carrito y el contador aumenta; no se puede agregar más que el stock (RB01); un producto Agotado no se puede agregar (RB02).
- **RF:** RF17, RF20, RF21 · **RB:** RB01, RB02, RB04 · **CA:** CA01, CA02

### HU04 — Modificar cantidades en el carrito
- **ID:** HU04 · **Prioridad:** Alta · **Estimación:** 5 pts
- **Descripción:** Como **comprador**, quiero **modificar cantidades en el carrito**, para **ajustar mi pedido antes de enviarlo**.
- **Criterios de aceptación:** aumentar/disminuir dentro de `1..stock`; el total se actualiza al instante (RB05); no baja de 1 (RB07); permitir eliminar ítem.
- **RF:** RF23, RF24, RF25, RF26 · **RB:** RB01, RB04, RB05, RB07 · **CA:** CA02, CA06

### HU05 — Enviar pedido por WhatsApp
- **ID:** HU05 · **Prioridad:** Alta · **Estimación:** 8 pts
- **Descripción:** Como **comprador**, quiero **enviar mi carrito por WhatsApp**, para **coordinar la compra directamente con OppaStore**.
- **Criterios de aceptación:** el botón genera un mensaje con productos, cantidades, precios y total, más Nombre, Distrito/Zona y Método de entrega (RB16); se registra el pedido en BD (RB22) y luego se abre `wa.me` con el mensaje prellenado; **no existe pasarela de pago** (RB11).
- **Desglose técnico:**
  - T1 (Dominio) `whatsapp.ts`: construir el texto del mensaje a partir del carrito.
  - T2 (Frontend) Formulario mínimo: Nombre, Distrito/Zona, Método de entrega.
  - T3 (Backend) `POST /api/v1/orders`: validar, persistir `pedido` + `pedido_items`, devolver texto.
  - T4 (Frontend) Abrir `https://wa.me/<numero>?text=<encoded>` en nueva pestaña.
  - T5 (Pruebas) Unit del generador de mensaje + E2E del flujo completo.
- **RF:** RF27, RF28, RF29 · **RB:** RB06, RB11, RB12, RB16, RB22 · **CA:** CA03, CA11

### HU08 — Registrar productos (admin)
- **ID:** HU08 · **Prioridad:** Alta · **Estimación:** 8 pts
- **Descripción:** Como **administrador**, quiero **registrar productos con imagen, precio, categoría y stock**, para **mantener actualizado el catálogo**.
- **Criterios de aceptación:** formulario valida campos obligatorios; para skincare/snacks permite capturar info específica (tipo de piel, modo de uso, advertencia, vencimiento, alérgenos); el producto nuevo aparece en el catálogo si está activo. Acceso restringido a la allowlist (RB23).
- **RF:** RF42, RF43 · **RB:** RB13, RB14, RB23 · **CA:** CA12

### HU14 — Iniciar sesión opcional con Google
- **ID:** HU14 · **Prioridad:** Media · **Estimación:** 5 pts
- **Descripción:** Como **comprador**, quiero **poder iniciar sesión con Google de forma opcional**, para **guardar mi carrito y verlo después**, sin que sea obligatorio para comprar.
- **Criterios de aceptación:** puedo comprar sin iniciar sesión (RB20); si inicio sesión con un carrito de invitado, este se fusiona con mi carrito guardado sin exceder stock (RB21); mis favoritos y carrito quedan guardados (RB17).
- **RF:** RF38, RF39, RF40, RF41 · **RB:** RB17, RB20, RB21 · **CA:** CA10

---

## Detalle de las demás historias (compacto)

- **HU02** — Como visitante, quiero **filtrar productos por categoría**, para encontrar skincare, snacks, peluches o accesorios. → RF11, RF12 · CA: —
- **HU06** — Como comprador, quiero **ver si un producto está disponible, agotado o en preventa**, para saber si puedo comprarlo. → RF14, RF31, RF32 · RB02, RB03, RB09, RB19 · CA01, CA04, CA07
- **HU07** — Como comprador, quiero **guardar productos favoritos**, para revisarlos después, sin duplicarlos. → RF34, RF35 · RB08 · CA05
- **HU09** — Como administrador, quiero **cambiar el estado de un producto**, para controlar si aparece como disponible, agotado o preventa. → RF46, RF47 · RB02, RB03, RB19
- **HU10** — Como comprador, quiero **ver información de skincare o snacks**, para comprar con más confianza. → RF19 · RB13, RB14 · CA09
- **HU11** — Como visitante, quiero **buscar un producto por nombre**, para encontrarlo rápido. → RF13
- **HU12** — Como comprador, quiero **ver y quitar mis favoritos**, para gestionarlos. → RF36
- **HU13** — Como administrador, quiero **desactivar un producto en vez de eliminarlo**, para no perder su historial. → RF45 · RB10 · CA08
- **HU15** — Como comprador con sesión, quiero **recuperar mi carrito y favoritos guardados**, para retomar mi compra. → RF39, RF41 · RB17
- **HU16** — Como administrador, quiero **ver el historial de pedidos**, para dar seguimiento a las ventas. → RF48 · RB22

---
_Control de cambios: v1.0 (2026-07-07) — versión inicial._
