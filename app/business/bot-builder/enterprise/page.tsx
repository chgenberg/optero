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
      price: "$1,500 – $5,000",
      timeline: "4–8 weeks",
      includes: [
        "Complex product configurator with dynamic pricing",
        "Integration with your CRM/ERP",
        "Custom business logic and product rules",
        "A/B testing of sales flows",
        "Dedicated support and SLA"
      ]
    },
    "financial-advisor": {
      title: "Financial Advisory Bot",
      price: "$10,000 – $50,000",
      timeline: "12–24 weeks",
      includes: [
        "MiFID II and GDPR compliance review",
        "Legal review of all advice",
        "Integration with core banking/investment systems",
        "Risk profiling and portfolio recommendations",
        "Audit trail and regulatory reporting",
        "Ongoing compliance monitoring"
      ]
    }
  };

  const info = typeInfo[type] || {
    title: "Enterprise Solution",
    price: "Quote after consultation",
    timeline: "Depends on scope",
    includes: ["Custom development", "Integrations", "Support"]
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
          message: `Interested in ${info.title} for ${url}`
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
            Thanks for your interest!
          </h2>
          <p className="text-gray-600 mb-8">
            Christopher will contact you within 24 hours to discuss your solution.
          </p>
          <button
            onClick={() => router.push('/business/bot-builder')}
            className="btn-minimal"
          >
            Back to start
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
            This use case requires a tailored solution with custom integrations and a compliance review.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-10">
          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="font-medium text-gray-900 mb-2">💰 Investment</h3>
            <p className="text-2xl font-light text-gray-900">{info.price}</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="font-medium text-gray-900 mb-2">⏱️ Timeline</h3>
            <p className="text-2xl font-light text-gray-900">{info.timeline}</p>
          </div>
        </div>

        <div className="mb-10">
          <h3 className="font-medium text-gray-900 mb-4">✨ What’s included:</h3>
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
            <li><strong>1. Consultation (30 min, free):</strong> We review your needs and requirements</li>
            <li><strong>2. Quote & Project Plan:</strong> Detailed specification and timeline</li>
            <li><strong>3. Development & Testing:</strong> Agile development with continuous feedback</li>
            <li><strong>4. Compliance Review:</strong> Legal/regulatory review (if relevant)</li>
            <li><strong>5. Deploy & Support:</strong> Launch + 1 month hands-on support</li>
          </ol>
        </div>

        <div className="flex justify-center gap-4">
          <button
            onClick={() => router.push('/business/bot-builder/analyze')}
            className="btn-minimal-outline"
          >
            ← Choose another bot type
          </button>
          <button
            onClick={handleContact}
            className="btn-minimal flex items-center gap-2"
          >
            Book a consultation with Christopher
            <MinimalIcons.Arrow className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-8 text-center text-sm text-gray-600">
          <p>Or email directly: <a href="mailto:christopher@mendio.se" className="text-black underline">christopher@mendio.se</a></p>
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

