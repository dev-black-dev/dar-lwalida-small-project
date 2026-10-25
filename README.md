# Dar L'Walida — Site de commande (démonstration)

**« Dar L'Walida — Le goût du Maroc, comme à la maison. »**

Site vitrine + carte + panier + commande **WhatsApp (click-to-chat)** pour
Dar L'Walida, 292 Avenue Mohammed V, Rabat.

Stack réelle : **Next.js 16 (App Router) · React 19 · Tailwind CSS v4 · TypeScript**.
Aucun backend métier, aucun paiement. La route `/api/health` du gabarit
reste présente pour le contrôle de santé.

> ⚠️ **Démonstration** non approuvée par le restaurant. Les prix viennent de
> Glovo (provisoires), le numéro WhatsApp et le compte Instagram sont ceux
> fournis pour le projet (à remplacer). Les visuels sont de vraies photos du
> restaurant (dossier `photo/`, optimisées dans `public/assets/`) ; les
> polices sont auto-hébergées dans `src/fonts/`.

---

## Lancer le projet en local

Prérequis : **Node.js 20.9+** (Node 22 recommandé) et **npm** (fourni avec Node).

Ouvrez un terminal, allez dans le dossier du projet, puis :

```bash
cd chemin/vers/dar-l-walida
npm install
npm run dev
```

Ouvrez ensuite le navigateur à l'adresse affichée, en général :

```
http://localhost:3000
```

Aucune variable d'environnement n'est requise pour le site (pas de clé
Google Maps, pas d'API WhatsApp). Le fichier `.env` du gabarit contient
uniquement `DATABASE_URL` pour `/api/health` — ne le supprimez pas si vous
utilisez ce healthcheck.

### Build et aperçu de production

```bash
npm run build
npm start
```

Puis ouvrez `http://localhost:3000`.

### Tests

```bash
# Tests logiques (WhatsApp + panier + recherche) — sans navigateur
npm test

# Séparément
npm run test:whatsapp   # numéro, prix, disponibilité, messages FR/AR, frais
npm run test:cart        # panier (doublons, quantités), recherche, parcours complet

# Vérification TypeScript
npm run typecheck

# Vérification locale complète (images, polices, contenu) — serveur lancé
npm run verify

# Parcours navigateur (optionnel)
npx --yes playwright install --with-deps chromium
npm run build && npm start
# dans un autre terminal :
BASE_URL=http://localhost:3000 node scripts/e2e.cjs
```

Astuce démo : ajoutez `?jour=5` à l'URL pour simuler un vendredi
(0 = dimanche … 6 = samedi) et afficher les plats du jour commandables.

### Recherche de plats

La recherche (barre collante au-dessus de la carte) interroge la **vraie
carte** en français **et** en arabe. Elle tolère la casse, les espaces
multiples, les accents (`é`, `œ`…), la ponctuation (`–`, `&`, `( )`), les
diacritiques arabes, et les fautes courantes (lettre doublée :
« harrira » → harira ; « tajin » → tajine). Les résultats peuvent être
filtrés par catégorie, et le panier n'est **jamais** modifié par une
recherche. Logique testable : `src/lib/search.ts`.

### Frais de livraison

`src/config/restaurant.ts` → `delivery.feeMAD` :

- `null` (défaut) : les frais ne sont **jamais inventés**. Le message
  WhatsApp affiche « Frais de livraison : à confirmer » et le total est
  annoncé **hors frais de livraison**.
- un nombre (ex. `20`) : affiché « 20 MAD » et **ajouté** au total.

### Dépannage courant

| Problème | Solution |
| --- | --- |
| `EADDRINUSE` (port 3000 occupé) | `npx next dev -p 3001` puis ouvrir `http://localhost:3001` |
| `npm install` échoue | Vérifier Node 18+ : `node -v`. Supprimer `node_modules` et `package-lock.json`, relancer `npm install` |
| Page blanche / anciennes données | `rm -rf .next` puis `npm run dev` |
| Erreur de polices au démarrage (`@vercel/turbopack-next/...`, `queries have exactly one entry`) | Ancien bug de `next/font/google` + Turbopack. **Corrigé** : polices auto-hébergées (`src/fonts/`, `next/font/local`). Supprimer `.next` puis relancer `npm run dev` |
| WhatsApp ne s'ouvre pas | Utiliser « Copier le message » dans l'étape 2 du checkout, ou tester sur un téléphone |
| Carte Google Maps vide | Vérifier la connexion ; l'iframe n'a pas besoin de clé API. Les coordonnées se règlent dans `src/config/restaurant.ts` |

---

## Déploiement GitHub + Netlify

Le projet est un build Next.js « serveur » (App Router, route `/api/health`,
optimisation d'images `next/image`) : **pas** de `output: "export"`.
`netlify.toml` contient déjà les bons réglages et Netlify détecte Next.js
automatiquement (adaptateur OpenNext — ne pas installer `@netlify/plugin-nextjs`).

### 1. Mettre le projet sur GitHub

```bash
cd chemin/vers/dar-l-walida
git init -b main
git add .
git status                     # vérifier : ni .env, ni node_modules, ni .next
git commit -m "Dar L'Walida — site de commande WhatsApp"
```

Créez ensuite un dépôt **vide** sur GitHub (sans README ni .gitignore), puis
remplacez `VOTRE-COMPTE` et `VOTRE-DEPOT` :

```bash
git remote add origin https://github.com/VOTRE-COMPTE/VOTRE-DEPOT.git
git push -u origin main
```

Variante GitHub CLI : `gh repo create dar-lwalida --private --source=. --remote=origin --push`

### 2. Réglages Netlify

| Réglage | Valeur |
| --- | --- |
| Build command | `npm run build` |
| Publish directory | `.next` |
| Node version | `22` (défini dans `netlify.toml`) |
| Framework | Next.js (détecté automatiquement) |
| Redirections SPA | **aucune** (l'App Router gère les routes) |

### 3. Variables d'environnement

| Variable | Requis | Rôle |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | recommandé | URL publique pour Open Graph / canonical, ex. `https://dar-lwalida.netlify.app` |
| `DATABASE_URL` | non | uniquement `/api/health` et `drizzle-kit` |

Aucune clé API n'est nécessaire : les polices sont auto-hébergées et la carte
Google Maps est embarquée sans clé.

### 4. Publier sur Netlify

1. [app.netlify.com](https://app.netlify.com) → **Add new site → Import an existing project**.
2. Autoriser GitHub et choisir le dépôt.
3. Vérifier **Build command** `npm run build` et **Publish directory** `.next`.
4. **Site configuration → Environment variables** : ajouter `NEXT_PUBLIC_SITE_URL`.
5. **Deploy site**. Chaque `git push` sur `main` redéploie automatiquement.

Alternative gratuite : **Vercel** (Hobby) — import du dépôt, framework Next.js
détecté, build `npm run build`, aucune configuration supplémentaire.

> Le déploiement doit être lancé depuis **votre** compte GitHub/Netlify :
> aucun envoi n'est effectué automatiquement par le projet.


---

## Fichiers à éditer

| Besoin | Fichier |
| --- | --- |
| WhatsApp, téléphone, adresse, GPS, Instagram, horaires | `src/config/restaurant.ts` |
| Frais de livraison (`delivery.feeMAD`, `null` = à confirmer) | `src/config/restaurant.ts` |
| Plats, prix, disponibilité | `src/data/menu.ts` |
| Recherche (normalisation, alias, tolérance fautes) | `src/lib/search.ts` |
| Panier (source unique de vérité + persistance) | `src/lib/cart-store.ts` |
| Message WhatsApp (structure, totaux) | `src/lib/whatsapp.ts` |
| Visuels | `src/config/assets.ts` |
| Polices (auto-hébergées) | `src/fonts/*.woff2` — regénérer : `node scripts/fetch-fonts.mjs` |
| Textes FR / AR | `src/lib/i18n.tsx` |

**Instagram** : `restaurant.instagram.url` — actuellement
`https://www.instagram.com/nassim_ela/` (profil fourni pour le projet).

**Position GPS** : `restaurant.geo.lat` / `lng` — nœud OpenStreetMap
« Dar Lwalida » (`node/14070853001`), Avenue Mohamed V, Hassan, Rabat :
**34.0152509, −6.8348421**. Carte Google Maps embarquée **sans clé API**.

---

## À confirmer par le restaurant

- [ ] Tous les prix (source Glovo)
- [ ] Numéro WhatsApp officiel (actuel : 06 19 65 39 18, provisoire)
- [ ] Compte Instagram officiel (actuel : @nassim_ela)
- [ ] Téléphone public +212 5 30 31 89 69
- [ ] Horaires, zone et frais de livraison
- [ ] Position GPS (OSM, août 2026 — à valider sur place)
- [ ] Photographies officielles
