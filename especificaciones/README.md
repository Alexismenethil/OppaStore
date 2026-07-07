# Especificaciones — OppaStore

Paquete de **Spec Driven Development (SDD)** del proyecto final del curso
**Pruebas y Aseguramiento de la Calidad de Software**.

> **OppaStore** es una plataforma e-commerce de productos asiáticos de tendencia
> (K-beauty, snacks, peluches kawaii, accesorios, coleccionables, drops y preventas)
> para Ayacucho. El MVP **no integra pasarela de pagos**: el flujo de compra termina
> en **WhatsApp**, y la venta se coordina manualmente (Yape, Plin, efectivo, delivery o recojo).

## Cómo leer estas especificaciones

Primero se define QUÉ debe hacer el sistema (requisitos, reglas, historias, criterios),
luego CÓMO se prueba (casos de prueba, plan QA) y CÓMO se construye (arquitectura, DER).
Todo está enlazado por una **matriz de trazabilidad** para que ningún requisito quede
sin historia, sin criterio y sin prueba.

| # | Documento | Contenido |
|---|-----------|-----------|
| 00 | [Visión y alcance](00-vision-y-alcance.md) | Problema, objetivos, público, alcance del MVP y fuera de alcance |
| 01 | [Arquitectura y decisiones](01-arquitectura.md) | Stack, estructura del monorepo, despliegue, ADRs |
| 02 | [Modelo de datos (DER)](02-modelo-de-datos-der.md) | Entidades, DER (Mermaid) y esquema Prisma |
| 03 | [Requisitos funcionales (RF)](03-requisitos-funcionales.md) | RF01–RF48 por módulo |
| 04 | [Requisitos no funcionales (RNF)](04-requisitos-no-funcionales.md) | RNF01–RNF15 |
| 05 | [Reglas de negocio (RB)](05-reglas-de-negocio.md) | RB01–RB23 |
| 06 | [Historias de usuario (HU)](06-historias-de-usuario.md) | HU01–HU16 (formato tesis) |
| 07 | [Criterios de aceptación (CA)](07-criterios-de-aceptacion.md) | CA01–CA12 (Gherkin) |
| 08 | [Casos de prueba (CP)](08-casos-de-prueba.md) | CP01–CP22 |
| 09 | [Matriz de trazabilidad](09-matriz-de-trazabilidad.md) | RF ↔ HU ↔ RB ↔ CA ↔ CP |
| 10 | [Plan de pruebas / QA](10-plan-de-pruebas-qa.md) | Estrategia, herramientas, ISO/IEC 25010, SUS |
| 11 | [Backlog y sprints](11-backlog-y-sprints.md) | Product backlog y planificación por sprints |

## Convención de identificadores

| Prefijo | Significado | Rango |
|---------|-------------|-------|
| `RF`  | Requisito funcional | RF01–RF48 |
| `RNF` | Requisito no funcional | RNF01–RNF15 |
| `RB`  | Regla de negocio | RB01–RB23 |
| `HU`  | Historia de usuario | HU01–HU16 |
| `CA`  | Criterio de aceptación | CA01–CA12 |
| `CP`  | Caso de prueba | CP01–CP22 |
| `ADR` | Registro de decisión de arquitectura | ADR-01–ADR-08 |

## Stack (resumen)

- **Frontend:** Next.js (App Router) · TypeScript · Tailwind CSS · Framer Motion · Lucide React → **Vercel**
- **Backend:** Express · PostgreSQL · Prisma (Docker Desktop en dev) → **Render**
- **Auth:** Google OAuth + JWT en el backend (login **opcional**; checkout de invitado por defecto)
- **Pruebas:** Vitest · React Testing Library · Playwright · cobertura

## Estado

Fase actual: **Especificación** (previa a la implementación). Ver control de cambios al pie de cada documento.
