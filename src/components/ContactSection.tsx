"use client";

import {
  Clock,
  ExternalLink,
  MapPin,
  MessageCircle,
  Navigation,
  Phone,
} from "lucide-react";
import {
  formatLocalMoroccan,
  getWhatsAppDestination,
  genericWhatsAppUrl,
  mapsDirectionsUrl,
  mapsEmbedUrl,
  mapsPlaceUrl,
  restaurant,
  restaurantTelHref,
} from "@/config/restaurant";
import { useI18n } from "@/lib/i18n";
import { SectionHeading } from "@/components/ui";

export default function ContactSection() {
  const { t } = useI18n();
  const waUrl = genericWhatsAppUrl();
  const wa = getWhatsAppDestination();
  const { lat, lng } = restaurant.geo;
  const coordsLabel = `${lat.toFixed(7)}, ${lng.toFixed(7)}`;

  const rows = [
    {
      icon: MapPin,
      label: t("contact.visit"),
      value: restaurant.address.full,
    },
    {
      icon: Phone,
      label: t("contact.phone"),
      value: (
        <span>
          <a
            href={restaurantTelHref}
            dir="ltr"
            className="underline-offset-2 hover:text-gold-300 hover:underline"
          >
            {restaurant.phoneDisplay}
          </a>
          {!restaurant.phoneVerified && (
            <span className="ms-2 rounded-full border border-gold-400/40 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-gold-300">
              {t("contact.toConfirm")}
            </span>
          )}
        </span>
      ),
      note: t("contact.phoneNote"),
    },
    {
      icon: MessageCircle,
      label: "WhatsApp",
      value: (
        <span>
          {waUrl ? (
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              dir="ltr"
              className="underline-offset-2 hover:text-gold-300 hover:underline"
            >
              {wa ? formatLocalMoroccan(wa) : "—"}
            </a>
          ) : (
            <span dir="ltr">—</span>
          )}
          {restaurant.whatsapp.temporary && (
            <span className="ms-2 rounded-full border border-gold-400/40 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-gold-300">
              {t("contact.toConfirm")}
            </span>
          )}
        </span>
      ),
      note: restaurant.whatsapp.temporary ? t("contact.tempNumber") : undefined,
    },
    {
      icon: Clock,
      label: t("contact.hours"),
      value: <span className="text-cream-200/75">{t("contact.hoursNote")}</span>,
    },
  ];

  return (
    <section
      id="contact"
      className="zellige-dark scroll-mt-20 bg-cocoa-950 py-16 text-cream-100 sm:py-24"
      aria-labelledby="contact-title"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading
          id="contact-title"
          tone="light"
          kicker={t("contact.kicker")}
          title={t("contact.title")}
        />

        <div className="mt-12 grid items-start gap-10 lg:grid-cols-5">
          <ul className="space-y-6 lg:col-span-2">
            {rows.map((row, i) => (
              <li key={i} className="flex items-start gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-gold-400/40 bg-cocoa-900 text-gold-300">
                  <row.icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold-300/90">
                    {row.label}
                  </p>
                  <p className="mt-1 break-words text-base font-semibold text-cream-50">
                    {row.value}
                  </p>
                  {row.note ? (
                    <p className="mt-1 text-xs text-cream-200/60">{row.note}</p>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>

          {/* Carte Google Maps — iframe public, aucune clé API */}
          <div className="lg:col-span-3">
            <div className="overflow-hidden rounded-2xl border border-cream-100/15 bg-cocoa-900 shadow-lift">
              <div className="relative aspect-[4/3] w-full sm:aspect-[16/10]">
                <iframe
                  title={t("contact.map.iframe")}
                  src={mapsEmbedUrl}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                  className="absolute inset-0 h-full w-full border-0"
                />
              </div>

              <div className="space-y-4 p-4 sm:p-5">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold-300/90">
                    {t("contact.map.coords")}
                  </p>
                  <a
                    href={restaurant.geo.osmUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-sm tabular-nums text-cream-50 underline-offset-2 hover:text-gold-300 hover:underline"
                    dir="ltr"
                  >
                    {coordsLabel}
                  </a>
                </div>
                <p className="text-[11px] leading-relaxed text-cream-200/55">
                  {t("contact.map.source")}
                </p>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <a
                    href={mapsDirectionsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-full bg-clay-600 px-5 text-sm font-bold text-cream-50 shadow-soft transition-colors hover:bg-clay-500"
                  >
                    <Navigation className="h-4 w-4" aria-hidden="true" />
                    {t("contact.directions")}
                  </a>
                  <a
                    href={mapsPlaceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-full border border-cream-100/30 px-5 text-sm font-bold text-cream-50 transition-colors hover:border-gold-300 hover:text-gold-300"
                  >
                    <ExternalLink className="h-4 w-4" aria-hidden="true" />
                    {t("contact.openMap")}
                  </a>
                </div>
                {waUrl && (
                  <a
                    href={waUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full border border-cream-100/20 px-5 text-sm font-bold text-cream-100/90 transition-colors hover:border-gold-300 hover:text-gold-300"
                  >
                    <MessageCircle className="h-4 w-4" aria-hidden="true" />
                    {t("contact.order")}
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
