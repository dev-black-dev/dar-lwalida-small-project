"use client";

import { useRef } from "react";
import Image from "next/image";
import { AlertTriangle, Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { assets } from "@/config/assets";
import { formatMAD } from "@/config/restaurant";
import { menuSettings } from "@/data/menu";
import { useCart } from "@/lib/cart";
import { useI18n } from "@/lib/i18n";
import { EmptyTajine, Star } from "@/components/ui";
import { useBodyScrollLock } from "@/lib/useBodyScrollLock";
import { useFocusTrap } from "@/lib/useFocusTrap";

export default function CartDrawer() {
  const { t, lang } = useI18n();
  const {
    lines,
    count,
    subtotal,
    hasUnavailable,
    increase,
    decrease,
    remove,
    clear,
    drawerOpen,
    setDrawerOpen,
    setCheckoutOpen,
  } = useCart();
  const panelRef = useRef<HTMLDivElement>(null);

  useFocusTrap(panelRef, drawerOpen, () => setDrawerOpen(false));

  // Verrouille le défilement de la page tant que le tiroir est ouvert
  // (compteur partagé avec le menu mobile et la modale de commande).
  useBodyScrollLock(drawerOpen);

  const isEmpty = lines.length === 0;

  return (
    <div
      className={`fixed inset-0 z-50 ${drawerOpen ? "" : "pointer-events-none"}`}
      aria-hidden={!drawerOpen}
      inert={!drawerOpen}
    >
      <div
        onClick={() => setDrawerOpen(false)}
        className={`absolute inset-0 bg-cocoa-950/55 transition-opacity duration-300 ${drawerOpen ? "opacity-100" : "opacity-0"}`}
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-title"
        tabIndex={-1}
        data-open={drawerOpen}
        className="drawer-panel absolute inset-y-0 end-0 flex w-full max-w-md flex-col bg-cream-50 shadow-lift outline-none"
      >
        <header className="flex items-center justify-between border-b border-cocoa-900/10 bg-cream-100 px-5 py-4">
          <h2 id="cart-title" className="flex items-center gap-2 font-display text-xl text-cocoa-900">
            <ShoppingBag className="h-5 w-5 text-clay-600" aria-hidden="true" />
            {t("cart.title")}
            {count > 0 && (
              <span className="rounded-full bg-clay-600 px-2.5 py-0.5 font-sans text-xs font-extrabold text-cream-50">
                {count}
              </span>
            )}
          </h2>
          <button
            type="button"
            onClick={() => setDrawerOpen(false)}
            aria-label={t("cart.close")}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full text-cocoa-800 transition-colors hover:bg-cream-200"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </header>

        {isEmpty ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center">
            <EmptyTajine className="h-28 w-40" />
            <div>
              <p className="font-display text-xl text-cocoa-900">{t("cart.empty.title")}</p>
              <p className="mt-1 text-sm text-cocoa-700/80">{t("cart.empty.text")}</p>
            </div>
            <a
              href="#carte"
              onClick={() => setDrawerOpen(false)}
              className="inline-flex min-h-11 items-center justify-center rounded-full bg-clay-600 px-6 text-sm font-bold text-cream-50 transition-colors hover:bg-clay-700"
            >
              {t("cart.browse")}
            </a>
          </div>
        ) : (
          <>
            <ul className="flex-1 divide-y divide-cocoa-900/10 overflow-y-auto px-5">
              {lines.map(({ item, qty, lineTotal, availableToday }) => {
                const photo = item.photo ? assets[item.photo] : null;
                const name = lang === "ar" ? item.nameAr : item.nameFr;
                return (
                  <li key={item.id} className="flex gap-3 py-4">
                    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-cream-200">
                      {photo ? (
                        <Image src={photo.src} alt="" fill sizes="56px" className="object-cover" />
                      ) : (
                        <div className="zellige-light flex h-full w-full items-center justify-center">
                          <Star className="h-6 w-6 text-clay-400/70" />
                        </div>
                      )}
                    </div>

                    <div className="flex min-w-0 flex-1 flex-col">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-bold leading-snug text-cocoa-900">{name}</p>
                        <button
                          type="button"
                          onClick={() => remove(item.id)}
                          aria-label={t("aria.remove", { name })}
                          className="-me-2 -mt-1.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-cocoa-600/70 transition-colors hover:bg-clay-100 hover:text-clay-700"
                        >
                          <Trash2 className="h-4 w-4" aria-hidden="true" />
                        </button>
                      </div>
                      <p className="text-xs text-cocoa-700/75" dir="ltr">
                        <span dir="auto">{formatMAD(item.priceMAD)}</span> · {t("cart.each")}
                      </p>
                      {!availableToday && (
                        <p className="mt-1 flex items-center gap-1 text-xs font-bold text-clay-700">
                          <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />
                          {t("cart.unavailableLine")}
                        </p>
                      )}

                      <div className="mt-2 flex items-center justify-between">
                        <div
                          className="flex items-center gap-0.5 rounded-full border border-clay-600/35 bg-cream-100 p-0.5"
                          role="group"
                          aria-label={t("aria.quantity", { name })}
                        >
                          <button
                            type="button"
                            onClick={() => decrease(item.id)}
                            aria-label={t("aria.decrease", { name })}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-cocoa-900 hover:bg-clay-100"
                          >
                            <Minus className="h-3.5 w-3.5" aria-hidden="true" />
                          </button>
                          <span className="min-w-6 text-center text-sm font-extrabold tabular-nums">{qty}</span>
                          <button
                            type="button"
                            onClick={() => increase(item.id)}
                            aria-label={t("aria.increase", { name })}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-clay-600 text-cream-50 hover:bg-clay-700"
                          >
                            <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                          </button>
                        </div>
                        <p className="text-sm font-extrabold tabular-nums text-cocoa-900" dir="ltr">
                          {formatMAD(lineTotal)}
                        </p>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>

            <footer className="space-y-3 border-t border-cocoa-900/10 bg-cream-100 px-5 py-4">
              <div className="flex items-baseline justify-between gap-3">
                <p className="text-sm font-bold uppercase tracking-wider text-cocoa-700">
                  {t("cart.subtotal")}
                  {menuSettings.pricesProvisional && (
                    <span className="ms-2 text-[11px] font-semibold normal-case tracking-normal text-cocoa-600/70">
                      ({t("cart.provisional")})
                    </span>
                  )}
                </p>
                <p className="font-display text-2xl font-bold tabular-nums text-clay-700" dir="ltr">
                  {formatMAD(subtotal)}
                </p>
              </div>
              <p className="text-xs leading-relaxed text-cocoa-700/75">{t("cart.disclaimer")}</p>

              {hasUnavailable && (
                <p role="alert" className="flex items-start gap-2 rounded-lg bg-clay-100 px-3 py-2 text-xs font-bold text-clay-800">
                  <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  {t("cart.unavailableBlock")}
                </p>
              )}

              <button
                type="button"
                disabled={hasUnavailable}
                onClick={() => {
                  setDrawerOpen(false);
                  setCheckoutOpen(true);
                }}
                className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-clay-600 px-6 text-base font-bold text-cream-50 shadow-soft transition-colors hover:bg-clay-700 disabled:cursor-not-allowed disabled:bg-cocoa-600/40"
              >
                {t("cart.checkout")}
              </button>
              <button
                type="button"
                onClick={clear}
                className="mx-auto flex min-h-10 items-center justify-center gap-1.5 rounded-full px-4 text-sm font-semibold text-cocoa-600/80 transition-colors hover:text-clay-700"
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
                {t("cart.clear")}
              </button>
            </footer>
          </>
        )}
      </div>
    </div>
  );
}
