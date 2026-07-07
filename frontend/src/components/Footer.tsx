import { Wallet } from "lucide-react";

/** Pie de página con datos del negocio y medios de pago (RF10, RB12). */
export function Footer() {
  return (
    <footer id="contacto" className="mt-xl border-t border-outline-variant bg-surface-container-lowest">
      <div className="mx-auto grid max-w-container-max grid-cols-1 gap-lg px-gutter py-xl md:grid-cols-4">
        <div>
          <div className="mb-4 font-heading text-headline-md text-primary">OppaStore</div>
          <p className="text-body-md text-on-surface-variant">
            Traemos lo mejor de la cultura asiática directamente a Ayacucho. Belleza, snacks &amp;
            food y ternura en un solo lugar.
          </p>
        </div>
        <div>
          <h5 className="mb-md font-body text-label-lg text-primary">Tienda</h5>
          <ul className="space-y-sm text-on-surface-variant">
            <li>Catálogo</li>
            <li>Drops</li>
            <li>Novedades</li>
          </ul>
        </div>
        <div>
          <h5 className="mb-md font-body text-label-lg text-primary">Ayuda</h5>
          <ul className="space-y-sm text-on-surface-variant">
            <li>Cómo comprar</li>
            <li>Contacto</li>
            <li>Envíos en Ayacucho</li>
          </ul>
        </div>
        <div>
          <h5 className="mb-md font-body text-label-lg text-primary">Ubicación</h5>
          <p className="mb-md text-on-surface-variant">
            Ayacucho, Perú
            <br />
            Atención online
          </p>
          <div className="flex items-center gap-sm rounded-md bg-primary-container p-sm text-on-primary-container">
            <Wallet size={18} />
            <span className="text-body-sm">Aceptamos Yape, Plin y Efectivo</span>
          </div>
        </div>
      </div>
      <div className="border-t border-outline-variant py-md text-center text-body-sm text-on-surface-variant">
        © {new Date().getFullYear()} OppaStore. Inspiración coreana en Ayacucho.
      </div>
    </footer>
  );
}
