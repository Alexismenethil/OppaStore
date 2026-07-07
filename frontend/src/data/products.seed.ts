/**
 * Catálogo semilla del MVP. Incluye productos con distintos estados para ejercitar
 * las reglas de negocio (agotado, pocas unidades, preventa, disponible).
 * En producción, estos datos provienen del backend (GET /api/v1/products).
 */
import type { Producto } from "@/domain/types";

export const CATEGORIAS = [
  { slug: "skincare", nombre: "Skincare Coreano" },
  { slug: "snacks", nombre: "Snacks & Foods" },
  { slug: "peluches", nombre: "Peluches Kawaii" },
  { slug: "accesorios", nombre: "Accesorios" },
  { slug: "colecciones", nombre: "Colecciones" },
  { slug: "drops", nombre: "Drops" },
] as const;

const IMAGENES_KBEAUTY_BOX = [
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCoUZV3kkKn9om6dkxzKlVQnk3GHhzdbclnds9aokrjGxGHcy2pPFoEb8T5HgBd9T9KAKmduDpmvX3TSDHVZV_oeDP3JWodQ1RJjZ7PsJlh8hiSmcmyLuGtymaIf59rFi_GkmWsMsbhxHLXbDHBRxlI-TEWItt9i29p3ey0dOlCOSkFUq0quVBCu4-QRtqaROjCu-dxyphpJE7i4m4kmd6M9930SAIF2zeQ_81n-kWFfVNjp1wAYUxY",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBpK-yxkWYj88X5dlhBSlGKQUmx6SGaRU0Dvz63s7GYMDepWIe2iKIENoVSTMO9yDyOPclX-yKsWhAP9OpS0S5JfH7h1ikGkHD8DnCY5HbQpyS6Mq__23l89AFlsCsHs8nwnBfZgv0zhr3V4B4-L8eLAefsMTxsdTuTS_jKn07kHDI54hZhmYkT3Bce8cZKhgr0vskZ6X8g8zjYyFadogJr_w52dEBwblMRZfNde_exUZSi47px05SD",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCqu_uQY3wPTJ1mpSBrK7lB1jbydgvbMCfkJ__Us9gmuLy0UifUrk83Rg5Rk6I9yp1736l8dwSAKTF-10l7sA3bB2336a2XxUZQezzdGAGIZAxjyIqUrDwdsbseiMAqAerDIdkQmpF7Dbt9EVG7BY_Q7TEdfj4T75IhC5VzFQywb0414pLYxbqwOId_Ffn4vjBg5vDnsjUiw79WZa2HsDIShCDM93C6szZYC6Dbvx1OUWekVPQvFiCL",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBoIw99HH7IKOwhJsBbnXU8mvQfvVLvwxHpnjLX6w_QfwrxUjX7fELNxBJubA50otie3Uu2sjDZIrIDRLZGRtoRNVjiRDrCZchTiAkqxQrd45u76YL5xl6Aypr5HV1DRnTBL9DiEy48xu7-VnGsGiD3bZrMbnHoPQ8V_Jlz7ku6WgFn8Y6w3FL42T2meWm-ulmXKdfHJirRsyyHRVFIm7PeisKo6hzQ92_naImVIh90XPNlfe5QEnrs",
] as const;

export const PRODUCTOS: Producto[] = [
  {
    id: "p1",
    slug: "serum-centella-asiatica",
    nombre: "Serum Centella Asiatica",
    descripcion: "Piel calmada e hidratada con extracto de centella asiática.",
    precio: 92.0,
    stock: 20,
    categoria: "skincare",
    tipo: "skincare",
    activo: true,
    esPreventa: false,
    fechaVencimiento: "2027-03-01",
    infoAdicional: {
      tipoPiel: "Todo tipo de piel, ideal para piel sensible",
      modoUso: "Aplicar 2-3 gotas sobre el rostro limpio, mañana y noche.",
      advertencia: "Uso externo. Evitar contacto con los ojos.",
    },
    imagenUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBpK-yxkWYj88X5dlhBSlGKQUmx6SGaRU0Dvz63s7GYMDepWIe2iKIENoVSTMO9yDyOPclX-yKsWhAP9OpS0S5JfH7h1ikGkHD8DnCY5HbQpyS6Mq__23l89AFlsCsHs8nwnBfZgv0zhr3V4B4-L8eLAefsMTxsdTuTS_jKn07kHDI54hZhmYkT3Bce8cZKhgr0vskZ6X8g8zjYyFadogJr_w52dEBwblMRZfNde_exUZSi47px05SD",
    destacado: true,
  },
  {
    id: "p2",
    slug: "peluche-panda-premium",
    nombre: "Peluche Panda Premium",
    descripcion: "Súper suave y esponjoso, perfecto para regalar.",
    precio: 45.0,
    stock: 12,
    categoria: "peluches",
    tipo: "peluche",
    activo: true,
    esPreventa: false,
    imagenUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBCcpC1UqJmEq14rjKQt2AHaDk9f1q8dja1m76GF-v8QbBN70ucEiJ5XjekaEKa-eVDOk_SBDdnCU-eIVD3iK0wRvj1-j2lCf7gagiSWiR9BqhqDeDbpzRU0CIt0EBkPjGAGqfEeB6ekOlJyHy5xEDKKMRNW05mWBNtmSAUXj2Gq33aHR-jzEPsevTE3sdScZu6inj7iNRtvYiq-YGD7aMODLys6eW5tkU_lWpDoGNCW5kRUgPBrlK6",
    destacado: true,
  },
  {
    id: "p3",
    slug: "pack-snacks-coreanos",
    nombre: "Pack de Snacks & Food Coreanos",
    descripcion: "Mezcla de sabores dulces y picantes de edición limitada.",
    precio: 35.0,
    stock: 3,
    categoria: "snacks",
    tipo: "snack",
    activo: true,
    esPreventa: false,
    fechaVencimiento: "2026-11-30",
    infoAdicional: {
      alergenos: "Contiene gluten, soya y frutos secos.",
      advertencia: "Consumir antes de la fecha de vencimiento.",
    },
    imagenUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCN6SjZDF39qbf9bmZEWakSnojQcwn8xEqhfLgtjSxPkF9CuSFKctdh-KIX1QZ0VwBv1cNCkYFv_Tv3LuyXDAMsBElx0qixYVQeReBoKKysbX0dXwlaOdRbo9i6RKylW-h56Igzkv3TiWdlEFikqrzJQgTUd-Pt0iYI8Jgdh2dxspQ3yjUgguhIiFA5ijVyIxSmvo925QWYNpd2-fs3aQBXexYZcvgDOGFrfyIz7kGXrH2Q7L83Egjo",
    destacado: true,
  },
  {
    id: "p4",
    slug: "photocard-holder-glitter",
    nombre: "Photocard Holder Glitter",
    descripcion: "Protección con estilo para tus photocards favoritas.",
    precio: 28.0,
    stock: 50,
    categoria: "accesorios",
    tipo: "accesorio",
    activo: true,
    esPreventa: true,
    fechaEstimadaLlegada: "2026-08-15",
    imagenUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuC1Cpfx09JyljDUdTaQ2WQM9lFpfIffnC2hiLQml0Szosh7whvTRfKFXDw-_RC67Sv0lXi5SC3Sca9IdGLTnl6SBcuxkkc26l7fJQGljdBQBBRNcqiMoQSfZbYX51tr1mfsxLtfytvc0fc8GpzVF-Gci5wWhvn_0-YIfCg8ls4BtNZE76362GavGeTWjc-9-3SKJX8RQJO7wXUKygrSyoWeGAMAWQod7whQZLxPHltqFEE_nh8FNNci",
    destacado: true,
  },
  {
    id: "p5",
    slug: "tonico-yuja-niacin",
    nombre: "Tónico Yuja Niacin",
    descripcion: "Tónico iluminador con yuja y niacinamida.",
    precio: 65.0,
    stock: 8,
    categoria: "skincare",
    tipo: "skincare",
    activo: true,
    esPreventa: false,
    fechaVencimiento: "2027-01-15",
    infoAdicional: {
      tipoPiel: "Piel apagada o con manchas.",
      modoUso: "Aplicar con algodón tras la limpieza.",
    },
    imagenUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCqu_uQY3wPTJ1mpSBrK7lB1jbydgvbMCfkJ__Us9gmuLy0UifUrk83Rg5Rk6I9yp1736l8dwSAKTF-10l7sA3bB2336a2XxUZQezzdGAGIZAxjyIqUrDwdsbseiMAqAerDIdkQmpF7Dbt9EVG7BY_Q7TEdfj4T75IhC5VzFQywb0414pLYxbqwOId_Ffn4vjBg5vDnsjUiw79WZa2HsDIShCDM93C6szZYC6Dbvx1OUWekVPQvFiCL",
  },
  {
    id: "p6",
    slug: "snack-honey-butter",
    nombre: "Snack Coreano Honey Butter",
    descripcion: "El clásico snack coreano dulce y salado.",
    precio: 12.0,
    stock: 0,
    categoria: "snacks",
    tipo: "snack",
    activo: true,
    esPreventa: false,
    fechaVencimiento: "2026-09-01",
    infoAdicional: { alergenos: "Contiene leche y gluten." },
    imagenUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDlunewa24Q8L5cAHTADM1VgyCmcy3zRR8lAuLTCT0pgOnr3OLBazNyuA0ApmOZDpV8D6HwUqlz5OzEkZVerXa0JzyOrhdtrogKe7X5Wz2Z0a7LyC6Zk1Csh-EaD3STdxB-eSZbYNwBLWUEe3x4B00cU6FpuYUf4b5gGS_VyBpaXB0QCYWzLIAyav_nbUUNF9nQ_8GjdGffSSbzfAEszG9MqbW2bPt3uc8uIFa7MZlyVR6qUO9-RYZl",
  },
  {
    id: "p7",
    slug: "serum-centella-glow-drop",
    nombre: "Serum Centella Glow — Edición Ayacucho Flora",
    descripcion: "Drop de temporada. Edición limitada que no se repite.",
    precio: 120.0,
    stock: 15,
    categoria: "drops",
    tipo: "drop",
    activo: true,
    esPreventa: true,
    fechaEstimadaLlegada: "2026-08-30",
    imagenUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBoIw99HH7IKOwhJsBbnXU8mvQfvVLvwxHpnjLX6w_QfwrxUjX7fELNxBJubA50otie3Uu2sjDZIrIDRLZGRtoRNVjiRDrCZchTiAkqxQrd45u76YL5xl6Aypr5HV1DRnTBL9DiEy48xu7-VnGsGiD3bZrMbnHoPQ8V_Jlz7ku6WgFn8Y6w3FL42T2meWm-ulmXKdfHJirRsyyHRVFIm7PeisKo6hzQ92_naImVIh90XPNlfe5QEnrs",
    destacado: true,
  },
  {
    id: "p8",
    slug: "coleccion-kbeauty-box",
    nombre: "K-Beauty Collection Box",
    descripcion: "Caja de colección con productos virales de Seúl.",
    precio: 150.0,
    stock: 5,
    categoria: "colecciones",
    tipo: "coleccion",
    activo: true,
    esPreventa: false,
    imagenUrl: IMAGENES_KBEAUTY_BOX[0],
    imagenes: [...IMAGENES_KBEAUTY_BOX],
  },
  {
    id: "p9",
    slug: "mascarilla-descontinuada",
    nombre: "Mascarilla (descontinuada)",
    descripcion: "Producto retirado del catálogo (inactivo).",
    precio: 20.0,
    stock: 4,
    categoria: "skincare",
    tipo: "skincare",
    activo: false,
    esPreventa: false,
  },
];
