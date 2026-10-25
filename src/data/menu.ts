/**
 * ─────────────────────────────────────────────────────────────
 *  LA CARTE — src/data/menu.ts  (fichier unique à éditer)
 *
 *  ⚠️ PRIX PROVISOIRES : relevés sur la fiche Glovo du restaurant.
 *  Les prix des plateformes de livraison peuvent différer des prix
 *  pratiqués au restaurant. Ils N'ONT PAS été validés par le
 *  propriétaire. Une fois confirmés, passez `priceStatus` à
 *  "verified" (ou `menuSettings.pricesProvisional` à false).
 *
 *  DISPONIBILITÉ :
 *  - `available: false`     → le plat est masqué partout.
 *  - `availableDays: [5]`   → plat du jour (0 = dimanche … 6 = samedi),
 *                             fuseau Africa/Casablanca.
 *  - `menuSettings.hideUnavailableDailyDishes: true`
 *                           → les plats du jour sont masqués les jours
 *                             où ils ne sont pas servis (sinon : affichés
 *                             avec leur jour, non commandables).
 *
 *  Aucun ingrédient, allergène ou plat supplémentaire n'a été inventé.
 * ─────────────────────────────────────────────────────────────
 */

import type { AssetKey } from "@/config/assets";

/** 0 = dimanche, 1 = lundi, … 6 = samedi */
export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export interface MenuItem {
  id: string;
  nameFr: string;
  nameAr: string;
  priceMAD: number;
  priceStatus: "provisional" | "verified";
  photo?: AssetKey;
  /** false = masqué (rupture, retiré…). Défaut : true. */
  available?: boolean;
  /** Plat du jour : jours où il est servi. */
  availableDays?: Weekday[];
}

export interface MenuCategory {
  id: string;
  labelFr: string;
  labelAr: string;
  introFr: string;
  introAr: string;
  /** Bannière photo ; sinon bannière à motif zellige. */
  banner?: AssetKey;
  items: MenuItem[];
}

export const menuSettings = {
  /** Source des prix affichés. */
  priceSource: "Glovo",
  /** true = tous les prix sont signalés « indicatifs, à confirmer ». */
  pricesProvisional: true,
  /** true = masquer les plats du jour les jours où ils ne sont pas servis. */
  hideUnavailableDailyDishes: false,
  currency: "MAD",
} as const;

export const weekdayNames: Record<"fr" | "ar", string[]> = {
  fr: ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"],
  ar: ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"],
};

const P = "provisional" as const;

export const menu: MenuCategory[] = [
  {
    id: "entrees",
    labelFr: "Entrées",
    labelAr: "المقبلات",
    introFr: "Salades marocaines et harira, pour bien commencer le repas.",
    introAr: "سلطات مغربية وحريرة، لبداية شهية.",
    banner: "banner-entrees",
    items: [
      { id: "salade-lwalida", nameFr: "Salade L'Walida", nameAr: "سلطة الوليدة", priceMAD: 42, priceStatus: P, photo: "dish-salade-lwalida" },
      { id: "harira", nameFr: "Soupe Marocaine – Harira", nameAr: "الحريرة المغربية", priceMAD: 35, priceStatus: P, photo: "dish-harira" },
      { id: "taktouka", nameFr: "Taktouka", nameAr: "تكتوكة", priceMAD: 28, priceStatus: P, photo: "dish-taktouka" },
      { id: "bakkoula", nameFr: "Bakkoula", nameAr: "بقولة", priceMAD: 28, priceStatus: P, photo: "dish-bakkoula" },
      { id: "zaalouk", nameFr: "Zaalouk", nameAr: "زعلوك", priceMAD: 28, priceStatus: P, photo: "dish-zaalouk" },
      { id: "lentilles", nameFr: "Lentilles", nameAr: "عدس", priceMAD: 28, priceStatus: P, photo: "dish-lentilles" },
      { id: "haricots-blancs", nameFr: "Haricots Blancs", nameAr: "لوبيا بيضاء", priceMAD: 28, priceStatus: P, photo: "dish-haricots-blancs" },
      { id: "salade-marocaine", nameFr: "Salade Marocaine", nameAr: "سلطة مغربية", priceMAD: 23, priceStatus: P, photo: "dish-salade-marocaine" },
    ],
  },
  {
    id: "tajines",
    labelFr: "Tajines",
    labelAr: "الطواجن",
    introFr: "Mijotés en terre cuite, dans la pure tradition marocaine.",
    introAr: "مطهوة في الفخار على الطريقة المغربية الأصيلة.",
    banner: "banner-tajines",
    items: [
      { id: "tajine-foie-veau", nameFr: "Tajine Foie de Veau", nameAr: "طاجين كبدة العجل", priceMAD: 108, priceStatus: P, photo: "dish-tajine-foie-veau" },
      { id: "tajine-pied-veau", nameFr: "Tajine Pied de Veau", nameAr: "طاجين كرعين العجل", priceMAD: 88, priceStatus: P, photo: "dish-tajine-pied-veau" },
      { id: "tanjia-lwalida", nameFr: "Tanjia L'Walida", nameAr: "طنجية الوليدة", priceMAD: 88, priceStatus: P, photo: "dish-tanjia-lwalida" },
      { id: "tajine-tete-boeuf", nameFr: "Tajine Tête de Bœuf", nameAr: "طاجين رأس البقر", priceMAD: 83, priceStatus: P, photo: "dish-tajine-tete-boeuf" },
      { id: "tajine-queue-boeuf", nameFr: "Tajine de Queue de Bœuf", nameAr: "طاجين ذيل البقر", priceMAD: 83, priceStatus: P, photo: "dish-tajine-queue-boeuf" },
      { id: "tripes-boeuf", nameFr: "Tripes de Bœuf", nameAr: "كرشة البقر", priceMAD: 68, priceStatus: P, photo: "dish-tripes-boeuf" },
      {
        id: "tajine-kefta-beid",
        nameFr: "Tajine Kefta et Beid",
        nameAr: "طاجين الكفتة بالبيض",
        priceMAD: 68,
        priceStatus: P,
        photo: "dish-tajine-kefta-oeufs",
      },
      { id: "tajine-poulet-citron", nameFr: "Tajine Poulet au Citron Confit", nameAr: "طاجين الدجاج بالحامض المرقد", priceMAD: 62, priceStatus: P, photo: "dish-tajine-poulet-citron" },
      { id: "tajine-kefta-sardines", nameFr: "Tajine de Kefta de Sardines", nameAr: "طاجين كفتة السردين", priceMAD: 48, priceStatus: P, photo: "dish-tajine-kefta-sardines" },
    ],
  },
  {
    id: "plats-du-jour",
    labelFr: "Plats du jour",
    labelAr: "أطباق اليوم",
    introFr: "Chaque plat est servi uniquement le jour indiqué.",
    introAr: "كل طبق يُقدَّم فقط في اليوم المحدد.",
    banner: "banner-plats-du-jour",
    items: [
      { id: "mardi-seffa-poulet", nameFr: "Mardi – Seffa au Poulet", nameAr: "الثلاثاء – سفة بالدجاج", priceMAD: 68, priceStatus: P, availableDays: [2], photo: "dish-seffa" },
      { id: "mercredi-rfissa", nameFr: "Mercredi – Rfissa", nameAr: "الأربعاء – رفيسة", priceMAD: 63, priceStatus: P, availableDays: [3], photo: "dish-rfissa" },
      { id: "vendredi-couscous-boeuf", nameFr: "Vendredi – Couscous Viande Bœuf", nameAr: "الجمعة – كسكس بلحم البقر", priceMAD: 74, priceStatus: P, availableDays: [5], photo: "dish-couscous-boeuf" },
      { id: "vendredi-couscous-poulet", nameFr: "Vendredi – Couscous Poulet", nameAr: "الجمعة – كسكس بالدجاج", priceMAD: 68, priceStatus: P, availableDays: [5], photo: "dish-couscous-poulet" },
    ],
  },
  {
    id: "desserts",
    labelFr: "Desserts",
    labelAr: "الحلويات",
    introFr: "Une touche de douceur pour terminer.",
    introAr: "لمسة حلوة لختام الوجبة.",
    items: [
      { id: "salade-fruits", nameFr: "Salade de Fruits Frais", nameAr: "سلطة الفواكه الطازجة", priceMAD: 28, priceStatus: P, photo: "dish-salade-fruits" },
      { id: "mahlabiya", nameFr: "Mahlabiya", nameAr: "مهلبية", priceMAD: 28, priceStatus: P, photo: "dish-mahlabiya" },
    ],
  },
  {
    id: "boissons",
    labelFr: "Boissons",
    labelAr: "المشروبات",
    introFr: "Thé à la menthe, café et boissons fraîches.",
    introAr: "شاي بالنعناع، قهوة ومشروبات باردة.",
    items: [
      { id: "cafe-espresso", nameFr: "Café Espresso", nameAr: "قهوة إسبريسو", priceMAD: 18, priceStatus: P, photo: "dish-cafe-espresso" },
      { id: "the-menthe", nameFr: "Thé à la Menthe", nameAr: "شاي بالنعناع", priceMAD: 16, priceStatus: P, photo: "dish-the-menthe" },
      { id: "coca-classique", nameFr: "Coca-Cola Classique (50 cl)", nameAr: "كوكاكولا كلاسيك (50 سل)", priceMAD: 15, priceStatus: P, photo: "dish-coca-classique" },
      { id: "coca-zero", nameFr: "Coca-Cola Zero (50 cl)", nameAr: "كوكاكولا زيرو (50 سل)", priceMAD: 15, priceStatus: P, photo: "dish-coca-zero" },
      { id: "hawai-tropical", nameFr: "Hawaï Tropical (50 cl)", nameAr: "هاواي تروبيكال (50 سل)", priceMAD: 15, priceStatus: P, photo: "dish-hawai-tropical" },
      { id: "poms-pomme", nameFr: "Pom's Pomme (50 cl)", nameAr: "بومز تفاح (50 سل)", priceMAD: 15, priceStatus: P, photo: "dish-poms-pomme" },
      { id: "sprite-classique", nameFr: "Sprite Classique (50 cl)", nameAr: "سبرايت كلاسيك (50 سل)", priceMAD: 15, priceStatus: P, photo: "dish-sprite-classique" },
      { id: "sidi-ali", nameFr: "Sidi Ali (50 cl)", nameAr: "سيدي علي (50 سل)", priceMAD: 10, priceStatus: P, photo: "dish-sidi-ali" },
    ],
  },
];

/** Index par id (plats masqués via `available: false` exclus). */
export const menuItemsById: Record<string, MenuItem> = Object.fromEntries(
  menu
    .flatMap((c) => c.items)
    .filter((i) => i.available !== false)
    .map((i) => [i.id, i]),
);

/** Plat commandable aujourd'hui ? (`today` null = inconnu → on autorise). */
export function isAvailableOn(item: MenuItem, today: Weekday | null): boolean {
  if (item.available === false) return false;
  if (!item.availableDays || today === null) return true;
  return item.availableDays.includes(today);
}

/** Le prix est-il signalé comme provisoire ? */
export function isPriceProvisional(item: MenuItem): boolean {
  return menuSettings.pricesProvisional || item.priceStatus !== "verified";
}
