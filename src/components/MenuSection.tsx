"use client";

import { useMemo, useRef, useState } from "react";
import Image from "next/image";
import { Info, Search, X } from "lucide-react";
import { assets } from "@/config/assets";
import { isAvailableOn, menu, menuSettings } from "@/data/menu";
import type { MenuCategory, MenuItem } from "@/data/menu";
import { useCart } from "@/lib/cart";
import { useI18n } from "@/lib/i18n";
import { categoriesOf, searchMenu } from "@/lib/search";
import { EmptyTajine, PatternBanner, SectionHeading } from "@/components/ui";
import MenuCard from "@/components/MenuCard";

export default function MenuSection() {
  const { t, lang } = useI18n();
  const { today } = useCart();
  const [activeId, setActiveId] = useState(menu[0].id);
  const [query, setQuery] = useState("");
  const [searchCat, setSearchCat] = useState<string>("all");
  const [hideUnavailable, setHideUnavailable] = useState<boolean>(menuSettings.hideUnavailableDailyDishes);
  const panelRef = useRef<HTMLDivElement>(null);

  /** Plats visibles d'une catégorie (masqués + option « plats non servis »). */
  const visibleItems = (cat: MenuCategory): MenuItem[] =>
    cat.items.filter((i) => {
      if (i.available === false) return false;
      if (hideUnavailable && i.availableDays && today !== null) return isAvailableOn(i, today);
      return true;
    });

  const active = menu.find((c) => c.id === activeId) ?? menu[0];
  const activeItems = visibleItems(active);
  const label = (c: MenuCategory) => (lang === "ar" ? c.labelAr : c.labelFr);

  const searching = query.trim().length > 0;

  // Recherche dans la vraie carte (nom FR + AR + catégorie), tolérante
  // aux accents, espaces, casse, ponctuation et variantes d'orthographe.
  const results = useMemo(
    () => searchMenu(query, { hideUnavailable, today }),
    [query, hideUnavailable, today],
  );
  const resultCats = useMemo(() => categoriesOf(results), [results]);

  // Filtre par catégorie à l'intérieur des résultats. Si la catégorie
  // choisie disparaît des résultats, on retombe automatiquement sur « Tous ».
  const effectiveCat =
    searchCat === "all" || resultCats.some((c) => c.id === searchCat) ? searchCat : "all";
  const filteredResults = useMemo(
    () => (effectiveCat === "all" ? results : results.filter((h) => h.cat.id === effectiveCat)),
    [results, effectiveCat],
  );
  const countInCat = (catId: string) => results.filter((h) => h.cat.id === catId).length;

  const clearSearch = () => {
    setQuery("");
    setSearchCat("all");
  };

  const selectCategory = (id: string) => {
    setActiveId(id);
    // Si l'utilisateur est descendu dans une longue liste, revenir en haut du panneau.
    const el = panelRef.current;
    if (el && el.getBoundingClientRect().top < 0) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const bannerAsset = active.banner ? assets[active.banner] : null;

  return (
    <section id="carte" className="scroll-mt-16 bg-cream-100 py-16 sm:py-24" aria-labelledby="menu-title">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading kicker={t("menu.kicker")} title={t("menu.title")} intro={t("menu.intro")} id="menu-title" />

        {/* Note honnête sur les prix */}
        <p className="mx-auto mt-6 flex max-w-2xl items-start gap-2 rounded-xl border border-gold-500/40 bg-gold-200/25 px-4 py-3 text-sm text-cocoa-700">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-gold-600" aria-hidden="true" />
          {t("menu.priceNote")}
        </p>

        {/* Barre collante : recherche + catégories */}
        <div className="sticky top-16 z-30 -mx-4 mt-8 border-b border-cocoa-900/10 bg-cream-100/95 px-4 pb-3 pt-3 backdrop-blur-md sm:top-[72px] sm:mx-0 sm:rounded-b-xl sm:px-0">
          <div className="relative">
            <label htmlFor="menu-search" className="sr-only">
              {t("menu.search.label")}
            </label>
            <Search className="pointer-events-none absolute inset-y-0 start-4 my-auto h-4 w-4 text-cocoa-600/60" aria-hidden="true" />
            <input
              id="menu-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("menu.search.ph")}
              autoComplete="off"
              className="min-h-11 w-full rounded-full border border-cocoa-900/15 bg-cream-50 py-2.5 pe-11 ps-11 text-base text-cocoa-900 placeholder:text-cocoa-600/55 focus:border-clay-600 focus:outline-none [&::-webkit-search-cancel-button]:hidden"
            />
            {query && (
              <button
                type="button"
                onClick={clearSearch}
                aria-label={t("menu.search.clear")}
                className="absolute inset-y-0 end-1 my-auto inline-flex h-9 w-9 items-center justify-center rounded-full text-cocoa-700 hover:bg-cream-200"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            )}
          </div>

          {!searching && (
            <div
              role="tablist"
              aria-label={t("nav.menu")}
              className="mt-3 flex gap-2 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {menu.map((cat) => {
                const selected = cat.id === activeId;
                return (
                  <button
                    key={cat.id}
                    role="tab"
                    id={`tab-${cat.id}`}
                    aria-selected={selected}
                    aria-controls="menu-panel"
                    onClick={() => selectCategory(cat.id)}
                    className={`inline-flex min-h-10 shrink-0 items-center gap-2 whitespace-nowrap rounded-full px-4 text-sm font-bold transition-colors ${
                      selected
                        ? "bg-clay-600 text-cream-50 shadow-soft"
                        : "border border-cocoa-900/15 bg-cream-50 text-cocoa-800 hover:border-clay-600 hover:text-clay-700"
                    }`}
                  >
                    {label(cat)}
                    <span
                      className={`rounded-full px-1.5 text-[11px] tabular-nums ${
                        selected ? "bg-cream-50/20" : "bg-cream-200 text-cocoa-700"
                      }`}
                    >
                      {visibleItems(cat).length}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div ref={panelRef} className="scroll-mt-40 pt-6">
          {searching ? (
            /* Résultats de recherche */
            <div aria-live="polite">
              <p className="mb-3 text-sm font-semibold text-cocoa-700">
                {t("menu.search.results", { n: filteredResults.length, q: query.trim() })}
              </p>

              {results.length > 0 && (
                <div role="group" aria-label={t("menu.search.filter")} className="mb-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    aria-pressed={effectiveCat === "all"}
                    onClick={() => setSearchCat("all")}
                    className={`inline-flex min-h-9 items-center gap-1.5 rounded-full px-3.5 text-sm font-bold transition-colors ${
                      effectiveCat === "all"
                        ? "bg-clay-600 text-cream-50 shadow-soft"
                        : "border border-cocoa-900/15 bg-cream-50 text-cocoa-800 hover:border-clay-600 hover:text-clay-700"
                    }`}
                  >
                    {t("menu.search.all")}
                    <span
                      className={`rounded-full px-1.5 text-[11px] tabular-nums ${
                        effectiveCat === "all" ? "bg-cream-50/20" : "bg-cream-200 text-cocoa-700"
                      }`}
                    >
                      {results.length}
                    </span>
                  </button>
                  {resultCats.map((cat) => {
                    const selected = effectiveCat === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        aria-pressed={selected}
                        onClick={() => setSearchCat(cat.id)}
                        className={`inline-flex min-h-9 items-center gap-1.5 rounded-full px-3.5 text-sm font-bold transition-colors ${
                          selected
                            ? "bg-clay-600 text-cream-50 shadow-soft"
                            : "border border-cocoa-900/15 bg-cream-50 text-cocoa-800 hover:border-clay-600 hover:text-clay-700"
                        }`}
                      >
                        {label(cat)}
                        <span
                          className={`rounded-full px-1.5 text-[11px] tabular-nums ${
                            selected ? "bg-cream-50/20" : "bg-cream-200 text-cocoa-700"
                          }`}
                        >
                          {countInCat(cat.id)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}

              {filteredResults.length === 0 ? (
                <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-cocoa-900/20 bg-cream-50 px-6 py-12 text-center">
                  <EmptyTajine className="h-24 w-32" />
                  <p className="font-display text-lg text-cocoa-900">{t("menu.search.empty.title")}</p>
                  <p className="text-sm text-cocoa-700/80">{t("menu.search.empty.text")}</p>
                  <button
                    type="button"
                    onClick={clearSearch}
                    className="mt-2 inline-flex min-h-11 items-center rounded-full border border-cocoa-900/20 px-5 text-sm font-bold text-cocoa-900 hover:border-clay-600 hover:text-clay-700"
                  >
                    {t("menu.search.clear")}
                  </button>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {filteredResults.map(({ item, cat }) => (
                    <MenuCard key={item.id} item={item} categoryLabel={label(cat)} />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div id="menu-panel" role="tabpanel" aria-labelledby={`tab-${active.id}`}>
              {/* Bannière de catégorie */}
              <div className="relative h-36 overflow-hidden rounded-2xl border border-cocoa-900/10 shadow-soft sm:h-48">
                {bannerAsset ? (
                  <Image
                    key={bannerAsset.src}
                    src={bannerAsset.src}
                    alt={lang === "ar" ? bannerAsset.altAr : bannerAsset.altFr}
                    fill
                    sizes="(max-width: 1152px) 100vw, 1152px"
                    className="object-cover"
                  />
                ) : (
                  <PatternBanner title={label(active)} subtitle={lang === "ar" ? active.introAr : active.introFr} />
                )}
                <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-cocoa-950/90 via-cocoa-950/45 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-4 sm:p-6">
                  <h3 className="font-display text-2xl font-semibold text-cream-50 sm:text-3xl">{label(active)}</h3>
                  <p className="mt-1 text-sm text-cream-100/90 sm:text-base">
                    {lang === "ar" ? active.introAr : active.introFr}
                  </p>
                </div>
                {bannerAsset?.isConceptual && (
                  <span className="absolute end-3 top-3 rounded-full bg-cocoa-950/65 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-cream-100">
                    {t("menu.photoIllustration")}
                  </span>
                )}
              </div>

              {/* Option : masquer les plats du jour non servis aujourd'hui */}
              {active.items.some((i) => i.availableDays) && (
                <label className="mt-4 flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border border-cocoa-900/10 bg-cream-50 px-4 py-2 text-sm font-semibold text-cocoa-800">
                  <input
                    type="checkbox"
                    checked={hideUnavailable}
                    onChange={(e) => setHideUnavailable(e.target.checked)}
                    className="h-5 w-5 accent-[var(--color-clay-600)]"
                  />
                  {t("menu.daily.hide")}
                </label>
              )}

              {activeItems.length === 0 ? (
                <div className="mt-6 flex flex-col items-center gap-3 rounded-2xl border border-dashed border-cocoa-900/20 bg-cream-50 px-6 py-10 text-center">
                  <EmptyTajine className="h-20 w-28" />
                  <p className="text-sm font-semibold text-cocoa-700">{t("menu.daily.allHidden")}</p>
                </div>
              ) : (
                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  {activeItems.map((item) => (
                    <MenuCard key={item.id} item={item} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
