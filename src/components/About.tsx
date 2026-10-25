"use client";

import Image from "next/image";
import { assets } from "@/config/assets";
import { restaurant } from "@/config/restaurant";
import { useI18n } from "@/lib/i18n";
import { ConceptBadge, SectionHeading, Star, Wordmark } from "@/components/ui";

export default function About() {
  const { t, lang } = useI18n();
  const alt = (key: keyof typeof assets) =>
    lang === "ar" ? assets[key].altAr : assets[key].altFr;

  return (
    <section
      id="apropos"
      className="zellige-light scroll-mt-20 border-y border-cocoa-900/10 bg-cream-50 py-16 sm:py-24"
      aria-label={t("nav.about")}
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          {/* Façade (photo officielle à insérer — même nom de fichier) */}
          <figure className="relative mx-auto w-full max-w-md lg:ms-0">
            <div className="relative overflow-hidden rounded-2xl border border-cocoa-900/10 shadow-lift">
              <Image
                src={assets.exterieur.src}
                alt={alt("exterieur")}
                width={assets.exterieur.w}
                height={assets.exterieur.h}
                loading="lazy"
                sizes="(max-width: 1024px) 90vw, 40vw"
                className="aspect-[4/5] w-full object-cover"
              />
              {assets.exterieur.isConceptual && (
                <ConceptBadge label={t("menu.photoIllustration")} />
              )}
            </div>
            <figcaption className="mt-3 text-center text-sm text-cocoa-700/80">
              {restaurant.address.street} — {restaurant.address.city}
            </figcaption>
          </figure>

          <div>
            <SectionHeading
              align="start"
              kicker={t("about.kicker")}
              title={t("about.title")}
            />
            <p className="mt-6 text-base leading-relaxed text-cocoa-800 sm:text-lg">
              {t("about.p1")}
            </p>
            <p className="mt-4 text-base leading-relaxed text-cocoa-700/90">
              {t("about.p2")}
            </p>

            {/* Branding */}
            <div className="zellige-dark mt-8 inline-flex flex-col items-center gap-1 rounded-2xl bg-cocoa-950 px-10 py-7 text-center shadow-soft">
              <Wordmark tone="light" />
              <span
                dir="rtl"
                lang="ar"
                className="mt-2 text-xl font-bold text-gold-300"
              >
                {restaurant.taglineAr}
              </span>
            </div>

            <p className="mt-6 flex items-start gap-2 text-xs leading-relaxed text-cocoa-600/70">
              <Star className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              {t("about.imageNote")}
            </p>
          </div>
        </div>

        {/* Bande ambiance */}
        <div className="mt-14 grid gap-5 sm:grid-cols-2">
          <figure className="relative overflow-hidden rounded-2xl border border-cocoa-900/10 shadow-soft">
            <Image
              src={assets.ambiance.src}
              alt={alt("ambiance")}
              width={assets.ambiance.w}
              height={assets.ambiance.h}
              loading="lazy"
              sizes="(max-width: 640px) 100vw, 50vw"
              className="aspect-[16/10] w-full object-cover"
            />
            {assets.ambiance.isConceptual && (
              <ConceptBadge label={t("menu.photoIllustration")} />
            )}
          </figure>
          <figure className="relative overflow-hidden rounded-2xl border border-cocoa-900/10 shadow-soft">
            <Image
              src={assets["table-traditionnelle"].src}
              alt={alt("table-traditionnelle")}
              width={assets["table-traditionnelle"].w}
              height={assets["table-traditionnelle"].h}
              loading="lazy"
              sizes="(max-width: 640px) 100vw, 50vw"
              className="aspect-[16/10] w-full object-cover object-center"
            />
            {assets["table-traditionnelle"].isConceptual && (
              <ConceptBadge label={t("menu.photoIllustration")} />
            )}
          </figure>
        </div>
      </div>
    </section>
  );
}
