"use client";

import { useEffect, useState } from "react";
import { Menu, MessageCircle, ShoppingBag, X } from "lucide-react";
import { genericWhatsAppUrl } from "@/config/restaurant";
import { useCart } from "@/lib/cart";
import { useI18n } from "@/lib/i18n";
import { useBodyScrollLock } from "@/lib/useBodyScrollLock";
import { LogoMark, Wordmark } from "@/components/ui";

const navItems = [
  { href: "#accueil", key: "nav.home" as const },
  { href: "#carte", key: "nav.menu" as const },
  { href: "#apropos", key: "nav.about" as const },
  { href: "#contact", key: "nav.contact" as const },
];

export default function Header() {
  const { t, lang, setLang } = useI18n();
  const { count, setDrawerOpen } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const waUrl = genericWhatsAppUrl();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Bloque le scroll du body quand le menu mobile est ouvert
  // (compteur partagé : ne débloque pas si un autre panneau est ouvert).
  useBodyScrollLock(open);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 transition-shadow ${
        scrolled || open
          ? "bg-cream-100/95 shadow-soft backdrop-blur-md"
          : "bg-cream-100/80 backdrop-blur-sm"
      }`}
    >
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:start-3 focus:top-3 focus:z-50 focus:rounded-full focus:bg-clay-600 focus:px-4 focus:py-2 focus:text-sm focus:font-bold focus:text-cream-50"
      >
        {t("skip.main")}
      </a>

      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-3 min-[360px]:px-4 sm:h-[72px] sm:px-6">
        {/* Wordmark */}
        <a href="#accueil" className="flex min-w-0 items-center gap-2 min-[360px]:gap-2.5" aria-label="Dar L'Walida — accueil">
          <LogoMark className="h-9 w-9 shrink-0 text-clay-600 min-[360px]:h-10 min-[360px]:w-10" />
          <Wordmark tone="dark" />
        </a>

        {/* Nav desktop */}
        <nav aria-label="Navigation principale" className="hidden items-center gap-1 lg:flex">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="rounded-full px-4 py-2 text-sm font-semibold text-cocoa-800 transition-colors hover:bg-cream-200 hover:text-clay-700"
            >
              {t(item.key)}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {/* Sélecteur de langue */}
          <button
            type="button"
            onClick={() => setLang(lang === "fr" ? "ar" : "fr")}
            className="hidden min-h-11 items-center rounded-full border border-cocoa-900/15 px-4 py-2 text-sm font-bold text-cocoa-800 transition-colors hover:border-clay-600 hover:text-clay-700 sm:inline-flex"
            aria-label={t("lang.switch")}
          >
            {t("lang.label")}
          </button>

          {/* Panier */}
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            aria-label={t("cart.open")}
            aria-haspopup="dialog"
            className="relative inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border border-cocoa-900/15 bg-cream-50 text-cocoa-900 transition-colors hover:border-clay-600 hover:text-clay-700"
          >
            <ShoppingBag className="h-5 w-5" aria-hidden="true" />
            {count > 0 && (
              <span
                aria-live="polite"
                className="absolute -end-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-clay-600 px-1 text-[11px] font-extrabold text-cream-50"
              >
                {count > 99 ? "99+" : count}
              </span>
            )}
          </button>

          {/* CTA principal (desktop) : ouvre la commande si le panier contient des plats,
              sinon une conversation WhatsApp générique. */}
          {count > 0 ? (
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              className="hidden min-h-11 items-center gap-2 rounded-full bg-clay-600 px-5 py-2.5 text-sm font-bold text-cream-50 shadow-soft transition-colors hover:bg-clay-700 md:inline-flex"
            >
              <MessageCircle className="h-4 w-4" aria-hidden="true" />
              {t("cta.order")}
            </button>
          ) : (
            waUrl && (
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden min-h-11 items-center gap-2 rounded-full bg-clay-600 px-5 py-2.5 text-sm font-bold text-cream-50 shadow-soft transition-colors hover:bg-clay-700 md:inline-flex"
              >
                <MessageCircle className="h-4 w-4" aria-hidden="true" />
                {t("cta.order")}
              </a>
            )
          )}

          {/* Burger mobile */}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? t("menu.close") : t("menu.open")}
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border border-cocoa-900/15 bg-cream-50 text-cocoa-900 lg:hidden"
          >
            {open ? (
              <X className="h-5 w-5" aria-hidden="true" />
            ) : (
              <Menu className="h-5 w-5" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {/* Panneau mobile */}
      {open && (
        <div
          id="mobile-nav"
          className="animate-fade-up border-t border-cocoa-900/10 bg-cream-100/98 px-4 pb-6 pt-3 lg:hidden"
        >
          <nav aria-label="Navigation mobile" className="flex flex-col">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="rounded-xl px-3 py-3.5 text-base font-semibold text-cocoa-900 hover:bg-cream-200"
              >
                {t(item.key)}
              </a>
            ))}
          </nav>
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              setLang(lang === "fr" ? "ar" : "fr");
            }}
            className="mt-1 w-full rounded-xl px-3 py-3.5 text-start text-base font-semibold text-cocoa-900 hover:bg-cream-200"
          >
            {t("lang.label")}
          </button>
          {count > 0 ? (
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                setDrawerOpen(true);
              }}
              className="mt-3 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-clay-600 px-5 py-3 text-base font-bold text-cream-50 shadow-soft"
            >
              <MessageCircle className="h-5 w-5" aria-hidden="true" />
              {t("cta.order")} ({count})
            </button>
          ) : (
            waUrl && (
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-clay-600 px-5 py-3 text-base font-bold text-cream-50 shadow-soft"
              >
                <MessageCircle className="h-5 w-5" aria-hidden="true" />
                {t("cta.order")}
              </a>
            )
          )}
        </div>
      )}
    </header>
  );
}
