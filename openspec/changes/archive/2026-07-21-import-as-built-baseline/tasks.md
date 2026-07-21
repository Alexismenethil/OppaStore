## 1. Recolección de evidencia académica e histórica

- [x] 1.1 Leer completamente `especificaciones/00-vision-y-alcance.md` a `especificaciones/05-reglas-de-negocio.md` y registrar alcance, arquitectura, datos, RF, RNF y RB aplicables.
- [x] 1.2 Leer completamente `especificaciones/06-historias-de-usuario.md` a `especificaciones/11-backlog-y-sprints.md` y registrar las relaciones HU, CA, CP y la planificación histórica.
- [x] 1.3 Leer completamente `especificaciones/12-especificacion-as-built-y-tareas.md` y separar comportamientos verificados, desviaciones y pendientes explícitos.
- [x] 1.4 Revisar `git log --oneline --reverse` y asociar únicamente los commits cuyo alcance sea identificable, sin inferir que OpenSpec dirigió los sprints originales.
- [x] 1.5 Revisar `openspec/specs/` y confirmar que `homepage-trends-headline` permanece sin modificación y sin conflicto semántico con la nueva capability `homepage`.

## 2. Contraste con implementación y datos

- [x] 2.1 Revisar completamente `frontend/src/` y registrar por capability páginas, componentes, contextos, dominio y clientes API realmente implementados.
- [x] 2.2 Revisar completamente `backend/src/` y registrar rutas, middleware, autenticación, validaciones, errores y fallbacks realmente implementados.
- [x] 2.3 Contrastar `backend/prisma/schema.prisma` con el DER académico y verificar entidades, relaciones, unicidad, estados y snapshots usados por el código.
- [x] 2.4 Documentar explícitamente las desviaciones as-built: admin por correo/contraseña + JWT `esAdmin`, fallback de checkout, límites de OAuth Google y Cloudinary, y ausencia de pasarela.

## 3. Contraste con pruebas automatizadas

- [x] 3.1 Revisar completamente `frontend/tests/` y mapear pruebas unitarias, de componentes, features, clientes API y Playwright a los escenarios correspondientes.
- [x] 3.2 Revisar completamente `backend/tests/` y mapear pruebas unitarias e integración API a validaciones, errores y persistencia correspondientes.
- [x] 3.3 Verificar que toda ruta citada en una línea `AUTOMATED TESTS` existe y que su prueba ejercita el comportamiento descrito.
- [x] 3.4 Mantener explícita la diferencia entre prueba definida, prueba automatizada en verde y validación externa/E2E no demostrada.

## 4. Creación de capabilities as-built

- [x] 4.1 Crear `homepage` con navegación, hero, categorías, destacados, drop, respaldo y trazas reales.
- [x] 4.2 Crear `catalog` con activos, búsqueda, filtros, presentación, estados y errores/respaldo.
- [x] 4.3 Crear `product-detail` con resolución por slug, 404/inactivos, galería, datos específicos y cantidad.
- [x] 4.4 Crear `cart` con líneas únicas, límites, eliminación, totales, persistencia local y drawer.
- [x] 4.5 Crear `checkout-whatsapp` con validación, mensaje, enlace, registro nominal y fallback as-built.
- [x] 4.6 Crear `orders` con validación autoritativa, stock, snapshots, estado inicial y ausencia de pago automático.
- [x] 4.7 Crear `favorites` con alternancia única, listado y persistencia local/remota.
- [x] 4.8 Crear `customer-auth` con Google OAuth opcional, JWT, sesión cliente y checkout invitado.
- [x] 4.9 Crear `customer-sync` con recuperación, fusión, reemplazo, límites y aislamiento por usuario.
- [x] 4.10 Crear `admin-access` con login independiente, autorización `esAdmin`, respuestas 401/403 y guardia UI.
- [x] 4.11 Crear `admin-products` con alta, edición, validaciones, estado, eliminación, categorías e imágenes.
- [x] 4.12 Crear `admin-orders` con historial, snapshots, estados manuales y resumen operativo.
- [x] 4.13 Crear `site-configuration` con singleton público, categorías ordenadas, edición administrativa y valores de respaldo.

## 5. Validación de trazabilidad y alcance documental

- [x] 5.1 Verificar que todos los requisitos normativos usan SHALL o SHALL NOT y que cada requisito contiene al menos un escenario con WHEN y THEN.
- [x] 5.2 Validar que RF, HU, RB, CA y CP citados existen en `especificaciones/` y son aplicables al comportamiento as-built descrito.
- [x] 5.3 Confirmar que no se importaron funcionalidades futuras, metas no ejecutadas ni decisiones académicas contradichas por la implementación.
- [x] 5.4 Ejecutar `openspec validate import-as-built-baseline` y corregir todos los errores hasta obtener validación exitosa.
- [x] 5.5 Ejecutar `git diff --name-only` y confirmar que ningún archivo bajo `frontend/src/`, `backend/src/`, `frontend/tests/`, `backend/tests/` o `backend/prisma/` fue modificado.
- [x] 5.6 Confirmar que el cambio solo agrega artefactos documentales bajo `openspec/changes/import-as-built-baseline/` y queda listo para una aplicación/archivo posterior, sin implementarlo todavía.
