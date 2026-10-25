"use client";

import { ClipboardList, MessageCircle, UtensilsCrossed } from "lucide-react";
import { useI18n } from "@/lib/i18n";

/** Bandeau sobre expliquant le parcours de commande WhatsApp. */
export default function HowToOrder() {
  const { t } = useI18n();
  const steps = [
    { icon: UtensilsCrossed, title: t("howto.1.title"), text: t("howto.1.text") },
    { icon: ClipboardList, title: t("howto.2.title"), text: t("howto.2.text") },
    { icon: MessageCircle, title: t("howto.3.title"), text: t("howto.3.text") },
  ];
  return (
    <section aria-labelledby="howto-title" className="zellige-dark bg-cocoa-950 py-10 text-cream-100 sm:py-12">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <h2 id="howto-title" className="text-center text-xs font-bold uppercase tracking-[0.28em] text-gold-300">
          {t("howto.title")}
        </h2>
        <ol className="mt-6 grid gap-4 sm:grid-cols-3">
          {steps.map((s, i) => (
            <li key={i} className="flex items-start gap-4 rounded-2xl border border-cream-100/10 bg-cocoa-900/60 p-4">
              <span className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-gold-400/40 bg-cocoa-950 text-gold-300">
                <s.icon className="h-5 w-5" aria-hidden="true" />
                <span className="absolute -end-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-clay-600 text-[11px] font-extrabold text-cream-50">
                  {i + 1}
                </span>
              </span>
              <div>
                <p className="font-display text-lg text-cream-50">{s.title}</p>
                <p className="mt-0.5 text-sm leading-relaxed text-cream-200/75">{s.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
