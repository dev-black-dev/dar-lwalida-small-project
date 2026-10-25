"use client";

import { useEffect, useState } from "react";
import { restaurant } from "@/config/restaurant";
import type { Weekday } from "@/data/menu";

const map: Record<string, Weekday> = {
  Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6,
};

/** Jour de la semaine actuel dans le fuseau du restaurant (Africa/Casablanca). */
export function weekdayInRestaurantTz(date = new Date()): Weekday {
  try {
    const short = new Intl.DateTimeFormat("en-US", {
      weekday: "short",
      timeZone: restaurant.timeZone,
    }).format(date);
    return map[short] ?? (date.getDay() as Weekday);
  } catch {
    return date.getDay() as Weekday;
  }
}

/**
 * Retourne le jour courant côté client (null pendant le rendu serveur
 * pour éviter tout décalage d'hydratation). Rafraîchi toutes les minutes
 * pour gérer le passage de minuit.
 * `?jour=5` dans l'URL force un jour (utile pour tester/démontrer).
 */
export function useToday(): Weekday | null {
  const [day, setDay] = useState<Weekday | null>(null);
  useEffect(() => {
    const compute = () => {
      const forced = new URLSearchParams(window.location.search).get("jour");
      const n = forced !== null ? Number(forced) : NaN;
      setDay(Number.isInteger(n) && n >= 0 && n <= 6 ? (n as Weekday) : weekdayInRestaurantTz());
    };
    compute();
    const id = window.setInterval(compute, 60_000);
    return () => window.clearInterval(id);
  }, []);
  return day;
}
