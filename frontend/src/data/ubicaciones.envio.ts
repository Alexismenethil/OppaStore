export interface UbicacionEnvio {
  provincia: string;
  distritos: string[];
}

export const UBICACIONES_ENVIO: UbicacionEnvio[] = [
  { provincia: "Amazonas", distritos: ["Chachapoyas", "Bagua", "Utcubamba"] },
  { provincia: "Áncash", distritos: ["Huaraz", "Chimbote", "Nuevo Chimbote"] },
  { provincia: "Apurímac", distritos: ["Abancay", "Andahuaylas", "Talavera"] },
  { provincia: "Arequipa", distritos: ["Arequipa", "Cayma", "Cerro Colorado", "José Luis Bustamante", "Socabaya"] },
  {
    provincia: "Ayacucho",
    distritos: ["Ayacucho", "Andrés Avelino Cáceres", "Carmen Alto", "Jesús Nazareno", "San Juan Bautista"],
  },
  { provincia: "Cajamarca", distritos: ["Cajamarca", "Baños del Inca", "Jaén"] },
  { provincia: "Callao", distritos: ["Callao", "Bellavista", "La Perla", "Ventanilla"] },
  { provincia: "Cusco", distritos: ["Cusco", "San Jerónimo", "San Sebastián", "Santiago", "Wanchaq"] },
  { provincia: "Huancavelica", distritos: ["Huancavelica", "Ascensión"] },
  { provincia: "Huánuco", distritos: ["Huánuco", "Amarilis", "Pillco Marca", "Tingo María"] },
  { provincia: "Ica", distritos: ["Ica", "Chincha Alta", "Nazca", "Pisco"] },
  { provincia: "Junín", distritos: ["Huancayo", "El Tambo", "Chilca", "Tarma"] },
  { provincia: "La Libertad", distritos: ["Trujillo", "El Porvenir", "La Esperanza", "Víctor Larco Herrera"] },
  { provincia: "Lambayeque", distritos: ["Chiclayo", "José Leonardo Ortiz", "La Victoria"] },
  {
    provincia: "Lima",
    distritos: [
      "Ate",
      "Cercado de Lima",
      "Comas",
      "La Molina",
      "Lince",
      "Los Olivos",
      "Miraflores",
      "San Borja",
      "San Isidro",
      "San Juan de Lurigancho",
      "Santiago de Surco",
      "Villa El Salvador",
    ],
  },
  { provincia: "Loreto", distritos: ["Iquitos", "Belén", "Punchana", "San Juan Bautista"] },
  { provincia: "Madre de Dios", distritos: ["Tambopata", "Puerto Maldonado"] },
  { provincia: "Moquegua", distritos: ["Moquegua", "Ilo"] },
  { provincia: "Pasco", distritos: ["Chaupimarca", "Yanacancha"] },
  { provincia: "Piura", distritos: ["Piura", "Castilla", "Paita", "Sullana", "Talara"] },
  { provincia: "Puno", distritos: ["Puno", "Juliaca"] },
  { provincia: "San Martín", distritos: ["Tarapoto", "Moyobamba", "Rioja"] },
  { provincia: "Tacna", distritos: ["Tacna", "Alto de la Alianza", "Gregorio Albarracín"] },
  { provincia: "Tumbes", distritos: ["Tumbes", "Zarumilla"] },
  { provincia: "Ucayali", distritos: ["Pucallpa", "Callería", "Manantay", "Yarinacocha"] },
];

export const PROVINCIAS_ENVIO = UBICACIONES_ENVIO.map((ubicacion) => ubicacion.provincia);

export function normalizarBusqueda(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export function filtrarOpciones(opciones: string[], busqueda: string, limite = 7): string[] {
  const query = normalizarBusqueda(busqueda);
  if (!query) return opciones.slice(0, limite);

  return opciones
    .filter((opcion) => normalizarBusqueda(opcion).includes(query))
    .sort((a, b) => {
      const aNorm = normalizarBusqueda(a);
      const bNorm = normalizarBusqueda(b);
      const aEmpieza = aNorm.startsWith(query);
      const bEmpieza = bNorm.startsWith(query);
      if (aEmpieza !== bEmpieza) return aEmpieza ? -1 : 1;
      return a.localeCompare(b, "es");
    })
    .slice(0, limite);
}

export function esProvinciaValida(provincia?: string): boolean {
  if (!provincia) return false;
  const buscada = normalizarBusqueda(provincia);
  return PROVINCIAS_ENVIO.some((opcion) => normalizarBusqueda(opcion) === buscada);
}

export function distritosDeProvincia(provincia?: string): string[] {
  if (!provincia) return [];
  const buscada = normalizarBusqueda(provincia);
  return UBICACIONES_ENVIO.find((ubicacion) => normalizarBusqueda(ubicacion.provincia) === buscada)?.distritos ?? [];
}

export function esDistritoValido(provincia?: string, distrito?: string): boolean {
  if (!distrito) return false;
  const buscado = normalizarBusqueda(distrito);
  return distritosDeProvincia(provincia).some((opcion) => normalizarBusqueda(opcion) === buscado);
}
