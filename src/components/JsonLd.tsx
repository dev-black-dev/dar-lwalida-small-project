import { restaurant } from "@/config/restaurant";

/**
 * Données structurées Restaurant.
 * Pas de notes, horaires ni prix : ces champs n'ont pas été confirmés.
 */
export default function JsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    name: restaurant.name,
    description: restaurant.sloganFr,
    servesCuisine: "Moroccan",
    address: {
      "@type": "PostalAddress",
      streetAddress: restaurant.address.street,
      addressLocality: restaurant.address.city,
      postalCode: restaurant.address.postalCode,
      addressCountry: "MA",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: restaurant.geo.lat,
      longitude: restaurant.geo.lng,
    },
    hasMap: restaurant.geo.osmUrl,
    sameAs: [restaurant.instagram.url],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
