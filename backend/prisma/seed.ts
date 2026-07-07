import { PrismaClient, TipoProducto } from "@prisma/client";

const prisma = new PrismaClient();

const CATEGORIAS = [
  { slug: "skincare", nombre: "Skincare Coreano" },
  { slug: "snacks", nombre: "Snacks & Foods" },
  { slug: "peluches", nombre: "Peluches Kawaii" },
  { slug: "accesorios", nombre: "Accesorios" },
  { slug: "colecciones", nombre: "Colecciones" },
  { slug: "drops", nombre: "Drops" },
];

const PRODUCTOS = [
  { slug: "serum-centella-asiatica", nombre: "Serum Centella Asiatica", descripcion: "Piel calmada e hidratada.", precio: 92.0, stock: 20, categoria: "skincare", tipo: TipoProducto.skincare, destacado: true, infoAdicional: { tipoPiel: "Todo tipo de piel", modoUso: "2-3 gotas mañana y noche.", advertencia: "Uso externo." } },
  { slug: "peluche-panda-premium", nombre: "Peluche Panda Premium", descripcion: "Súper suave y esponjoso.", precio: 45.0, stock: 12, categoria: "peluches", tipo: TipoProducto.peluche, destacado: true },
  { slug: "pack-snacks-coreanos", nombre: "Pack de Snacks & Food Coreanos", descripcion: "Dulces y picantes.", precio: 35.0, stock: 3, categoria: "snacks", tipo: TipoProducto.snack, destacado: true, infoAdicional: { alergenos: "Contiene gluten, soya y frutos secos." } },
  { slug: "photocard-holder-glitter", nombre: "Photocard Holder Glitter", descripcion: "Protección con estilo.", precio: 28.0, stock: 50, categoria: "accesorios", tipo: TipoProducto.accesorio, destacado: true, esPreventa: true, fechaEstimadaLlegada: new Date("2026-08-15") },
  { slug: "tonico-yuja-niacin", nombre: "Tónico Yuja Niacin", descripcion: "Tónico iluminador.", precio: 65.0, stock: 8, categoria: "skincare", tipo: TipoProducto.skincare, infoAdicional: { tipoPiel: "Piel apagada", modoUso: "Aplicar con algodón." } },
  { slug: "snack-honey-butter", nombre: "Snack Coreano Honey Butter", descripcion: "Dulce y salado.", precio: 12.0, stock: 0, categoria: "snacks", tipo: TipoProducto.snack, infoAdicional: { alergenos: "Contiene leche y gluten." } },
  { slug: "serum-centella-glow-drop", nombre: "Serum Centella Glow — Edición Ayacucho Flora", descripcion: "Drop de temporada.", precio: 120.0, stock: 15, categoria: "drops", tipo: TipoProducto.drop, destacado: true, esPreventa: true, fechaEstimadaLlegada: new Date("2026-08-30") },
  { slug: "coleccion-kbeauty-box", nombre: "K-Beauty Collection Box", descripcion: "Productos virales de Seúl.", precio: 150.0, stock: 5, categoria: "colecciones", tipo: TipoProducto.coleccion },
  { slug: "mascarilla-descontinuada", nombre: "Mascarilla (descontinuada)", descripcion: "Producto retirado.", precio: 20.0, stock: 4, categoria: "skincare", tipo: TipoProducto.skincare, activo: false },
];

async function main() {
  const idPorSlug = new Map<string, string>();
  for (const c of CATEGORIAS) {
    const cat = await prisma.categoria.upsert({
      where: { slug: c.slug },
      update: { nombre: c.nombre },
      create: c,
    });
    idPorSlug.set(c.slug, cat.id);
  }

  for (const p of PRODUCTOS) {
    const { categoria, ...datos } = p;
    await prisma.producto.upsert({
      where: { slug: p.slug },
      update: { ...datos, categoriaId: idPorSlug.get(categoria)! },
      create: { ...datos, categoriaId: idPorSlug.get(categoria)! },
    });
  }

  console.log(`Seed completo: ${CATEGORIAS.length} categorías, ${PRODUCTOS.length} productos.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
