import {
  BOOKING_URL,
  EMAIL,
  PHONE_E164,
  SITE_NAME,
  SITE_URL,
} from "@/lib/site";

export default function JsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "LocalBusiness",
        "@id": `${SITE_URL}/#business`,
        name: SITE_NAME,
        url: SITE_URL,
        image: `${SITE_URL}/drone-service-image-v2.webp`,
        telephone: PHONE_E164,
        email: EMAIL,
        priceRange: "$$",
        areaServed: [
          { "@type": "City", name: "Dallas" },
          { "@type": "City", name: "Fort Worth" },
          { "@type": "City", name: "Frisco" },
          { "@type": "AdministrativeArea", name: "Dallas–Fort Worth metroplex" },
        ],
        address: {
          "@type": "PostalAddress",
          addressLocality: "Dallas",
          addressRegion: "TX",
          addressCountry: "US",
        },
        description:
          "Professional real estate photography, aerial drone media, and floor plans for listing agents in the Dallas–Fort Worth area.",
        sameAs: [],
        makesOffer: [
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: "Property Photography",
              url: `${SITE_URL}/services/property-photography`,
            },
          },
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: "Aerial Photography",
              url: `${SITE_URL}/services/aerial-photography`,
            },
          },
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: "Floor Plans and Mapping",
              url: `${SITE_URL}/services/floor-plans`,
            },
          },
        ],
        potentialAction: {
          "@type": "ReserveAction",
          target: BOOKING_URL,
          name: "Book a Shoot",
        },
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: SITE_URL,
        name: SITE_NAME,
        publisher: { "@id": `${SITE_URL}/#business` },
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
