import type { Metadata } from "next";
import { Plus_Jakarta_Sans, DM_Sans } from "next/font/google";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-jakarta",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-dm-sans",
});

export const metadata: Metadata = {
  title: "OppaStore | K-Beauty & Kawaii en Ayacucho",
  description:
    "Tendencias asiáticas en Ayacucho: skincare coreano, snacks, peluches kawaii y más. Pide fácil por WhatsApp.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${jakarta.variable} ${dmSans.variable}`}>
      <body>{children}</body>
    </html>
  );
}
