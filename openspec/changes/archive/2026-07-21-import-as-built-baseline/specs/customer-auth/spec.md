## ADDED Requirements

### Requirement: RF38 — Login Google opcional para clientes

El sistema SHALL permitir iniciar sesión de cliente mediante Google OAuth cuando las credenciales estén configuradas y SHALL mantener el checkout de invitado disponible sin sesión. El login Google SHALL crear o actualizar un usuario cliente con `esAdmin = false` y emitir un JWT de 30 días. (HU14; RB20; CA10; CP19)

#### Scenario: Cliente inicia OAuth configurado
- **WHEN** solicita `/api/v1/auth/google` con un destino interno
- **THEN** el backend redirige al consentimiento Google con scope `openid email profile` y conserva el destino seguro en `state`
- **AUTOMATED TESTS** `backend/tests/auth.test.ts`, `backend/tests/auth.redirect.test.ts`, `frontend/tests/lib/apiAuthSync.test.ts`

#### Scenario: OAuth no está configurado
- **WHEN** el cliente solicita el inicio o callback sin credenciales del proveedor
- **THEN** el backend responde 501 con un error explícito
- **AUTOMATED TESTS** `backend/tests/auth.test.ts`

#### Scenario: Callback no recibe código
- **WHEN** Google vuelve al callback sin el parámetro `code`
- **THEN** el backend redirige al destino seguro con `error=sin_codigo`
- **AUTOMATED TESTS** `backend/tests/auth.test.ts`, `backend/tests/auth.redirect.test.ts`

#### Scenario: Invitado compra sin iniciar sesión
- **WHEN** completa el checkout sin usuario autenticado
- **THEN** el frontend envía el pedido sin `usuarioId` y el backend lo acepta
- **AUTOMATED TESTS** `backend/tests/orders.test.ts`, `frontend/tests/lib/apiOrdersConfig.test.ts`, `frontend/tests/components/CartDrawerHost.test.tsx`

### Requirement: Sesión cliente local y perfil autenticado

El frontend SHALL guardar el JWT, recuperar `/auth/me` al montar, eliminar una sesión inválida y separar visualmente las sesiones cliente de las administrativas. (RF38; HU14, HU15; RB17, RB20; CP19)

#### Scenario: Existe un token válido almacenado
- **WHEN** se monta el proveedor de autenticación
- **THEN** recupera el perfil y expone al usuario autenticado
- **AUTOMATED TESTS** `frontend/tests/lib/apiAuthSync.test.ts`, `backend/tests/auth.test.ts`, `backend/tests/middleware.test.ts`

#### Scenario: Token almacenado es inválido
- **WHEN** `/auth/me` responde que la sesión no es válida
- **THEN** el cliente API informa explícitamente `Sesión inválida` para que el proveedor descarte la sesión
- **AUTOMATED TESTS** `frontend/tests/lib/apiAuthSync.test.ts`
