# site-configuration

## Purpose

Definir la configuración pública y administrativa as-built del contenido del sitio.

## Requirements

### Requirement: Configuración pública singleton

El sistema SHALL exponer sin autenticación una configuración `default` con imágenes del hero, etiqueta, producto drop, WhatsApp, correo, redes y dirección; si no existe SHALL crearla con campos opcionales nulos. (RF10; HU01, HU05; RB06, RB12; CP15)

#### Scenario: Visitante solicita configuración pública
- **WHEN** hace `GET /api/v1/config`
- **THEN** recibe 200 y todos los campos públicos del singleton sin proporcionar JWT
- **AUTOMATED TESTS** `backend/tests/site.test.ts`, `frontend/tests/lib/apiOrdersConfig.test.ts`

#### Scenario: Singleton no existe
- **WHEN** se solicita la configuración pública
- **THEN** el backend crea `default` y devuelve los campos opcionales vacíos
- **AUTOMATED TESTS** `backend/tests/site.test.ts`

### Requirement: Categorías públicas ordenadas

El sistema SHALL exponer sin autenticación las categorías ordenadas por `orden` y SHALL limitar la respuesta pública a slug, nombre, imagen, overlay y orden. (RF07, RF12; HU01, HU02; CP02)

#### Scenario: Visitante solicita categorías
- **WHEN** hace `GET /api/v1/categories`
- **THEN** recibe categorías ordenadas y solo los campos públicos necesarios
- **AUTOMATED TESTS** `backend/tests/site.test.ts`, `frontend/tests/lib/apiOrdersConfig.test.ts`

### Requirement: Edición administrativa del contenido del sitio

Un administrador SHALL poder actualizar parcialmente la configuración pública, incluyendo limpiar campos con `null`, y SHALL recibir 400 para URLs inválidas. (RF10, RF43; HU08; CP16)

#### Scenario: Administrador actualiza hero o contacto
- **WHEN** envía `PUT /api/v1/admin/config` con campos válidos
- **THEN** el singleton se actualiza y la lectura pública refleja el cambio
- **AUTOMATED TESTS** `backend/tests/admin.test.ts`, `frontend/tests/lib/apiAdmin.test.ts`

#### Scenario: Administrador limpia un campo opcional
- **WHEN** envía el campo como `null`
- **THEN** el backend lo persiste vacío y el frontend público puede usar su valor de respaldo
- **AUTOMATED TESTS** `backend/tests/admin.test.ts`, `frontend/tests/features/ConfigContext.test.tsx`

#### Scenario: Configuración remota falla o trae campos vacíos
- **WHEN** el proveedor público no puede cargarla o recibe valores nulos
- **THEN** conserva valores locales de respaldo para hero, categorías, dirección y WhatsApp configurado por entorno
- **AUTOMATED TESTS** `frontend/tests/features/ConfigContext.test.tsx`
