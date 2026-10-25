/**
 * Configuration drizzle-kit — OUTILS DE MIGRATION UNIQUEMENT.
 *
 * Le site (carte, panier, commande WhatsApp) et le build Next.js ne
 * dépendent PAS de cette configuration ni d'une base de données.
 * DATABASE_URL n'est requis que pour les commandes `drizzle-kit`.
 *
 * Aucun identifiant n'est stocké dans le dépôt : la valeur vient de
 * `.env` (ignoré par Git) — voir `.env.example`.
 */
import "dotenv/config";
import { defineConfig } from "drizzle-kit";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error(
    "DATABASE_URL est requis pour drizzle-kit (ex. npx drizzle-kit push). " +
      "Ajoutez-le dans .env — voir .env.example. " +
      "Le site et `npm run build` n'en ont pas besoin.",
  );
}

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema.ts",
  dbCredentials: { url: databaseUrl },
});
