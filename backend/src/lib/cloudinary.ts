import { createHash } from "node:crypto";

/**
 * Firma de subida directa a Cloudinary (RF43 — subida de fotos del admin).
 * El navegador sube el archivo a Cloudinary con estos datos; el secreto nunca
 * sale del servidor. Si no está configurado, el panel cae a pegar una URL manual.
 */

export function cloudinaryConfigurado(): boolean {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET,
  );
}

export interface FirmaSubida {
  cloudName: string;
  apiKey: string;
  timestamp: number;
  folder: string;
  signature: string;
}

/**
 * Genera timestamp + firma SHA-1 de los parámetros que enviará el cliente
 * (ordenados alfabéticamente, según el algoritmo de Cloudinary).
 */
export function firmarSubida(timestamp: number): FirmaSubida {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME!;
  const apiKey = process.env.CLOUDINARY_API_KEY!;
  const apiSecret = process.env.CLOUDINARY_API_SECRET!;
  const folder = process.env.CLOUDINARY_FOLDER ?? "oppastore";

  const paramsAFirmar = `folder=${folder}&timestamp=${timestamp}`;
  const signature = createHash("sha1").update(paramsAFirmar + apiSecret).digest("hex");

  return { cloudName, apiKey, timestamp, folder, signature };
}
