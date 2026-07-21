## Why

OppaStore ya cuenta con documentación académica, implementación, pruebas automatizadas e historial Git, pero OpenSpec solo representa un cambio puntual posterior del titular de Home. Se necesita importar una línea base operativa **as-built**, reconstruida retrospectivamente desde esa evidencia, sin afirmar que OpenSpec se utilizó originalmente para construir todos los módulos.

`especificaciones/` continuará siendo el paquete académico e histórico del proyecto. `openspec/specs/` será la representación operativa del comportamiento actual verificado y OpenSpec se utilizará hacia adelante para especificar cambios incrementales sobre esta línea base.

## What Changes

- Incorporar trece capacidades as-built que describen únicamente comportamientos implementados y verificables.
- Conservar referencias RF, HU, RB, CA y CP cuando la documentación académica define una traza aplicable, señalando en el diseño las desviaciones observadas entre lo planificado y lo construido.
- Relacionar cada escenario con archivos de pruebas automatizadas reales, sin equiparar la existencia de una prueba con una validación externa o E2E exitosa cuando esa evidencia no existe.
- Documentar explícitamente decisiones as-built relevantes: acceso admin independiente por correo/contraseña y JWT `esAdmin`; checkout invitado con fallback a WhatsApp; OAuth Google y Cloudinary probados localmente con límites de verificación externa.
- No modificar código de producción ni pruebas como parte de esta importación documental.

## Capabilities

### New Capabilities

- `homepage`: portada pública, navegación, categorías, destacados, drop, proceso de compra y datos configurables visibles.
- `catalog`: listado público de activos, búsqueda, filtro, estados, precios y acciones de producto.
- `product-detail`: consulta por slug, galería, datos del producto, información específica y selección de cantidad.
- `cart`: operaciones, límites de stock, totales, drawer y persistencia local del carrito invitado.
- `checkout-whatsapp`: validación de cliente y destino, registro nominal del pedido, mensaje y apertura de WhatsApp con fallback implementado.
- `orders`: persistencia de pedidos e ítems con snapshot, estado inicial e historial/cambio de estado administrativo.
- `favorites`: alternancia sin duplicados, listado y persistencia local/remota.
- `customer-auth`: autenticación opcional de clientes con Google OAuth, JWT, recuperación de sesión y checkout sin login obligatorio.
- `customer-sync`: recuperación, fusión y reemplazo remoto de carrito y favoritos autenticados con revalidación de stock.
- `admin-access`: login administrativo independiente, JWT con claim `esAdmin`, guardia de UI y respuestas 401/403.
- `admin-products`: administración de productos, categorías, imágenes, estados derivados y borrado físico o lógico según historial.
- `admin-orders`: tablero, historial de pedidos, detalle y transición manual entre estados soportados.
- `site-configuration`: configuración pública y administrativa de hero, drop, contacto, redes y presentación de categorías.

### Modified Capabilities

- Ninguna. La capacidad existente `homepage-trends-headline` conserva su requisito puntual; la nueva capacidad `homepage` incorpora el resto de la línea base as-built sin cambiar ese comportamiento.

## Impact

- Se crearán artefactos únicamente bajo `openspec/changes/import-as-built-baseline/`; al aplicar/archivar la importación, las capacidades pasarán a `openspec/specs/` como línea base operativa.
- Las fuentes de evidencia son `especificaciones/00–12`, `frontend/src/`, `backend/src/`, `frontend/tests/`, `backend/tests/`, `backend/prisma/schema.prisma`, las specs OpenSpec existentes y `git log --oneline --reverse`.
- No hay cambios de API, base de datos, dependencias, código de producción ni pruebas automatizadas.
