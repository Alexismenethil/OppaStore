"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save, ArrowLeft, Plus, X } from "lucide-react";
import Link from "next/link";
import { adminApi, type AdminProducto, type DatosProducto } from "@/lib/api/admin";
import { useToast } from "@/components/ui/Toast";
import { Campo, Tarjeta, Interruptor, claseInput } from "./ui";
import { ImageUploader } from "./ImageUploader";

const TIPOS = [
  { value: "skincare", label: "Skincare" },
  { value: "snack", label: "Snack / Food" },
  { value: "peluche", label: "Peluche" },
  { value: "accesorio", label: "Accesorio" },
  { value: "coleccion", label: "Colección" },
  { value: "drop", label: "Drop" },
  { value: "general", label: "General" },
];

interface Props {
  producto?: AdminProducto;
  categorias: { slug: string; nombre: string }[];
}

const soloFecha = (iso: string | null | undefined) => (iso ? iso.slice(0, 10) : "");

/** Formulario de alta/edición de producto (RF43, RF44, RF46, RF47). */
export function ProductoForm({ producto, categorias }: Props) {
  const router = useRouter();
  const { mostrar } = useToast();
  const editando = Boolean(producto);

  const [nombre, setNombre] = useState(producto?.nombre ?? "");
  const [descripcion, setDescripcion] = useState(producto?.descripcion ?? "");
  const [precio, setPrecio] = useState(producto ? String(producto.precio) : "");
  const [stock, setStock] = useState(producto ? String(producto.stock) : "0");
  const [categoriaSlug, setCategoriaSlug] = useState(
    producto?.categoria?.slug ?? categorias[0]?.slug ?? "",
  );
  const [tipo, setTipo] = useState(producto?.tipo ?? "general");
  const [imagenUrl, setImagenUrl] = useState<string | null>(producto?.imagenUrl ?? null);
  const [galeria, setGaleria] = useState<string[]>(producto?.imagenes ?? []);
  const [activo, setActivo] = useState(producto?.activo ?? true);
  const [destacado, setDestacado] = useState(producto?.destacado ?? false);
  const [esPreventa, setEsPreventa] = useState(producto?.esPreventa ?? false);
  const [fechaLlegada, setFechaLlegada] = useState(soloFecha(producto?.fechaEstimadaLlegada));
  const [fechaVenc, setFechaVenc] = useState(soloFecha(producto?.fechaVencimiento));
  const [tipoPiel, setTipoPiel] = useState(producto?.infoAdicional?.tipoPiel ?? "");
  const [modoUso, setModoUso] = useState(producto?.infoAdicional?.modoUso ?? "");
  const [advertencia, setAdvertencia] = useState(producto?.infoAdicional?.advertencia ?? "");
  const [alergenos, setAlergenos] = useState(producto?.infoAdicional?.alergenos ?? "");
  const [guardando, setGuardando] = useState(false);

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    if (!nombre.trim() || !descripcion.trim()) {
      mostrar("aviso", "Nombre y descripción son obligatorios.");
      return;
    }
    const precioNum = Number(precio);
    const stockNum = Number(stock);
    if (!(precioNum > 0)) {
      mostrar("aviso", "El precio debe ser mayor a 0.");
      return;
    }
    if (!Number.isInteger(stockNum) || stockNum < 0) {
      mostrar("aviso", "El stock debe ser un entero ≥ 0.");
      return;
    }
    if (!categoriaSlug) {
      mostrar("aviso", "Selecciona una categoría.");
      return;
    }

    const info = { tipoPiel, modoUso, advertencia, alergenos };
    const infoLimpia = Object.fromEntries(
      Object.entries(info).filter(([, v]) => v.trim() !== ""),
    );

    const datos: DatosProducto = {
      nombre: nombre.trim(),
      descripcion: descripcion.trim(),
      precio: precioNum,
      stock: stockNum,
      categoriaSlug,
      tipo,
      imagenUrl,
      imagenes: galeria,
      activo,
      destacado,
      esPreventa,
      fechaEstimadaLlegada: esPreventa && fechaLlegada ? fechaLlegada : null,
      fechaVencimiento: fechaVenc || null,
      infoAdicional: Object.keys(infoLimpia).length ? infoLimpia : null,
    };

    setGuardando(true);
    try {
      if (producto) {
        await adminApi.editarProducto(producto.id, datos);
        mostrar("exito", "Producto actualizado 💚");
      } else {
        await adminApi.crearProducto(datos);
        mostrar("exito", "Producto creado 💚");
      }
      router.push("/admin/productos");
      router.refresh();
    } catch (err) {
      mostrar("aviso", err instanceof Error ? err.message : "No se pudo guardar");
    } finally {
      setGuardando(false);
    }
  }

  return (
    <form onSubmit={guardar} className="space-y-lg">
      <div className="flex items-center justify-between gap-md">
        <div className="flex items-center gap-sm">
          <Link
            href="/admin/productos"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-white/80 bg-white text-on-surface-variant shadow-[0_10px_24px_rgba(35,75,54,0.08)] transition-all duration-200 hover:-translate-y-0.5 hover:text-primary active:scale-95"
            aria-label="Volver"
          >
            <ArrowLeft size={18} />
          </Link>
          <h1 className="font-heading text-headline-sm text-on-surface md:text-headline-md">
            {editando ? "Editar producto" : "Nuevo producto"}
          </h1>
        </div>
        <button
          type="submit"
          disabled={guardando}
          className="flex items-center gap-xs rounded-full bg-primary px-md py-2.5 font-body text-label-lg text-on-primary shadow-[0_14px_30px_rgba(45,111,66,0.20)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_18px_36px_rgba(45,111,66,0.26)] active:scale-95 disabled:opacity-60 md:px-lg"
        >
          {guardando ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
          Guardar
        </button>
      </div>

      <div className="grid gap-lg lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-md">
          <Tarjeta className="space-y-md">
            <Campo label="Nombre" requerido>
              <input className={claseInput} value={nombre} onChange={(e) => setNombre(e.target.value)} />
            </Campo>
            <Campo label="Descripción" requerido>
              <textarea
                className={`${claseInput} min-h-[90px] resize-y`}
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
              />
            </Campo>
            <div className="grid grid-cols-2 gap-md">
              <Campo label="Precio (S/)" requerido>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  className={claseInput}
                  value={precio}
                  onChange={(e) => setPrecio(e.target.value)}
                />
              </Campo>
              <Campo label="Stock" requerido>
                <input
                  type="number"
                  min="0"
                  className={claseInput}
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                />
              </Campo>
            </div>
            <div className="grid grid-cols-2 gap-md">
              <Campo label="Categoría" requerido>
                <select className={claseInput} value={categoriaSlug} onChange={(e) => setCategoriaSlug(e.target.value)}>
                  {categorias.map((c) => (
                    <option key={c.slug} value={c.slug}>
                      {c.nombre}
                    </option>
                  ))}
                </select>
              </Campo>
              <Campo label="Tipo (etiqueta)" requerido hint="Define la info específica del detalle.">
                <select className={claseInput} value={tipo} onChange={(e) => setTipo(e.target.value)}>
                  {TIPOS.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </Campo>
            </div>
          </Tarjeta>

          <Tarjeta className="space-y-md">
            <h2 className="font-heading text-headline-sm text-on-surface">Información específica (opcional)</h2>
            <div className="grid gap-md sm:grid-cols-2">
              <Campo label="Tipo de piel (skincare)">
                <input className={claseInput} value={tipoPiel} onChange={(e) => setTipoPiel(e.target.value)} />
              </Campo>
              <Campo label="Modo de uso (skincare)">
                <input className={claseInput} value={modoUso} onChange={(e) => setModoUso(e.target.value)} />
              </Campo>
              <Campo label="Alérgenos (snacks)">
                <input className={claseInput} value={alergenos} onChange={(e) => setAlergenos(e.target.value)} />
              </Campo>
              <Campo label="Advertencia">
                <input className={claseInput} value={advertencia} onChange={(e) => setAdvertencia(e.target.value)} />
              </Campo>
            </div>
            <div className="grid gap-md sm:grid-cols-2">
              <Campo label="Fecha de vencimiento" hint="Skincare / snacks.">
                <input type="date" className={claseInput} value={fechaVenc} onChange={(e) => setFechaVenc(e.target.value)} />
              </Campo>
              {esPreventa && (
                <Campo label="Llegada estimada (preventa)">
                  <input
                    type="date"
                    className={claseInput}
                    value={fechaLlegada}
                    onChange={(e) => setFechaLlegada(e.target.value)}
                  />
                </Campo>
              )}
            </div>
          </Tarjeta>
        </div>

        <div className="space-y-md">
          <Tarjeta className="space-y-md">
            <ImageUploader value={imagenUrl} onChange={setImagenUrl} label="Foto principal" alto="h-48" />
            <GaleriaEditor galeria={galeria} onChange={setGaleria} />
          </Tarjeta>

          <Tarjeta className="space-y-sm">
            <Interruptor
              label="Activo"
              descripcion="Visible en el catálogo público."
              checked={activo}
              onChange={setActivo}
            />
            <Interruptor
              label="Destacado"
              descripcion="Respaldo de 'los más pedidos'."
              checked={destacado}
              onChange={setDestacado}
            />
            <Interruptor
              label="Preventa / Drop"
              descripcion="Muestra countdown y llegada estimada."
              checked={esPreventa}
              onChange={setEsPreventa}
            />
          </Tarjeta>
        </div>
      </div>
    </form>
  );
}

/** Galería de fotos secundarias del detalle (máx. 6). */
function GaleriaEditor({ galeria, onChange }: { galeria: string[]; onChange: (g: string[]) => void }) {
  const [agregando, setAgregando] = useState(false);

  return (
    <div>
      <p className="mb-xs font-body text-label-md text-on-surface-variant">Galería (opcional)</p>
      <div className="grid grid-cols-3 gap-sm">
        {galeria.map((url, i) => (
          <div key={`${url}-${i}`} className="relative aspect-square overflow-hidden rounded-[1rem] border border-white/80 bg-surface-container shadow-sm ring-1 ring-outline-variant/40">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt="" className="h-full w-full object-cover" />
            <button
              type="button"
              aria-label="Quitar"
              onClick={() => onChange(galeria.filter((_, j) => j !== i))}
              className="absolute right-1 top-1 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-on-surface shadow-sm transition-colors hover:text-error"
            >
              <X size={13} />
            </button>
          </div>
        ))}
        {galeria.length < 6 && !agregando && (
          <button
            type="button"
            onClick={() => setAgregando(true)}
            className="flex aspect-square flex-col items-center justify-center gap-xs rounded-[1rem] border border-dashed border-outline-variant/70 bg-white/60 text-on-surface-variant transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:text-primary"
          >
            <Plus size={18} />
            <span className="font-body text-label-md">Añadir</span>
          </button>
        )}
      </div>
      {agregando && (
        <div className="mt-sm">
          <ImageUploader
            value={null}
            onChange={(url) => {
              if (url) onChange([...galeria, url]);
              setAgregando(false);
            }}
            label="Nueva foto de galería"
            alto="h-32"
          />
        </div>
      )}
    </div>
  );
}
