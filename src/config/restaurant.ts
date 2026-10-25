/**
 * ─────────────────────────────────────────────────────────────
 *  DAR L'WALIDA — Configuration centrale du restaurant
 *
 *  Seul fichier à modifier pour :
 *  - le numéro WhatsApp de commande (PROVISOIRE pour la démo),
 *  - le téléphone public,
 *  - les horaires (masqués tant que `hours` = null),
 *  - l'adresse.
 * ─────────────────────────────────────────────────────────────
 */

export const restaurant = {
  name: "Dar L'Walida",
  brand: "DAR L'WALIDA",
  taglineEn: "Authentic Moroccan Cuisine",
  taglineAr: "شهيوات بلدية مغربية",
  sloganFr: "Le goût du Maroc, comme à la maison.",
  sloganAr: "مذاق المغرب، كما في البيت.",

  address: {
    street: "292 Avenue Mohammed V",
    city: "Rabat",
    country: "Maroc",
    full: "292 Avenue Mohammed V, Rabat, Maroc",
    postalCode: "10020",
  },

  /**
   * Position GPS du restaurant.
   * Source : nœud OpenStreetMap « Dar Lwalida » (amenity=restaurant),
   *   node/14070853001, vérifié le 2026-08-03, Avenue Mohamed V,
   *   quartier Océan / Hassan, Rabat. Téléphone OSM identique à la
   *   fiche publique. Concordance à ~10 m avec la fiche Google publique
   *   (34.0152852, −6.8347625).
   * ⚠️ Non confirmé par le propriétaire : modifier ici si besoin.
   */
  geo: {
    lat: 34.0152509,
    lng: -6.8348421,
    source: "OpenStreetMap",
    osmUrl: "https://www.openstreetmap.org/node/14070853001",
    ownerConfirmed: false,
  },

  /**
   * Instagram fourni pour ce projet. Remplacer `url` par le compte
   * officiel du restaurant dès qu'il est connu.
   */
  instagram: {
    url: "https://www.instagram.com/nassim_ela/",
    handle: "@nassim_ela",
  },

  credit: "Designed & Developed by Black.",

  /** Téléphone public (fiche publique) — ⚠️ à confirmer avant mise en ligne. */
  phoneDisplay: "+212 5 30 31 89 69",
  phoneVerified: false,

  /**
   * ── WHATSAPP DE COMMANDE ───────────────────────────────────
   * ⚠️ Numéro PROVISOIRE (développeur) pour la démonstration.
   * Pour passer en production, remplacez UNIQUEMENT `number`
   * par le numéro officiel du restaurant. Tous les formats sont
   * acceptés et normalisés automatiquement :
   *   "0619653918", "06 19 65 39 18", "+212 6 19 65 39 18",
   *   "00212619653918", "212619653918"  →  212619653918
   *
   * Il s'agit d'un lien « click-to-chat » (wa.me), PAS d'une
   * intégration WhatsApp Business API : aucune clé, aucun envoi
   * automatique — le client confirme l'envoi dans WhatsApp.
   */
  whatsapp: {
    number: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "0619653918",
    temporary: !process.env.NEXT_PUBLIC_WHATSAPP_NUMBER,
  },

  /**
   * Horaires d'ouverture : null = non vérifiés → masqués.
   * Exemple : [{ days: "Lun – Sam", time: "12:00 – 23:00" }]
   */
  hours: null as null | { days: string; time: string }[],

  /**
   * ── LIVRAISON ────────────────────────────────────────────────
   * `feeMAD` = frais de livraison en dirhams.
   *   - null  → NON confirmés : jamais inventés. Le message WhatsApp
   *             les affiche « à confirmer » et exclut les frais du
   *             total calculé (le total est alors explicitement
   *             « hors frais de livraison »).
   *   - 20    → affichés « 20 MAD » et ajoutés au total.
   */
  delivery: {
    feeMAD: null as number | null,
    zone: "Rabat",
    enabled: true,
  },

  /** Fuseau horaire utilisé pour les plats du jour. */
  timeZone: "Africa/Casablanca",

  isDemo: true,
} as const;

/** Lien téléphonique cliquable (numéro nettoyé pour `tel:`). */
export const restaurantTelHref = `tel:${restaurant.phoneDisplay.replace(/[^\d+]/g, "")}`;

const geoQuery = `${restaurant.geo.lat},${restaurant.geo.lng}`;
const placeQuery = encodeURIComponent(
  `${restaurant.name}, ${restaurant.address.full}`,
);

/**
 * Carte embarquée Google Maps — aucune clé API.
 * Marqueur centré sur les coordonnées OSM du restaurant.
 */
export const mapsEmbedUrl =
  `https://maps.google.com/maps?q=${geoQuery}` +
  `&ll=${geoQuery}&z=17&hl=fr&output=embed`;

/** Ouvre Google Maps sur le lieu (marqueur). */
export const mapsPlaceUrl = `https://www.google.com/maps/search/?api=1&query=${geoQuery}`;

/** Itinéraire Google Maps vers les coordonnées exactes (aucune clé API). */
export const mapsDirectionsUrl =
  `https://www.google.com/maps/dir/?api=1&destination=${geoQuery}` +
  `&travelmode=driving`;

/** Lien de repli par adresse textuelle (si les coordonnées étaient retirées). */
export const mapsAddressSearchUrl =
  `https://www.google.com/maps/search/?api=1&query=${placeQuery}`;

/**
 * Normalise un numéro vers le format international attendu par wa.me
 * (chiffres uniquement, indicatif pays, SANS « + », SANS 0 initial).
 * Retourne null si le numéro est manquant ou invalide.
 */
export function normalizeWhatsAppNumber(raw: string | null | undefined): string | null {
  if (!raw) return null;
  let digits = String(raw).replace(/\D/g, "");
  if (digits.startsWith("00")) digits = digits.slice(2); // 00212… → 212…
  if (/^0[5-7]\d{8}$/.test(digits)) digits = "212" + digits.slice(1); // 06… → 2126…
  if (digits.startsWith("2120")) digits = "212" + digits.slice(4); // +212 06… → 2126…
  if (digits.startsWith("212")) {
    return /^212[5-7]\d{8}$/.test(digits) ? digits : null; // numéro marocain strict
  }
  // Autres pays : format E.164 générique (8 à 15 chiffres, ne commence pas par 0)
  return /^[1-9]\d{7,14}$/.test(digits) ? digits : null;
}

/** Numéro de destination résolu (ou null si invalide). */
export function getWhatsAppDestination(): string | null {
  return normalizeWhatsAppNumber(restaurant.whatsapp.number);
}

/** Affichage local lisible : 212619653918 → 06 19 65 39 18 */
export function formatLocalMoroccan(intl: string | null): string {
  if (!intl || !intl.startsWith("212")) return intl ?? "";
  const local = "0" + intl.slice(3);
  return local.replace(/(\d{2})(?=\d)/g, "$1 ").trim();
}

/**
 * Construit le lien officiel click-to-chat :
 *   https://wa.me/<international>?text=<message encodé>
 * `encodeURIComponent` encode accents, apostrophes, arabe, retours ligne,
 * « & », « # », « ? »… Les saisies client ne sont jamais concaténées brutes.
 */
export function buildWhatsAppUrl(message: string): string | null {
  const dest = getWhatsAppDestination();
  if (!dest) return null;
  const text = message.trim();
  return text
    ? `https://wa.me/${dest}?text=${encodeStrict(text)}`
    : `https://wa.me/${dest}`;
}

/**
 * encodeURIComponent + encodage RFC 3986 strict de ! ' ( ) *
 * (laissés bruts par encodeURIComponent). Garantit un lien identique
 * à celui réellement ouvert par les navigateurs et robuste dans les
 * navigateurs intégrés (Instagram, Facebook…) et anciennes versions de WhatsApp.
 */
export function encodeStrict(s: string): string {
  return encodeURIComponent(s).replace(
    /[!'()*]/g,
    (c) => "%" + c.charCodeAt(0).toString(16).toUpperCase(),
  );
}

export const genericOrderMessage =
  "Bonjour Dar L'Walida, je souhaite passer une commande via votre site.";

export function genericWhatsAppUrl(): string | null {
  return buildWhatsAppUrl(genericOrderMessage);
}

/** Formate un montant en dirhams : 152 → « 152 MAD ». */
export function formatMAD(amount: number): string {
  const n = Number.isInteger(amount) ? String(amount) : amount.toFixed(2);
  return `${n} MAD`;
}
