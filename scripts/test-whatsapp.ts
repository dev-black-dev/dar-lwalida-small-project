/**
 * Tests de la commande WhatsApp (sans navigateur).
 * Lancer : npx --yes tsx scripts/test-whatsapp.ts
 */
import assert from "node:assert/strict";
import {
  normalizeWhatsAppNumber,
  getWhatsAppDestination,
  buildWhatsAppUrl,
  mapsEmbedUrl,
  mapsDirectionsUrl,
  mapsPlaceUrl,
  restaurant,
} from "../src/config/restaurant";
import { menu, menuItemsById, isAvailableOn } from "../src/data/menu";
import { buildCheckout, computeSubtotal, isValidPhone, validateCheckout } from "../src/lib/whatsapp";
import type { OrderLine } from "../src/lib/whatsapp";

let passed = 0;
const test = (name: string, fn: () => void) => {
  fn();
  passed++;
  console.log("✓", name);
};

test("normalisation du numéro (tous formats → 212619653918)", () => {
  for (const raw of ["0619653918", "06 19 65 39 18", "+212 6 19 65 39 18", "00212619653918", "212619653918", "+212 0619653918", "06.19.65.39.18"]) {
    assert.equal(normalizeWhatsAppNumber(raw), "212619653918", raw);
  }
  for (const bad of ["", "123", "0019", "abc", "2126196539", "06196539181"]) {
    assert.equal(normalizeWhatsAppNumber(bad), null, bad);
  }
  assert.equal(getWhatsAppDestination(), "212619653918");
});

test("menu : 31 plats, prix fournis, aucun prix nul", () => {
  const items = menu.flatMap((c) => c.items);
  assert.equal(items.length, 31);
  const expected: Record<string, number> = {
    "salade-lwalida": 42, harira: 35, taktouka: 28, bakkoula: 28, zaalouk: 28, lentilles: 28, "haricots-blancs": 28, "salade-marocaine": 23,
    "tajine-foie-veau": 108, "tajine-pied-veau": 88, "tanjia-lwalida": 88, "tajine-tete-boeuf": 83, "tajine-queue-boeuf": 83, "tripes-boeuf": 68, "tajine-kefta-beid": 68, "tajine-poulet-citron": 62, "tajine-kefta-sardines": 48,
    "vendredi-couscous-boeuf": 74, "mardi-seffa-poulet": 68, "vendredi-couscous-poulet": 68, "mercredi-rfissa": 63,
    "salade-fruits": 28, mahlabiya: 28,
    "cafe-espresso": 18, "the-menthe": 16, "coca-classique": 15, "coca-zero": 15, "hawai-tropical": 15, "poms-pomme": 15, "sprite-classique": 15, "sidi-ali": 10,
  };
  for (const [id, price] of Object.entries(expected)) assert.equal(menuItemsById[id]?.priceMAD, price, id);
});

test("plats du jour : disponibilité par jour", () => {
  const rfissa = menuItemsById["mercredi-rfissa"];
  assert.equal(isAvailableOn(rfissa, 3), true);
  assert.equal(isAvailableOn(rfissa, 5), false);
  assert.equal(isAvailableOn(menuItemsById["vendredi-couscous-boeuf"], 5), true);
  assert.equal(isAvailableOn(menuItemsById["mardi-seffa-poulet"], 1), false);
  assert.equal(isAvailableOn(menuItemsById["harira"], 1), true);
});

const lines: OrderLine[] = [
  { nameFr: "Tajine Kefta et Beid", priceMAD: 68, qty: 2 },
  { nameFr: "Thé à la Menthe", priceMAD: 16, qty: 1 },
];

test("sous-total : 2 × 68 + 1 × 16 = 152", () => {
  assert.equal(computeSubtotal(lines), 152);
});

test("validation des champs", () => {
  assert.deepEqual(validateCheckout([], { name: "", phone: "", mode: "delivery", address: "" }), ["cart", "name", "phone", "address"]);
  assert.deepEqual(validateCheckout(lines, { name: "Amina", phone: "0612345678", mode: "pickup" }), []);
  assert.deepEqual(validateCheckout(lines, { name: "Amina", phone: "0612345678", mode: "pickup" }, { hasUnavailable: true }), ["unavailable"]);
  assert.ok(isValidPhone("06 12 34 56 78"));
  assert.ok(isValidPhone("+212 6 12 34 56 78"));
  assert.ok(isValidPhone("+33 6 12 34 56 78"));
  assert.ok(!isValidPhone("12345"));
  assert.ok(!isValidPhone("06123"));
  assert.ok(!isValidPhone("abc0612345678"));
});

test("message + URL : accents, apostrophes, arabe, retours ligne, & # ?", () => {
  const details = {
    name: "Amina   Ben'Ali  بنعلي",
    phone: "06 12 34 56 78",
    mode: "delivery" as const,
    address: "12, rue de l'Indépendance & Co #3, Agdal — الرباط",
    notes: "Sans piment ?\n\n\n\nÉtage 2 — شكرا",
  };
  const { message, url } = buildCheckout(lines, details, { provisional: true });
  assert.ok(url);
  assert.ok(url!.startsWith("https://wa.me/212619653918?text="));
  assert.ok(!/[\s\n#&'()!*]/.test(url!.split("?text=")[1]), "aucun caractère non encodé (RFC 3986 strict)");
  assert.equal(decodeURIComponent(url!.split("?text=")[1]), message, "aller-retour exact");
  const expected = [
    "Bonjour Dar L’Walida,",
    "",
    "Je souhaite passer la commande suivante :",
    "",
    "- Tajine Kefta et Beid × 2 — 68 MAD l'unité",
    "- Thé à la Menthe × 1 — 16 MAD",
    "",
    "Sous-total : 152 MAD (prix indicatifs)",
    "Frais de livraison : à confirmer avec le restaurant",
    "Total (hors frais de livraison) : 152 MAD (prix indicatifs)",
    "",
    "Nom : Amina Ben'Ali بنعلي",
    "Téléphone : 06 12 34 56 78",
    "Type de commande : Livraison",
    "Adresse : 12, rue de l'Indépendance & Co #3, Agdal — الرباط",
    "Remarques : Sans piment ?\n\nÉtage 2 — شكرا",
    "",
    "Merci de confirmer ma commande.",
  ].join("\n");
  assert.equal(message, expected);
  console.log("\n--- MESSAGE GÉNÉRÉ ---\n" + message + "\n--- URL ---\n" + url + "\n");
});

test("à emporter : total simple, aucun frais de livraison, pas de Notes vides", () => {
  const { message } = buildCheckout(lines, { name: "Youssef", phone: "+212612345678", mode: "pickup", address: "ignored", notes: "  " });
  assert.ok(message.includes("Type de commande : À emporter"));
  assert.ok(message.includes("Total : 152 MAD"));
  assert.ok(!message.includes("Frais de livraison"));
  assert.ok(!message.includes("Adresse :"));
  assert.ok(!message.includes("Remarques :"));
});

test("livraison avec frais confirmés : frais affichés et ajoutés au total", () => {
  const { message } = buildCheckout(
    lines,
    { name: "Youssef", phone: "0612345678", mode: "delivery", address: "12 rue Oqba, Agdal, Rabat" },
    { deliveryFeeMAD: 20 },
  );
  assert.ok(message.includes("Frais de livraison : 20 MAD"));
  assert.ok(message.includes("Sous-total : 152 MAD"));
  assert.ok(message.includes("Total : 172 MAD"), "152 + 20 = 172");
  assert.ok(!message.includes("hors frais de livraison"));
});

test("livraison frais = 0 (offerts) : frais affichés, total inchangé", () => {
  const { message } = buildCheckout(
    lines,
    { name: "Youssef", phone: "0612345678", mode: "delivery", address: "12 rue Oqba, Agdal, Rabat" },
    { deliveryFeeMAD: 0 },
  );
  assert.ok(message.includes("Frais de livraison : 0 MAD"));
  assert.ok(message.includes("Total : 152 MAD"));
});

test("livraison frais inconnus : jamais inventés, total hors livraison", () => {
  const { message } = buildCheckout(
    lines,
    { name: "Youssef", phone: "0612345678", mode: "delivery", address: "12 rue Oqba, Agdal, Rabat" },
    { deliveryFeeMAD: null },
  );
  assert.ok(message.includes("Frais de livraison : à confirmer avec le restaurant"));
  assert.ok(message.includes("Total (hors frais de livraison) : 152 MAD"));
});

test("arabe : noms arabes exacts, accents et sauts de ligne encodés", () => {
  const arLines: OrderLine[] = [
    { nameFr: "Tajine Kefta et Beid", nameAr: "طاجين الكفتة بالبيض", priceMAD: 68, qty: 2 },
    { nameFr: "Thé à la Menthe", nameAr: "شاي بالنعناع", priceMAD: 16, qty: 1 },
  ];
  const { message, url } = buildCheckout(
    arLines,
    { name: "أمينة", phone: "0612345678", mode: "pickup", notes: "بدون حار\n\nشكرا" },
    { lang: "ar", provisional: true },
  );
  assert.ok(message.includes("- طاجين الكفتة بالبيض × 2 — 68 MAD للوحدة"));
  assert.ok(message.includes("- شاي بالنعناع × 1 — 16 MAD"));
  assert.ok(message.includes("المجموع الفرعي : 152 MAD (أسعار تقديرية)"));
  assert.ok(message.includes("المجموع : 152 MAD (أسعار تقديرية)"));
  assert.ok(message.includes("الاسم : أمينة"));
  assert.ok(message.includes("نوع الطلب : استلام من المطعم"));
  assert.ok(message.includes("ملاحظات : بدون حار\n\nشكرا"));
  assert.ok(!message.includes("رسوم التوصيل"));
  assert.ok(url);
  assert.equal(decodeURIComponent(url!.split("?text=")[1]), message);
});

test("URL générique valide", () => {
  assert.equal(buildWhatsAppUrl(""), "https://wa.me/212619653918");
});

test("Google Maps : coordonnées OSM exactes, aucune clé API", () => {
  assert.equal(restaurant.geo.lat, 34.0152509);
  assert.equal(restaurant.geo.lng, -6.8348421);
  assert.ok(mapsEmbedUrl.includes("34.0152509,-6.8348421"));
  assert.ok(mapsEmbedUrl.includes("output=embed"));
  assert.ok(mapsDirectionsUrl.includes("destination=34.0152509,-6.8348421"));
  assert.ok(mapsPlaceUrl.includes("query=34.0152509,-6.8348421"));
  assert.equal(restaurant.instagram.url, "https://www.instagram.com/nassim_ela/");
  assert.equal(restaurant.credit, "Designed & Developed by Black.");
});

console.log(`\n${passed} tests réussis.`);
