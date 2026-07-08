-- AlterTable
ALTER TABLE "categorias" ADD COLUMN     "imagen_url" TEXT,
ADD COLUMN     "orden" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "overlay" TEXT;

-- AlterTable
ALTER TABLE "productos" ADD COLUMN     "imagenes" JSONB;

-- CreateTable
CREATE TABLE "site_config" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "hero_flat_lay_url" TEXT,
    "hero_panda_url" TEXT,
    "hero_panda_etiqueta" TEXT,
    "drop_home_producto_id" TEXT,
    "whatsapp" TEXT,
    "email" TEXT,
    "facebook" TEXT,
    "instagram" TEXT,
    "tiktok" TEXT,
    "direccion" TEXT,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "site_config_pkey" PRIMARY KEY ("id")
);
