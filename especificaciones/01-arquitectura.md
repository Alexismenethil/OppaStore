# 01 — Arquitectura y decisiones

## 1. Visión general

OppaStore es una aplicación web **cliente–servidor** desacoplada:

- **Frontend (Next.js)** consume una **API REST** del backend. Renderiza el catálogo,
  el carrito, favoritos, drops, detalle y el panel admin. Es responsive **mobile-first**.
- **Backend (Express + PostgreSQL)** expone la API, contiene la **lógica de negocio y de
  datos**, la autenticación (Google OAuth + JWT) y la persistencia (Prisma).
- El cierre de compra **no pasa por el servidor de pagos**: el backend registra el pedido
  y el frontend abre **WhatsApp** con el mensaje prellenado.

```
┌────────────────────┐        HTTPS / REST         ┌──────────────────────┐
│   Frontend (Next)  │  ───────────────────────▶   │  Backend (Express)   │
│  App Router · TS   │  ◀───────────────────────   │  Controllers · JWT   │
│  Tailwind · Framer │        JSON  +  JWT          │  Services (RB01–23)  │
│  Lucide · Vercel   │                              │  Prisma · Render     │
└─────────┬──────────┘                              └──────────┬───────────┘
          │ wa.me (mensaje prellenado)                         │
          ▼                                                    ▼
     WhatsApp del negocio                              PostgreSQL (Docker dev)
```

## 2. Stack tecnológico

| Capa | Tecnología | Justificación |
|------|-----------|---------------|
| UI | **Next.js (App Router) + TypeScript** | Ecosistema del equipo, SSR/SSG para SEO del catálogo, tipado estricto |
| Estilos | **Tailwind CSS** | Calca 1:1 los tokens del design system "Green Panda" de las maquetas |
| Animación | **Framer Motion** | Interacciones sutiles (float, hover, drawer del carrito) del diseño |
| Iconos | **Lucide React** | Reemplaza Material Symbols de las maquetas, ligero y consistente |
| API | **Express** | Backend explícito y simple, separable y desplegable en Render |
| ORM | **Prisma** | DER físico, migraciones versionadas y tipos generados (menos errores silenciosos, RNF09) |
| BD | **PostgreSQL** (Docker Desktop en dev) | Relacional, robusto, gratis en Render |
| Auth | **Google OAuth + JWT** (Passport en Express) | Login opcional de baja fricción; JWT protege endpoints privados |
| Pruebas | **Vitest · React Testing Library · Playwright** | Unitarias (reglas), componentes y E2E de flujos |
| Deploy | **Vercel** (front) · **Render** (back) | Flujo de despliegue conocido por el equipo |

## 3. Estructura del monorepo

```
proyecto-final/
├── especificaciones/          # este paquete SDD
├── frontend/                  # Next.js (deploy Vercel)
│   ├── src/
│   │   ├── app/               # rutas: /, /catalogo, /producto/[slug], /drops,
│   │   │                      #        /favoritos, /admin
│   │   ├── components/        # Button, Card, StatusBadge, ProductCard, CartDrawer…
│   │   ├── features/
│   │   │   ├── cart/          # CartContext + hooks (estado UI)
│   │   │   └── favorites/
│   │   ├── domain/            # LÓGICA PURA sin framework → RB01–RB23 testeables
│   │   │   ├── cart.ts        # add, updateQty, removeItem, totals, validación stock
│   │   │   ├── whatsapp.ts    # generación del mensaje wa.me (RB06, RB16)
│   │   │   ├── productStatus.ts # estado derivado (RB02, RB09, RB19)
│   │   │   └── money.ts       # formato S/ X.XX (RB18)
│   │   ├── lib/api/           # cliente REST hacia el backend
│   │   └── styles/            # tokens del design system
│   └── tests/                 # unit · component · e2e (Playwright)
├── backend/                   # Express (deploy Render)
│   ├── src/
│   │   ├── routes/            # /api/v1/products, /cart, /orders, /auth, /admin
│   │   ├── controllers/
│   │   ├── services/          # reglas de negocio del lado servidor (stock, pedidos)
│   │   ├── middlewares/       # auth JWT, allowlist admin, validación, errores
│   │   └── prisma/            # schema.prisma, migraciones, seed
│   └── tests/                 # unit + integración de API
├── docker-compose.yml         # PostgreSQL local para desarrollo
└── doc/                       # informe final + PDF de referencia del docente
```

> La **capa `domain/`** del frontend y los **`services/`** del backend concentran las reglas
> de negocio como funciones puras. 1 regla de negocio = ≥ 1 prueba unitaria → trazabilidad
> RB → CP directa (ver [09-matriz-de-trazabilidad](09-matriz-de-trazabilidad.md)).

## 4. Contrato de API (borrador)

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/api/v1/products` | pública | Lista productos **activos** (filtros `?categoria=&q=`) |
| GET | `/api/v1/products/:slug` | pública | Detalle de producto |
| GET | `/api/v1/drops` | pública | Productos en preventa/edición limitada |
| POST | `/api/v1/orders` | opcional | Registra pedido y devuelve texto para WhatsApp |
| GET | `/api/v1/auth/google` | pública | Inicia OAuth Google |
| GET | `/api/v1/auth/google/callback` | pública | Callback → emite JWT |
| GET | `/api/v1/me/cart` | JWT | Carrito guardado del usuario |
| PUT | `/api/v1/me/cart` | JWT | Guarda/mergea carrito |
| GET/PUT | `/api/v1/me/favorites` | JWT | Favoritos del usuario |
| GET | `/api/v1/admin/products` | JWT + admin | Lista todos (incl. inactivos) |
| POST/PUT | `/api/v1/admin/products[/:id]` | JWT + admin | Crear/editar |
| PATCH | `/api/v1/admin/products/:id/status` | JWT + admin | Activar/desactivar, stock, estado |
| GET | `/api/v1/admin/orders` | JWT + admin | Historial de pedidos |

## 5. Registro de decisiones de arquitectura (ADR)

| ADR | Decisión | Motivo | Consecuencia |
|-----|----------|--------|--------------|
| **ADR-01** | Sin pasarela de pagos; cierre por WhatsApp | Negocio sin RUC 20 | Se registra el pedido y se abre `wa.me`; pago manual (RB11, RB12) |
| **ADR-02** | Frontend Next.js + backend Express separados | Preferencia del equipo; despliegue Vercel + Render | Se define API REST y CORS; dos despliegues |
| **ADR-03** | PostgreSQL + Prisma | DER físico, migraciones, tipos | Requiere Docker en dev; migraciones versionadas (RNF14) |
| **ADR-04** | Login **opcional** solo con Google (OAuth + JWT en backend) | Baja fricción en compra por impulso; auth centralizado | Checkout de invitado por defecto; sesión solo para guardados (RB20) |
| **ADR-05** | Admin por **allowlist de correos Google** (`ADMIN_EMAILS`) | Simplicidad, sin tabla de roles | Correos autorizados obtienen admin; resto 403 (RB23) |
| **ADR-06** | Estado del producto **derivado** del stock + banderas | Evitar estados contradictorios | `estado` no se almacena como etiqueta; se calcula (RB19) |
| **ADR-07** | Reglas de negocio en capa de dominio pura | Testabilidad y mantenibilidad (RNF08, RNF10) | Lógica desacoplada de React/Express |
| **ADR-08** | Se registra cada pedido (`pedidos`) antes de abrir WhatsApp | Historial admin y evidencia QA | Entidad `pedidos`/`pedido_items` en el DER (RB22) |

## 6. Design system (tokens)

Fuente: `stitch_oppastore_ui_ux_design/green_panda_narrative/DESIGN.md`. Se portan como
tokens de Tailwind. Extracto:

| Token | Valor | Uso |
|-------|-------|-----|
| `primary` (mint) | `#2f6a3f` | Acción principal, acentos |
| `primary-container` | `#b2f2bb` | Botones suaves, badges positivos |
| `secondary` (sage) | `#56624b` | Estructura, texto orgánico |
| `tertiary-container` (lila) | `#f3dcef` | Badges "kawaii", acentos sutiles |
| `background` (blanco cálido) | `#f4fafd` / `#FCFAF7` | Fondo premium no clínico |
| `error` | `#ba1a1a` | Estado "Agotado"/alertas |
| Tipografía títulos | **Plus Jakarta Sans** | Headings, nombres de producto |
| Tipografía cuerpo | **DM Sans** | Texto y labels |
| Radios | 1rem base · 1.5–2rem cards | Estética "squishy" premium |

Reglas de estilo: whitespace generoso, esquinas grandes, sombras difusas (no bordes duros),
badges lila/crema con texto sage para el toque kawaii, punto mint bajo el ítem de menú activo.

---
_Control de cambios: v1.0 (2026-07-07) — versión inicial._
