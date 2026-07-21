# admin-access

## Purpose

Definir el acceso y la autorización as-built del panel administrativo de OppaStore.

## Requirements

### Requirement: RF42 as-built — Login administrativo independiente

El panel SHALL autenticar administradores mediante correo y contraseña configurados por variables de entorno, separados del login Google de clientes. En desarrollo, cuando ninguna credencial admin está configurada, SHALL usar las credenciales de desarrollo implementadas; en producción sin configuración SHALL responder 501. (HU08; RB23 y CA12 con desviación as-built; CP21)

#### Scenario: Administrador presenta credenciales válidas
- **WHEN** envía `POST /api/v1/auth/admin/login`
- **THEN** el backend crea o actualiza la identidad administrativa, devuelve un JWT con `esAdmin = true` y su perfil público
- **AUTOMATED TESTS** `backend/tests/auth.test.ts`, `backend/tests/adminAuth.test.ts`, `frontend/tests/lib/apiAuthSync.test.ts`

#### Scenario: Credenciales son inválidas
- **WHEN** el correo o contraseña no coincide
- **THEN** el backend responde 401 sin emitir un token
- **AUTOMATED TESTS** `backend/tests/auth.test.ts`, `backend/tests/adminAuth.test.ts`, `frontend/tests/lib/apiAuthSync.test.ts`

#### Scenario: Login no está configurado en producción
- **WHEN** se solicita login administrativo
- **THEN** el backend responde 501 con un error explícito
- **AUTOMATED TESTS** `backend/tests/auth.test.ts`, `backend/tests/adminAuth.test.ts`

### Requirement: Autorización por JWT `esAdmin`

Todas las rutas `/api/v1/admin/*` SHALL exigir un JWT válido con `esAdmin = true`; SHALL responder 401 si falta o es inválido y 403 si representa a un cliente no administrador. (RF42; HU08; RB23 con materialización distinta; CA12; CP21)

#### Scenario: Solicitud sin sesión o con token inválido
- **WHEN** intenta acceder a una ruta administrativa
- **THEN** el backend responde 401
- **AUTOMATED TESTS** `backend/tests/middleware.test.ts`, `backend/tests/admin.test.ts`

#### Scenario: Cliente autenticado intenta acceder
- **WHEN** usa un JWT válido con `esAdmin = false`
- **THEN** el backend responde 403
- **AUTOMATED TESTS** `backend/tests/middleware.test.ts`, `backend/tests/admin.test.ts`, `frontend/tests/lib/apiAdmin.test.ts`

### Requirement: Guardia del panel administrativo

La UI administrativa SHALL mostrar el formulario de acceso mientras no exista una sesión admin, SHALL renderizar el shell y navegación solo para `usuario.esAdmin`, y SHALL permitir cerrar sesión. (RF42; HU08; CP21)

#### Scenario: Sesión no es administrativa
- **WHEN** se abre una ruta `/admin`
- **THEN** el shell muestra el acceso independiente y no muestra el contenido protegido
- **AUTOMATED TESTS** `frontend/tests/components/AdminShell.test.tsx`

#### Scenario: Sesión es administrativa
- **WHEN** el proveedor expone un usuario con `esAdmin = true`
- **THEN** el shell muestra navegación y contenido del panel
- **AUTOMATED TESTS** `frontend/tests/components/AdminShell.test.tsx`

