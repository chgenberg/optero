"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import PremiumInterview from "@/components/PremiumInterview";

function InterviewContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isVerified, setIsVerified] = useState(false);
  const [profession, setProfession] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [userContext, setUserContext] = useState<any>({});
  const [showReport, setShowReport] = useState(false);
  const [email, setEmail] = useState("");
  const [reportContent, setReportContent] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    // Verifiera att användaren har betalat (mock för development)
    const isMock = searchParams.get("mock") === "true";
    const profParam = searchParams.get("profession");
    const specParam = searchParams.get("specialization");

    if (isMock && profParam && specParam) {
      setIsVerified(true);
      setProfession(profParam);
      setSpecialization(specParam);
      // I produktion: hämta från localStorage eller database
      setUserContext({
        tasks: [],
        challenges: [],
        experience: "Medel",
      });
    } else {
      // I produktion: Verifiera Stripe session
      // Om inte verifierad, redirect till start
      // router.push("/");
      setIsVerified(true); // Temporary for development
    }
  }, [searchParams, router]);

  const handleInterviewComplete = async (sessionId: string) => {
    setShowReport(true);
  };

  const handleGenerateReport = async () => {
    if (!email.trim()) {
      alert("Vänligen ange din email");
      return;
    }

    setIsGenerating(true);
    // Här skulle vi anropa generate-report API
    // För nu: simulera
    setTimeout(() => {
      setReportContent("Din rapport har genererats och skickas till " + email);
      setIsGenerating(false);
    }, 3000);
  };

  if (!isVerified) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Verifierar betalning...</p>
        </div>
      </div>
    );
  }

  if (showReport) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white py-12">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Intervju slutförd! 🎉
            </h2>
            <p className="text-gray-600 mb-8">
              Nu genererar vi din personliga AI-strategi
            </p>

            {!reportContent ? (
              <div className="space-y-4">
                <div className="text-left">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Skicka rapporten till:
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="din@email.se"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-gray-900 focus:outline-none"
                  />
                </div>

                <button
                  onClick={handleGenerateReport}
                  disabled={isGenerating}
                  className="w-full px-6 py-4 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-all duration-200 font-medium disabled:opacity-50"
                >
                  {isGenerating ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Genererar rapport...
                    </span>
                  ) : (
                    "Generera min rapport"
                  )}
                </button>

                <p className="text-xs text-gray-500">
                  Rapporten tar ca 2-3 minuter att generera
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                  <p className="text-green-800 text-sm">{reportContent}</p>
                </div>

                <div className="bg-gray-50 rounded-xl p-6 text-left">
                  <h3 className="font-bold text-gray-900 mb-3">Vad händer nu?</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start gap-2">
                      <span className="text-gray-900 font-bold">1.</span>
                      <span>Din rapport skickas till {email} inom 10-15 minuter</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-gray-900 font-bold">2.</span>
                      <span>Rapporten innehåller 8-12 sidor med personlig analys</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-gray-900 font-bold">3.</span>
                      <span>Du får tillgång till support-chatten i 30 dagar</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-gray-900 font-bold">4.</span>
                      <span>Börja implementera direkt med våra copy-paste prompts!</span>
                    </li>
                  </ul>
                </div>

                <button
                  onClick={() => router.push("/")}
                  className="w-full px-6 py-3 border-2 border-gray-900 text-gray-900 rounded-xl hover:bg-gray-900 hover:text-white transition-all duration-200 font-medium"
                >
                  Tillbaka till startsidan
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white py-8">
      <PremiumInterview
        profession={profession}
        specialization={specialization}
        userContext={userContext}
        onComplete={handleInterviewComplete}
      />
    </div>
  );
}

export default function PremiumInterviewPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Laddar...</p>
        </div>
      </div>
    }>
      <InterviewContent />
    </Suspense>
  );
}

