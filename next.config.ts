import type { NextConfig } from "next";

/*
 * Largeurs autorisées par l'optimisateur d'images Next.js.
 * Doit couvrir toutes les largeurs passées via `getImageProps`/`width` :
 * hero 1600, hero-mobile 737, exterieur 1024, ambiance 900,
 * table-traditionnelle 1200, bannières 1200, plats 600.
 */
const nextConfig: NextConfig = {
  images: {
    deviceSizes: [600, 640, 737, 750, 828, 900, 1024, 1080, 1200, 1600, 1920, 2048, 3840],
  },
};

export default nextConfig;
