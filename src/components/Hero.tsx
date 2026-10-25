"use client";

import { getImageProps } from "next/image";
import { ArrowDown, MessageCircle, Star } from "lucide-react";
import { assets } from "@/config/assets";
import { genericWhatsAppUrl } from "@/config/restaurant";
import { useI18n } from "@/lib/i18n";
import { StarDivider } from "@/components/ui";

export default function Hero() {
  const { t, lang } = useI18n();
  const waUrl = genericWhatsAppUrl();
  const alt = lang === "ar" ? assets.hero.altAr : assets.hero.altFr;

  // Art direction : recadrage portrait sur mobile, paysage sur desktop.
  const common = { alt, priority: true, quality: 75 } as const;
  const {
    props: { srcSet: desktopSrcSet },
  } = getImageProps({ ...common, src: assets.hero.src, width: assets.hero.w, height: assets.hero.h, sizes: "100vw" });
  const {
    props: { srcSet: mobileSrcSet, ...mobileRest },
  } = getImageProps({
    ...common,
    src: assets["hero-mobile"].src,
    width: assets["hero-mobile"].w,
    height: assets["hero-mobile"].h,
    sizes: "100vw",
  });

  return (
    <section id="accueil" aria-labelledby="hero-title" className="relative">
      <div className="relative min-h-[100svh] w-full overflow-hidden bg-cocoa-950 sm:min-h-[88svh]">
        <picture>
          <source media="(min-width: 768px)" srcSet={desktopSrcSet} />
          <source media="(max-width: 767px)" srcSet={mobileSrcSet} />
          {/* eslint-disable-next-line jsx-a11y/alt-text */}
          <img {...mobileRest} className="absolute inset-0 h-full w-full object-cover object-center" />
        </picture>

        {/* Voiles de lisibilité (texte toujours contrasté) */}
        <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-cocoa-950 via-cocoa-950/60 to-cocoa-950/20" />
        <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-r from-cocoa-950/70 via-cocoa-950/20 to-transparent rtl:bg-gradient-to-l" />

        <div className="relative z-10 mx-auto flex min-h-[100svh] max-w-6xl flex-col justify-end px-4 pb-14 pt-28 sm:min-h-[88svh] sm:px-6 sm:pb-20">
          <div className="max-w-2xl animate-fade-up text-cream-50">
            <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.28em] text-gold-300">
              <Star className="h-4 w-4" aria-hidden="true" />
              {t("hero.kicker")}
            </p>

            <h1 id="hero-title" className="mt-4">
              <span className="block font-script text-[56px] leading-[0.95] sm:text-[88px]">
                Dar L&rsquo;Walida
              </span>
              <span className="mt-3 block font-display text-[28px] font-semibold italic leading-tight text-cream-50 sm:text-[44px]">
                {t("hero.slogan")}
              </span>
            </h1>

            <StarDivider className="my-5 justify-start text-gold-300 sm:my-6" />

            <p className="max-w-xl text-base leading-relaxed text-cream-100/90 sm:text-lg">
              {t("hero.support")}
            </p>
            <p dir="rtl" lang="ar" className="mt-3 text-xl font-bold text-gold-300 sm:text-2xl">
              شهيوات بلدية مغربية
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
              <a
                href="#carte"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-clay-600 px-7 py-3 text-base font-bold text-cream-50 shadow-lift transition-colors hover:bg-clay-500"
              >
                {t("cta.discoverMenu")}
                <ArrowDown className="h-4 w-4" aria-hidden="true" />
              </a>
              {waUrl && (
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-cream-100/60 bg-cocoa-950/30 px-7 py-3 text-base font-bold text-cream-50 backdrop-blur-sm transition-colors hover:border-gold-300 hover:text-gold-300"
                >
                  <MessageCircle className="h-5 w-5" aria-hidden="true" />
                  {t("cta.order")}
                </a>
              )}
            </div>
            <p className="mt-4 text-sm text-cream-100/75">{t("hero.note")}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
