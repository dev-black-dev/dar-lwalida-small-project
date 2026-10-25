"use client";

import { MapPin, MessageCircle, Phone } from "lucide-react";
import {
  genericWhatsAppUrl,
  mapsDirectionsUrl,
  restaurant,
  restaurantTelHref,
} from "@/config/restaurant";
import { useI18n } from "@/lib/i18n";
import { LogoMark, Wordmark } from "@/components/ui";

const nav = [
  { href: "#accueil", key: "nav.home" as const },
  { href: "#carte", key: "nav.menu" as const },
  { href: "#apropos", key: "nav.about" as const },
  { href: "#contact", key: "nav.contact" as const },
];

export default function Footer() {
  const { t } = useI18n();
  const waUrl = genericWhatsAppUrl();
  const year = new Date().getFullYear();

  return (
    <footer className="bg-cocoa-950 pb-20 pt-14 text-cream-200 lg:pb-0">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid gap-10 border-b border-cream-100/10 pb-10 md:grid-cols-3">
          <div>
            <div className="flex items-center gap-3">
              <LogoMark className="h-11 w-11 text-gold-400" />
              <Wordmark tone="light" />
            </div>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-cream-200/70">
              {t("footer.tagline")}
            </p>
            <p dir="rtl" lang="ar" className="mt-2 text-lg font-bold text-gold-300">
              {restaurant.taglineAr}
            </p>
            <a
              href={restaurant.instagram.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${t("footer.instagram")} ${restaurant.instagram.handle}`}
              className="mt-5 inline-flex h-11 w-11 items-center justify-center rounded-full border border-cream-100/20 text-cream-100/80 transition-colors hover:border-gold-300 hover:text-gold-300"
            >
              <InstagramIcon />
            </a>
          </div>

          <nav aria-label={t("footer.nav")} className="md:justify-self-center">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-gold-300/90">
              {t("footer.nav")}
            </p>
            <ul className="mt-4 space-y-2.5">
              {nav.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    className="text-sm font-semibold text-cream-100/85 transition-colors hover:text-gold-300"
                  >
                    {t(item.key)}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="md:justify-self-end">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-gold-300/90">
              {t("footer.contact")}
            </p>
            <ul className="mt-4 space-y-3 text-sm">
              <li className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold-400" aria-hidden="true" />
                <a
                  href={mapsDirectionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-cream-100/85 hover:text-gold-300"
                >
                  {restaurant.address.full}
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-gold-400" aria-hidden="true" />
                <a
                  href={restaurantTelHref}
                  dir="ltr"
                  className="font-semibold text-cream-100/85 hover:text-gold-300"
                >
                  {restaurant.phoneDisplay}
                </a>
              </li>
              {waUrl && (
                <li>
                  <a
                    href={waUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-11 items-center gap-2 rounded-full bg-clay-600 px-5 py-2.5 text-sm font-bold text-cream-50 transition-colors hover:bg-clay-500"
                  >
                    <MessageCircle className="h-4 w-4" aria-hidden="true" />
                    {t("contact.order")}
                  </a>
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-3 py-6 text-center text-xs text-cream-200/50 md:flex-row md:items-start md:text-start">
          <p>
            © {year} {restaurant.brand}. {t("footer.rights")}
          </p>
          {restaurant.isDemo ? (
            <p className="max-w-md leading-relaxed">{t("footer.demo")}</p>
          ) : null}
        </div>

        <p className="border-t border-cream-100/5 py-5 text-center text-[11px] tracking-[0.12em] text-cream-200/35">
          {restaurant.credit}
        </p>
      </div>
    </footer>
  );
}

/** Glyphe Instagram (lucide ne l'exporte pas dans cette version). */
function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
      <rect x="3.5" y="3.5" width="17" height="17" rx="5" stroke="currentColor" strokeWidth="1.7" />
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.7" />
      <circle cx="17.2" cy="6.8" r="1" fill="currentColor" />
    </svg>
  );
}
