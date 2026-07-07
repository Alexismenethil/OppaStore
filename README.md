# OppaStore 💚

Plataforma e-commerce de productos asiáticos de tendencia para Ayacucho. Catálogo, carrito y
**pedidos por WhatsApp** (sin pasarela de pagos). Proyecto final del curso *Pruebas y
Aseguramiento de la Calidad de Software*, desarrollado con **Spec Driven Development**.

- 📐 Especificaciones (SDD): [`especificaciones/`](especificaciones/README.md)
- 🎨 Diseño de referencia: [`stitch_oppastore_ui_ux_design/`](stitch_oppastore_ui_ux_design/)
- 📄 Informe / referencia académica: [`doc/`](doc/)

## Arquitectura

| Capa | Stack | Deploy |
|------|-------|--------|
| Frontend | Next.js (App Router) · TypeScript · Tailwind · Framer Motion · Lucide | Vercel |
| Backend | Express · PostgreSQL · Prisma | Render |
| Auth | Google OAuth + JWT (login opcional) | — |
| Pruebas | Vitest · React Testing Library · Playwright | — |

## Puesta en marcha (desarrollo)

Requisitos: Node 20+, Docker Desktop.

```bash
# 1) Base de datos PostgreSQL (Docker)
docker compose up -d

# 2) Backend
cd backend
cp .env.example .env
npm install
npm run prisma:migrate      # crea las tablas
npm run seed                # carga categorías y productos de ejemplo
npm run dev                 # API en http://localhost:4000

# 3) Frontend (en otra terminal)
cd frontend
cp .env.example .env.local
npm install
npm run dev                 # app en http://localhost:3000
```

## Pruebas

```bash
# Frontend: reglas de negocio (dominio) + componentes
cd frontend
npm run test           # Vitest (unit + componentes)
npm run test:cov       # con reporte de cobertura
npm run test:e2e       # Playwright (requiere app corriendo)

# Backend: unit + integración de API
cd backend
npm run test
```

## Estructura

```
proyecto-final/
├── especificaciones/     # paquete SDD (requisitos, reglas, HU, CP, trazabilidad, DER)
├── frontend/             # Next.js
│   └── src/
│       ├── domain/       # reglas de negocio puras y testeables (RB01–RB23)
│       ├── data/         # catálogo semilla
│       ├── components/   # UI (design system "Green Panda")
│       └── app/          # rutas
├── backend/              # Express + Prisma
│   └── prisma/           # schema (DER) + seed
├── docker-compose.yml    # PostgreSQL local
└── doc/                  # informe final + PDF de referencia
```

Ver el estado del MVP y los sprints en
[`especificaciones/11-backlog-y-sprints.md`](especificaciones/11-backlog-y-sprints.md).
