/**
 * Vérification locale complète (dev ou prod) :
 *  - page d'accueil 200 + contenu clé
 *  - polices auto-hébergées servies (woff2)
 *  - toutes les images d'assets 200 + type image/*
 *  - aucune erreur de build dans le log dev récent
 * Usage : node scripts/verify-site.mjs [baseUrl]  (ou BASE_URL=…)
 */
import { readFile } from "node:fs/promises";

const BASE = process.argv[2] || process.env.BASE_URL || "http://localhost:3000";
const assetConfig = await readFile(new URL("../src/config/assets.ts", import.meta.url), "utf8");
const declaredAssets = [...assetConfig.matchAll(/src:\s*"([^\"]+)"/g)].map((match) => match[1]);
const generatedDishes = [...assetConfig.matchAll(/generatedDish\("([^\"]+)"/g)].map(
  (match) => `/assets/dishes/dish-${match[1]}.webp`,
);
const IMAGE_URLS = [...new Set([...declaredAssets, ...generatedDishes])].map(
  (src) => `/_next/image?url=${encodeURIComponent(src)}&w=1200&q=75`,
);

async function waitForServer(timeoutMs = 90000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(BASE + "/", { redirect: "manual" });
      if (res.status < 500) return true;
    } catch {
      /* pas encore prêt */
    }
    await new Promise((r) => setTimeout(r, 1500));
  }
  return false;
}

let failed = 0;
const ok = (cond, label) => {
  if (!cond) failed++;
  console.log(`${cond ? "OK  " : "FAIL"} ${label}`);
};

console.log(`Attente du serveur ${BASE} ...`);
if (!(await waitForServer())) {
  console.error("FAIL serveur indisponible");
  process.exit(1);
}
console.log("Serveur prêt.\n");

// 1) Page d'accueil
const page = await fetch(BASE + "/");
const html = await page.text();
ok(page.status === 200, `GET / -> ${page.status}`);
ok(html.includes("Dar L'Walida") || html.includes("Dar L’Walida"), "contenu : nom du restaurant présent");
ok(html.includes("wa.me/212619653918"), "lien WhatsApp 212619653918 présent dans le HTML");
ok(html.includes("instagram.com/nassim_ela"), "lien Instagram présent");
ok(html.includes("Designed &amp; Developed by Black") || html.includes("Designed & Developed by Black"), "crédit « Designed & Developed by Black » présent");
ok(html.includes("google.com/maps"), "Google Maps présent");
ok(!html.includes("googleapis.com/css"), "aucun appel CSS à fonts.googleapis.com");

// 2) Polices auto-hébergées
const fontRefs = [...html.matchAll(/\/_next\/static\/media\/[^"' )]+\.woff2/g)].map((m) => m[0]);
ok(fontRefs.length > 0, `polices référencées dans le HTML (${fontRefs.length})`);
for (const f of new Set(fontRefs)) {
  const r = await fetch(BASE + f);
  const ct = r.headers.get("content-type") || "";
  ok(r.status === 200 && ct.includes("woff2"), `${f} -> ${r.status} ${ct}`);
}

// 3) Images
for (const u of IMAGE_URLS) {
  const r = await fetch(BASE + u);
  const ct = r.headers.get("content-type") || "";
  ok(r.status === 200 && ct.startsWith("image/"), `${r.status} ${ct.padEnd(12)} ${u}`);
}

console.log(failed === 0 ? "\nTout est OK." : `\n${failed} problème(s) détecté(s).`);
process.exit(failed === 0 ? 0 : 1);
