# 05 — Reglas de negocio (RB)

Reglas que gobiernan el comportamiento del sistema. Las RB01–RB15 provienen del
planteamiento original; RB16–RB23 se añadieron para cubrir vacíos detectados durante la
especificación (mensaje de WhatsApp completo, persistencia, estado derivado, login
opcional, registro de pedidos y acceso admin).

| ID | Regla | Verificable en |
|----|-------|----------------|
| **RB01** | No se puede agregar al carrito una cantidad mayor al stock disponible. | CP06 |
| **RB02** | Un producto agotado (stock 0) debe mostrarse como "Agotado" y no permitir compra directa. | CP05 |
| **RB03** | Un producto en preventa debe mostrar su fecha estimada de llegada. | CP10 |
| **RB04** | El carrito calcula automáticamente el total según precio y cantidad. | CP07 |
| **RB05** | Al cambiar la cantidad de un producto, el total se actualiza inmediatamente. | CP07 |
| **RB06** | El botón "Enviar pedido por WhatsApp" genera un mensaje con todos los productos del carrito. | CP09 |
| **RB07** | El carrito no permite cantidades menores a 1. | CP06, CP08 |
| **RB08** | Un usuario no puede agregar el mismo producto dos veces a favoritos. | CP12 |
| **RB09** | Un producto con stock **1 ≤ stock ≤ 5** se muestra como "Pocas unidades". | CP11 |
| **RB10** | Los productos inactivos no se muestran en el catálogo público. | CP01, CP17 |
| **RB11** | No debe existir pasarela de pago integrada. | CP14 |
| **RB12** | La confirmación de pago y entrega se realiza manualmente por WhatsApp. | CP15 |
| **RB13** | Los productos de skincare muestran información básica de uso, advertencia o vencimiento si está disponible. | CP18 |
| **RB14** | Los snacks muestran fecha de vencimiento y advertencia de alérgenos si corresponde. | CP18 |
| **RB15** | El sistema debe estar optimizado para uso móvil. | CP13 |
| **RB16** | El mensaje de WhatsApp incluye, además del detalle de productos y total, los campos **Nombre**, **Distrito/Zona** y **Método de entrega** (recojo/delivery). | CP09 |
| **RB17** | El carrito y los favoritos persisten entre recargas: **localStorage** para invitado y **base de datos** para usuario con sesión. | CP19, CP22 |
| **RB18** | Precios y totales se muestran siempre en formato `S/ X.XX` (2 decimales, moneda PEN). | CP07, CP09 |
| **RB19** | El **estado del producto es derivado**: `stock == 0` → Agotado; `1..5` → Pocas unidades; `> 5` → Disponible. "Preventa" y "Activo/Inactivo" son banderas del admin; si el producto está en preventa activa, la etiqueta "Preventa" prevalece. | CP05, CP11 |
| **RB20** | El login es **opcional**: el checkout por WhatsApp funciona sin iniciar sesión (checkout de invitado). | CP19 |
| **RB21** | Al iniciar sesión, el carrito de invitado se **fusiona** con el carrito guardado sumando cantidades sin exceder el stock. | CP19 |
| **RB22** | Cada pedido enviado se **registra** con estado inicial "pendiente"; su coordinación y actualización de estado es manual. | CP20 |
| **RB23** | Solo los correos Google incluidos en la allowlist (`ADMIN_EMAILS`) acceden al panel admin; el resto recibe acceso denegado (403). | CP21 |

## Notas de diseño de reglas

- **Estado derivado (RB19):** evita inconsistencias entre "stock" y "etiqueta". La etiqueta
  nunca se persiste como texto; se calcula con una función pura `estadoProducto(producto)`
  en `frontend/src/domain/productStatus.ts` (misma lógica replicada/validada en backend).
- **Precedencia de etiquetas:** `Inactivo` (no se muestra) > `Preventa` (si `es_preventa`)
  > `Agotado` (stock 0) > `Pocas unidades` (1–5) > `Disponible` (>5).
- **Fusión de carrito (RB21):** `cantidad_final = min(cantidad_invitado + cantidad_guardada, stock)`.
- **Formato de dinero (RB18):** función `formatearSoles(monto)` centralizada; toda la UI la usa.

---
_Control de cambios: v1.0 (2026-07-07) — versión inicial._
