"use client";

import { useEffect } from "react";

/**
 * Verrou du défilement de la page, partagé par tous les panneaux
 * (menu mobile, tiroir du panier, modale de commande).
 *
 * Un COMPTEUR global évite le bug classique où le premier panneau
 * fermé réactive le scroll alors qu'un autre est encore ouvert.
 */
let locks = 0;
let previousOverflow = "";

export function useBodyScrollLock(active: boolean): void {
  useEffect(() => {
    if (!active || typeof document === "undefined") return;
    if (locks === 0) {
      previousOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
    }
    locks += 1;
    return () => {
      locks = Math.max(0, locks - 1);
      if (locks === 0) document.body.style.overflow = previousOverflow;
    };
  }, [active]);
}
