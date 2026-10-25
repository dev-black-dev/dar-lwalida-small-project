/**
 * ─────────────────────────────────────────────────────────────
 *  Panier — SOURCE UNIQUE DE VÉRITÉ (store externe, sans backend).
 *
 *  Ce module contient :
 *  1. des opérations PURES sur les lignes (`addLine`, `decreaseLine`…)
 *     testables sans navigateur ;
 *  2. un store observable (module-level) utilisé par React via
 *     `useSyncExternalStore` dans src/lib/cart.tsx.
 *
 *  Pourquoi un store externe ? Pour éviter tout `setState` dans un
 *  effet d'hydratation (règle react-hooks/set-state-in-effect) et
 *  garantir une seule source de vérité, persistée dans localStorage.
 * ─────────────────────────────────────────────────────────────
 */

import { menuItemsById } from "@/data/menu";

/** Ligne minimale persistée : identifiant de plat + quantité. */
export interface StoredLine {
  id: string;
  qty: number;
}

export const CART_STORAGE_KEY = "dlw.cart.v2";
export const MAX_QTY = 50;

/* ───────────────────────── opérations pures ───────────────────────── */

/** Nettoie une valeur lue du stockage : ids connus, quantités 1..MAX_QTY. */
export function normalizeStoredLines(input: unknown): StoredLine[] {
  if (!Array.isArray(input)) return [];
  const out: StoredLine[] = [];
  const seen = new Set<string>();
  for (const raw of input) {
    if (typeof raw !== "object" || raw === null) continue;
    const { id, qty } = raw as Partial<StoredLine>;
    if (typeof id !== "string" || typeof qty !== "number") continue;
    if (!Number.isFinite(qty) || qty <= 0) continue;
    if (menuItemsById[id] === undefined) continue; // plat retiré de la carte → ignoré
    if (seen.has(id)) continue; // pas de doublon
    seen.add(id);
    out.push({ id, qty: Math.min(MAX_QTY, Math.floor(qty)) });
  }
  return out;
}

/** Ajoute 1 : incrémente la ligne existante, sinon crée la ligne. */
export function addLine(lines: StoredLine[], id: string): StoredLine[] {
  const existing = lines.find((l) => l.id === id);
  if (!existing) return [...lines, { id, qty: 1 }];
  if (existing.qty >= MAX_QTY) return lines;
  return lines.map((l) => (l.id === id ? { ...l, qty: l.qty + 1 } : l));
}

/** +1 (borné à MAX_QTY). */
export function increaseLine(lines: StoredLine[], id: string): StoredLine[] {
  const existing = lines.find((l) => l.id === id);
  if (!existing || existing.qty >= MAX_QTY) return lines;
  return lines.map((l) => (l.id === id ? { ...l, qty: l.qty + 1 } : l));
}

/** −1 ; la ligne disparaît à 0. */
export function decreaseLine(lines: StoredLine[], id: string): StoredLine[] {
  const existing = lines.find((l) => l.id === id);
  if (!existing) return lines;
  return lines
    .map((l) => (l.id === id ? { ...l, qty: l.qty - 1 } : l))
    .filter((l) => l.qty > 0);
}

/** Retire complètement une ligne. */
export function removeLine(lines: StoredLine[], id: string): StoredLine[] {
  return lines.filter((l) => l.id !== id);
}

/** Nombre total d'articles (somme des quantités). */
export function countLines(lines: StoredLine[]): number {
  return lines.reduce((sum, l) => sum + l.qty, 0);
}

/** Sous-total calculé depuis la carte (prix × quantités). */
export function subtotalLines(lines: StoredLine[]): number {
  return lines.reduce((sum, l) => sum + (menuItemsById[l.id]?.priceMAD ?? 0) * l.qty, 0);
}

/* ───────────────────────── store observable ───────────────────────── */

const EMPTY: StoredLine[] = [];
let snapshot: StoredLine[] = EMPTY;
let hydrated = false;
const listeners = new Set<() => void>();

function persist(next: StoredLine[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* stockage indisponible (navigation privée…) */
  }
}

function commit(next: StoredLine[]): void {
  snapshot = next;
  persist(next);
  for (const listener of listeners) listener();
}

export function subscribeCart(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Référence stable : identique tant que le panier n'a pas changé. */
export function getCartSnapshot(): StoredLine[] {
  return snapshot;
}

/** Valeur utilisée côté serveur et pendant l'hydratation. */
export function getServerCartSnapshot(): StoredLine[] {
  return EMPTY;
}

/** Lit localStorage une seule fois (côté client). */
export function hydrateCart(): void {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(CART_STORAGE_KEY);
  } catch {
    raw = null;
  }
  let parsed: unknown = null;
  try {
    parsed = raw ? JSON.parse(raw) : null;
  } catch {
    parsed = null;
  }
  const next = normalizeStoredLines(parsed);
  if (next.length > 0) commit(next);
}

export function addToCartStore(id: string): void {
  if (menuItemsById[id] === undefined) return;
  commit(addLine(snapshot, id));
}

export function increaseInCart(id: string): void {
  commit(increaseLine(snapshot, id));
}

export function decreaseInCart(id: string): void {
  commit(decreaseLine(snapshot, id));
}

export function removeFromCart(id: string): void {
  commit(removeLine(snapshot, id));
}

export function clearCartStore(): void {
  commit(EMPTY);
}

/** Réservé aux tests : remet le store à zéro. */
export function resetCartStoreForTests(): void {
  snapshot = EMPTY;
  hydrated = false;
  listeners.clear();
}
