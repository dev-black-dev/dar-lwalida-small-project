import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import JsonLd from "@/components/JsonLd";
import "./globals.css";

/*
 * Polices AUTO-HÉBERGÉES (src/fonts/*.woff2, fichiers Google Fonts).
 *
 * Pourquoi pas next/font/google : cette intégration dépendait d'une
 * résolution Turbopack fragile en dev (erreur récurrente
 * « next/font/google queries have exactly one entry » / module introuvable
 * "@vercel/turbopack-next/internal/font/google/font").
 * Avec next/font/local, plus aucune requête réseau vers Google Fonts
 * en dev, en build ou à l'exécution — et le même rendu visuel.
 *
 * Regénérer les fichiers : node scripts/fetch-fonts.mjs
 *
 * Manrope / Playfair Display / Caveat : fichiers variables (plage de graisses).
 * Amiri : fichiers statiques 400 & 700, sous-ensemble arabe.
 */

const playfair = localFont({
  src: [
    { path: "../fonts/playfair-display-latin-normal.woff2", weight: "500 700", style: "normal" },
    { path: "../fonts/playfair-display-latin-italic.woff2", weight: "500 700", style: "italic" },
  ],
  variable: "--font-playfair",
  display: "swap",
});

const manrope = localFont({
  src: "../fonts/manrope-latin-var.woff2",
  weight: "400 800",
  variable: "--font-manrope",
  display: "swap",
});

const caveat = localFont({
  src: "../fonts/caveat-latin-var.woff2",
  weight: "600 700",
  variable: "--font-caveat",
  display: "swap",
});

const amiri = localFont({
  src: [
    { path: "../fonts/amiri-arabic-400.woff2", weight: "400", style: "normal" },
    { path: "../fonts/amiri-arabic-700.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-amiri",
  display: "swap",
});

/*
 * URL publique du site (balises Open Graph / canonical).
 * Configurable sans toucher au code via NEXT_PUBLIC_SITE_URL
 * (ex. https://dar-lwalida.netlify.app ou le domaine définitif).
 * Repli : domaine prévu pour la production.
 */
const FALLBACK_SITE_URL = "https://dar-l-walida.com";

function resolveSiteUrl(): URL {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!raw) return new URL(FALLBACK_SITE_URL);
  try {
    const url = new URL(raw);
    if (url.protocol === "http:" || url.protocol === "https:") return url;
  } catch {
    /* valeur invalide → repli ci-dessous */
  }
  console.warn(
    `[config] NEXT_PUBLIC_SITE_URL invalide (« ${raw} ») : repli sur ${FALLBACK_SITE_URL}. ` +
      "La valeur doit inclure le protocole, ex. https://mon-site.netlify.app",
  );
  return new URL(FALLBACK_SITE_URL);
}

const siteUrl = resolveSiteUrl();

export const metadata: Metadata = {
  metadataBase: siteUrl,
  title: {
    default: "Dar L'Walida — Cuisine marocaine authentique à Rabat | Commande sur WhatsApp",
    template: "%s — Dar L'Walida",
  },
  description:
    "Dar L'Walida — Le goût du Maroc, comme à la maison. Cuisine marocaine traditionnelle à Rabat, 292 Avenue Mohammed V. Commandez via WhatsApp.",
  keywords: [
    "restaurant marocain Rabat",
    "cuisine marocaine",
    "tajine Rabat",
    "couscous Rabat",
    "Dar L'Walida",
  ],
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: siteUrl,
    siteName: "Dar L'Walida",
    title: "Dar L'Walida — Cuisine marocaine authentique à Rabat",
    description:
      "Dar L'Walida — Le goût du Maroc, comme à la maison. Cuisine marocaine à Rabat. Commande simple via WhatsApp.",
    images: [
      {
        url: "/assets/hero.jpg",
        width: 1600,
        height: 900,
        alt: "Dar L'Walida — restaurant de cuisine marocaine à Rabat",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Dar L'Walida — Cuisine marocaine authentique à Rabat",
    description:
      "Dar L'Walida — Le goût du Maroc, comme à la maison. Commande simple via WhatsApp.",
    images: ["/assets/hero.jpg"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: "#241610",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      dir="ltr"
      className={`${playfair.variable} ${manrope.variable} ${caveat.variable} ${amiri.variable}`}
    >
      <head>
        <link rel="icon" type="image/svg+xml" href="/icons/icon.svg" />
        <link rel="apple-touch-icon" href="/icons/icon.svg" />
      </head>
      <body className="antialiased">
        <JsonLd />
        {children}
      </body>
    </html>
  );
}
