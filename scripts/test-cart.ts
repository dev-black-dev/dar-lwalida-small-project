/**
 * Tests du panier et de la recherche (sans navigateur).
 * Lancer : npx --yes tsx scripts/test-cart.ts
 */
import assert from "node:assert/strict";
import { menuItemsById } from "../src/data/menu";
import {
  addLine,
  addToCartStore,
  clearCartStore,
  countLines,
  decreaseInCart,
  decreaseLine,
  getCartSnapshot,
  increaseInCart,
  increaseLine,
  MAX_QTY,
  normalizeStoredLines,
  removeFromCart,
  removeLine,
  resetCartStoreForTests,
  subscribeCart,
  subtotalLines,
} from "../src/lib/cart-store";
import { categoriesOf, normalizeText, searchMenu, tokenizeQuery } from "../src/lib/search";
import { buildCheckout } from "../src/lib/whatsapp";
import type { OrderLine } from "../src/lib/whatsapp";

let passed = 0;
const test = (name: string, fn: () => void) => {
  fn();
  passed++;
  console.log("✓", name);
};

const ids = (hits: ReturnType<typeof searchMenu>) => hits.map((h) => h.item.id).sort();

/* ─────────────────────────── panier : opérations pures ─────────────────────────── */

test("ajout : 3 plats différents → 3 lignes, pas de doublon", () => {
  let lines = addLine([], "tajine-kefta-beid");
  lines = addLine(lines, "the-menthe");
  lines = addLine(lines, "harira");
  assert.deepEqual(
    lines.map((l) => l.id),
    ["tajine-kefta-beid", "the-menthe", "harira"],
  );
  assert.equal(countLines(lines), 3);
});

test("re-ajout du même plat : la quantité augmente (pas de doublon)", () => {
  let lines = addLine([], "tajine-kefta-beid");
  lines = addLine(lines, "tajine-kefta-beid");
  lines = addLine(lines, "tajine-kefta-beid");
  assert.equal(lines.length, 1);
  assert.equal(lines[0].qty, 3);
});

test("+1 / −1 / retrait, et −1 à zéro supprime la ligne", () => {
  let lines = addLine([], "the-menthe");
  lines = increaseLine(lines, "the-menthe");
  assert.equal(lines[0].qty, 2);
  lines = decreaseLine(lines, "the-menthe");
  assert.equal(lines[0].qty, 1);
  lines = decreaseLine(lines, "the-menthe");
  assert.deepEqual(lines, []);
  lines = addLine(addLine([], "harira"), "the-menthe");
  assert.equal(removeLine(lines, "harira").length, 1);
});

test("quantité bornée à MAX_QTY", () => {
  let lines = addLine([], "harira");
  for (let i = 0; i < MAX_QTY + 10; i++) lines = increaseLine(lines, "harira");
  assert.equal(lines[0].qty, MAX_QTY);
});

test("sous-total calculé depuis les VRAIS prix de la carte", () => {
  const lines = addLine(addLine(addLine([], "tajine-kefta-beid"), "tajine-kefta-beid"), "the-menthe");
  assert.equal(subtotalLines(lines), 68 * 2 + 16);
});

test("normalizeStoredLines : ids inconnus/doublons/quantités invalides écartés", () => {
  const cleaned = normalizeStoredLines([
    { id: "harira", qty: 2 },
    { id: "harira", qty: 5 }, // doublon ignoré
    { id: "plat-inexistant", qty: 3 }, // hors carte
    { id: "the-menthe", qty: 0 }, // quantité nulle
    { id: "tajine-kefta-beid", qty: -4 },
    { id: "the-menthe", qty: 2.7 }, // arrondi
    "bruit",
    null,
  ]);
  assert.deepEqual(cleaned, [
    { id: "harira", qty: 2 },
    { id: "the-menthe", qty: 2 },
  ]);
  assert.deepEqual(normalizeStoredLines("pas un tableau"), []);
  assert.deepEqual(normalizeStoredLines(undefined), []);
});

/* ─────────────────────────── panier : store observable ─────────────────────────── */

test("store : ajouter/re-ajouter/incrémentation/décrémenter/retirer/vider", () => {
  resetCartStoreForTests();
  const notifications: number[] = [];
  const unsubscribe = subscribeCart(() => notifications.push(getCartSnapshot().length));

  addToCartStore("tajine-kefta-beid");
  addToCartStore("tajine-kefta-beid");
  addToCartStore("sidi-ali");
  assert.equal(getCartSnapshot().length, 2);
  assert.equal(getCartSnapshot().find((l) => l.id === "tajine-kefta-beid")!.qty, 2);
  assert.equal(countLines(getCartSnapshot()), 3);

  increaseInCart("sidi-ali");
  assert.equal(subtotalLines(getCartSnapshot()), 68 * 2 + 10 * 2);

  decreaseInCart("sidi-ali");
  assert.equal(getCartSnapshot().find((l) => l.id === "sidi-ali")!.qty, 1);

  removeFromCart("tajine-kefta-beid");
  assert.deepEqual(getCartSnapshot().map((l) => l.id), ["sidi-ali"]);

  addToCartStore("plat-qui-nexiste-pas");
  assert.deepEqual(getCartSnapshot().map((l) => l.id), ["sidi-ali"], "id inconnu ignoré");

  clearCartStore();
  assert.deepEqual(getCartSnapshot(), []);
  assert.deepEqual(notifications, [1, 1, 2, 2, 2, 1, 0], "chaque mutation notifie les abonnés");

  unsubscribe();
  resetCartStoreForTests();
});

/* ─────────────────────────── recherche ─────────────────────────── */

test("normalisation : casse, accents, œ, ponctuation, espaces", () => {
  assert.equal(normalizeText("  TÊTE de BŒUF  "), "tete de boeuf");
  assert.equal(normalizeText("Soupe Marocaine – Harira"), "soupe marocaine harira");
  assert.equal(normalizeText("Coca-Cola Classique (50 cl)"), "coca cola classique 50 cl");
  assert.deepEqual(tokenizeQuery("   TAJINE   Kefta "), ["tajine", "kefta"]);
});

test("recherche FR : casse, espaces multiples, accents, underscore", () => {
  assert.ok(ids(searchMenu("TAJINE")).length >= 6);
  assert.deepEqual(ids(searchMenu("  tajine   kefta ")), [
    "tajine-kefta-beid",
    "tajine-kefta-sardines",
  ]);
  assert.deepEqual(ids(searchMenu("tajine kefta sardines")), ["tajine-kefta-sardines"]);
  assert.deepEqual(ids(searchMenu("the menthe")), ["the-menthe"]);
  assert.deepEqual(ids(searchMenu("harira")), ["harira"]);
  assert.deepEqual(ids(searchMenu("boeuf")).includes("tajine-tete-boeuf"), true);
});

test("recherche : variantes d'orthographe et préfixes", () => {
  assert.deepEqual(ids(searchMenu("harrira")), ["harira"], "lettre doublée tolérée");
  assert.ok(ids(searchMenu("tajin")).length >= 6, "alias tajin → tajine");
  assert.ok(ids(searchMenu("taj")).length >= 6, "préfixe accepté");
  assert.deepEqual(searchMenu("zzz"), [], "mot court absurde → aucun résultat");
});

test("recherche AR : diacritiques, variantes alef/ta-marbuta, article", () => {
  assert.ok(ids(searchMenu("طاجين")).length >= 6);
  assert.deepEqual(ids(searchMenu("طَاجِين")), ids(searchMenu("طاجين")), "harakat ignorés");
  assert.ok(ids(searchMenu("الحريره")).includes("harira"), "ة/ه tolérés");
  assert.deepEqual(ids(searchMenu("كسكس")), ["vendredi-couscous-boeuf", "vendredi-couscous-poulet"]);
});

test("recherche par catégorie (libellé) et filtre de catégorie", () => {
  assert.equal(ids(searchMenu("boissons")).length, 8, "le libellé de catégorie est cherché");
  assert.deepEqual(
    ids(searchMenu("couscous", { categoryId: "plats-du-jour" })),
    ["vendredi-couscous-boeuf", "vendredi-couscous-poulet"],
  );
  assert.deepEqual(ids(searchMenu("couscous", { categoryId: "boissons" })), []);
});

test("requête vide → aucun résultat ; requête inconnue → état vide", () => {
  assert.deepEqual(searchMenu(""), []);
  assert.deepEqual(searchMenu("   "), []);
  assert.deepEqual(searchMenu("zzzz-introuvable"), []);
});

test("plats du jour : filtre « masquer les non servis »", () => {
  assert.equal(ids(searchMenu("couscous", { hideUnavailable: true, today: 1 })).length, 0);
  assert.equal(ids(searchMenu("couscous", { hideUnavailable: true, today: 5 })).length, 2);
  assert.equal(ids(searchMenu("couscous", { hideUnavailable: true, today: null })).length, 2);
});

test("categoriesOf : catégories uniques, dans l'ordre de la carte", () => {
  const cats = categoriesOf(searchMenu("tajine"));
  assert.ok(cats.length >= 1 && cats[0].id === "tajines");
});

test("la recherche ne modifie JAMAIS le panier", () => {
  resetCartStoreForTests();
  addToCartStore("tajine-kefta-beid");
  addToCartStore("the-menthe");
  const before = JSON.stringify(getCartSnapshot());
  for (const q of ["tajine", "boissons", "كسكس", "zzz", "harira"]) searchMenu(q);
  assert.equal(JSON.stringify(getCartSnapshot()), before);
  resetCartStoreForTests();
});

/* ─────────────── parcours complet : 3 plats, doublon, livraison & emporter ─────────────── */

function orderLinesFromCart(): OrderLine[] {
  return getCartSnapshot().map((l) => {
    const item = menuItemsById[l.id];
    return { nameFr: item.nameFr, nameAr: item.nameAr, priceMAD: item.priceMAD, qty: l.qty };
  });
}

test("parcours livraison : message complet, exact, sans plat non choisi", () => {
  resetCartStoreForTests();
  addToCartStore("tajine-kefta-beid");
  addToCartStore("tajine-kefta-beid"); // répétition du même plat → ×2
  addToCartStore("harira");
  addToCartStore("the-menthe");

  const lines = orderLinesFromCart();
  assert.equal(lines.length, 3, "trois plats distincts, le doublon fusionné");
  const { message, url } = buildCheckout(lines, {
    name: "Amina Benali",
    phone: "0612345678",
    mode: "delivery",
    address: "12 rue Oqba, Agdal, Rabat",
    notes: "Sans piment",
  });

  for (const name of ["Tajine Kefta et Beid", "Soupe Marocaine – Harira", "Thé à la Menthe"]) {
    assert.equal(message.split(name).length - 1, 1, `${name} apparaît exactement une fois`);
  }
  assert.ok(message.includes("- Tajine Kefta et Beid × 2 — 68 MAD l'unité"));
  assert.ok(message.includes("- Soupe Marocaine – Harira × 1 — 35 MAD"));
  assert.ok(message.includes("- Thé à la Menthe × 1 — 16 MAD"));
  assert.ok(message.includes("Sous-total : 187 MAD"));
  assert.ok(message.includes("Total (hors frais de livraison) : 187 MAD"));
  assert.ok(message.includes("Type de commande : Livraison"));
  assert.ok(message.includes("Adresse : 12 rue Oqba, Agdal, Rabat"));
  assert.ok(message.includes("Remarques : Sans piment"));
  assert.ok(!message.includes("Sidi Ali"), "aucun plat non sélectionné");
  assert.ok(!message.includes("Taktouka"), "aucun plat non sélectionné");
  assert.ok(url?.startsWith("https://wa.me/212619653918?text="));
  assert.equal(decodeURIComponent(url!.split("?text=")[1]), message);
  resetCartStoreForTests();
});

test("parcours à emporter : total simple et libellé correct", () => {
  resetCartStoreForTests();
  addToCartStore("tanjia-lwalida");
  addToCartStore("salade-fruits");
  const { message } = buildCheckout(orderLinesFromCart(), {
    name: "Karim",
    phone: "+212 6 12 34 56 78",
    mode: "pickup",
  });
  assert.ok(message.includes("Type de commande : À emporter"));
  assert.ok(message.includes("Sous-total : 116 MAD"));
  assert.ok(message.includes("Total : 116 MAD"));
  assert.ok(!message.includes("Frais de livraison"));
  assert.ok(!message.includes("Adresse :"));
  resetCartStoreForTests();
});

console.log(`\n${passed} tests panier/recherche réussis.`);
