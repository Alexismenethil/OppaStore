# 07 — Criterios de aceptación (CA)

Redactados en formato **Gherkin** (Dado / Cuando / Entonces). CA01–CA07 provienen del
planteamiento original; CA08–CA12 se añadieron para cubrir admin, info de producto, login
opcional, registro de pedido y control de acceso.

### CA01 — Producto agotado
```gherkin
Dado que un producto tiene stock 0
Cuando el usuario lo visualiza en el catálogo
Entonces debe mostrarse con la etiqueta "Agotado"
  Y el botón "Agregar al carrito" debe estar deshabilitado
```
Trazas: HU03, HU06 · RB02, RB19 · RF14, RF17 · CP05

### CA02 — Límite de cantidad según stock
```gherkin
Dado que un producto tiene 3 unidades disponibles
Cuando el usuario intenta agregar 4 unidades al carrito
Entonces el sistema debe impedirlo
  Y debe mostrar una advertencia clara
```
Trazas: HU03, HU04 · RB01 · RF20, RF26 · CP06

### CA03 — Mensaje de WhatsApp
```gherkin
Dado que el carrito contiene varios productos
Cuando el usuario presiona "Enviar pedido por WhatsApp"
Entonces el sistema debe abrir WhatsApp con un mensaje que incluya
  el nombre de cada producto, cantidades, precios y el total
```
Trazas: HU05 · RB06, RB16 · RF27, RF29 · CP09

### CA04 — Producto en preventa
```gherkin
Dado que un producto está en preventa
Cuando el usuario entra al detalle del producto
Entonces debe visualizar la fecha estimada de llegada
  Y la etiqueta "Preventa"
```
Trazas: HU06 · RB03, RB19 · RF19, RF31, RF32 · CP10

### CA05 — Favoritos sin duplicados
```gherkin
Dado que un usuario agregó un producto a favoritos
Cuando intenta agregar el mismo producto nuevamente
Entonces el sistema no debe duplicarlo
```
Trazas: HU07 · RB08 · RF35 · CP12

### CA06 — Actualización automática del total
```gherkin
Dado que el usuario cambia la cantidad de un producto en el carrito
Cuando aumenta o disminuye la cantidad
Entonces el subtotal y el total deben actualizarse automáticamente
```
Trazas: HU04 · RB04, RB05 · RF25 · CP07

### CA07 — Pocas unidades
```gherkin
Dado que un producto tiene stock entre 1 y 5
Cuando se muestra en el catálogo
Entonces debe aparecer la etiqueta "Pocas unidades"
```
Trazas: HU06 · RB09, RB19 · RF14 · CP11

### CA08 — Producto inactivo oculto
```gherkin
Dado que un administrador desactiva un producto
Cuando un visitante navega por el catálogo público
Entonces ese producto no debe aparecer en la lista
```
Trazas: HU13 · RB10 · RF11, RF45 · CP17

### CA09 — Información de skincare/snacks
```gherkin
Dado un producto de tipo skincare (o snack)
Cuando el usuario entra a su detalle
Entonces debe ver la información específica del tipo
  (skincare: tipo de piel, modo de uso, advertencia, vencimiento;
   snack: vencimiento y alérgenos si corresponde)
```
Trazas: HU10 · RB13, RB14 · RF19 · CP18

### CA10 — Login opcional con fusión de carrito
```gherkin
Dado un invitado con productos en su carrito
Cuando inicia sesión con Google
Entonces su carrito de invitado se fusiona con su carrito guardado
  Y las cantidades no exceden el stock disponible
  Y puede seguir comprando sin que el login sea obligatorio
```
Trazas: HU14 · RB17, RB20, RB21 · RF38, RF40 · CP19

### CA11 — Registro del pedido antes de WhatsApp
```gherkin
Dado un carrito con al menos un ítem y los datos del cliente completos
Cuando el usuario confirma "Enviar pedido por WhatsApp"
Entonces el sistema registra el pedido en la base de datos con estado "pendiente"
  Y luego abre WhatsApp con el mensaje prellenado
```
Trazas: HU05 · RB22 · RF28, RF29 · CP20

### CA12 — Control de acceso admin
```gherkin
Dado un usuario autenticado cuyo correo no está en la allowlist de administradores
Cuando intenta acceder al panel de administración
Entonces el sistema debe denegar el acceso (403)
```
Trazas: HU08 · RB23 · RF42 · CP21

---
_Control de cambios: v1.0 (2026-07-07) — versión inicial._
