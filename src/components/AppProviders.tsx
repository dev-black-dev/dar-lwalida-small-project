"use client";

import type { ReactNode } from "react";
import { Check, ShoppingBag } from "lucide-react";
import { formatMAD } from "@/config/restaurant";
import { menuItemsById } from "@/data/menu";
import { CartProvider, useCart } from "@/lib/cart";
import { LangProvider, useI18n } from "@/lib/i18n";

/** Toast discret « plat ajouté » (annoncé aux lecteurs d'écran). */
function Toast() {
  const { toastItemId } = useCart();
  const { t, lang } = useI18n();
  const item = toastItemId ? menuItemsById[toastItemId] : null;
  return (
    <div aria-live="polite" className="pointer-events-none fixed inset-x-0 top-20 z-[45] flex justify-center px-4 sm:top-24">
      {item ? (
        <p className="animate-toast flex max-w-full items-center gap-2 rounded-full bg-cocoa-950/95 px-5 py-3 text-sm font-bold text-cream-50 shadow-lift">
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-600">
            <Check className="h-3 w-3" aria-hidden="true" />
          </span>
          <span className="truncate">
            {lang === "ar" ? item.nameAr : item.nameFr} — {t("toast.added")}
          </span>
        </p>
      ) : null}
    </div>
  );
}

/** Barre de commande collante (mobile/tablette) : nombre d'articles + sous-total. */
function MobileCartBar() {
  const { count, subtotal, drawerOpen, checkoutOpen, setDrawerOpen } = useCart();
  const { t } = useI18n();
  if (count === 0 || drawerOpen || checkoutOpen) return null;
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2 lg:hidden">
      <button
        type="button"
        onClick={() => setDrawerOpen(true)}
        className="animate-toast flex min-h-14 w-full items-center justify-between gap-3 rounded-full bg-clay-600 px-5 text-cream-50 shadow-lift transition-colors hover:bg-clay-700"
      >
        <span className="flex items-center gap-2.5 text-sm font-bold">
          <span className="relative">
            <ShoppingBag className="h-5 w-5" aria-hidden="true" />
            <span className="absolute -end-2 -top-2 inline-flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-cream-50 px-1 text-[10px] font-extrabold text-clay-700">
              {count}
            </span>
          </span>
          {t("cart.view")}
        </span>
        <span className="font-display text-lg font-bold tabular-nums" dir="ltr">
          {formatMAD(subtotal)}
        </span>
      </button>
    </div>
  );
}

export default function AppProviders({ children }: { children: ReactNode }) {
  return (
    <LangProvider>
      <CartProvider>
        {children}
        <Toast />
        <MobileCartBar />
      </CartProvider>
    </LangProvider>
  );
}
