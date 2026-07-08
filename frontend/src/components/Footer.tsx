import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowUpRight, MapPin, MessageCircle, Wallet } from "lucide-react";
import { WHATSAPP_NUMERO } from "@/lib/config";
import { normalizarNumero } from "@/domain/whatsapp";

const tienda = [
  { label: "Catálogo", href: "/catalogo" },
  { label: "Favoritos", href: "/favoritos" },
];

const ayuda = [
  { label: "Cómo comprar", href: "/#contacto" },
  { label: "Contacto", href: "#contacto" },
  { label: "Envíos en Ayacucho", href: "#contacto" },
];

function FooterLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <li>
      <Link
        href={href}
        className="group inline-flex items-center gap-xs text-on-surface-variant transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:translate-x-1 hover:text-primary"
      >
        <span>{children}</span>
        <ArrowUpRight
          size={13}
          className="opacity-0 transition-all duration-300 group-hover:translate-x-0.5 group-hover:opacity-100"
        />
      </Link>
    </li>
  );
}

/** Pie de página con datos del negocio y medios de pago (RF10, RB12). */
export function Footer() {
  const whatsappHref = `https://wa.me/${normalizarNumero(WHATSAPP_NUMERO)}`;

  return (
    <footer
      id="contacto"
      className="relative mt-xl overflow-hidden border-t border-outline-variant/70 bg-surface-container-lowest"
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/45 to-transparent" />
      <div className="pointer-events-none absolute -right-20 -top-28 h-56 w-56 rounded-full bg-primary-container/35 blur-3xl" />

      <div className="mx-auto grid max-w-container-max grid-cols-1 gap-lg px-gutter py-xl md:grid-cols-4">
        <div>
          <Link
            href="/"
            className="group mb-4 inline-flex font-heading text-headline-md text-primary transition-transform duration-300 hover:-translate-y-0.5"
          >
            OppaStore
            <span className="ml-xs mt-1 h-2 w-2 rounded-full bg-primary-fixed-dim opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          </Link>
          <p className="max-w-sm text-body-md text-on-surface-variant">
            Traemos lo mejor de la cultura asiática directamente a Ayacucho. Belleza, snacks &amp;
            food y ternura en un solo lugar.
          </p>
          <a
            href={whatsappHref}
            target="_blank"
            rel="noreferrer"
            className="group mt-md inline-flex items-center gap-sm rounded-full bg-primary px-md py-sm font-body text-label-lg text-on-primary shadow-[0_12px_30px_rgba(47,106,63,0.16)] transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-0.5 hover:shadow-[0_18px_42px_rgba(47,106,63,0.22)] active:scale-95"
          >
            <MessageCircle size={16} className="transition-transform duration-300 group-hover:scale-110" />
            WhatsApp
          </a>
        </div>

        <div>
          <h5 className="mb-md font-body text-label-lg text-primary">Tienda</h5>
          <ul className="space-y-sm">
            {tienda.map((item) => (
              <FooterLink key={item.label} href={item.href}>
                {item.label}
              </FooterLink>
            ))}
          </ul>
        </div>

        <div>
          <h5 className="mb-md font-body text-label-lg text-primary">Ayuda</h5>
          <ul className="space-y-sm">
            {ayuda.map((item) => (
              <FooterLink key={item.label} href={item.href}>
                {item.label}
              </FooterLink>
            ))}
          </ul>
        </div>

        <div>
          <h5 className="mb-md font-body text-label-lg text-primary">Ubicación</h5>
          <p className="mb-md flex items-start gap-xs text-on-surface-variant">
            <MapPin size={18} className="mt-1 shrink-0 text-primary" />
            <span>
              Ayacucho, Perú
              <br />
              Atención online
            </span>
          </p>
          <div className="group flex items-center gap-sm rounded-md bg-primary-container p-sm text-on-primary-container transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-0.5 hover:shadow-[0_14px_34px_rgba(47,106,63,0.12)]">
            <Wallet size={18} className="transition-transform duration-300 group-hover:rotate-[-8deg] group-hover:scale-110" />
            <span className="text-body-sm">Aceptamos Yape, Plin y Efectivo</span>
          </div>
        </div>
      </div>

      <div className="border-t border-outline-variant/70 py-md text-center text-body-sm text-on-surface-variant">
        © {new Date().getFullYear()} OppaStore. Inspiración coreana en Ayacucho.
      </div>
    </footer>
  );
}
