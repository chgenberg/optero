"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";

type Step = "intro" | "company" | "department" | "industry";

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

const INDUSTRIES = [
  { value: "tech", label: "Tech & SaaS" },
  { value: "ecommerce", label: "E-handel" },
  { value: "retail", label: "Retail" },
  { value: "manufacturing", label: "Tillverkning" },
  { value: "consulting", label: "Konsulting" },
  { value: "finance", label: "Finans" },
  { value: "healthcare", label: "Vård & Omsorg" },
  { value: "education", label: "Utbildning" },
  { value: "realestate", label: "Fastigheter" },
  { value: "transport", label: "Transport & Logistik" },
  { value: "hospitality", label: "Hotell & Restaurang" },
  { value: "media", label: "Media & Kommunikation" },
  { value: "other", label: "Annat" },
];

export default function BusinessPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [step, setStep] = useState<Step>("intro");
  
  const [companyInfo, setCompanyInfo] = useState({
    name: "",
    size: "",
    industry: "",
    employees: "",
  });
  
  const [department, setDepartment] = useState("");

  const handleSizeSelect = (size: string) => {
    setCompanyInfo({...companyInfo, size});
    setStep("department");
  };

  const handleDepartmentSelect = (dept: string) => {
    setDepartment(dept);
    setStep("industry");
  };

  const handleIndustrySelect = (industry: string) => {
    setCompanyInfo({...companyInfo, industry});
    router.push(`/business/analysis?dept=${department}&size=${companyInfo.size}&industry=${industry}`);
  };

  const handleStartJourney = () => {
    setStep("company");
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-12">
        
        {/* Intro step */}
        {step === "intro" && (
          <div className="text-center mb-16 animate-fade-in-up">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4 sm:mb-6 tracking-wider uppercase">
              AI SOM GER DITT TEAM TID ATT FOKUSERA PÅ DET SOM RÄKNAS
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-gray-600 font-light px-4 sm:px-0 tracking-wide">
              Få en plan som frigör timmar varje vecka – skräddarsydd för ert företag.
            </p>

            <div className="flex justify-center mt-12 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              <button
                onClick={handleStartJourney}
                className="btn-primary px-8 py-4 text-lg"
              >
                Starta er AI-resa →
              </button>
            </div>
          </div>
        )}

        {/* Company size step */}
        {step === "company" && (
          <div className="animate-fade-in-up">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
              Hur stort är ert företag?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {COMPANY_SIZES.map((size) => (
                <button
                  key={size.value}
                  onClick={() => handleSizeSelect(size.value)}
                  className="p-8 bg-white rounded-lg border-2 border-gray-200 hover:border-gray-900 transition-all group text-left"
                >
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-gray-700">
                    {size.label}
                  </h3>
                  <p className="text-gray-600">{size.subtitle}</p>
                </button>
              ))}
            </div>
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

        {/* Industry step */}
        {step === "industry" && (
          <div className="animate-fade-in-up">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
              Vilken bransch är ni verksamma inom?
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
              {INDUSTRIES.map((industry) => (
                <button
                  key={industry.value}
                  onClick={() => handleIndustrySelect(industry.value)}
                  className="p-4 bg-white rounded-lg border-2 border-gray-200 hover:border-gray-900 transition-all text-center"
                >
                  <span className="text-gray-900 font-medium">{industry.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}