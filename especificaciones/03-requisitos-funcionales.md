# 03 — Requisitos funcionales (RF)

Cada RF indica su módulo y las reglas de negocio ([05](05-reglas-de-negocio.md)) que aplica.
Prioridad MoSCoW: **M** = Must, **S** = Should, **C** = Could.

## Módulo 1 — Home / Landing

| ID | Requisito | Prio | RB |
|----|-----------|------|----|
| **RF01** | Mostrar header fijo con logo OppaStore y menú: Inicio, Skincare, Snacks & Foods, Colecciones, Drops, Contacto. | M | — |
| **RF02** | Ofrecer un buscador global accesible desde el header. | S | — |
| **RF03** | Mostrar ícono de Favoritos con contador de elementos. | S | RB08 |
| **RF04** | Mostrar ícono de Carrito con contador de ítems. | M | RB04 |
| **RF05** | Mostrar botón "Comprar por WhatsApp" en el header. | M | RB06 |
| **RF06** | Mostrar hero con mensaje principal y llamados a la acción. | M | — |
| **RF07** | Mostrar sección de categorías navegables. | M | — |
| **RF08** | Mostrar sección de productos destacados ("Los más pedidos"). | M | RB10 |
| **RF09** | Mostrar sección de Drops/preventas con etiqueta y fecha estimada/cuenta regresiva. | S | RB03 |
| **RF10** | Mostrar sección "Cómo comprar" (3 pasos) y footer con datos y medios de pago (Yape/Plin/Efectivo). | M | RB12 |

## Módulo 2 — Catálogo

| ID | Requisito | Prio | RB |
|----|-----------|------|----|
| **RF11** | Listar únicamente productos **activos** (ocultar inactivos). | M | RB10 |
| **RF12** | Filtrar productos por categoría. | M | — |
| **RF13** | Buscar productos por nombre (coincidencia parcial, sin distinción de mayúsculas). | M | — |
| **RF14** | Mostrar etiqueta de estado (Disponible / Pocas unidades / Agotado / Preventa) **derivada** de stock + banderas. | M | RB02, RB09, RB19 |
| **RF15** | Mostrar precio en soles con formato `S/ X.XX`. | M | RB18 |
| **RF16** | Mostrar imagen del producto. | M | — |
| **RF17** | Botón "Agregar al carrito"; deshabilitado cuando el producto está Agotado. | M | RB01, RB02 |

## Módulo 3 — Detalle de producto

| ID | Requisito | Prio | RB |
|----|-----------|------|----|
| **RF18** | Mostrar imagen grande, nombre, descripción, precio, categoría, estado de stock y cantidad disponible. | M | RB18, RB19 |
| **RF19** | Mostrar información específica según tipo: **Skincare** (tipo de piel, modo de uso, advertencia, vencimiento si aplica); **Snacks** (vencimiento y alérgenos si aplica); **Drops/preventas** (fecha estimada de llegada). | M | RB03, RB13, RB14 |
| **RF20** | Agregar al carrito desde el detalle validando el stock disponible. | M | RB01 |
| **RF21** | Selector de cantidad limitado al rango `1..stock`. | M | RB01, RB07 |

## Módulo 4 — Carrito

| ID | Requisito | Prio | RB |
|----|-----------|------|----|
| **RF22** | Listar ítems del carrito (imagen, nombre, precio, cantidad). | M | — |
| **RF23** | Aumentar/disminuir la cantidad de un ítem dentro de `1..stock`. | M | RB01, RB05, RB07 |
| **RF24** | Eliminar un ítem del carrito. | M | — |
| **RF25** | Calcular subtotal por ítem y total general automáticamente. | M | RB04, RB05, RB18 |
| **RF26** | Validar stock al modificar cantidades y avisar al usuario. | M | RB01, RB07 |
| **RF27** | Generar mensaje de WhatsApp con productos, cantidades, precios, total y campos Nombre, Distrito/Zona y Método de entrega. | M | RB06, RB16 |
| **RF28** | Registrar el pedido en la base de datos antes de abrir WhatsApp. | M | RB22 |
| **RF29** | Abrir WhatsApp (`wa.me`) con el mensaje prellenado hacia el número del negocio. | M | RB06, RB11, RB12 |

## Módulo 5 — Drops y preventas

| ID | Requisito | Prio | RB |
|----|-----------|------|----|
| **RF30** | Listar productos de edición limitada o preventa. | S | — |
| **RF31** | Mostrar etiqueta "Preventa abierta", "Stock limitado" o "Próximamente". | S | RB03 |
| **RF32** | Mostrar la fecha estimada de llegada. | S | RB03 |
| **RF33** | Permitir agregar al carrito solo si la preventa está habilitada. | S | RB01, RB03 |

## Módulo 6 — Favoritos

| ID | Requisito | Prio | RB |
|----|-----------|------|----|
| **RF34** | Marcar/desmarcar un producto como favorito. | S | — |
| **RF35** | Evitar duplicados en la lista de favoritos. | S | RB08 |
| **RF36** | Mostrar la lista de favoritos. | S | — |
| **RF37** | Persistir favoritos (localStorage para invitado; base de datos si hay sesión). | C | RB17 |

## Módulo 7 — Sesión opcional (Google)

| ID | Requisito | Prio | RB |
|----|-----------|------|----|
| **RF38** | Permitir inicio de sesión **opcional** con Google. | S | RB20 |
| **RF39** | Persistir el carrito del usuario autenticado (carrito guardado). | C | RB17 |
| **RF40** | Fusionar el carrito de invitado con el carrito guardado al iniciar sesión, sin exceder stock. | C | RB21 |
| **RF41** | Recuperar carrito y favoritos guardados al volver a iniciar sesión. | C | RB17 |

## Módulo 8 — Panel administrador

| ID | Requisito | Prio | RB |
|----|-----------|------|----|
| **RF42** | Restringir el acceso al panel admin a correos Google en la allowlist. | M | RB23 |
| **RF43** | Crear producto (nombre, categoría, precio, stock, imagen, tipo y campos específicos). | M | RB13, RB14 |
| **RF44** | Editar producto existente. | M | — |
| **RF45** | Activar/desactivar producto (**borrado lógico**, no físico si tiene historial). | M | RB10 |
| **RF46** | Actualizar el stock de un producto. | M | RB01, RB09 |
| **RF47** | Cambiar el estado del producto (disponible/pocas unidades/agotado/preventa). | M | RB02, RB03, RB19 |
| **RF48** | Listar productos (incluyendo inactivos) y ver el historial de pedidos. | M | RB22 |

---
_Control de cambios: v1.0 (2026-07-07) — versión inicial._
