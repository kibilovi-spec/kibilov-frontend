export default function StructuredData() {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "AutoPartsStore",
        "@id": "https://kibilov.ge",
        "name": "Kibilov AutoParts",
        "description": "ავტონაწილების ონლაინ მაღაზია საქართველოში. AI ძებნა ქართულად.",
        "url": "https://kibilov.ge",
        "telephone": "+995577575052",
        "address": {
          "@type": "PostalAddress",
          "addressLocality": "რუსთავი",
          "addressCountry": "GE"
        },
        "geo": {
          "@type": "GeoCoordinates",
          "latitude": 41.5479,
          "longitude": 45.0153
        },
        "openingHours": "Mo-Sa 09:00-19:00",
        "priceRange": "₾₾",
        "sameAs": ["https://wa.me/995577575052"],
        "contactPoint": {
          "@type": "ContactPoint",
          "telephone": "+995577575052",
          "contactType": "customer service",
          "availableLanguage": ["Georgian", "Russian"]
        }
      },
      {
        "@type": "WebSite",
        "@id": "https://kibilov.ge/#website",
        "url": "https://kibilov.ge",
        "name": "Kibilov AutoParts",
        "description": "ავტონაწილები საქართველოში",
        "potentialAction": {
          "@type": "SearchAction",
          "target": "https://kibilov.ge/products?search={search_term_string}",
          "query-input": "required name=search_term_string"
        }
      }
    ]
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
