"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowUpRight, MapPin, MessageCircle, Wallet } from "lucide-react";
import { useSiteConfig } from "@/features/config/ConfigContext";
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

/** Pie de página con datos del negocio, medios de pago y redes (RF10, RB12). */
export function Footer() {
  const { config } = useSiteConfig();
  const whatsappHref = config.whatsapp ? `https://wa.me/${normalizarNumero(config.whatsapp)}` : "#";

  const redes = [
    config.instagram && { label: "Instagram", href: config.instagram, icono: <InstagramIcon /> },
    config.facebook && { label: "Facebook", href: config.facebook, icono: <FacebookIcon /> },
    config.tiktok && { label: "TikTok", href: config.tiktok, icono: <TikTokIcon /> },
    config.whatsapp && { label: "WhatsApp", href: whatsappHref, icono: <WhatsAppIcon /> },
    config.email && { label: "Correo", href: `mailto:${config.email}`, icono: <GmailIcon /> },
  ].filter(Boolean) as { label: string; href: string; icono: ReactNode }[];

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
          {config.whatsapp && (
            <a
              href={whatsappHref}
              target="_blank"
              rel="noreferrer"
              className="group mt-md inline-flex items-center gap-sm rounded-full bg-primary px-md py-sm font-body text-label-lg text-on-primary shadow-[0_12px_30px_rgba(47,106,63,0.16)] transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-0.5 hover:shadow-[0_18px_42px_rgba(47,106,63,0.22)] active:scale-95"
            >
              <MessageCircle size={16} className="transition-transform duration-300 group-hover:scale-110" />
              WhatsApp
            </a>
          )}

          {redes.length > 0 && (
            <div className="mt-md flex flex-wrap items-center gap-xs">
              {redes.map((r) => (
                <a
                  key={r.label}
                  href={r.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={r.label}
                  title={r.label}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-outline-variant/70 bg-surface-container-lowest text-on-surface-variant transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-0.5 hover:border-primary/40 hover:text-primary hover:shadow-[0_10px_24px_rgba(47,106,63,0.12)]"
                >
                  {r.icono}
                </a>
              ))}
            </div>
          )}
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
            <span>{config.direccion ?? "Ayacucho, Perú"}</span>
          </p>
          {config.email && (
            <a
              href={`mailto:${config.email}`}
              className="mb-md inline-flex items-center gap-xs text-body-sm text-on-surface-variant transition-colors hover:text-primary"
            >
              <GmailIcon /> {config.email}
            </a>
          )}
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

// ── Íconos de marca (SVG inline, sin dependencias) ──────────────────────────
function InstagramIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  );
}
function FacebookIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M14 9h3V5.5h-3c-2.2 0-3.5 1.4-3.5 3.6V11H8v3.4h2.5V22h3.4v-7.6H16l.5-3.4h-2.6V9.4c0-.3.2-.4.5-.4z" />
    </svg>
  );
}
function TikTokIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M16.5 3c.3 2 1.6 3.5 3.5 3.8V9.4c-1.4 0-2.7-.4-3.8-1.1v6.3c0 3.1-2.4 5.4-5.3 5.4S5.6 17.7 5.6 14.6c0-2.9 2.2-5.1 5-5.1.3 0 .5 0 .8.1v2.7c-.3-.1-.5-.1-.8-.1-1.4 0-2.4 1.1-2.4 2.4s1 2.4 2.4 2.4c1.4 0 2.5-1.1 2.5-2.5V3h2.8z" />
    </svg>
  );
}
function WhatsAppIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2a10 10 0 0 0-8.6 15l-1.3 4.7 4.8-1.3A10 10 0 1 0 12 2zm5.4 14.1c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .1-1.7-.1-.4-.1-.9-.3-1.6-.6-2.8-1.2-4.6-4-4.7-4.2-.1-.2-1.1-1.5-1.1-2.8 0-1.3.7-2 .9-2.2.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5.2.5.7 1.8.8 1.9.1.1.1.3 0 .5-.1.2-.2.4-.3.5l-.4.5c-.1.1-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.4 2.4 1.5.3.1.5.1.6-.1.2-.2.7-.8.9-1.1.2-.3.4-.2.6-.1.3.1 1.6.8 1.8.9.3.1.4.2.5.3.1.2.1.7-.1 1.2z" />
    </svg>
  );
}
function GmailIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <rect x="2.5" y="4.5" width="19" height="15" rx="2.5" />
      <path d="M3 6.5 12 13l9-6.5" />
    </svg>
  );
}
