"use client";

import Image from "next/image";
import { CalendarDays, Minus, Plus } from "lucide-react";
import { assets } from "@/config/assets";
import { formatMAD } from "@/config/restaurant";
import { isAvailableOn, weekdayNames } from "@/data/menu";
import type { MenuItem } from "@/data/menu";
import { useCart } from "@/lib/cart";
import { useI18n } from "@/lib/i18n";

export default function MenuCard({ item, categoryLabel }: { item: MenuItem; categoryLabel?: string }) {
  const { t, lang } = useI18n();
  const { add, increase, decrease, qtyOf, today } = useCart();
  const qty = qtyOf(item.id);
  const photo = item.photo ? assets[item.photo] : null;
  const name = lang === "ar" ? item.nameAr : item.nameFr;
  const secondary = lang === "ar" ? item.nameFr : item.nameAr;
  const available = isAvailableOn(item, today);
  const days = item.availableDays?.map((d) => weekdayNames[lang][d]).join(", ");

  return (
    <article
      className={`flex gap-3.5 rounded-xl border bg-cream-50 p-3 shadow-soft transition-shadow sm:gap-4 sm:p-4 ${
        available ? "border-cocoa-900/10 hover:shadow-lift" : "border-cocoa-900/10 opacity-75"
      }`}
    >
      {photo && (
        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-cream-200 sm:h-24 sm:w-24 md:h-28 md:w-28">
          <Image
            src={photo.src}
            alt={lang === "ar" ? photo.altAr : photo.altFr}
            fill
            sizes="112px"
            className="object-cover"
          />
          {photo.isConceptual && (
            <span className="absolute inset-x-1 bottom-1 rounded bg-cocoa-950/70 px-1 py-0.5 text-center text-[9px] font-bold uppercase tracking-wider text-cream-100">
              {t("menu.photoIllustration")}
            </span>
          )}
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        {categoryLabel && (
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-clay-600">{categoryLabel}</p>
        )}
        <h3 className="break-words font-display text-[16px] font-semibold leading-snug text-cocoa-900 sm:text-[17px]">{name}</h3>
        <p
          className="mt-0.5 truncate text-[12px] sm:text-[13px] text-cocoa-600/75"
          lang={lang === "ar" ? "fr" : "ar"}
          dir={lang === "ar" ? "ltr" : "rtl"}
        >
          {secondary}
        </p>

        {days && (
          <p
            className={`mt-2 inline-flex w-fit items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-bold sm:px-2.5 sm:py-1 sm:text-[11px] ${
              available && today !== null
                ? "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-700/20"
                : "bg-gold-200/40 text-cocoa-700 ring-1 ring-gold-500/40"
            }`}
          >
            <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
            {t("menu.daily.servedOn", { day: days })}
            {today !== null && (available ? ` · ${t("menu.daily.today")}` : ` · ${t("menu.daily.unavailable")}`)}
          </p>
        )}

        <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-3">
          <p className="font-display text-lg font-bold tabular-nums text-clay-700 sm:text-xl" dir="ltr">
            {formatMAD(item.priceMAD)}
          </p>

          {!available ? (
            <span className="inline-flex min-h-10 items-center rounded-full border border-cocoa-900/15 px-3 text-[11px] font-bold text-cocoa-600/80 sm:min-h-11 sm:px-4 sm:text-xs">
              {t("menu.daily.unavailable")}
            </span>
          ) : qty === 0 ? (
            <button
              type="button"
              onClick={() => add(item.id)}
              aria-label={t("aria.add", { name })}
              className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-full bg-clay-600 px-3.5 py-1.5 text-xs font-bold text-cream-50 transition-colors hover:bg-clay-700 active:bg-clay-800 sm:min-h-11 sm:px-5 sm:text-sm"
            >
              <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" aria-hidden="true" />
              {t("menu.add")}
            </button>
          ) : (
            <div
              className="flex items-center gap-1 rounded-full border border-clay-600/40 bg-cream-100 p-0.5 sm:p-1"
              role="group"
              aria-label={t("aria.quantity", { name })}
            >
              <button
                type="button"
                onClick={() => decrease(item.id)}
                aria-label={t("aria.decrease", { name })}
                className="inline-flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full text-cocoa-900 transition-colors hover:bg-clay-100"
              >
                <Minus className="h-3.5 w-3.5 sm:h-4 sm:w-4" aria-hidden="true" />
              </button>
              <span aria-live="polite" className="min-w-5 sm:min-w-6 text-center text-sm sm:text-base font-extrabold tabular-nums">
                {qty}
              </span>
              <button
                type="button"
                onClick={() => increase(item.id)}
                aria-label={t("aria.increase", { name })}
                className="inline-flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-clay-600 text-cream-50 transition-colors hover:bg-clay-700"
              >
                <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" aria-hidden="true" />
              </button>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
