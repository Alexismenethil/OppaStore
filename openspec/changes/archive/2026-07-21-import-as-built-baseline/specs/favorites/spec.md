## ADDED Requirements

### Requirement: RF34–RF36 — Favoritos únicos y visibles

El frontend SHALL permitir alternar un producto como favorito, SHALL mantener ids únicos y SHALL mostrar los productos activos favoritos que pueda resolver desde el catálogo. (HU07, HU12; RB08; CA05; CP12)

#### Scenario: Comprador marca un producto no favorito
- **WHEN** pulsa el control de favorito
- **THEN** el id se agrega una sola vez y los contadores se actualizan
- **AUTOMATED TESTS** `frontend/tests/domain/favorites.test.ts`, `frontend/tests/features/FavoritesContext.test.tsx`, `frontend/tests/components/ProductCard.test.tsx`, `frontend/tests/components/ProductGrid.test.tsx`

#### Scenario: Comprador vuelve a pulsar un favorito
- **WHEN** el id ya está marcado
- **THEN** el id se elimina en lugar de duplicarse
- **AUTOMATED TESTS** `frontend/tests/domain/favorites.test.ts`, `frontend/tests/features/FavoritesContext.test.tsx`

#### Scenario: Grilla recibe la lista de favoritos
- **WHEN** la vista entrega ids favoritos a la grilla de productos
- **THEN** únicamente las tarjetas correspondientes aparecen marcadas y pueden alternarse
- **AUTOMATED TESTS** `frontend/tests/components/ProductGrid.test.tsx`

### Requirement: RF37 — Persistencia local y reemplazo remoto

Los favoritos del invitado SHALL persistir en `localStorage`; al recibir una lista remota, el contexto SHALL reemplazarla eliminando duplicados y SHALL tolerar almacenamiento corrupto sin romper la UI. (HU07, HU15; RB08, RB17; CP12, CP22)

#### Scenario: Invitado recarga la aplicación
- **WHEN** existen favoritos válidos almacenados
- **THEN** el contexto recupera la misma lista única
- **AUTOMATED TESTS** `frontend/tests/features/FavoritesContext.test.tsx`, `frontend/tests/lib/storage.test.ts`

#### Scenario: Lista remota contiene ids repetidos
- **WHEN** la sincronización reemplaza el estado local
- **THEN** el contexto conserva una sola aparición de cada id
- **AUTOMATED TESTS** `frontend/tests/features/FavoritesContext.test.tsx`, `backend/tests/sync.test.ts`, `frontend/tests/lib/apiAuthSync.test.ts`
