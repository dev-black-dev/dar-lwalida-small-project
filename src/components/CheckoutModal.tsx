"use client";

import { useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  Check,
  Copy,
  MapPin,
  MessageCircle,
  Phone,
  Store,
  X,
} from "lucide-react";
import { formatLocalMoroccan, formatMAD, getWhatsAppDestination } from "@/config/restaurant";
import { menuSettings } from "@/data/menu";
import { useCart } from "@/lib/cart";
import { useI18n } from "@/lib/i18n";
import type { DictKey } from "@/lib/i18n";
import { useBodyScrollLock } from "@/lib/useBodyScrollLock";
import { useFocusTrap } from "@/lib/useFocusTrap";
import { buildCheckout, validateCheckout } from "@/lib/whatsapp";
import type { CheckoutErrorKey, OrderDetails } from "@/lib/whatsapp";

const CUSTOMER_KEY = "dlw.customer.v1";

const errorText: Record<CheckoutErrorKey, DictKey> = {
  cart: "checkout.error.cart",
  unavailable: "checkout.error.unavailable",
  name: "checkout.error.name",
  phone: "checkout.error.phone",
  address: "checkout.error.address",
  number: "checkout.error.number",
};

/** Copie robuste (API Clipboard, sinon repli textarea). */
async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    /* repli ci-dessous */
  }
  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}

/** Coordonnées mémorisées lors d'une commande précédente. */
function readSavedCustomer(): Partial<OrderDetails> {
  try {
    const parsed: unknown = JSON.parse(window.localStorage.getItem(CUSTOMER_KEY) ?? "null");
    return typeof parsed === "object" && parsed !== null ? (parsed as Partial<OrderDetails>) : {};
  } catch {
    return {};
  }
}

/**
 * Contenu de la modale. Monté UNIQUEMENT quand la modale est ouverte :
 * chaque ouverture repart donc d'un état neuf (étape 1, aucun message
 * copié), sans réinitialisation via effet.
 */
function CheckoutDialog() {
  const { t, lang } = useI18n();
  const { lines, orderLines, count, subtotal, hasUnavailable, setCheckoutOpen, setDrawerOpen, clear } =
    useCart();

  const [step, setStep] = useState<"details" | "review">("details");
  const [form, setForm] = useState<OrderDetails>(() => {
    const saved = readSavedCustomer();
    return {
      name: saved.name ?? "",
      phone: saved.phone ?? "",
      mode: "pickup",
      address: saved.address ?? "",
      notes: "",
    };
  });
  const [errors, setErrors] = useState<CheckoutErrorKey[]>([]);
  const [opened, setOpened] = useState(false);
  const [copied, setCopied] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const destination = getWhatsAppDestination();
  const destinationLabel = destination
    ? `${formatLocalMoroccan(destination)} (+${destination})`
    : "—";

  useFocusTrap(panelRef, true, () => setCheckoutOpen(false));
  useBodyScrollLock(true);

  // Étape réellement affichée : dérivée (aucun setState dans un effet).
  // Si le panier devient invalide, on revient visuellement à l'étape 1.
  const shownStep = step === "review" && (orderLines.length === 0 || hasUnavailable) ? "details" : step;

  // Message et lien toujours recalculés depuis le panier courant.
  const checkout = useMemo(
    () => buildCheckout(orderLines, form, { provisional: menuSettings.pricesProvisional, lang }),
    [orderLines, form, lang],
  );

  const set = <K extends keyof OrderDetails>(key: K, value: OrderDetails[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors.length) setErrors((e) => e.filter((x) => x !== key));
  };

  const goToReview = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validateCheckout(orderLines, form, { hasUnavailable });
    if (!checkout.url) errs.push("number");
    setErrors(errs);
    if (errs.length > 0) {
      const firstField = errs.find((x) => x === "name" || x === "phone" || x === "address");
      if (firstField) document.getElementById(`co-${firstField}`)?.focus();
      return;
    }
    try {
      window.localStorage.setItem(
        CUSTOMER_KEY,
        JSON.stringify({ name: form.name.trim(), phone: form.phone.trim(), address: form.address?.trim() ?? "" }),
      );
    } catch {
      /* ignore */
    }
    setStep("review");
    panelRef.current?.querySelector<HTMLElement>("[data-scroll]")?.scrollTo({ top: 0 });
  };

  const has = (k: CheckoutErrorKey) => errors.includes(k);
  const inputBase =
    "w-full rounded-xl border bg-cream-50 px-4 py-3 text-base text-cocoa-900 placeholder:text-cocoa-600/50 focus:border-clay-600 focus:outline-none";
  const fieldError = (k: CheckoutErrorKey) =>
    has(k) ? (
      <p id={`co-${k}-error`} role="alert" className="mt-1.5 text-xs font-semibold text-clay-700">
        {t(errorText[k])}
      </p>
    ) : null;

  const globalErrors = errors.filter((e) => e === "cart" || e === "unavailable" || e === "number");

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center sm:p-4">
      <div className="absolute inset-0 bg-cocoa-950/60" onClick={() => setCheckoutOpen(false)} aria-hidden="true" />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="checkout-title"
        tabIndex={-1}
        className="animate-pop relative flex max-h-[94svh] w-full max-w-lg flex-col overflow-hidden rounded-t-2xl bg-cream-50 shadow-lift outline-none sm:rounded-2xl"
      >
        {/* En-tête + étapes */}
        <header className="border-b border-cocoa-900/10 bg-cream-100 px-5 pb-3 pt-4">
          <div className="flex items-center justify-between gap-3">
            <h2 id="checkout-title" className="font-display text-xl text-cocoa-900">
              {t("checkout.title")}
            </h2>
            <button
              type="button"
              onClick={() => setCheckoutOpen(false)}
              aria-label={t("cart.close")}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full text-cocoa-800 hover:bg-cream-200"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
          <ol className="mt-2 flex items-center gap-2 text-xs font-bold" aria-label={t("checkout.title")}>
            {(["details", "review"] as const).map((s, i) => {
              const current = shownStep === s;
              const done = shownStep === "review" && s === "details";
              return (
                <li key={s} className="flex items-center gap-2" aria-current={current ? "step" : undefined}>
                  {i > 0 && <span className="h-px w-6 bg-cocoa-900/20" aria-hidden="true" />}
                  <span
                    className={`inline-flex h-6 w-6 items-center justify-center rounded-full ${
                      current ? "bg-clay-600 text-cream-50" : done ? "bg-emerald-700 text-cream-50" : "bg-cream-200 text-cocoa-700"
                    }`}
                  >
                    {done ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : i + 1}
                  </span>
                  <span className={current ? "text-cocoa-900" : "text-cocoa-600/70"}>
                    {t(s === "details" ? "checkout.step1" : "checkout.step2")}
                  </span>
                </li>
              );
            })}
          </ol>
        </header>

        <div data-scroll className="flex-1 overflow-y-auto px-5 py-4">
          {/* Récapitulatif (toujours visible) */}
          <div className="rounded-xl border border-cocoa-900/10 bg-cream-100 p-4">
            <ul className="space-y-1">
              {lines.map((l) => (
                <li key={l.item.id} className="flex justify-between gap-3 text-sm text-cocoa-800">
                  <span className="min-w-0 break-words">
                    <span className="font-bold tabular-nums">{l.qty} ×</span>{" "}
                    {lang === "ar" ? l.item.nameAr : l.item.nameFr}
                  </span>
                  <span className="shrink-0 tabular-nums" dir="ltr">{formatMAD(l.lineTotal)}</span>
                </li>
              ))}
            </ul>
            <p className="mt-3 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 border-t border-cocoa-900/10 pt-2 text-sm font-extrabold text-cocoa-900">
              <span>
                {t("cart.subtotal")} · {t("cart.items", { n: count })}
                {menuSettings.pricesProvisional && (
                  <span className="ms-1 text-[11px] font-semibold text-cocoa-600/70">({t("cart.provisional")})</span>
                )}
              </span>
              <span className="tabular-nums text-clay-700" dir="ltr">{formatMAD(subtotal)}</span>
            </p>
          </div>

          {globalErrors.length > 0 && (
            <div role="alert" className="mt-4 space-y-1 rounded-xl border border-clay-600/40 bg-clay-100 px-4 py-3">
              {globalErrors.map((k) => (
                <p key={k} className="flex items-start gap-2 text-sm font-semibold text-clay-800">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                  {t(errorText[k])}
                </p>
              ))}
            </div>
          )}

          {shownStep === "details" ? (
            <form id="checkout-form" onSubmit={goToReview} noValidate className="mt-4 space-y-4">
              <p className="text-xs text-cocoa-700/75">{t("checkout.subtitle")}</p>

              <div>
                <label htmlFor="co-name" className="mb-1.5 block text-sm font-bold text-cocoa-900">
                  {t("checkout.name")} <span className="text-clay-600" aria-hidden="true">*</span>
                </label>
                <input
                  id="co-name"
                  type="text"
                  value={form.name}
                  onChange={(e) => set("name", e.target.value)}
                  placeholder={t("checkout.name.ph")}
                  autoComplete="name"
                  required
                  maxLength={80}
                  aria-invalid={has("name")}
                  aria-describedby={has("name") ? "co-name-error" : undefined}
                  className={`${inputBase} ${has("name") ? "border-clay-600" : "border-cocoa-900/20"}`}
                />
                {fieldError("name")}
              </div>

              <div>
                <label htmlFor="co-phone" className="mb-1.5 block text-sm font-bold text-cocoa-900">
                  {t("checkout.phone")} <span className="text-clay-600" aria-hidden="true">*</span>
                </label>
                <div className="relative">
                  <Phone className="pointer-events-none absolute inset-y-0 start-3.5 my-auto h-4 w-4 text-cocoa-600/60" aria-hidden="true" />
                  <input
                    id="co-phone"
                    type="tel"
                    inputMode="tel"
                    dir="ltr"
                    value={form.phone}
                    onChange={(e) => set("phone", e.target.value)}
                    placeholder={t("checkout.phone.ph")}
                    autoComplete="tel"
                    required
                    maxLength={25}
                    aria-invalid={has("phone")}
                    aria-describedby={has("phone") ? "co-phone-error" : undefined}
                    className={`${inputBase} ps-10 text-start ${has("phone") ? "border-clay-600" : "border-cocoa-900/20"}`}
                  />
                </div>
                {fieldError("phone")}
              </div>

              <fieldset>
                <legend className="mb-1.5 block text-sm font-bold text-cocoa-900">{t("checkout.mode")}</legend>
                <div className="grid grid-cols-2 gap-2">
                  {(
                    [
                      { value: "delivery", icon: MapPin, label: t("checkout.delivery") },
                      { value: "pickup", icon: Store, label: t("checkout.pickup") },
                    ] as const
                  ).map((opt) => {
                    const selected = form.mode === opt.value;
                    return (
                      <label
                        key={opt.value}
                        className={`flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-xl border px-3 py-3 text-sm font-bold transition-colors has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-gold-500 ${
                          selected
                            ? "border-clay-600 bg-clay-600 text-cream-50"
                            : "border-cocoa-900/20 bg-cream-50 text-cocoa-800 hover:border-clay-600"
                        }`}
                      >
                        <input
                          type="radio"
                          name="mode"
                          value={opt.value}
                          checked={selected}
                          onChange={() => set("mode", opt.value)}
                          className="sr-only"
                        />
                        <opt.icon className="h-4 w-4" aria-hidden="true" />
                        {opt.label}
                      </label>
                    );
                  })}
                </div>
              </fieldset>

              {form.mode === "delivery" && (
                <div>
                  <label htmlFor="co-address" className="mb-1.5 block text-sm font-bold text-cocoa-900">
                    {t("checkout.address")} <span className="text-clay-600" aria-hidden="true">*</span>
                  </label>
                  <textarea
                    id="co-address"
                    rows={2}
                    value={form.address}
                    onChange={(e) => set("address", e.target.value)}
                    placeholder={t("checkout.address.ph")}
                    autoComplete="street-address"
                    required
                    maxLength={200}
                    aria-invalid={has("address")}
                    aria-describedby={has("address") ? "co-address-error" : undefined}
                    className={`${inputBase} resize-none ${has("address") ? "border-clay-600" : "border-cocoa-900/20"}`}
                  />
                  {fieldError("address")}
                </div>
              )}

              <div>
                <label htmlFor="co-notes" className="mb-1.5 block text-sm font-bold text-cocoa-900">
                  {t("checkout.notes")}
                </label>
                <textarea
                  id="co-notes"
                  value={form.notes}
                  onChange={(e) => set("notes", e.target.value)}
                  placeholder={t("checkout.notes.ph")}
                  rows={2}
                  maxLength={300}
                  className={`${inputBase} resize-none border-cocoa-900/20`}
                />
              </div>
            </form>
          ) : (
            /* Étape 2 : message exact + lien réel wa.me */
            <div className="mt-4">
              <h3 className="text-sm font-bold text-cocoa-900">{t("checkout.review.title")}</h3>
              <p className="mt-1 text-xs text-cocoa-700/75">
                {t("checkout.review.help", { number: destinationLabel })}
              </p>
              <pre
                dir={lang === "ar" ? "rtl" : "ltr"}
                lang={lang}
                className="mt-3 max-h-64 overflow-y-auto whitespace-pre-wrap break-words rounded-xl border border-emerald-800/15 bg-[#e7f6e3] p-4 font-sans text-[13px] leading-relaxed text-cocoa-900"
                data-testid="whatsapp-message"
              >
                {checkout.message}
              </pre>

              {opened && (
                <p role="status" className="mt-3 flex items-start gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-900 ring-1 ring-emerald-700/20">
                  <Check className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                  {t("checkout.sentNote")}
                </p>
              )}
              <p className="mt-3 text-xs leading-relaxed text-cocoa-700/75">
                {t("checkout.fallback", { number: destinationLabel })}
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        <footer className="space-y-2 border-t border-cocoa-900/10 bg-cream-100 px-5 py-4">
          {shownStep === "details" ? (
            <button
              type="submit"
              form="checkout-form"
              className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-clay-600 px-6 text-base font-bold text-cream-50 shadow-soft transition-colors hover:bg-clay-700"
            >
              {t("checkout.continue")}
            </button>
          ) : (
            <>
              {checkout.url ? (
                /* Lien réel : ouverture déclenchée par le clic utilisateur → jamais bloquée */
                <a
                  href={checkout.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setOpened(true)}
                  data-testid="whatsapp-link"
                  className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[#1f8f4e] px-6 text-base font-bold text-white shadow-soft transition-colors hover:bg-[#187a41]"
                >
                  <MessageCircle className="h-5 w-5" aria-hidden="true" />
                  {t("checkout.open")}
                </a>
              ) : (
                <p role="alert" className="text-sm font-semibold text-clay-800">{t("checkout.error.number")}</p>
              )}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setStep("details")}
                  className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-full border border-cocoa-900/20 px-4 text-sm font-bold text-cocoa-900 hover:border-clay-600"
                >
                  <ArrowLeft className="h-4 w-4 rtl:rotate-180" aria-hidden="true" />
                  {t("checkout.back")}
                </button>
                <button
                  type="button"
                  onClick={async () => setCopied(await copyText(checkout.message))}
                  className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-full border border-cocoa-900/20 px-4 text-sm font-bold text-cocoa-900 hover:border-clay-600"
                >
                  {copied ? <Check className="h-4 w-4 text-emerald-700" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
                  {copied ? t("checkout.copied") : t("checkout.copy")}
                </button>
              </div>
              {opened && (
                <button
                  type="button"
                  onClick={() => {
                    clear();
                    setCheckoutOpen(false);
                    setDrawerOpen(false);
                  }}
                  className="mx-auto flex min-h-10 items-center px-4 text-xs font-semibold text-cocoa-600/80 underline-offset-2 hover:text-clay-700 hover:underline"
                >
                  {t("cart.clear")}
                </button>
              )}
            </>
          )}
          <p className="text-center text-[11px] leading-relaxed text-cocoa-700/60">{t("cart.disclaimer")}</p>
        </footer>
      </div>
    </div>
  );
}

/**
 * N'affiche rien tant que la commande n'est pas ouverte : le contenu
 * (et donc son état) est créé à chaque ouverture.
 */
export default function CheckoutModal() {
  const { checkoutOpen } = useCart();
  if (!checkoutOpen) return null;
  return <CheckoutDialog />;
}
