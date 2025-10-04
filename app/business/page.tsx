"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";

type Step = "intro" | "company" | "department";

const COMPANY_SIZES = [
  { 
    value: "startup", 
    label: "Startup", 
    subtitle: "1-10 anställda",
    icon: "🚀",
    color: "from-purple-500 to-pink-500"
  },
  { 
    value: "small", 
    label: "Litet företag", 
    subtitle: "10-50 anställda",
    icon: "🏢",
    color: "from-blue-500 to-cyan-500"
  },
  { 
    value: "medium", 
    label: "Medelstort", 
    subtitle: "50-250 anställda",
    icon: "🏛️",
    color: "from-green-500 to-emerald-500"
  },
  { 
    value: "large", 
    label: "Stort företag", 
    subtitle: "250+ anställda",
    icon: "🌆",
    color: "from-orange-500 to-red-500"
  },
];

const DEPARTMENTS = [
  { value: "sales", label: "Försäljning", icon: "📈", description: "Öka konvertering & automatisera CRM" },
  { value: "marketing", label: "Marknadsföring", icon: "🎯", description: "Skapa innehåll & optimera kampanjer" },
  { value: "finance", label: "Ekonomi & Finans", icon: "💰", description: "Automatisera bokföring & rapporter" },
  { value: "hr", label: "HR & Personal", icon: "👥", description: "Snabbare rekrytering & onboarding" },
  { value: "customer-service", label: "Kundtjänst", icon: "💬", description: "AI-chatbots & bättre support" },
  { value: "operations", label: "Operations", icon: "⚙️", description: "Optimera processer & produktion" },
  { value: "it", label: "IT & Teknik", icon: "💻", description: "Automatisera kod & dokumentation" },
  { value: "management", label: "Ledning", icon: "🎖️", description: "Beslutsunderlag & strategisk analys" },
];

const INDUSTRIES = [
  { value: "tech", label: "Tech & SaaS", icon: "💻" },
  { value: "ecommerce", label: "E-handel", icon: "🛒" },
  { value: "retail", label: "Retail", icon: "🏪" },
  { value: "manufacturing", label: "Tillverkning", icon: "🏭" },
  { value: "consulting", label: "Konsulting", icon: "💼" },
  { value: "finance", label: "Finans", icon: "🏦" },
  { value: "healthcare", label: "Vård & Omsorg", icon: "🏥" },
  { value: "education", label: "Utbildning", icon: "🎓" },
  { value: "realestate", label: "Fastigheter", icon: "🏠" },
  { value: "transport", label: "Transport & Logistik", icon: "🚚" },
  { value: "hospitality", label: "Hotell & Restaurang", icon: "🏨" },
  { value: "media", label: "Media & Kommunikation", icon: "📺" },
  { value: "other", label: "Annat", icon: "🔧" },
];

export default function BusinessPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [step, setStep] = useState<Step>("intro");
  const [isAnimating, setIsAnimating] = useState(false);
  
  const [companyInfo, setCompanyInfo] = useState({
    name: "",
    size: "",
    industry: "",
    employees: "",
  });
  
  const [showIndustryModal, setShowIndustryModal] = useState(false);
  const [department, setDepartment] = useState("");

  const handleSizeSelect = (size: string) => {
    setCompanyInfo({...companyInfo, size});
    // Auto-progress after selection
    setTimeout(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setStep("department");
        setIsAnimating(false);
      }, 300);
    }, 500);
  };

  const handleDepartmentSelect = (dept: string) => {
    setDepartment(dept);
    // Animate and redirect
    setIsAnimating(true);
    setTimeout(() => {
      router.push(`/business/analysis?dept=${dept}&size=${companyInfo.size}&industry=${companyInfo.industry}`);
    }, 300);
  };

  const handleStartJourney = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setStep("company");
      setIsAnimating(false);
    }, 300);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 overflow-hidden">
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        
        {/* Animated background elements */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-purple-200 rounded-full blur-3xl opacity-20 animate-pulse-slow" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-200 rounded-full blur-3xl opacity-20 animate-pulse-slow" style={{ animationDelay: '2s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40rem] h-[40rem] bg-gradient-to-r from-pink-200 to-yellow-200 rounded-full blur-3xl opacity-10 animate-spin-slow" />
        </div>

        {/* Intro step */}
        {step === "intro" && (
          <div className={`relative z-10 transition-all duration-500 ${isAnimating ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
            <div className="text-center mb-16 animate-fade-in-up">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4 sm:mb-6 tracking-wider uppercase">
                AI SOM GER DITT TEAM TID ATT FOKUSERA PÅ DET SOM RÄKNAS
              </h1>
              <p className="text-lg sm:text-xl md:text-2xl text-gray-600 font-light px-4 sm:px-0 tracking-wide">
                Få en plan som frigör timmar varje vecka – skräddarsydd för ert företag.
              </p>
            </div>

            <div className="flex justify-center animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              <button
                onClick={handleStartJourney}
                className="btn-primary px-8 py-4 text-lg"
              >
                Starta er AI-resa →
              </button>
            </div>
          </div>
        )}

        {/* Company info step */}
        {step === "company" && (
          <div className={`relative z-10 transition-all duration-500 ${isAnimating ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
            <button
              onClick={() => setStep("intro")}
              className="mb-8 text-gray-600 hover:text-gray-900 transition-all flex items-center gap-2 group"
            >
              <span className="transform group-hover:-translate-x-1 transition-transform">←</span>
              <span>Tillbaka</span>
            </button>

            <div className="text-center mb-12 animate-fade-in-up">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Berätta om ert företag
              </h2>
              <p className="text-lg text-gray-600">
                Vi anpassar AI-strategin efter er storlek och bransch
              </p>
            </div>

            {/* Interactive company form */}
            <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 border border-gray-100 animate-fade-in-up">
              <div className="space-y-8">
                {/* Company name with floating label */}
                <div className="relative">
                  <input
                    type="text"
                    value={companyInfo.name}
                    onChange={(e) => setCompanyInfo({...companyInfo, name: e.target.value})}
                    className="peer w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:border-gray-900 focus:outline-none transition-all text-lg"
                    placeholder=" "
                  />
                  <label className="absolute left-6 top-4 text-gray-400 transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-lg peer-focus:-top-8 peer-focus:text-sm peer-focus:text-gray-900 peer-[:not(:placeholder-shown)]:-top-8 peer-[:not(:placeholder-shown)]:text-sm peer-[:not(:placeholder-shown)]:text-gray-900">
                    Företagsnamn
                  </label>
                </div>

                {/* Industry selection - custom modal */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-3">
                    Vilken bransch är ni i?
                  </label>
                  <button
                    onClick={() => setShowIndustryModal(true)}
                    className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl hover:border-gray-400 transition-all text-left flex items-center justify-between group"
                  >
                    <span className={companyInfo.industry ? "text-gray-900" : "text-gray-400"}>
                      {companyInfo.industry ? 
                        INDUSTRIES.find(i => i.value === companyInfo.industry)?.label : 
                        "Välj bransch..."
                      }
                    </span>
                    <svg className="w-5 h-5 text-gray-400 transform group-hover:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>

                {/* Employee count - animated input */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-3">
                    Antal anställda
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={companyInfo.employees}
                      onChange={(e) => setCompanyInfo({...companyInfo, employees: e.target.value})}
                      className="w-full px-6 py-4 pr-20 border-2 border-gray-200 rounded-2xl focus:border-gray-900 focus:outline-none transition-all text-lg"
                      placeholder="25"
                    />
                    <div className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400">
                      personer
                    </div>
                  </div>
                </div>

                {/* Company size - interactive cards */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-3">
                    Företagsstorlek
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {COMPANY_SIZES.map((size, i) => (
                      <button
                        key={size.value}
                        onClick={() => handleSizeSelect(size.value)}
                        className={`relative p-6 rounded-2xl border-2 transition-all transform hover:scale-105 hover:shadow-xl group overflow-hidden ${
                          companyInfo.size === size.value
                            ? "border-gray-900 bg-gray-50"
                            : "border-gray-200 hover:border-gray-400"
                        }`}
                        style={{ animationDelay: `${i * 0.1}s` }}
                      >
                        <div className={`absolute inset-0 bg-gradient-to-br ${size.color} opacity-0 group-hover:opacity-10 transition-opacity`} />
                        <div className="relative z-10">
                          <div className="text-4xl mb-3">{size.icon}</div>
                          <p className="font-bold text-gray-900 text-lg">{size.label}</p>
                          <p className="text-sm text-gray-600 mt-1">{size.subtitle}</p>
                        </div>
                        {companyInfo.size === size.value && (
                          <div className="absolute top-4 right-4">
                            <div className="w-6 h-6 bg-gray-900 rounded-full flex items-center justify-center">
                              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </div>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Department selection step */}
        {step === "department" && (
          <div className={`relative z-10 transition-all duration-500 ${isAnimating ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
            <button
              onClick={() => setStep("company")}
              className="mb-8 text-gray-600 hover:text-gray-900 transition-all flex items-center gap-2 group"
            >
              <span className="transform group-hover:-translate-x-1 transition-transform">←</span>
              <span>Tillbaka</span>
            </button>

            <div className="text-center mb-12 animate-fade-in-up">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Vilken avdelning vill ni optimera?
              </h2>
              <p className="text-lg text-gray-600">
                Vi skapar en skräddarsydd AI-strategi för just er avdelning
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {DEPARTMENTS.map((dept, i) => (
                <button
                  key={dept.value}
                  onClick={() => handleDepartmentSelect(dept.value)}
                  className="relative bg-white p-8 rounded-3xl border-2 border-gray-200 hover:border-gray-900 transition-all transform hover:scale-105 hover:shadow-2xl group overflow-hidden animate-fade-in-up"
                  style={{ animationDelay: `${i * 0.05}s` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-gray-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="relative z-10">
                    <div className="text-5xl mb-4 transform group-hover:scale-110 transition-transform">{dept.icon}</div>
                    <h3 className="font-bold text-gray-900 text-lg mb-2 group-hover:text-white transition-colors">
                      {dept.label}
                    </h3>
                    <p className="text-sm text-gray-600 group-hover:text-gray-200 transition-colors">
                      {dept.description}
                    </p>
                    <div className="mt-4 flex items-center justify-center gap-2 text-sm font-medium text-gray-900 group-hover:text-white transition-colors">
                      <span>Spara 10-50h/vecka</span>
                      <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-12 p-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-3xl border border-blue-100 animate-fade-in-up">
              <div className="flex items-start gap-4">
                <div className="text-3xl">💡</div>
                <div>
                  <p className="text-blue-900 font-medium">Tips för bästa resultat:</p>
                  <p className="text-blue-800 text-sm mt-1">
                    Välj den avdelning där ni har mest repetitiva arbetsuppgifter eller störst tidsbrist. 
                    AI fungerar bäst där det finns tydliga mönster och återkommande uppgifter.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Industry modal */}
        {showIndustryModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden animate-scale-in">
              <div className="p-8 border-b border-gray-100">
                <h3 className="text-2xl font-bold text-gray-900">Välj er bransch</h3>
              </div>
              <div className="p-8 overflow-y-auto max-h-[60vh]">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {INDUSTRIES.map((industry) => (
                    <button
                      key={industry.value}
                      onClick={() => {
                        setCompanyInfo({...companyInfo, industry: industry.value});
                        setShowIndustryModal(false);
                      }}
                      className="p-4 rounded-2xl border-2 border-gray-200 hover:border-gray-900 hover:bg-gray-50 transition-all group"
                    >
                      <div className="text-3xl mb-2">{industry.icon}</div>
                      <p className="text-sm font-medium text-gray-900">{industry.label}</p>
                    </button>
                  ))}
                </div>
              </div>
              <div className="p-8 border-t border-gray-100">
                <button
                  onClick={() => setShowIndustryModal(false)}
                  className="w-full py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
                >
                  Avbryt
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* CSS for custom animations */}
      <style jsx>{`
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.2; transform: scale(1); }
          50% { opacity: 0.3; transform: scale(1.1); }
        }
        @keyframes spin-slow {
          from { transform: translate(-50%, -50%) rotate(0deg); }
          to { transform: translate(-50%, -50%) rotate(360deg); }
        }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes scale-in {
          from { transform: scale(0.9); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .animate-pulse-slow { animation: pulse-slow 4s ease-in-out infinite; }
        .animate-spin-slow { animation: spin-slow 20s linear infinite; }
        .animate-bounce-slow { animation: bounce-slow 2s ease-in-out infinite; }
        .animate-gradient { 
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }
        .animate-scale-in { animation: scale-in 0.3s ease-out; }
      `}</style>
    </main>
  );
}