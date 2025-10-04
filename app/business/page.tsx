"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";

type Step = "company" | "department" | "questions" | "results";

const COMPANY_SIZES = [
  { value: "startup", label: "Startup (1-10 anställda)" },
  { value: "small", label: "Litet företag (10-50 anställda)" },
  { value: "medium", label: "Medelstort (50-250 anställda)" },
  { value: "large", label: "Stort företag (250+ anställda)" },
];

const DEPARTMENTS = [
  { value: "sales", label: "Försäljning", icon: "📈" },
  { value: "marketing", label: "Marknadsföring", icon: "🎯" },
  { value: "finance", label: "Ekonomi & Finans", icon: "💰" },
  { value: "hr", label: "HR & Personal", icon: "👥" },
  { value: "customer-service", label: "Kundtjänst", icon: "💬" },
  { value: "operations", label: "Operations & Produktion", icon: "⚙️" },
  { value: "it", label: "IT & Teknik", icon: "💻" },
  { value: "management", label: "Ledning", icon: "🎖️" },
];

const INDUSTRIES = [
  "Tech & SaaS",
  "E-handel",
  "Retail",
  "Tillverkning",
  "Konsulting",
  "Finans",
  "Vård & Omsorg",
  "Utbildning",
  "Fastigheter",
  "Transport & Logistik",
  "Hotell & Restaurang",
  "Media & Kommunikation",
  "Annat",
];

export default function BusinessPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [step, setStep] = useState<Step>("company");
  
  const [companyInfo, setCompanyInfo] = useState({
    name: "",
    size: "",
    industry: "",
    employees: "",
  });
  
  const [department, setDepartment] = useState("");

  const handleCompanySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep("department");
  };

  const handleDepartmentSelect = (dept: string) => {
    setDepartment(dept);
    router.push(`/business/analysis?dept=${dept}&size=${companyInfo.size}&industry=${companyInfo.industry}`);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        
        {step === "company" && (
          <div className="animate-fade-in-up">
            {/* Hero for B2B */}
            <div className="text-center mb-12">
              <div className="inline-block px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-medium mb-6">
                För företag & team
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                AI SOM FÖRLÄNGER DIN TEAMS TID
              </h1>
              <p className="text-xl text-gray-600 mb-4">
                Få en skräddarsydd AI-strategi för din avdelning eller hela företaget.
              </p>
              <p className="text-lg text-gray-500">
                Svara på 20-30 frågor och få 5 konkreta AI-lösningar som sparar 10-50 timmar per vecka för ditt team.
              </p>
            </div>

            {/* Company info form */}
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Berätta om ert företag
              </h2>
              
              <form onSubmit={handleCompanySubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Företagsnamn
                  </label>
                  <input
                    type="text"
                    value={companyInfo.name}
                    onChange={(e) => setCompanyInfo({...companyInfo, name: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    placeholder="T.ex. Acme AB"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Företagsstorlek
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {COMPANY_SIZES.map((size) => (
                      <button
                        key={size.value}
                        type="button"
                        onClick={() => setCompanyInfo({...companyInfo, size: size.value})}
                        className={`p-4 rounded-lg border-2 transition-all text-left ${
                          companyInfo.size === size.value
                            ? "border-gray-900 bg-gray-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <p className="font-medium text-gray-900">{size.label}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bransch
                  </label>
                  <select
                    value={companyInfo.industry}
                    onChange={(e) => setCompanyInfo({...companyInfo, industry: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    required
                  >
                    <option value="">Välj bransch...</option>
                    {INDUSTRIES.map((industry) => (
                      <option key={industry} value={industry}>
                        {industry}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Antal anställda (ungefär)
                  </label>
                  <input
                    type="number"
                    value={companyInfo.employees}
                    onChange={(e) => setCompanyInfo({...companyInfo, employees: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    placeholder="T.ex. 25"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={!companyInfo.name || !companyInfo.size || !companyInfo.industry || !companyInfo.employees}
                  className="w-full py-4 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium text-lg"
                >
                  Fortsätt →
                </button>
              </form>
            </div>

            {/* Social proof */}
            <div className="mt-12 text-center">
              <p className="text-gray-500 text-sm mb-4">Företag som redan använder AI:</p>
              <div className="flex flex-wrap justify-center gap-8 opacity-60">
                <span className="text-gray-400 font-medium">Spotify</span>
                <span className="text-gray-400 font-medium">Klarna</span>
                <span className="text-gray-400 font-medium">H&M</span>
                <span className="text-gray-400 font-medium">Volvo</span>
                <span className="text-gray-400 font-medium">Ericsson</span>
              </div>
            </div>
          </div>
        )}

        {step === "department" && (
          <div className="animate-fade-in-up">
            <button
              onClick={() => setStep("company")}
              className="mb-8 text-gray-600 hover:text-gray-900 transition-colors flex items-center gap-2"
            >
              ← Tillbaka
            </button>

            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Vilken avdelning vill ni optimera?
              </h2>
              <p className="text-gray-600">
                Vi skapar en skräddarsydd AI-strategi för just er avdelning
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {DEPARTMENTS.map((dept) => (
                <button
                  key={dept.value}
                  onClick={() => handleDepartmentSelect(dept.value)}
                  className="p-6 bg-white rounded-xl border-2 border-gray-200 hover:border-gray-900 hover:shadow-lg transition-all text-left group"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-4xl">{dept.icon}</span>
                    <div>
                      <p className="font-semibold text-gray-900 text-lg group-hover:text-gray-900">
                        {dept.label}
                      </p>
                      <p className="text-sm text-gray-500">
                        Spara 10-50h/vecka
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-8 p-6 bg-blue-50 rounded-xl border border-blue-100">
              <p className="text-blue-900 text-sm">
                💡 <strong>Tips:</strong> Välj den avdelning där ni har mest repetitiva arbetsuppgifter eller störst tidsbrist.
              </p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
