## ADDED Requirements

### Requirement: RF43–RF44 — Alta y edición de productos

El panel SHALL permitir crear y editar productos con nombre, descripción, precio positivo, stock entero no negativo, categoría existente, tipo soportado, imágenes URL válidas, banderas y campos específicos opcionales. La creación SHALL generar un slug normalizado único y añadir sufijos en colisiones. (HU08; RB01, RB13, RB14; CP16)

#### Scenario: Administrador crea un producto válido
- **WHEN** envía todos los campos obligatorios y una categoría existente
- **THEN** el backend responde 201 con el producto relacionado y un slug único
- **AUTOMATED TESTS** `backend/tests/admin.test.ts`, `backend/tests/lib.test.ts`, `frontend/tests/lib/apiAdmin.test.ts`

#### Scenario: Datos de producto son inválidos
- **WHEN** falta un obligatorio, el precio no es positivo, el stock es negativo, el tipo no existe o una URL es inválida
- **THEN** el backend responde 400 con detalles de validación
- **AUTOMATED TESTS** `backend/tests/admin.test.ts`

#### Scenario: Producto o categoría no existe al editar
- **WHEN** el administrador actualiza un id ausente o usa una categoría desconocida
- **THEN** el backend responde 404 para el producto o 400 para la categoría
- **AUTOMATED TESTS** `backend/tests/admin.test.ts`

### Requirement: RF45–RF47 — Estado, stock y eliminación

El panel SHALL editar stock y banderas `activo`, `destacado` y `esPreventa`; el estado público SHALL continuar derivándose del stock y preventa. Al eliminar, SHALL desactivar el producto si tiene líneas de pedido y SHALL eliminarlo físicamente, junto con referencias de carrito/favoritos, si no tiene historial. (HU09, HU13; RB01, RB02, RB03, RB09, RB10, RB19, RB22; CA08; CP16, CP17)

#### Scenario: Administrador desactiva un producto
- **WHEN** cambia `activo` a falso
- **THEN** el producto permanece en admin y deja de aparecer en catálogo y detalle públicos
- **AUTOMATED TESTS** `backend/tests/admin.test.ts`, `backend/tests/products.test.ts`, `frontend/tests/lib/apiAdmin.test.ts`

#### Scenario: Administrador elimina producto con historial
- **WHEN** existe al menos un `PedidoItem` asociado
- **THEN** el backend realiza borrado lógico y responde `eliminado: logico`
- **AUTOMATED TESTS** `backend/tests/admin.test.ts`

#### Scenario: Administrador elimina producto sin historial
- **WHEN** no existen líneas de pedido asociadas
- **THEN** el backend borra referencias de carrito/favoritos, elimina el producto y responde `eliminado: fisico`
- **AUTOMATED TESTS** `backend/tests/admin.test.ts`

### Requirement: Categorías e imágenes administrativas

El panel SHALL listar y editar nombre, imagen y overlay de categorías; SHALL solicitar una firma de subida Cloudinary solo para administradores y SHALL responder 501 cuando el proveedor no esté configurado, permitiendo a la UI usar una URL manual. (RF43; HU08; CP16)

#### Scenario: Administrador edita una categoría existente
- **WHEN** envía un nombre, imagen u overlay válido
- **THEN** el cambio persistido aparece en la configuración pública de categorías
- **AUTOMATED TESTS** `backend/tests/admin.test.ts`, `frontend/tests/lib/apiAdmin.test.ts`

#### Scenario: Cloudinary está configurado
- **WHEN** un administrador solicita `/admin/uploads/sign`
- **THEN** recibe timestamp, carpeta, cloud name, API key y firma SHA-1 sin el secreto
- **AUTOMATED TESTS** `backend/tests/admin.test.ts`, `backend/tests/lib.test.ts`

#### Scenario: Cloudinary no está configurado
- **WHEN** un administrador solicita una firma
- **THEN** recibe 501 con un error explícito de configuración
- **AUTOMATED TESTS** `backend/tests/admin.test.ts`, `backend/tests/lib.test.ts`
