/**
 * Commande WhatsApp — logique pure (testable sans navigateur).
 *
 * Fonctionnement : lien « click-to-chat » officiel
 *   https://wa.me/<numéro international>?text=<message encodé>
 * Ce n'est PAS l'API WhatsApp Business : rien n'est envoyé
 * automatiquement, le client appuie lui-même sur « Envoyer ».
 */
import { buildWhatsAppUrl, restaurant } from "@/config/restaurant";

export interface OrderLine {
  nameFr: string;
  nameAr?: string;
  priceMAD: number;
  qty: number;
}

export interface OrderDetails {
  name: string;
  phone: string;
  mode: "delivery" | "pickup";
  address?: string;
  notes?: string;
}

export type CheckoutErrorKey =
  | "cart"
  | "unavailable"
  | "name"
  | "phone"
  | "address"
  | "number";

/** Ligne unique, espaces normalisés, longueur bornée. */
function oneLine(s: string | undefined, max: number): string {
  return (s ?? "").replace(/\s+/g, " ").trim().slice(0, max);
}

/** Texte multi-ligne propre (notes) : lignes vides multiples réduites. */
function multiLine(s: string | undefined, max: number): string {
  return (s ?? "")
    .replace(/\r\n?/g, "\n")
    .split("\n")
    .map((l) => l.replace(/[ \t]+/g, " ").trim())
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
    .slice(0, max);
}

/** Sous-total calculé à partir des prix de la carte × quantités. */
export function computeSubtotal(lines: OrderLine[]): number {
  return lines.reduce((sum, l) => sum + l.priceMAD * l.qty, 0);
}

/** Téléphone client : mobile/fixe marocain ou international courant. */
export function isValidPhone(raw: string): boolean {
  const trimmed = raw.trim();
  if (!/^[+\d][\d\s.\-()]*$/.test(trimmed)) return false;
  let d = trimmed.replace(/\D/g, "");
  if (d.startsWith("00")) d = d.slice(2);
  if (/^0[5-7]\d{8}$/.test(d)) return true; // 06 12 34 56 78
  if (/^212[5-7]\d{8}$/.test(d)) return true; // +212 6 12 34 56 78
  return /^[1-9]\d{7,14}$/.test(d) && (trimmed.startsWith("+") || raw.trim().startsWith("00"));
}

/** Validation complète avant génération du lien. */
export function validateCheckout(
  lines: OrderLine[],
  details: OrderDetails,
  opts: { hasUnavailable?: boolean } = {},
): CheckoutErrorKey[] {
  const errors: CheckoutErrorKey[] = [];
  if (lines.length === 0 || lines.every((l) => l.qty <= 0)) errors.push("cart");
  if (opts.hasUnavailable) errors.push("unavailable");
  if (oneLine(details.name, 80).length < 2) errors.push("name");
  if (!isValidPhone(details.phone)) errors.push("phone");
  if (details.mode === "delivery" && oneLine(details.address, 200).length < 5)
    errors.push("address");
  return errors;
}

/** Construit le message de commande (texte brut, non encodé). */
export function buildOrderMessage(
  lines: OrderLine[],
  details: OrderDetails,
  opts: {
    provisional?: boolean;
    lang?: "fr" | "ar";
    /** Frais de livraison (MAD). `null`/absent → lus dans la config, jamais inventés. */
    deliveryFeeMAD?: number | null;
  } = {},
): string {
  const isAr = opts.lang === "ar";
  const isDelivery = details.mode === "delivery";
  const unitLabel = isAr ? "للوحدة" : "l'unité";

  const items = lines
    .filter((l) => l.qty > 0)
    .map((l) => {
      const name = isAr && l.nameAr ? l.nameAr : l.nameFr;
      const unit = l.qty > 1 ? ` ${unitLabel}` : "";
      return `- ${name} × ${l.qty} — ${l.priceMAD} MAD${unit}`;
    });

  const subtotal = computeSubtotal(lines);

  // Frais de livraison : jamais inventés. `null` → « à confirmer » et
  // exclus du total calculé (total explicitement « hors frais de livraison »).
  const fee =
    opts.deliveryFeeMAD !== undefined ? opts.deliveryFeeMAD : restaurant.delivery.feeMAD;
  const feeKnown = isDelivery && typeof fee === "number" && Number.isFinite(fee);
  const total = feeKnown ? subtotal + (fee as number) : subtotal;
  const provisional = opts.provisional ? (isAr ? " (أسعار تقديرية)" : " (prix indicatifs)") : "";

  const address = oneLine(details.address, 200);
  const notes = multiLine(details.notes, 300);

  if (isAr) {
    const feeLines = !isDelivery
      ? []
      : feeKnown
        ? [`رسوم التوصيل : ${fee} MAD`]
        : ["رسوم التوصيل : تُؤكَّد مع المطعم"];
    const totalLabel = isDelivery && !feeKnown ? "المجموع (دون رسوم التوصيل)" : "المجموع";
    return [
      "السلام عليكم دار الوالدة،",
      "",
      "أود تقديم الطلب التالي :",
      "",
      ...items,
      "",
      `المجموع الفرعي : ${subtotal} MAD${provisional}`,
      ...feeLines,
      `${totalLabel} : ${total} MAD${provisional}`,
      "",
      `الاسم : ${oneLine(details.name, 80)}`,
      `الهاتف : ${oneLine(details.phone, 25)}`,
      `نوع الطلب : ${isDelivery ? "توصيل" : "استلام من المطعم"}`,
      ...(isDelivery ? [`العنوان : ${address}`] : []),
      ...(notes ? [`ملاحظات : ${notes}`] : []),
      "",
      "المرجو تأكيد طلبي.",
    ].join("\n");
  }

  const feeLines = !isDelivery
    ? []
    : feeKnown
      ? [`Frais de livraison : ${fee} MAD`]
      : ["Frais de livraison : à confirmer avec le restaurant"];
  const totalLabel = isDelivery && !feeKnown ? "Total (hors frais de livraison)" : "Total";

  return [
    "Bonjour Dar L’Walida,",
    "",
    "Je souhaite passer la commande suivante :",
    "",
    ...items,
    "",
    `Sous-total : ${subtotal} MAD${provisional}`,
    ...feeLines,
    `${totalLabel} : ${total} MAD${provisional}`,
    "",
    `Nom : ${oneLine(details.name, 80)}`,
    `Téléphone : ${oneLine(details.phone, 25)}`,
    `Type de commande : ${isDelivery ? "Livraison" : "À emporter"}`,
    ...(isDelivery ? [`Adresse : ${address}`] : []),
    ...(notes ? [`Remarques : ${notes}`] : []),
    "",
    "Merci de confirmer ma commande.",
  ].join("\n");
}

/**
 * Message + lien wa.me encodé. `url` = null si le numéro configuré
 * est manquant/invalide (l'UI affiche alors une erreur claire).
 */
export function buildCheckout(
  lines: OrderLine[],
  details: OrderDetails,
  opts: { provisional?: boolean; lang?: "fr" | "ar"; deliveryFeeMAD?: number | null } = {},
): { message: string; url: string | null } {
  const message = buildOrderMessage(lines, details, opts);
  return { message, url: buildWhatsAppUrl(message) };
}
