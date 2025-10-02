import Script from 'next/script';

interface StructuredDataProps {
  profession: string;
  specialization: string;
  recommendations?: Array<{
    name: string;
    description: string;
    link: string;
  }>;
}

export default function StructuredData({ profession, specialization, recommendations = [] }: StructuredDataProps) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": `AI-verktyg för ${specialization || profession}`,
    "description": `Upptäck de bästa AI-verktygen och lösningarna för dig som arbetar som ${specialization || profession}. Få personliga rekommendationer och konkreta exempel.`,
    "supply": recommendations.map((rec, index) => ({
      "@type": "HowToSupply",
      "name": rec.name,
      "description": rec.description,
      "url": rec.link,
      "position": index + 1
    })),
    "step": recommendations.map((rec, index) => ({
      "@type": "HowToStep",
      "name": `Kom igång med ${rec.name}`,
      "text": rec.description,
      "url": rec.link,
      "position": index + 1
    })),
    "totalTime": "PT15M",
    "author": {
      "@type": "Organization",
      "name": "Optero",
      "url": "https://optero.se"
    }
  };

  // Additional structured data for the profession
  const professionData = {
    "@context": "https://schema.org",
    "@type": "Occupation",
    "name": profession,
    "description": `${profession} i Sverige`,
    "occupationalCategory": specialization,
    "skills": recommendations.map(r => r.name).join(", ")
  };

  return (
    <>
      <Script
        id="structured-data-howto"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData)
        }}
      />
      <Script
        id="structured-data-occupation"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(professionData)
        }}
      />
    </>
  );
}
