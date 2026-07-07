# 09 — Matriz de trazabilidad

Trazabilidad **bidireccional** entre requisitos funcionales (RF), historias de usuario (HU),
reglas de negocio (RB), criterios de aceptación (CA) y casos de prueba (CP). Garantiza que
todo requisito tenga historia, criterio y prueba, y que ninguna prueba quede huérfana.

## 1. Matriz principal (por caso de prueba)

Forma clásica de auditoría: una fila por caso de prueba muestra toda la cadena de origen.

| CP | Qué valida | CA | RB | HU | RF | Módulo |
|----|-----------|----|----|----|----|--------|
| CP01 | Catálogo muestra solo activos | — | RB10 | HU02 | RF11 | Catálogo |
| CP02 | Filtro por categoría | — | — | HU02 | RF12 | Catálogo |
| CP03 | Búsqueda por nombre | — | — | HU11 | RF13 | Catálogo |
| CP04 | Agregar producto disponible | — | RB04 | HU03 | RF17, RF20 | Catálogo/Detalle |
| CP05 | Bloqueo de agotado | CA01 | RB02, RB19 | HU03, HU06 | RF14, RF17 | Catálogo/Detalle |
| CP06 | Límite de cantidad = stock | CA02 | RB01, RB07 | HU03, HU04 | RF20, RF26 | Detalle/Carrito |
| CP07 | Total se actualiza | CA06 | RB04, RB05, RB18 | HU04 | RF25 | Carrito |
| CP08 | Eliminar del carrito | — | RB07 | HU04 | RF24 | Carrito |
| CP09 | Genera mensaje WhatsApp | CA03 | RB06, RB16 | HU05 | RF27, RF29 | Carrito |
| CP10 | Preventa con fecha | CA04 | RB03, RB19 | HU06 | RF19, RF31, RF32 | Detalle/Drops |
| CP11 | Pocas unidades (1–5) | CA07 | RB09, RB19 | HU06 | RF14 | Catálogo |
| CP12 | Favoritos sin duplicados | CA05 | RB08 | HU07 | RF35 | Favoritos |
| CP13 | Responsive móvil | — | RB15 | (todas) | RNF01 | Global |
| CP14 | Sin pasarela de pagos | — | RB11 | HU05 | RF29 | Global |
| CP15 | Flujo final WhatsApp | — | RB06, RB12 | HU05 | RF29 | Carrito |
| CP16 | Admin crea/edita/estado | — | RB13, RB14 | HU08, HU09 | RF43, RF44, RF46, RF47 | Admin |
| CP17 | Inactivo oculto en catálogo | CA08 | RB10 | HU13 | RF11, RF45 | Admin/Catálogo |
| CP18 | Detalle skincare/snack | CA09 | RB13, RB14 | HU10 | RF19 | Detalle |
| CP19 | Login Google + fusión carrito | CA10 | RB17, RB20, RB21 | HU14 | RF38, RF40 | Sesión |
| CP20 | Pedido registrado antes de WhatsApp | CA11 | RB22 | HU05 | RF28 | Carrito |
| CP21 | Acceso admin denegado | CA12 | RB23 | HU08 | RF42 | Admin |
| CP22 | Persistencia carrito (invitado) | — | RB17 | HU15 | RF37, RF39 | Carrito/Sesión |

## 2. Cobertura de requisitos funcionales (RF → HU/RB/CP)

| RF | HU | RB | CP |
|----|----|----|----|
| RF01 header/menú | HU01 | — | CP13 (visual) |
| RF02 buscador | HU11 | — | CP03 |
| RF03 favoritos contador | HU07 | RB08 | CP12 |
| RF04 carrito contador | HU03 | RB04 | CP04 |
| RF05 botón WhatsApp header | HU05 | RB06 | CP15 |
| RF06–RF08 hero/categorías/destacados | HU01 | RB10, RB18 | CP01 |
| RF09 sección drops | HU06 | RB03 | CP10 |
| RF10 cómo comprar/footer | HU05 | RB12 | CP15 |
| RF11 listar activos | HU02, HU13 | RB10 | CP01, CP17 |
| RF12 filtro categoría | HU02 | — | CP02 |
| RF13 búsqueda nombre | HU11 | — | CP03 |
| RF14 etiqueta estado | HU06 | RB02, RB09, RB19 | CP05, CP11 |
| RF15 precio soles | HU01 | RB18 | CP07 |
| RF16 imagen | HU01 | — | CP01 |
| RF17 agregar al carrito | HU03 | RB01, RB02 | CP04, CP05 |
| RF18 detalle completo | HU06 | RB18, RB19 | CP10 |
| RF19 info específica por tipo | HU10 | RB03, RB13, RB14 | CP18, CP10 |
| RF20–RF21 agregar/selector cantidad | HU03 | RB01, RB07 | CP06 |
| RF22 listar ítems | HU04 | — | CP04 |
| RF23 aumentar/disminuir | HU04 | RB01, RB05, RB07 | CP06, CP07 |
| RF24 eliminar ítem | HU04 | RB07 | CP08 |
| RF25 subtotal/total | HU04 | RB04, RB05, RB18 | CP07 |
| RF26 validar stock | HU04 | RB01 | CP06 |
| RF27 generar mensaje | HU05 | RB06, RB16 | CP09 |
| RF28 registrar pedido | HU05 | RB22 | CP20 |
| RF29 abrir WhatsApp | HU05 | RB06, RB11, RB12 | CP09, CP14, CP15 |
| RF30–RF33 drops/preventa | HU06 | RB01, RB03 | CP10 |
| RF34–RF36 favoritos | HU07, HU12 | RB08 | CP12 |
| RF37 persistir favoritos | HU15 | RB17 | CP22 |
| RF38 login Google | HU14 | RB20 | CP19 |
| RF39–RF41 carrito guardado/merge/recuperar | HU14, HU15 | RB17, RB21 | CP19, CP22 |
| RF42 acceso admin | HU08 | RB23 | CP21 |
| RF43–RF44 crear/editar | HU08 | RB13, RB14 | CP16 |
| RF45 activar/desactivar | HU13 | RB10 | CP17 |
| RF46–RF47 stock/estado | HU09 | RB02, RB03, RB19 | CP16 |
| RF48 listar/ historial pedidos | HU16 | RB22 | CP16, CP20 |

## 3. Verificación de completitud

- **RF sin prueba:** ninguno (todos los RF01–RF48 mapean a ≥ 1 CP).
- **RB sin prueba:** ninguna (RB01–RB23 aparecen en la columna RB de al menos un CP).
- **HU sin criterio/prueba:** ninguna (HU01–HU16 trazadas).
- **CP huérfano** (sin RF/HU de origen): ninguno.

> Esta matriz alimenta directamente la sección de **Resultados de la Fase de Análisis** y la
> **Validación de Funcionamiento (X4)** del informe final (ver [10-plan-de-pruebas-qa](10-plan-de-pruebas-qa.md)).

---
_Control de cambios: v1.0 (2026-07-07) — versión inicial._
