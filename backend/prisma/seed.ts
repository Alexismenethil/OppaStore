import { PrismaClient, TipoProducto } from "@prisma/client";

const prisma = new PrismaClient();

// Imágenes del diseño de referencia (mismas del seed del frontend, ahora en BD).
const IMG = "https://lh3.googleusercontent.com/aida-public/";

// Categorías con la foto y el overlay pastel del home (antes en frontend
// src/data/categorias.media.ts). Ahora editables desde el panel admin (RF43).
const CATEGORIAS = [
  { slug: "skincare", nombre: "Skincare Coreano", orden: 1, overlay: "from-surface-container-highest/80", imagen: `${IMG}AB6AXuC4TwXjEGuMn9zhy5jpjKfA3xJ4xwZuks9wYRnjrTMQInhRZl5gIyoxI2AdaLvV0pSdAqciJgTA7D2lfxsfVUMjrnQnYzyI3CoaSxrg954e5WownyXlys3eLEzHf9HOGK_BziuQRw1ZAVJ1dm_4Uvep7GUwrcSzANFP9L5_utqKo7pYJRXOFzN9q_eqpZu3-3yqOOuVAJLZIe84_w3BMOavIuCyVaaNR1cTrCe874Ws-ffmIq8UpmbO` },
  { slug: "snacks", nombre: "Snacks & Foods", orden: 2, overlay: "from-secondary-container/80", imagen: `${IMG}AB6AXuBqUuRJ6fcbPyLaiIDNZ9xy3y1dt9fGN6DhvYTTXoKK-jTkzFvJnjWXvI3PyvFlMd90fnZnHsHi6pg1upLJ1Wtck2ArN7WsmMrbfeqH7Z_yJKyt3v3sx1EkVGWtRXTwt1jtLhvCNV58rzA-AOrz364KwTUq27MzbFNLTpQZ5rIQmD4lzKnw6vs7-gQ3eJtDojjRbnpw4yvHKM-2M-Kk-SKhkCA8xzol_olh--8TibcTdJjEF4Rbokoa` },
  { slug: "peluches", nombre: "Peluches Kawaii", orden: 3, overlay: "from-tertiary-container/80", imagen: `${IMG}AB6AXuD03kfFtgfjSXRyWf6R7fv4KCH5OC1a9kbSm-jtoALqA4eHbfwNeVDUOhvhgMFU7s3rWvNMH7UkpEM3igv_rRiR9iiYvKqY1s_5pEjOUuqejNwGbJ20cvNlNFCcKUJQPcEiHo-QZv18k15qW4spoBU-V6FjjooXvtedmjqPU0-k0ma-DI9LTzxxfAmTgmQ9rIfD8iIFR-q2my7oOz25JI5P9pZ32HtuoYFXNCVYqf-wSdQDKme9UNjB` },
  { slug: "accesorios", nombre: "Accesorios", orden: 4, overlay: "from-surface-container-low/80", imagen: `${IMG}AB6AXuDdtXAMI4E5q1XxRNn2j4Pw8IcmGw52NlFbrO16T4GIHIPljjkWAZVRqs8T8Ox_V72Y-W6MpHt9bs_l5MAgmkUT4EkGea4YVLS7IIAQ0diy9DfwzZK4QVAdi0kYXcQv5gHQNc4LphWjVYpFT5Q0fPta9uXpeNSbzD62ME6K0lY5QeJs_zadIo0hfWeGx7ada-__TJl-3owJcuvW8fAtmu2ImyUr9PzksCnCv2ntJlVD5VSHGPjadkKg` },
  { slug: "colecciones", nombre: "Colecciones", orden: 5, overlay: "from-primary-container/80", imagen: `${IMG}AB6AXuCoUZV3kkKn9om6dkxzKlVQnk3GHhzdbclnds9aokrjGxGHcy2pPFoEb8T5HgBd9T9KAKmduDpmvX3TSDHVZV_oeDP3JWodQ1RJjZ7PsJlh8hiSmcmyLuGtymaIf59rFi_GkmWsMsbhxHLXbDHBRxlI-TEWItt9i29p3ey0dOlCOSkFUq0quVBCu4-QRtqaROjCu-dxyphpJE7i4m4kmd6M9930SAIF2zeQ_81n-kWFfVNjp1wAYUxY` },
  { slug: "drops", nombre: "Drops", orden: 6, overlay: "from-secondary-fixed/80", imagen: `${IMG}AB6AXuDvJMaqewAte9Y6JO9pvTO8Fap-tlVXNdS398_qUBbuD7iVh5Y33wWkt_RYItyHrcyHSFG0u1VZt8HRcfsnqCZH0PwcyNW17vc8lgi4nRhVN7_6Y8f_V3QaWp1wc5DWim52Zwt3CGe0hh9Sg5UCTtRDg-Yu9QtGVQRQVHkn2uix7LgmEFaJrCpkgCWzcK3b0EVriNJi7-yLw6vp_c_SOpMZ3W1tNtWH0vlHvN-GO9lMkootZBpb3a1u` },
];

const IMAGENES: Record<string, string> = {
  "serum-centella-asiatica": `${IMG}AB6AXuBpK-yxkWYj88X5dlhBSlGKQUmx6SGaRU0Dvz63s7GYMDepWIe2iKIENoVSTMO9yDyOPclX-yKsWhAP9OpS0S5JfH7h1ikGkHD8DnCY5HbQpyS6Mq__23l89AFlsCsHs8nwnBfZgv0zhr3V4B4-L8eLAefsMTxsdTuTS_jKn07kHDI54hZhmYkT3Bce8cZKhgr0vskZ6X8g8zjYyFadogJr_w52dEBwblMRZfNde_exUZSi47px05SD`,
  "peluche-panda-premium": `${IMG}AB6AXuBCcpC1UqJmEq14rjKQt2AHaDk9f1q8dja1m76GF-v8QbBN70ucEiJ5XjekaEKa-eVDOk_SBDdnCU-eIVD3iK0wRvj1-j2lCf7gagiSWiR9BqhqDeDbpzRU0CIt0EBkPjGAGqfEeB6ekOlJyHy5xEDKKMRNW05mWBNtmSAUXj2Gq33aHR-jzEPsevTE3sdScZu6inj7iNRtvYiq-YGD7aMODLys6eW5tkU_lWpDoGNCW5kRUgPBrlK6`,
  "pack-snacks-coreanos": `${IMG}AB6AXuCN6SjZDF39qbf9bmZEWakSnojQcwn8xEqhfLgtjSxPkF9CuSFKctdh-KIX1QZ0VwBv1cNCkYFv_Tv3LuyXDAMsBElx0qixYVQeReBoKKysbX0dXwlaOdRbo9i6RKylW-h56Igzkv3TiWdlEFikqrzJQgTUd-Pt0iYI8Jgdh2dxspQ3yjUgguhIiFA5ijVyIxSmvo925QWYNpd2-fs3aQBXexYZcvgDOGFrfyIz7kGXrH2Q7L83Egjo`,
  "photocard-holder-glitter": `${IMG}AB6AXuC1Cpfx09JyljDUdTaQ2WQM9lFpfIffnC2hiLQml0Szosh7whvTRfKFXDw-_RC67Sv0lXi5SC3Sca9IdGLTnl6SBcuxkkc26l7fJQGljdBQBBRNcqiMoQSfZbYX51tr1mfsxLtfytvc0fc8GpzVF-Gci5wWhvn_0-YIfCg8ls4BtNZE76362GavGeTWjc-9-3SKJX8RQJO7wXUKygrSyoWeGAMAWQod7whQZLxPHltqFEE_nh8FNNci`,
  "tonico-yuja-niacin": `${IMG}AB6AXuCqu_uQY3wPTJ1mpSBrK7lB1jbydgvbMCfkJ__Us9gmuLy0UifUrk83Rg5Rk6I9yp1736l8dwSAKTF-10l7sA3bB2336a2XxUZQezzdGAGIZAxjyIqUrDwdsbseiMAqAerDIdkQmpF7Dbt9EVG7BY_Q7TEdfj4T75IhC5VzFQywb0414pLYxbqwOId_Ffn4vjBg5vDnsjUiw79WZa2HsDIShCDM93C6szZYC6Dbvx1OUWekVPQvFiCL`,
  "snack-honey-butter": `${IMG}AB6AXuDlunewa24Q8L5cAHTADM1VgyCmcy3zRR8lAuLTCT0pgOnr3OLBazNyuA0ApmOZDpV8D6HwUqlz5OzEkZVerXa0JzyOrhdtrogKe7X5Wz2Z0a7LyC6Zk1Csh-EaD3STdxB-eSZbYNwBLWUEe3x4B00cU6FpuYUf4b5gGS_VyBpaXB0QCYWzLIAyav_nbUUNF9nQ_8GjdGffSSbzfAEszG9MqbW2bPt3uc8uIFa7MZlyVR6qUO9-RYZl`,
  "serum-centella-glow-drop": `${IMG}AB6AXuBoIw99HH7IKOwhJsBbnXU8mvQfvVLvwxHpnjLX6w_QfwrxUjX7fELNxBJubA50otie3Uu2sjDZIrIDRLZGRtoRNVjiRDrCZchTiAkqxQrd45u76YL5xl6Aypr5HV1DRnTBL9DiEy48xu7-VnGsGiD3bZrMbnHoPQ8V_Jlz7ku6WgFn8Y6w3FL42T2meWm-ulmXKdfHJirRsyyHRVFIm7PeisKo6hzQ92_naImVIh90XPNlfe5QEnrs`,
  "coleccion-kbeauty-box": `${IMG}AB6AXuCoUZV3kkKn9om6dkxzKlVQnk3GHhzdbclnds9aokrjGxGHcy2pPFoEb8T5HgBd9T9KAKmduDpmvX3TSDHVZV_oeDP3JWodQ1RJjZ7PsJlh8hiSmcmyLuGtymaIf59rFi_GkmWsMsbhxHLXbDHBRxlI-TEWItt9i29p3ey0dOlCOSkFUq0quVBCu4-QRtqaROjCu-dxyphpJE7i4m4kmd6M9930SAIF2zeQ_81n-kWFfVNjp1wAYUxY`,
};

// Galería del detalle (antes en frontend products.seed.ts).
const GALERIAS: Record<string, string[]> = {
  "coleccion-kbeauty-box": [
    IMAGENES["coleccion-kbeauty-box"],
    IMAGENES["serum-centella-asiatica"],
    IMAGENES["tonico-yuja-niacin"],
    IMAGENES["serum-centella-glow-drop"],
  ],
};

const PRODUCTOS = [
  { slug: "serum-centella-asiatica", nombre: "Serum Centella Asiatica", descripcion: "Piel calmada e hidratada con extracto de centella asiática.", precio: 92.0, stock: 20, categoria: "skincare", tipo: TipoProducto.skincare, destacado: true, fechaVencimiento: new Date("2027-03-01"), infoAdicional: { tipoPiel: "Todo tipo de piel, ideal para piel sensible", modoUso: "Aplicar 2-3 gotas sobre el rostro limpio, mañana y noche.", advertencia: "Uso externo. Evitar contacto con los ojos." } },
  { slug: "peluche-panda-premium", nombre: "Peluche Panda Premium", descripcion: "Súper suave y esponjoso, perfecto para regalar.", precio: 45.0, stock: 12, categoria: "peluches", tipo: TipoProducto.peluche, destacado: true },
  { slug: "pack-snacks-coreanos", nombre: "Pack de Snacks & Food Coreanos", descripcion: "Mezcla de sabores dulces y picantes de edición limitada.", precio: 35.0, stock: 3, categoria: "snacks", tipo: TipoProducto.snack, destacado: true, fechaVencimiento: new Date("2026-11-30"), infoAdicional: { alergenos: "Contiene gluten, soya y frutos secos.", advertencia: "Consumir antes de la fecha de vencimiento." } },
  { slug: "photocard-holder-glitter", nombre: "Photocard Holder Glitter", descripcion: "Protección con estilo para tus photocards favoritas.", precio: 28.0, stock: 50, categoria: "accesorios", tipo: TipoProducto.accesorio, destacado: true, esPreventa: true, fechaEstimadaLlegada: new Date("2026-08-15") },
  { slug: "tonico-yuja-niacin", nombre: "Tónico Yuja Niacin", descripcion: "Tónico iluminador con yuja y niacinamida.", precio: 65.0, stock: 8, categoria: "skincare", tipo: TipoProducto.skincare, fechaVencimiento: new Date("2027-01-15"), infoAdicional: { tipoPiel: "Piel apagada o con manchas.", modoUso: "Aplicar con algodón tras la limpieza." } },
  { slug: "snack-honey-butter", nombre: "Snack Coreano Honey Butter", descripcion: "El clásico snack coreano dulce y salado.", precio: 12.0, stock: 0, categoria: "snacks", tipo: TipoProducto.snack, fechaVencimiento: new Date("2026-09-01"), infoAdicional: { alergenos: "Contiene leche y gluten." } },
  { slug: "serum-centella-glow-drop", nombre: "Serum Centella Glow — Edición Ayacucho Flora", descripcion: "Drop de temporada. Edición limitada que no se repite.", precio: 120.0, stock: 15, categoria: "drops", tipo: TipoProducto.drop, destacado: true, esPreventa: true, fechaEstimadaLlegada: new Date("2026-08-30") },
  { slug: "coleccion-kbeauty-box", nombre: "K-Beauty Collection Box", descripcion: "Caja de colección con productos virales de Seúl.", precio: 150.0, stock: 5, categoria: "colecciones", tipo: TipoProducto.coleccion },
  { slug: "mascarilla-descontinuada", nombre: "Mascarilla (descontinuada)", descripcion: "Producto retirado del catálogo (inactivo).", precio: 20.0, stock: 4, categoria: "skincare", tipo: TipoProducto.skincare, activo: false },
];

async function main() {
  const idPorSlug = new Map<string, string>();
  for (const c of CATEGORIAS) {
    const { imagen, ...resto } = c;
    const cat = await prisma.categoria.upsert({
      where: { slug: c.slug },
      update: { nombre: c.nombre, imagenUrl: imagen, overlay: c.overlay, orden: c.orden },
      create: { ...resto, imagenUrl: imagen },
    });
    idPorSlug.set(c.slug, cat.id);
  }

  let dropHomeId: string | null = null;
  for (const p of PRODUCTOS) {
    const { categoria, ...datos } = p;
    const registro = {
      ...datos,
      imagenUrl: IMAGENES[p.slug] ?? null,
      imagenes: GALERIAS[p.slug] ?? undefined,
      categoriaId: idPorSlug.get(categoria)!,
    };
    const prod = await prisma.producto.upsert({
      where: { slug: p.slug },
      update: registro,
      create: registro,
    });
    if (p.slug === "serum-centella-glow-drop") dropHomeId = prod.id;
  }

  // Hero + contacto/redes del footer + drop del inicio (antes fijos en el front).
  await prisma.siteConfig.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      heroFlatLayUrl: `${IMG}AB6AXuBY7C7DUyBu7CBs_RGkusaf058CnG9SLZq_XBLNyxN57huioUHsiRJ0HQkj8ytFGacST-CoTFxp9vlnBRnXgeqy3oFKjEAktF7hXH7DcTco3RI1VzO6-TFsWqVVHzj0MEsPBIF6SzM4u_bj9U0uhRM9K65WymPQeRdU7fCAyk8jLnQYG5iDMGqfZr5-ERE5ZSdxMrNJc1vLyXhCSr0ct9xbDxOc1k5aIA9OpFjJLW1FPQStABAZ3t8H`,
      heroPandaUrl: `${IMG}AB6AXuB1ZQgCwz7_uNl18sWiNiJkq5Uw_YFOsuUUDImL8FkopI7dubFpwwrytOuUePV6n5xGM86tywqx3YBT2r3N9zZ0E30Mb1ZNHZO6eZUp5uNxMnwoL8FnSu5OLZokOXzmGl21okg9RSkzo7N4HBFUW0Ew1sdlDwaFbWJ9_lqvHXVe624ygRxFVHwdjqUTCyP7yiqAKSZpD1nqB2j0m_fqlI6_5246_D2kTgW_JwDf_UzoRAbcGvUK5W0S`,
      heroPandaEtiqueta: "Novedad Kawaii",
      dropHomeProductoId: dropHomeId,
      whatsapp: "51999999999",
      email: "hola@oppastore.pe",
      facebook: "https://facebook.com/oppastore",
      instagram: "https://instagram.com/oppastore",
      tiktok: "https://tiktok.com/@oppastore",
      direccion: "Ayacucho, Perú · Atención online",
    },
  });

  console.log(`Seed completo: ${CATEGORIAS.length} categorías, ${PRODUCTOS.length} productos, SiteConfig.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
