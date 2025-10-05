"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import IndustryInput from "@/components/IndustryInput";

type Step = "industry" | "company" | "department";

const COMPANY_SIZES = [
  { 
    value: "startup", 
    label: "Startup", 
    subtitle: "1-10 anställda"
  },
  { 
    value: "scaleup", 
    label: "Scale-up", 
    subtitle: "10-50 anställda"
  },
  { 
    value: "medium", 
    label: "Medelstort", 
    subtitle: "50-250 anställda"
  },
  { 
    value: "large", 
    label: "Stort företag", 
    subtitle: "250+ anställda"
  },
];

const DEPARTMENTS = [
  { value: "sales", label: "Försäljning", description: "Öka konvertering & automatisera CRM" },
  { value: "marketing", label: "Marknadsföring", description: "Skapa innehåll & optimera kampanjer" },
  { value: "finance", label: "Ekonomi & Finans", description: "Automatisera bokföring & rapporter" },
  { value: "hr", label: "HR & Personal", description: "Snabbare rekrytering & onboarding" },
  { value: "customer-service", label: "Kundtjänst", description: "AI-chatbots & bättre support" },
  { value: "operations", label: "Operations", description: "Optimera processer & produktion" },
  { value: "it", label: "IT & Teknik", description: "Automatisera kod & dokumentation" },
  { value: "management", label: "Ledning", description: "Beslutsunderlag & strategisk analys" },
];

export default function BusinessPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [step, setStep] = useState<Step>("industry");
  
  const [companyInfo, setCompanyInfo] = useState({
    name: "",
    size: "",
    industry: "",
    employees: "",
  });
  
  const [department, setDepartment] = useState("");

  const handleIndustrySelect = (industry: string) => {
    setCompanyInfo({...companyInfo, industry});
    setStep("company");
  };

  const handleCompanySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep("department");
  };

  const handleDepartmentSelect = (dept: string) => {
    setDepartment(dept);
    router.push(`/business/analysis?dept=${dept}&size=${companyInfo.size}&industry=${companyInfo.industry}`);
  };

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-6xl mx-auto w-full">
        
        {/* Industry input step - same layout as consumer */}
        {step === "industry" && (
          <div className="space-y-12 max-w-2xl mx-auto w-full">
            <div className="relative group">
              {/* Animated border container */}
              <div className="absolute -inset-1 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-2xl opacity-75 group-hover:opacity-100 blur-sm transition duration-1000 group-hover:duration-200 animate-gradient-x overflow-hidden"></div>
              
              {/* Content */}
              <div className="relative bg-white rounded-2xl p-8 sm:p-12">
                <div className="text-center animate-fade-in-up">
                  <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4 sm:mb-6 tracking-wider uppercase">
                    AI SOM GER DITT TEAM TID ATT FOKUSERA PÅ DET SOM RÄKNAS
                  </h1>
                  <p className="text-lg sm:text-xl md:text-2xl text-gray-600 font-light px-4 sm:px-0 tracking-wide">
                    Få en plan som frigör timmar varje vecka – skräddarsydd för ert företag.
                  </p>
                </div>

                <div className="mt-12">
                  <IndustryInput onSelect={handleIndustrySelect} />
                  
                  {/* Subtle links below input */}
                  <div className="text-center mt-6 flex items-center justify-center gap-4">
                    <a
                      href="/business/demo"
                      className="text-gray-500 hover:text-gray-900 transition-colors text-sm underline-offset-4 hover:underline"
                    >
                      Se exempel →
                    </a>
                    <span className="text-gray-300">•</span>
                    <a
                      href="/"
                      className="text-gray-500 hover:text-gray-900 transition-colors text-sm underline-offset-4 hover:underline"
                    >
                      För privatpersoner →
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Company info step */}
        {step === "company" && (
          <div className="animate-fade-in-up max-w-xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
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
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-gray-900 focus:outline-none transition-all"
                  placeholder="Exempel AB"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  Antal anställda
                </label>
                <div className="grid grid-cols-2 gap-4">
                  {COMPANY_SIZES.map((size) => (
                    <label
                      key={size.value}
                      className={`p-4 bg-white rounded-lg border-2 cursor-pointer transition-all ${
                        companyInfo.size === size.value 
                          ? 'border-gray-900 bg-gray-50' 
                          : 'border-gray-200 hover:border-gray-400'
                      }`}
                    >
                      <input
                        type="radio"
                        name="size"
                        value={size.value}
                        checked={companyInfo.size === size.value}
                        onChange={(e) => setCompanyInfo({...companyInfo, size: e.target.value})}
                        className="sr-only"
                        required
                      />
                      <div className="text-center">
                        <div className="font-bold text-gray-900">{size.label}</div>
                        <div className="text-sm text-gray-600">{size.subtitle}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full btn-primary py-4 text-lg"
              >
                Nästa →
              </button>
            </form>
          </div>
        )}

        {/* Department step */}
        {step === "department" && (
          <div className="animate-fade-in-up">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
              Vilken avdelning vill ni fokusera på?
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
              {DEPARTMENTS.map((dept) => (
                <button
                  key={dept.value}
                  onClick={() => handleDepartmentSelect(dept.value)}
                  className="p-6 bg-white rounded-lg border-2 border-gray-200 hover:border-gray-900 transition-all group text-left"
                >
                  <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-gray-700">
                    {dept.label}
                  </h3>
                  <p className="text-sm text-gray-600">{dept.description}</p>
                </button>
              ))}
            </div>
          </div>
        )}

      </div>
    </main>
  );
}