## Context

OppaStore es un monorepo Next.js/React + Express/Prisma/PostgreSQL construido en sprints antes de la adopción general de OpenSpec. La evidencia revisada comprende el paquete académico `especificaciones/00–12`, todo `frontend/src/` y `backend/src/`, las suites `frontend/tests/` y `backend/tests/`, `backend/prisma/schema.prisma`, las specs OpenSpec existentes y el historial Git cronológico.

La importación no es una implementación ni una reescritura histórica. `especificaciones/` conserva la intención académica, incluyendo metas y decisiones que no siempre coinciden con el sistema final. La nueva línea base en `openspec/specs/` describirá el comportamiento operativo que puede demostrarse en código y pruebas; el vínculo histórico entre ambos paquetes se conserva mediante identificadores RF, HU, RB, CA y CP.

## Goals / Non-Goals

**Goals:**

- Crear una especificación operativa separada para cada una de las trece capacidades solicitadas.
- Expresar requisitos normativos con SHALL y escenarios observables con WHEN/THEN.
- Conservar identificadores académicos solo cuando existe una relación sustentada.
- Citar pruebas automatizadas reales en los escenarios y distinguir sus niveles de evidencia.
- Registrar con fidelidad las desviaciones as-built y habilitar cambios incrementales futuros mediante OpenSpec.

**Non-Goals:**

- No afirmar que OpenSpec dirigió la construcción original del MVP.
- No modificar producción, pruebas, esquema Prisma, migraciones ni dependencias.
- No importar metas no demostradas como Lighthouse, axe, SUS, despliegues vivos o integraciones externas reales.
- No corregir las desviaciones detectadas ni declarar exitosa la suite E2E auditada.
- No sustituir ni borrar el paquete académico `especificaciones/`.

## Decisions

### 1. Modelar capacidades por responsabilidad observable

Las specs se dividen por superficies funcionales (`catalog`, `cart`, `orders`, etc.) y no por sprint o capa técnica. Esto permite que futuros cambios incrementales afecten una capacidad estable sin replicar la estructura histórica del backlog.

**Alternativa considerada:** una única spec monolítica del MVP. Se descarta porque diluye la propiedad de requisitos, complica deltas futuros y contradice las trece capacidades solicitadas.

### 2. Tratar la evidencia as-built como autoridad del comportamiento actual

Cuando documentación, código y pruebas divergen, el requisito describe el código ejecutable respaldado por pruebas. Los identificadores académicos se conservan como traza, pero no fuerzan comportamientos ausentes. Por ello, `admin-access` documenta login independiente con correo/contraseña y claim JWT `esAdmin`, no la allowlist Google prevista en RB23/CA12.

**Alternativa considerada:** copiar literalmente RF01–RF48. Se descarta porque importaría planes, niveles de prueba y decisiones que no representan el sistema final.

### 3. Mantener explícitos los límites de evidencia

La referencia `AUTOMATED TESTS` indica archivos reales que ejercitan el escenario. No implica que exista una prueba externa contra Google/Cloudinary ni que Playwright esté globalmente en verde. Los escenarios OAuth se limitan a redirecciones, intercambio simulado, ramas de error y persistencia local/integración que sí están automatizados.

**Alternativa considerada:** omitir pruebas con fallos auditados. Se descarta porque perdería trazabilidad; se citan como definición existente sin elevarlas a evidencia exitosa cuando corresponda.

### 4. Especificar el fallback de checkout como comportamiento intencional existente

El camino nominal registra el pedido antes de abrir WhatsApp, pero el frontend SHALL generar y abrir un mensaje local si el POST falla. Esta decisión refleja `CartDrawerHost.tsx` y su prueba, aunque matiza RF28/CA11.

**Alternativa considerada:** mantener el requisito absoluto “registrar siempre antes”. Se descarta porque sería falso para el as-built.

### 5. Preservar la spec puntual de titular existente

`homepage-trends-headline` permanece sin modificación. La nueva capability `homepage` describe la portada completa y referencia el titular actual sin reemplazar la spec archivada que originó ese cambio.

### 6. Importación documental mediante archivado OpenSpec

Los archivos bajo `changes/import-as-built-baseline/specs/<capability>/spec.md` usan `ADDED Requirements`. Al aplicar y archivar el cambio, OpenSpec incorporará esas specs a `openspec/specs/`. No existe migración de datos o despliegue de aplicación.

## Risks / Trade-offs

- **Riesgo: la traza académica puede interpretarse como prueba de conformidad total.** → Cada requisito cita solo IDs aplicables y cada escenario apunta a pruebas reales; las desviaciones se explicitan aquí y en las specs pertinentes.
- **Riesgo: pruebas E2E definidas pero fallidas se confundan con evidencia aprobada.** → Las referencias identifican cobertura existente; proposal/design conservan el resultado auditado y no declaran la suite E2E en verde.
- **Riesgo: la línea base quede obsoleta al cambiar el código.** → Tras el archivado, todo cambio funcional deberá entrar como delta OpenSpec incremental.
- **Riesgo: solapamiento entre `homepage` y `homepage-trends-headline`.** → La primera cubre la superficie integral; la segunda conserva únicamente el contrato textual ya existente.
- **Trade-off: requisitos más granulares aumentan el volumen documental.** → Se acepta para mantener trazabilidad verificable y facilitar deltas futuros por capacidad.

## Migration Plan

1. Validar proposal, design, trece delta specs y tasks con `openspec validate`.
2. Revisar que únicamente existan cambios bajo `openspec/changes/import-as-built-baseline/`.
3. Aplicar/archivar posteriormente el cambio para materializar las capacidades en `openspec/specs/`; esta propuesta no ejecuta ese paso.
4. Ante un problema de validación o trazabilidad, revertir únicamente el directorio documental del cambio; no hay rollback de aplicación o datos.

## Open Questions

- Ninguna para la importación. Las mejoras futuras —alinear RB23 con el admin real, decidir la política de fallback del pedido, estabilizar E2E y validar proveedores externos— deberán proponerse como cambios incrementales separados.
