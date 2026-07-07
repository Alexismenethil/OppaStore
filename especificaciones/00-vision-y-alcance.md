# 00 — Visión y alcance

## 1. Planteamiento del problema

Ayacucho tiene alta penetración de conectividad móvil pero carece de tiendas digitales
locales especializadas en productos asiáticos de tendencia (K-beauty, snacks coreanos,
peluches kawaii, coleccionables, drops/preventas). Ese comercio hoy ocurre de forma
informal en redes sociales genéricas, donde el catálogo es desorganizado, el stock no es
claro, no hay ficha de producto confiable y la coordinación de compra es dispersa. El
público objetivo —jóvenes de 15 a 30 años, compradores por impulso— necesita descubrir
productos rápido, ver disponibilidad real y concretar el pedido sin fricción.

Como el negocio **aún no cuenta con RUC 20**, no puede integrar una pasarela de pagos
formal (Stripe, Mercado Pago, Culqi). Por ello, el cierre de la transacción se **delega a
WhatsApp**, donde la venta se coordina manualmente (Yape, Plin, efectivo, delivery o recojo).

## 2. Objetivo del proyecto

Desarrollar una plataforma digital para la **gestión de catálogo, carrito y pedidos por
WhatsApp** de productos asiáticos de tendencia en Ayacucho, aplicando **Spec Driven
Development** y **aseguramiento de la calidad de software**.

### Objetivos específicos
1. Especificar el sistema (requisitos, reglas, historias, criterios, casos de prueba) antes de implementar.
2. Implementar el MVP respetando las especificaciones y la identidad visual "Green Panda".
3. Validar el **funcionamiento** (X4) con pruebas automatizadas y evidencia (ISO/IEC 25010).
4. Evaluar la **usabilidad** (X5) con la escala SUS sobre una muestra piloto.
5. Mantener **trazabilidad** completa requisito → historia → criterio → prueba.

## 3. Público objetivo

Jóvenes de ~15 a 30 años interesados en cultura asiática, K-beauty, productos virales,
coleccionables y regalos. Perfil mobile-first, sensible al diseño, propenso a la compra
por impulso. Se prioriza descubrimiento visual rápido y checkout en pocos pasos.

## 4. Identidad visual

Estilo **limpio, fluido, moderno, juvenil y premium**, inspirado en estética coreana/kawaii.
Paleta pastel: blanco cálido, verde menta, verde salvia, crema claro, gris suave, negro
elegante y acentos sutiles en rosa pastel/lila. Sistema de diseño de referencia:
`stitch_oppastore_ui_ux_design/green_panda_narrative/DESIGN.md`. Ver [01-arquitectura](01-arquitectura.md) §6.

## 5. Alcance del MVP (dentro)

| Módulo | Incluye |
|--------|---------|
| **Home / Landing** | Header con logo, menú, buscador, favoritos, carrito con contador, botón WhatsApp, hero, categorías, destacados, drops/preventas, "Cómo comprar", footer |
| **Catálogo** | Lista de productos activos, filtro por categoría, búsqueda por nombre, estado del producto, precio en soles, imagen, "Agregar al carrito" |
| **Detalle de producto** | Imagen grande, nombre, descripción, precio, categoría, stock, cantidad; info específica por tipo (skincare / snack / drop) |
| **Carrito** | Ítems seleccionados, aumentar/disminuir/eliminar, subtotal y total, validación de stock, generación del mensaje y envío por WhatsApp |
| **Drops y preventas** | Productos de edición limitada/preventa, etiquetas, fecha estimada de llegada, agregar al carrito si está habilitado |
| **Favoritos** | Marcar/quitar favoritos, sin duplicados, lista de favoritos |
| **Sesión (opcional)** | Login opcional con Google para guardar y recuperar carrito/favoritos |
| **Admin básico** | Crear/editar producto, activar/desactivar (borrado lógico), actualizar stock, cambiar estado, listar productos, ver historial de pedidos |

## 6. Fuera de alcance (delimitación del MVP)

- **Pasarela de pagos** (Stripe, Mercado Pago, Culqi u otro pago automático). El cierre es por WhatsApp (RB11, RB12).
- **Cuentas obligatorias**: el login es opcional; el checkout de invitado funciona sin sesión (RB20).
- Cálculo automático de costos de envío, tracking logístico, facturación electrónica.
- Reseñas/ratings de productos, cupones/descuentos automáticos, recomendaciones con IA.
- App móvil nativa (el enfoque es web responsive mobile-first).

> **Evolución futura:** cuando el negocio obtenga RUC 20 e integre pasarela de pagos, el
> inicio de sesión pasará a ser **obligatorio** y se añadirán checkout con pago y gestión
> de órdenes pagadas. La arquitectura se diseña para admitir ese cambio sin reescritura.

## 7. Supuestos y restricciones

- Un único desarrollador con roles duales Scrum (Product Owner / Scrum Team), como en la metodología del curso.
- Entorno de dev con Docker Desktop (PostgreSQL); despliegue en Vercel (frontend) y Render (backend).
- El número de WhatsApp del negocio se configura por variable de entorno.
- Evaluación de usabilidad con muestra piloto no probabilística (~15–20 usuarios de Ayacucho).

---
_Control de cambios: v1.0 (2026-07-07) — versión inicial._
