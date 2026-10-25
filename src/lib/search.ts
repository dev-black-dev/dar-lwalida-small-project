/**
 * ─────────────────────────────────────────────────────────────
 *  Recherche de plats — logique PURE (testable sans navigateur).
 *
 *  Objectifs :
 *  - rechercher le NOM EXACT des plats en français ET en arabe
 *    (jamais de plat inventé : on ne lit que src/data/menu.ts) ;
 *  - tolérer majuscules/minuscules, espaces multiples, accents
 *    (é, è, œ, ç…), apostrophes/tirets/ponctuation, diacritiques
 *    arabes, tatweel, variantes de alef/ya/ta-marbuta ;
 *  - absorber les fautes courantes (lettre doublée : « harrira »
 *    trouve « harira ») et quelques variantes usuelles (tajin→tajine) ;
 *  - filtrer par catégorie de carte ;
 *  - renvoyer aussi la catégorie, pour afficher/filtrer les résultats.
 * ─────────────────────────────────────────────────────────────
 */

import { isAvailableOn, menu } from "@/data/menu";
import type { MenuCategory, MenuItem, Weekday } from "@/data/menu";

/**
 * Variantes fréquentes → forme canonique.
 * Clés et valeurs sont déjà normalisées (voir `normalizeText`).
 */
const ALIASES: Record<string, string> = {
  tajin: "tajine",
  tajines: "tajine",
  tagine: "tajine",
  طاجن: "طاجين",
  طواجن: "طاجين",
  طنجيه: "طنجية",
  كسكسي: "كسكس",
  harrira: "harira",
  hrira: "harira",
  sfefa: "seffa",
  mahlabia: "mahlabiya",
  "coca cola": "coca",
};

/**
 * Normalise une chaîne pour la comparaison :
 * minuscules, accents retirés, séparateurs → espaces, espaces réduits.
 */
export function normalizeText(input: string): string {
  return (
    input
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // accents latins (é → e, ç → c…)
      .replace(/[œŒ]/g, "oe")
      .replace(/[æÆ]/g, "ae")
      .replace(/ß/g, "ss")
      .replace(/[\u0640]/g, "") // tatweel arabe (ـ)
      .replace(/[\u064B-\u065F\u0670]/g, "") // harakat / diacritiques arabes
      .replace(/[\u0623\u0625\u0622\u0671]/g, "\u0627") // أ إ آ ٱ → ا
      .replace(/[\u0649\u0626]/g, "\u064A") // ى ئ → ي
      .replace(/\u0629/g, "\u0647") // ة → ه
      .replace(/\u0624/g, "\u0648") // ؤ → و
      .toLowerCase()
      .replace(/[\u2018\u2019\u201B`´]/g, "'")
      // Tout ce qui n'est ni lettre ni chiffre devient un espace
      // (tirets, « – », « & », « ( ) », « ? », « / »…).
      .replace(/[^\p{L}\p{N}]+/gu, " ")
      .replace(/\s+/g, " ")
      .trim()
  );
}

/** Forme comparative d'un mot : alias + article arabe retiré + lettres doublées réduites. */
function foldToken(token: string): string {
  const noArticle = token.replace(/^(?:ال|الـ)/, "");
  const aliased = ALIASES[token] ?? ALIASES[noArticle] ?? noArticle;
  // Ne réduire les lettres doublées que sur les mots assez longs :
  // sinon « zzz » deviendrait « z » et matcherait « zaalouk » / « zero ».
  if (aliased.length < 4) return aliased;
  return aliased.replace(/(.)\1+/g, "$1");
}

/** Texte libre → mots comparables. Tableau vide si la requête est vide. */
export function tokenizeQuery(query: string): string[] {
  const normalized = normalizeText(query);
  if (!normalized) return [];
  return normalized.split(" ").map(foldToken);
}

/** Tous les mots de la requête doivent apparaître dans le nom/la catégorie. */
function matchesItem(item: MenuItem, cat: MenuCategory): (tokens: string[]) => boolean {
  const haystack = normalizeText(
    `${item.nameFr} ${item.nameAr} ${cat.labelFr} ${cat.labelAr}`,
  )
    .split(" ")
    .map(foldToken);
  return (tokens) => tokens.every((t) => haystack.some((h) => h.startsWith(t)));
}

export interface SearchHit {
  item: MenuItem;
  cat: MenuCategory;
}

export interface SearchOptions {
  /** Masquer les plats du jour non servis aujourd'hui. */
  hideUnavailable?: boolean;
  /** Jour courant (fuseau restaurant) ; null = inconnu → on n'écarte rien. */
  today?: Weekday | null;
  /** Limiter à une catégorie (id de `menu`) ; null/absent = toutes. */
  categoryId?: string | null;
}

/**
 * Recherche dans la VRAIE carte (`src/data/menu.ts`).
 * Renvoie [] si la requête est vide.
 */
export function searchMenu(query: string, options: SearchOptions = {}): SearchHit[] {
  const tokens = tokenizeQuery(query);
  if (tokens.length === 0) return [];

  return menu.flatMap((cat) => {
    if (options.categoryId && cat.id !== options.categoryId) return [];
    return cat.items
      .filter((i) => i.available !== false)
      .filter(
        (i) =>
          !options.hideUnavailable ||
          options.today === null ||
          options.today === undefined ||
          isAvailableOn(i, options.today),
      )
      .filter((i) => matchesItem(i, cat)(tokens))
      .map((item) => ({ item, cat }));
  });
}

/** Catégories réellement présentes dans un jeu de résultats (pour les puces de filtre). */
export function categoriesOf(hits: SearchHit[]): MenuCategory[] {
  const seen = new Map<string, MenuCategory>();
  for (const hit of hits) if (!seen.has(hit.cat.id)) seen.set(hit.cat.id, hit.cat);
  return [...seen.values()];
}
