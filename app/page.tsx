"use client";

import { useRouter } from "next/navigation";
import { Bot, Sparkles, Zap, Shield } from "lucide-react";

export default function Home() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-6xl mx-auto px-6 py-20">
        
        {/* Hero Section */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white rounded-full text-sm mb-6">
            <Sparkles className="w-4 h-4" />
            AI-drivna chatbots på 5 minuter
          </div>
          
          <h1 className="text-5xl md:text-6xl font-extralight text-gray-900 mb-6 tracking-tight">
            Bygg en chatbot som förstår<br />
            <span className="font-light">ditt företag</span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed">
            Tränad på din webbplats och dokument. Redo att svara på frågor, kvalificera leads och automatisera support – utan att du skriver en rad kod.
          </p>
          
          <button
            onClick={() => router.push('/business/bot-builder')}
            className="px-8 py-4 bg-black text-white rounded-full hover:bg-gray-800 transition-all text-lg font-light shadow-lg hover:shadow-xl"
          >
            Kom igång gratis →
          </button>
          
          <p className="text-sm text-gray-500 mt-4">
            Ingen kodning krävs · Gratis att testa · 5 minuter setup
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
            <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center mb-4">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-light mb-3">Smart från dag 1</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Crawlar din webbplats och läser dina dokument. Boten förstår ditt företag, produkter och tjänster direkt.
            </p>
          </div>
          
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
            <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center mb-4">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-light mb-3">Anpassad för dig</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Välj färger, typsnitt och ton. Koppla till Calendly, HubSpot, Zendesk. Din bot, ditt varumärke.
            </p>
          </div>
          
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
            <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-light mb-3">Säker & GDPR-kompatibel</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Data lagras säkert i EU. PII-maskering. Versionshantering och eval-pipeline för kvalitetssäkring.
            </p>
          </div>
        </div>

        {/* Use Cases */}
        <div className="mb-20">
          <h2 className="text-3xl font-light text-center mb-12">Vad kan du bygga?</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { title: "FAQ & Kundsupport", desc: "Svara på vanliga frågor 24/7, skapa tickets automatiskt" },
              { title: "Leadkvalificering", desc: "Samla in kontaktinfo, kvalificera leads, synka till HubSpot" },
              { title: "Bokning & Schemaläggning", desc: "Boka möten direkt i Calendly, hantera tidsbokning" },
              { title: "E-commerce Assistant", desc: "Produktrekommendationer, order tracking, upsell" },
              { title: "HR & Rekrytering", desc: "Screena kandidater, boka intervjuer, svara på HR-frågor" },
              { title: "Custom Enterprise", desc: "Komplex integration, compliance, white-label" }
            ].map((uc, i) => (
              <div key={i} className="p-6 bg-white rounded-xl border border-gray-200 hover:border-gray-300 transition-all">
                <h4 className="font-medium text-gray-900 mb-2">{uc.title}</h4>
                <p className="text-sm text-gray-600">{uc.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center bg-black text-white rounded-2xl p-12">
          <h2 className="text-3xl font-light mb-4">Redo att testa?</h2>
          <p className="text-gray-300 mb-8 max-w-xl mx-auto">
            Skapa din första bot på 5 minuter. Helt gratis. Ingen betalning krävs.
          </p>
          <button
            onClick={() => router.push('/business/bot-builder')}
            className="px-8 py-4 bg-white text-black rounded-full hover:bg-gray-100 transition-all text-lg font-light"
          >
            Bygg din bot nu →
          </button>
        </div>

      </div>
    </main>
  );
}
