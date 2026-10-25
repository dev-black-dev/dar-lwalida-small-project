/**
 * Télécharge les polices Google Fonts (woff2) dans src/fonts/ pour les
 * auto-héberger via next/font/local.
 * Lancer : node scripts/fetch-fonts.mjs
 *
 * Pourquoi : next/font/google dépend d'une résolution Turbopack fragile
 * (erreur « queries have exactly one entry » en dev sur Windows).
 * Les fichiers étant dans le projet, plus aucune requête n'est faite
 * à Google Fonts en dev/build/runtime.
 */
import fs from "node:fs";
import path from "node:path";

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
const OUT = "src/fonts";
fs.mkdirSync(OUT, { recursive: true });

const jobs = [
  {
    name: "Manrope",
    css: "https://fonts.googleapis.com/css2?family=Manrope:wght@400..800&display=swap",
    pick: [{ subset: "latin", style: "normal", out: "manrope-latin-var.woff2" }],
  },
  {
    name: "Playfair Display",
    css: "https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500..700;1,500..700&display=swap",
    pick: [
      { subset: "latin", style: "normal", out: "playfair-display-latin-normal.woff2" },
      { subset: "latin", style: "italic", out: "playfair-display-latin-italic.woff2" },
    ],
  },
  {
    name: "Caveat",
    css: "https://fonts.googleapis.com/css2?family=Caveat:wght@600..700&display=swap",
    pick: [{ subset: "latin", style: "normal", out: "caveat-latin-var.woff2" }],
  },
  {
    name: "Amiri",
    css: "https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&display=swap",
    pick: [
      { subset: "arabic", weight: "400", style: "normal", out: "amiri-arabic-400.woff2" },
      { subset: "arabic", weight: "700", style: "normal", out: "amiri-arabic-700.woff2" },
    ],
  },
];

async function fetchText(url) {
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.text();
}

/** Extrait les @font-face avec le commentaire de sous-ensemble qui précède. */
function parseCss(css) {
  const re = /\/\*\s*([a-z-]+)\s*\*\/\s*@font-face\s*\{([^}]*)\}/g;
  const faces = [];
  let m;
  while ((m = re.exec(css))) {
    const body = m[2];
    const style = (/font-style:\s*([^;]+);/.exec(body)?.[1] ?? "normal").trim();
    const weight = (/font-weight:\s*([^;]+);/.exec(body)?.[1] ?? "400").trim();
    const url = /src:\s*url\(([^)]+)\)/.exec(body)?.[1]?.trim();
    if (url) faces.push({ subset: m[1], style, weight, url });
  }
  return faces;
}

for (const job of jobs) {
  const css = await fetchText(job.css);
  const faces = parseCss(css);
  for (const p of job.pick) {
    const face = faces.find(
      (f) =>
        f.subset === p.subset &&
        f.style === (p.style ?? "normal") &&
        (!p.weight || f.weight === p.weight),
    );
    if (!face) throw new Error(`Face introuvable : ${JSON.stringify(p)} (${job.name})`);
    const res = await fetch(face.url, { headers: { "User-Agent": UA } });
    if (!res.ok) throw new Error(`HTTP ${res.status} — ${face.url}`);
    const buf = Buffer.from(await res.arrayBuffer());
    const magic = buf.subarray(0, 4).toString("latin1");
    if (magic !== "wOF2") throw new Error(`Format inattendu (${magic}) : ${face.url}`);
    fs.writeFileSync(path.join(OUT, p.out), buf);
    console.log(
      `✓ ${p.out.padEnd(36)} ${face.weight.padEnd(8)} ${face.style.padEnd(7)} ${Math.round(buf.length / 1024)} KB`,
    );
  }
}
console.log(`\nPolices enregistrées dans ${OUT}/`);
