"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import type { ReactNode } from "react";
import { isAvailableOn, menuItemsById } from "@/data/menu";
import type { MenuItem, Weekday } from "@/data/menu";
import type { OrderLine } from "@/lib/whatsapp";
import { useToday } from "@/lib/today";
import {
  addToCartStore,
  clearCartStore,
  decreaseInCart,
  getCartSnapshot,
  getServerCartSnapshot,
  hydrateCart,
  increaseInCart,
  removeFromCart,
  subscribeCart,
} from "@/lib/cart-store";

/**
 * Panier client (aucun backend).
 *
 * Les lignes vivent dans un STORE EXTERNE unique (src/lib/cart-store.ts),
 * lu ici via `useSyncExternalStore` : une seule source de vérité,
 * hydratation sans `setState` dans un effet, persistance localStorage.
 * Seul l'état d'interface (tiroir, modale, toast) est local à React.
 */

export interface CartDetailLine {
  item: MenuItem;
  qty: number;
  lineTotal: number;
  availableToday: boolean;
}

interface CartValue {
  lines: CartDetailLine[];
  orderLines: OrderLine[];
  count: number;
  subtotal: number;
  hasUnavailable: boolean;
  today: Weekday | null;
  add: (id: string) => void;
  increase: (id: string) => void;
  decrease: (id: string) => void;
  remove: (id: string) => void;
  clear: () => void;
  qtyOf: (id: string) => number;
  drawerOpen: boolean;
  setDrawerOpen: (open: boolean) => void;
  checkoutOpen: boolean;
  setCheckoutOpen: (open: boolean) => void;
  toastItemId: string | null;
}

const CartContext = createContext<CartValue | null>(null);
const TOAST_MS = 2200;

export function CartProvider({ children }: { children: ReactNode }) {
  const stored = useSyncExternalStore(subscribeCart, getCartSnapshot, getServerCartSnapshot);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [toastItemId, setToastItemId] = useState<string | null>(null);
  const toastTimer = useRef<number | null>(null);
  const today = useToday();

  // Hydratation unique depuis localStorage (mutate le store externe,
  // aucun setState : la règle react-hooks/set-state-in-effect est respectée).
  useEffect(() => {
    hydrateCart();
  }, []);

  const showToast = useCallback((id: string) => {
    setToastItemId(id);
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToastItemId(null), TOAST_MS);
  }, []);

  const add = useCallback(
    (id: string) => {
      const item = menuItemsById[id];
      if (!item || !isAvailableOn(item, today)) return;
      addToCartStore(id);
      showToast(id);
    },
    [today, showToast],
  );

  const increase = useCallback((id: string) => increaseInCart(id), []);
  const decrease = useCallback((id: string) => decreaseInCart(id), []);
  const remove = useCallback((id: string) => removeFromCart(id), []);
  const clear = useCallback(() => clearCartStore(), []);

  const lines = useMemo<CartDetailLine[]>(
    () =>
      stored.flatMap((l) => {
        const item = menuItemsById[l.id];
        if (!item) return [];
        return [
          {
            item,
            qty: l.qty,
            lineTotal: item.priceMAD * l.qty,
            availableToday: isAvailableOn(item, today),
          },
        ];
      }),
    [stored, today],
  );

  const orderLines = useMemo<OrderLine[]>(
    () =>
      lines.map((l) => ({
        nameFr: l.item.nameFr,
        nameAr: l.item.nameAr,
        priceMAD: l.item.priceMAD,
        qty: l.qty,
      })),
    [lines],
  );

  const count = useMemo(() => lines.reduce((s, l) => s + l.qty, 0), [lines]);
  const subtotal = useMemo(() => lines.reduce((s, l) => s + l.lineTotal, 0), [lines]);
  const hasUnavailable = useMemo(() => lines.some((l) => !l.availableToday), [lines]);

  const qtyOf = useCallback(
    (id: string) => stored.find((l) => l.id === id)?.qty ?? 0,
    [stored],
  );

  const value = useMemo<CartValue>(
    () => ({
      lines,
      orderLines,
      count,
      subtotal,
      hasUnavailable,
      today,
      add,
      increase,
      decrease,
      remove,
      clear,
      qtyOf,
      drawerOpen,
      setDrawerOpen,
      checkoutOpen,
      setCheckoutOpen,
      toastItemId,
    }),
    [
      lines,
      orderLines,
      count,
      subtotal,
      hasUnavailable,
      today,
      add,
      increase,
      decrease,
      remove,
      clear,
      qtyOf,
      drawerOpen,
      checkoutOpen,
      toastItemId,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart doit être utilisé dans <CartProvider>");
  return ctx;
}
