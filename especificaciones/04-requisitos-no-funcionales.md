# 04 — Requisitos no funcionales (RNF)

Los RNF se mapean, cuando aplica, a subcaracterísticas de **ISO/IEC 25010:2023** para
alinear con la evaluación de calidad del curso.

| ID | Requisito | Categoría (ISO 25010) | Verificación |
|----|-----------|-----------------------|--------------|
| **RNF01** | La interfaz debe ser **responsive y mobile-first**. | Adecuación / Portabilidad | Playwright en viewport móvil (CP13) |
| **RNF02** | El diseño debe ser limpio, moderno, pastel y coherente con la identidad "Green Panda". | Usabilidad (estética) | Revisión visual vs `DESIGN.md`; SUS |
| **RNF03** | El sistema debe cargar rápido y evitar componentes pesados innecesarios. | Eficiencia de desempeño | Lighthouse ≥ 90 en móvil; bundle acotado |
| **RNF04** | Los textos deben ser claros y orientados a jóvenes. | Usabilidad (reconocibilidad) | Revisión de contenido |
| **RNF05** | El flujo de compra debe ser simple, en pocos pasos. | Usabilidad (operabilidad) | ≤ 4 pasos catálogo→WhatsApp; SUS |
| **RNF06** | El código debe organizarse por componentes, páginas, servicios y datos. | Mantenibilidad (modularidad) | Estructura del repo ([01](01-arquitectura.md) §3) |
| **RNF07** | Las validaciones deben ser claras para el usuario. | Usabilidad (protección ante errores) | Mensajes de error en UI (CP06) |
| **RNF08** | El sistema debe ser mantenible y fácil de ampliar. | Mantenibilidad | Lógica en capa de dominio pura; ADR-07 |
| **RNF09** | Se deben evitar errores silenciosos. | Fiabilidad (madurez) | TS strict; manejo explícito de errores; toasts |
| **RNF10** | Debe ser posible probar las principales reglas de negocio. | Mantenibilidad (capacidad de prueba) | Suite Vitest sobre `domain/` |
| **RNF11** | Autenticación y endpoints privados protegidos con JWT; secretos en variables de entorno. | Seguridad | Middleware auth; pruebas de API (CP21) |
| **RNF12** | API REST versionada (`/api/v1`) con CORS restringido a los dominios de Vercel. | Seguridad / Compatibilidad | Configuración CORS; revisión |
| **RNF13** | Cobertura de pruebas objetivo **≥ 80 %** en la capa de dominio/reglas de negocio. | Mantenibilidad (capacidad de prueba) | Reporte de cobertura Vitest (evidencia X4) |
| **RNF14** | Migraciones de BD versionadas y reproducibles con Docker. | Mantenibilidad / Portabilidad | `prisma migrate`; `docker-compose up` |
| **RNF15** | Accesibilidad básica: contraste suficiente, foco visible, `alt` en imágenes. | Usabilidad (accesibilidad) | Auditoría axe/Lighthouse a11y |

## Objetivos medibles (metas de calidad)

- **Desempeño:** Time-to-Interactive < 3 s en 4G móvil; Lighthouse Performance ≥ 90.
- **Usabilidad:** SUS ≥ 80 (nivel "Excelente" según Brooke, 1996) en muestra piloto.
- **Funcionamiento (X4):** 100 % de casos de prueba críticos en verde, sin excepciones no controladas.
- **Cobertura:** ≥ 80 % en `domain/`; ≥ 60 % global.
- **Accesibilidad:** sin errores críticos de contraste en axe.

---
_Control de cambios: v1.0 (2026-07-07) — versión inicial._
