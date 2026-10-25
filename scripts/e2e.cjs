/*
 * Test E2E navigateur (Playwright / Chromium) du parcours complet.
 * Prérequis : serveur lancé (npm run build && npm start), puis :
 *   BASE_URL=http://localhost:3000 node scripts/e2e.cjs
 * (PLAYWRIGHT_PATH permet de pointer vers une installation externe.)
 */
const { chromium } = require(process.env.PLAYWRIGHT_PATH || "playwright");
const assert = require("node:assert/strict");

const BASE = process.env.BASE_URL || "http://localhost:3000";
const SHOTS = process.env.SHOTS_DIR || "/tmp/shots";
require("node:fs").mkdirSync(SHOTS, { recursive: true });

const EXPECTED = {
  "Salade L'Walida": 42, "Soupe Marocaine – Harira": 35, Taktouka: 28, Bakkoula: 28, Zaalouk: 28, Lentilles: 28, "Haricots Blancs": 28, "Salade Marocaine": 23,
  "Tajine Foie de Veau": 108, "Tajine Pied de Veau": 88, "Tanjia L'Walida": 88, "Tajine Tête de Bœuf": 83, "Tajine de Queue de Bœuf": 83, "Tripes de Bœuf": 68, "Tajine Kefta et Beid": 68, "Tajine Poulet au Citron Confit": 62, "Tajine de Kefta de Sardines": 48,
  "Mardi – Seffa au Poulet": 68, "Mercredi – Rfissa": 63, "Vendredi – Couscous Viande Bœuf": 74, "Vendredi – Couscous Poulet": 68,
  "Salade de Fruits Frais": 28, Mahlabiya: 28,
  "Café Espresso": 18, "Thé à la Menthe": 16, "Coca-Cola Classique (50 cl)": 15, "Coca-Cola Zero (50 cl)": 15, "Hawaï Tropical (50 cl)": 15, "Pom's Pomme (50 cl)": 15, "Sprite Classique (50 cl)": 15, "Sidi Ali (50 cl)": 10,
};

let passed = 0;
const ok = (msg) => { passed++; console.log("✓", msg); };

async function newPage(browser, width, height = 900, opts = {}) {
  const context = await browser.newContext({ viewport: { width, height }, locale: "fr-FR", ...opts });
  // Intercepte wa.me : on capture l'URL réellement ouverte sans dépendre du réseau.
  const opened = [];
  await context.route(/https:\/\/(wa\.me|api\.whatsapp\.com)\/.*/, (route) => {
    opened.push(route.request().url());
    route.fulfill({ status: 200, contentType: "text/html", body: "<title>wa</title>ok" });
  });
  const page = await context.newPage();
  const errors = [];
  const ignore = (u) =>
    /wa\.me|google\.com|gstatic\.com|googleapis\.com|googleusercontent\.com|maps\.google/i.test(u);
  page.on("console", (m) => {
    if (m.type() !== "error") return;
    const t = m.text();
    if (ignore(t)) return;
    errors.push(t);
  });
  page.on("pageerror", (e) => {
    if (!ignore(String(e))) errors.push(String(e));
  });
  page.on("response", (r) => {
    if (r.status() >= 400 && !ignore(r.url())) errors.push(`${r.status()} ${r.url()}`);
  });
  return { context, page, errors, opened };
}

async function noOverflow(page, label) {
  const { sw, iw } = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, iw: window.innerWidth }));
  assert.ok(sw <= iw, `${label}: débordement horizontal (${sw} > ${iw})`);
}

async function allImagesLoaded(page, label) {
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 600) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 60)); }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(800);
  const broken = await page.evaluate(() =>
    Array.from(document.images).filter((i) => i.complete && i.naturalWidth === 0).map((i) => i.currentSrc || i.src),
  );
  assert.deepEqual(broken, [], `${label}: images cassées`);
}

(async () => {
  const browser = await chromium.launch();

  // 1) Mises en page responsive + images + console
  for (const w of [360, 390, 768, 1440]) {
    const { context, page, errors } = await newPage(browser, w);
    await page.goto(BASE + "/?jour=5", { waitUntil: "load" });
    await noOverflow(page, `${w}px`);
    await allImagesLoaded(page, `${w}px`);
    // bannières de chaque catégorie
    for (const tab of await page.getByRole("tab").all()) { await tab.click(); await page.waitForTimeout(250); }
    await allImagesLoaded(page, `${w}px bannières`);
    await noOverflow(page, `${w}px après onglets`);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.screenshot({ path: `${SHOTS}/home-${w}.png` });
    assert.deepEqual(errors, [], `${w}px: erreurs console/réseau`);
    ok(`${w}px : aucun débordement, toutes les images chargées, aucune erreur console`);
    await context.close();
  }

  // 2) Carte complète + prix
  {
    const { context, page } = await newPage(browser, 1440);
    await page.goto(BASE + "/?jour=5", { waitUntil: "load" });
    const seen = {};
    for (const tab of await page.getByRole("tab").all()) {
      await tab.click();
      for (const card of await page.locator("#menu-panel article").all()) {
        const name = (await card.locator("h3").innerText()).trim();
        const price = (await card.locator("p.font-display").innerText()).trim();
        seen[name] = price;
      }
    }
    assert.equal(Object.keys(seen).length, 31, "31 plats rendus");
    for (const [name, price] of Object.entries(EXPECTED)) assert.equal(seen[name], `${price} MAD`, name);
    ok("31 plats rendus avec les prix exacts");

    // Recherche sans accents
    await page.fill("#menu-search", "the a la menthe");
    assert.equal(await page.locator("article").count(), 1);
    await page.fill("#menu-search", "zzzz");
    await page.getByText("Aucun plat trouvé").waitFor();
    await page.fill("#menu-search", "");
    ok("recherche insensible aux accents + état « aucun résultat »");
    await context.close();
  }

  // 3) Plats du jour : lundi (non servis) + masquage
  {
    const { context, page } = await newPage(browser, 390);
    await page.goto(BASE + "/?jour=1", { waitUntil: "load" });
    await page.getByRole("tab", { name: /Plats du jour/ }).click();
    assert.equal(await page.locator("#menu-panel article").count(), 4);
    assert.equal(await page.locator("#menu-panel article button", { hasText: "Ajouter" }).count(), 0, "non commandables le lundi");
    await page.getByLabel("Masquer les plats non servis aujourd'hui").check();
    assert.equal(await page.locator("#menu-panel article").count(), 0);
    await page.getByText("Aucun plat du jour n'est servi aujourd'hui.").waitFor();
    await page.goto(BASE + "/?jour=3", { waitUntil: "load" });
    await page.getByRole("tab", { name: /Plats du jour/ }).click();
    assert.equal(await page.locator("#menu-panel article button", { hasText: "Ajouter" }).count(), 1, "seule la Rfissa le mercredi");
    ok("plats du jour : indisponibles hors jour, masquables, Rfissa commandable le mercredi");

    // Panier contenant un plat non servi → commande bloquée
    await page.evaluate(() => localStorage.setItem("dlw.cart.v2", JSON.stringify([{ id: "vendredi-couscous-boeuf", qty: 1 }])));
    await page.reload({ waitUntil: "load" });
    await page.getByRole("button", { name: "Voir ma commande" }).click();
    await page.getByText("Non servi aujourd'hui — à retirer").waitFor();
    assert.ok(await page.getByRole("button", { name: "Passer la commande" }).isDisabled());
    ok("panier avec plat non servi aujourd'hui : commande bloquée avec message");
    await context.close();
  }

  // 4) Parcours complet de commande (mobile 390 puis desktop 1440)
  for (const w of [390, 1440]) {
    const { context, page, errors, opened } = await newPage(browser, w, w < 768 ? 844 : 900);
    await page.goto(BASE + "/?jour=5", { waitUntil: "load" });
    await page.getByRole("tab", { name: /Tajines/ }).click();
    await page.getByRole("button", { name: "Ajouter Tajine Kefta et Beid à la commande" }).click();
    await page.getByRole("button", { name: "Augmenter la quantité de Tajine Kefta et Beid" }).click();
    await page.getByRole("tab", { name: /Entrées/ }).click();
    await page.getByRole("button", { name: /Ajouter Soupe Marocaine – Harira/ }).click();
    await page.getByRole("button", { name: "Diminuer la quantité de Soupe Marocaine – Harira" }).click(); // retiré
    await page.getByRole("tab", { name: /Boissons/ }).click();
    await page.getByRole("button", { name: "Ajouter Thé à la Menthe à la commande" }).click();

    // Ouvrir la commande
    if (w < 1024) {
      const bar = page.getByRole("button", { name: /Voir ma commande/ });
      assert.match(await bar.innerText(), /3[\s\S]*152 MAD/);
      await bar.click();
    } else {
      await page.getByRole("button", { name: "Ouvrir la commande" }).click();
    }
    const drawer = page.getByRole("dialog", { name: "Votre commande" });
    await drawer.getByText("152 MAD").first().waitFor();
    // retirer puis rajouter une ligne
    await drawer.getByRole("button", { name: "Retirer Thé à la Menthe de la commande" }).click();
    await drawer.getByText("136 MAD").first().waitFor();
    await page.keyboard.press("Escape");
    await page.getByRole("button", { name: "Ajouter Thé à la Menthe à la commande" }).click();
    if (w < 1024) await page.getByRole("button", { name: /Voir ma commande/ }).click();
    else await page.getByRole("button", { name: "Ouvrir la commande" }).click();
    await drawer.getByText("152 MAD").first().waitFor();
    ok(`${w}px : ajout / + / − / suppression → sous-total 152 MAD`);

    await drawer.getByRole("button", { name: "Passer la commande" }).click();
    const modal = page.getByRole("dialog", { name: "Finaliser la commande" });

    // Validation
    await modal.getByRole("button", { name: "Vérifier ma commande" }).click();
    await modal.getByText("Veuillez indiquer votre nom.").waitFor();
    await modal.getByText(/Numéro invalide/).waitFor();
    await modal.getByText("Livraison", { exact: true }).click();
    await modal.getByRole("button", { name: "Vérifier ma commande" }).click();
    await modal.getByText("Veuillez indiquer l'adresse de livraison.").waitFor();
    await modal.locator("#co-phone").fill("12345");
    await modal.getByRole("button", { name: "Vérifier ma commande" }).click();
    await modal.getByText(/Numéro invalide/).waitFor();
    ok(`${w}px : validation nom / téléphone / adresse`);

    await modal.locator("#co-name").fill("Amina Ben'Ali بنعلي");
    await modal.locator("#co-phone").fill("06 12 34 56 78");
    await modal.locator("#co-address").fill("12, rue de l'Indépendance & Co #3, Agdal");
    await modal.locator("#co-notes").fill("Sans piment ? شكرا — Étage 2");
    await modal.getByRole("button", { name: "Vérifier ma commande" }).click();

    const pre = modal.getByTestId("whatsapp-message");
    await pre.waitFor();
    const message = await pre.innerText();
    const href = await modal.getByTestId("whatsapp-link").getAttribute("href");
    assert.ok(href.startsWith("https://wa.me/212619653918?text="), "destination 212619653918");
    const decoded = decodeURIComponent(href.split("?text=")[1]);
    assert.equal(decoded, message, "le lien contient exactement le message affiché");
    for (const part of [
      "Bonjour Dar L’Walida,",
      "- 2 × Tajine Kefta et Beid — 68 MAD chacun",
      "- 1 × Thé à la Menthe — 16 MAD",
      "Sous-total : 152 MAD",
      "Nom : Amina Ben'Ali بنعلي",
      "Téléphone : 06 12 34 56 78",
      "Mode : Livraison",
      "Adresse : 12, rue de l'Indépendance & Co #3, Agdal",
      "Notes : Sans piment ? شكرا — Étage 2",
      "Merci de confirmer la disponibilité, le prix final et les éventuels frais supplémentaires.",
    ]) assert.ok(decoded.includes(part), `message contient « ${part} »`);
    assert.ok(!decoded.includes("Harira"), "plat retiré absent du message");
    await page.screenshot({ path: `${SHOTS}/checkout-review-${w}.png` });

    // Clic réel sur le lien → ouverture d'un nouvel onglet wa.me
    const [popup] = await Promise.all([context.waitForEvent("page"), modal.getByTestId("whatsapp-link").click()]);
    await popup.waitForLoadState().catch(() => {});
    assert.equal(opened[0], href, "URL ouverte = URL générée");
    await modal.getByText(/appuyez sur « Envoyer »/).waitFor();
    assert.deepEqual(errors, [], `${w}px: erreurs console`);
    ok(`${w}px : message exact, encodage correct, clic → ${opened[0].slice(0, 48)}…`);
    if (w === 390) console.log("\n--- MESSAGE (navigateur) ---\n" + message + "\n");
    await context.close();
  }

  // 5) Arabe / RTL
  {
    const { context, page, errors } = await newPage(browser, 390, 844);
    await page.goto(BASE + "/", { waitUntil: "load" });
    await page.getByRole("button", { name: "Ouvrir le menu" }).click();
    await page.getByRole("button", { name: "العربية" }).click();
    const attrs = await page.evaluate(() => [document.documentElement.lang, document.documentElement.dir]);
    assert.deepEqual(attrs, ["ar", "rtl"]);
    await page.getByText("اكتشف القائمة").first().waitFor();
    await page.getByText("مذاق المغرب، كما في البيت.").first().waitFor();
    await noOverflow(page, "AR 390px");
    await page.screenshot({ path: `${SHOTS}/home-ar-390.png` });
    assert.deepEqual(errors, []);
    ok("arabe : lang=ar, dir=rtl, libellés traduits, aucun débordement");
    await context.close();
  }

  // 6) Carte Google Maps, Instagram, crédit
  {
    const { context, page } = await newPage(browser, 1440);
    await page.goto(BASE + "/", { waitUntil: "domcontentloaded" });
    const iframe = page.locator("#contact iframe");
    await iframe.waitFor();
    const src = await iframe.getAttribute("src");
    assert.ok(src.includes("34.0152509"), "iframe centré sur la latitude OSM");
    assert.ok(src.includes("-6.8348421"), "iframe centré sur la longitude OSM");
    assert.ok(src.includes("output=embed"), "embed Google Maps sans clé API");
    const dir = await page.getByRole("link", { name: "Obtenir l'itinéraire" }).getAttribute("href");
    assert.ok(dir.includes("34.0152509,-6.8348421"), "itinéraire vers les coordonnées exactes");
    const ig = page.locator('footer a[href="https://www.instagram.com/nassim_ela/"]');
    assert.equal(await ig.getAttribute("target"), "_blank");
    assert.ok((await ig.getAttribute("rel") || "").includes("noopener"));
    await page.getByText("Designed & Developed by Black.").waitFor();
    ok("carte Google Maps (coords OSM), Instagram, crédit footer");
    await context.close();
  }

  await browser.close();
  console.log(`\n${passed} vérifications E2E réussies.`);
})().catch((e) => {
  console.error("✗ ÉCHEC :", e.message);
  process.exit(1);
});
