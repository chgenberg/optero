"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { MinimalIcons } from "@/components/MinimalIcons";
import { useState, Suspense } from "react";

function EnterpriseContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const type = searchParams?.get("type") || "";
  const [submitted, setSubmitted] = useState(false);
  
  const typeInfo: Record<string, { title: string; price: string; timeline: string; includes: string[] }> = {
    "sales-assistant": {
      title: "Sales Assistant (Advanced)",
      price: "15,000 - 50,000 kr",
      timeline: "4-8 veckor",
      includes: [
        "Komplex produktkonfigurator med dynamisk prissättning",
        "Integration med ert CRM/ERP-system",
        "Custom business logic och produktregler",
        "A/B-testing av olika försäljningsflöden",
        "Dedikerad support och SLA"
      ]
    },
    "financial-advisor": {
      title: "Finansiell Rådgivningsbot",
      price: "100,000 - 500,000 kr",
      timeline: "12-24 veckor",
      includes: [
        "MiFID II och GDPR-compliance granskning",
        "Legal review av alla råd och svar",
        "Integration med core banking/investment systems",
        "Risk profiling och portfolio recommendations",
        "Audit trail och regulatory reporting",
        "Ongoing compliance monitoring"
      ]
    }
  };

  const info = typeInfo[type] || {
    title: "Enterprise-lösning",
    price: "Offert efter konsultation",
    timeline: "Beroende på omfattning",
    includes: ["Custom development", "Integrationer", "Support"]
  };

  const handleContact = async () => {
    const email = sessionStorage.getItem("botUserEmail") || "";
    const url = sessionStorage.getItem("botWebsiteUrl") || "";
    
    // Send email notification (implement later)
    try {
      await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          url,
          botType: type,
          message: `Intresserad av ${info.title} för ${url}`
        })
      });
      setSubmitted(true);
    } catch (error) {
      console.error('Contact error:', error);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="minimal-box max-w-2xl w-full text-center">
          <div className="w-16 h-16 bg-green-500 rounded-full mx-auto mb-6 flex items-center justify-center">
            <MinimalIcons.Check className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-light text-gray-900 mb-4">
            Tack för ditt intresse!
          </h2>
          <p className="text-gray-600 mb-8">
            Christopher kontaktar dig inom 24 timmar för att diskutera din lösning.
          </p>
          <button
            onClick={() => router.push('/business/bot-builder')}
            className="btn-minimal"
          >
            Tillbaka till start
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="minimal-box max-w-3xl w-full">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-yellow-500 rounded-full mx-auto mb-6 flex items-center justify-center">
            <span className="text-3xl">💼</span>
          </div>
          <h1 className="text-3xl font-light text-gray-900 mb-4">
            {info.title}
          </h1>
          <p className="text-gray-600">
            Detta use case kräver en skräddarsydd lösning med custom integrationer och compliance-granskning
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-10">
          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="font-medium text-gray-900 mb-2">💰 Investering</h3>
            <p className="text-2xl font-light text-gray-900">{info.price}</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="font-medium text-gray-900 mb-2">⏱️ Tidsram</h3>
            <p className="text-2xl font-light text-gray-900">{info.timeline}</p>
          </div>
        </div>

        <div className="mb-10">
          <h3 className="font-medium text-gray-900 mb-4">✨ Vad ingår:</h3>
          <ul className="space-y-3">
            {info.includes.map((item, i) => (
              <li key={i} className="flex items-start gap-3">
                <MinimalIcons.Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
          <h3 className="font-medium text-blue-900 mb-2">🚀 Process:</h3>
          <ol className="space-y-2 text-sm text-blue-800">
            <li><strong>1. Konsultation (30 min, gratis):</strong> Vi går igenom era behov och krav</li>
            <li><strong>2. Offert & Projektplan:</strong> Detaljerad specifikation och tidsplan</li>
            <li><strong>3. Development & Testing:</strong> Agil utveckling med kontinuerlig feedback</li>
            <li><strong>4. Compliance Review:</strong> Legal/regulatory granskning (om relevant)</li>
            <li><strong>5. Deploy & Support:</strong> Lansering + 1 månads hands-on support</li>
          </ol>
        </div>

        <div className="flex justify-center gap-4">
          <button
            onClick={() => router.push('/business/bot-builder/analyze')}
            className="btn-minimal-outline"
          >
            ← Välj annan bottyp
          </button>
          <button
            onClick={handleContact}
            className="btn-minimal flex items-center gap-2"
          >
            Boka konsultation med Christopher
            <MinimalIcons.Arrow className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-8 text-center text-sm text-gray-600">
          <p>Eller e-posta direkt: <a href="mailto:christopher@mendio.se" className="text-black underline">christopher@mendio.se</a></p>
        </div>
      </div>
    </div>
  );
}

export default function EnterprisePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <MinimalIcons.Loader className="w-8 h-8 text-gray-400 animate-spin" />
      </div>
    }>
      <EnterpriseContent />
    </Suspense>
  );
}

