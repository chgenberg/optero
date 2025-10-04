"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";

// Department-specific questions
const DEPARTMENT_QUESTIONS: Record<string, Array<{question: string, type: "text" | "number" | "select", options?: string[]}>> = {
  "sales": [
    { question: "Hur många säljare har ni i teamet?", type: "number" },
    { question: "Vad är er genomsnittliga deal-size? (SEK)", type: "number" },
    { question: "Hur lång är er genomsnittliga säljcykel? (dagar)", type: "number" },
    { question: "Vilket CRM-system använder ni?", type: "select", options: ["Salesforce", "HubSpot", "Pipedrive", "Microsoft Dynamics", "Annat", "Inget"] },
    { question: "Hur många timmar per vecka spenderar varje säljare på administration?", type: "number" },
    { question: "Hur genererar ni leads idag?", type: "text" },
    { question: "Hur kvalificerar ni leads innan kontakt?", type: "text" },
    { question: "Hur många cold outreach-emails skickar ni per vecka?", type: "number" },
    { question: "Vad är er genomsnittliga konverteringsgrad? (%)", type: "number" },
    { question: "Hur skapar ni offerter idag?", type: "text" },
    { question: "Hur lång tid tar det att skapa en anpassad offert? (timmar)", type: "number" },
    { question: "Hur följer ni upp kundkontakter?", type: "text" },
    { question: "Hur ofta har ni säljmöten/uppföljningar?", type: "select", options: ["Dagligen", "Varje vecka", "Varannan vecka", "Månadsvis", "Sällan"] },
    { question: "Vilka verktyg använder ni för prospecting?", type: "text" },
    { question: "Hur onboardar ni nya kunder?", type: "text" },
    { question: "Hur hanterar ni avtalsförhandlingar?", type: "text" },
    { question: "Hur mäter ni säljprestanda?", type: "text" },
    { question: "Vilka är era största utmaningar i säljprocessen?", type: "text" },
    { question: "Hur mycket tid spenderar säljare på att uppdatera CRM?", type: "number" },
    { question: "Hur analyserar ni förlorade deals?", type: "text" },
  ],
  "marketing": [
    { question: "Hur många personer jobbar med marknadsföring?", type: "number" },
    { question: "Vad är er månatliga marknadsbudget? (SEK)", type: "number" },
    { question: "Vilka kanaler använder ni mest?", type: "text" },
    { question: "Hur skapar ni innehåll idag?", type: "text" },
    { question: "Hur många innehållspublikationer gör ni per vecka?", type: "number" },
    { question: "Hur lång tid tar det att skapa ett blogginlägg?", type: "number" },
    { question: "Hur hanterar ni social media?", type: "text" },
    { question: "Vilka verktyg använder ni för marknadsföring?", type: "text" },
    { question: "Hur mäter ni marknadsföringens ROI?", type: "text" },
    { question: "Hur ofta gör ni kampanjer?", type: "select", options: ["Varje vecka", "Varje månad", "Kvartalsvis", "Sällan"] },
    { question: "Hur skapar ni annonstexter?", type: "text" },
    { question: "Hur mycket tid spenderar ni på att designa grafik?", type: "number" },
    { question: "Hur analyserar ni kampanjresultat?", type: "text" },
    { question: "Hur segmenterar ni er målgrupp?", type: "text" },
    { question: "Hur personaliserar ni kommunikation?", type: "text" },
    { question: "Vilka är era största marknadsföringsutmaningar?", type: "text" },
    { question: "Hur hanterar ni email-marknadsföring?", type: "text" },
    { question: "Hur ofta uppdaterar ni er hemsida?", type: "select", options: ["Dagligen", "Varje vecka", "Månadsvis", "Sällan"] },
    { question: "Hur arbetar ni med SEO?", type: "text" },
    { question: "Hur skapar ni case studies och kundberättelser?", type: "text" },
  ],
  "finance": [
    { question: "Hur många personer jobbar med ekonomi?", type: "number" },
    { question: "Vilket ekonomisystem använder ni?", type: "select", options: ["Fortnox", "Visma", "SAP", "Dynamics", "Annat"] },
    { question: "Hur många fakturor hanterar ni per månad?", type: "number" },
    { question: "Hur lång tid tar bokslut? (timmar)", type: "number" },
    { question: "Hur ofta gör ni ekonomiska rapporter?", type: "select", options: ["Varje vecka", "Månadsvis", "Kvartalsvis"] },
    { question: "Hur mycket tid spenderar ni på manuell bokföring?", type: "number" },
    { question: "Hur hanterar ni leverantörsfakturor?", type: "text" },
    { question: "Hur sköter ni kundfakturering?", type: "text" },
    { question: "Hur följer ni upp betalningar?", type: "text" },
    { question: "Hur gör ni budgetuppföljning?", type: "text" },
    { question: "Hur ofta stämmer ni av konton?", type: "select", options: ["Dagligen", "Varje vecka", "Månadsvis"] },
    { question: "Hur hanterar ni momsdeklarationer?", type: "text" },
    { question: "Hur skapar ni ekonomiska prognoser?", type: "text" },
    { question: "Hur analyserar ni avvikelser?", type: "text" },
    { question: "Hur kommunicerar ni ekonomi till ledning?", type: "text" },
    { question: "Vilka är era största ekonomiadministrativa utmaningar?", type: "text" },
    { question: "Hur mycket tid går åt till att samla data från olika system?", type: "number" },
    { question: "Hur hanterar ni utlägg och reseräkningar?", type: "text" },
    { question: "Hur sköter ni lönehantering?", type: "text" },
    { question: "Hur ofta får ni ad-hoc rapportförfrågningar?", type: "select", options: ["Dagligen", "Varje vecka", "Månadsvis", "Sällan"] },
  ],
  "hr": [
    { question: "Hur många personer jobbar med HR?", type: "number" },
    { question: "Hur många rekryteringar gör ni per år?", type: "number" },
    { question: "Hur lång tid tar en rekryteringsprocess? (veckor)", type: "number" },
    { question: "Hur många ansökningar får ni per tjänst i genomsnitt?", type: "number" },
    { question: "Hur screener ni CV:n idag?", type: "text" },
    { question: "Hur skapar ni jobbannonser?", type: "text" },
    { question: "Vilket ATS (Applicant Tracking System) använder ni?", type: "text" },
    { question: "Hur många intervjuer gör ni per kandidat?", type: "number" },
    { question: "Hur onboardar ni nya medarbetare?", type: "text" },
    { question: "Hur lång tid tar onboarding? (dagar)", type: "number" },
    { question: "Hur hanterar ni medarbetarsamtal?", type: "text" },
    { question: "Hur ofta gör ni medarbetarsamtal?", type: "select", options: ["Månadsvis", "Kvartalsvis", "Halvårsvis", "Årligen"] },
    { question: "Hur mäter ni medarbetarnöjdhet?", type: "text" },
    { question: "Hur hanterar ni kompetensutveckling?", type: "text" },
    { question: "Hur mycket tid spenderar ni på administrativt HR-arbete?", type: "number" },
    { question: "Hur kommunicerar ni HR-policies?", type: "text" },
    { question: "Hur hanterar ni frånvaro och sjukskrivningar?", type: "text" },
    { question: "Hur sköter ni löneadministration?", type: "text" },
    { question: "Vilka är era största HR-utmaningar?", type: "text" },
    { question: "Hur arbetar ni med employer branding?", type: "text" },
  ],
  "customer-service": [
    { question: "Hur många personer jobbar med kundtjänst?", type: "number" },
    { question: "Hur många kundärenden hanterar ni per dag?", type: "number" },
    { question: "Vilka kanaler använder ni? (email, telefon, chat, etc.)", type: "text" },
    { question: "Vad är er genomsnittliga svarstid? (timmar)", type: "number" },
    { question: "Hur många av ärendena är repetitiva frågor? (%)", type: "number" },
    { question: "Vilket CRM/helpdesk-system använder ni?", type: "text" },
    { question: "Hur dokumenterar ni kundinteraktioner?", type: "text" },
    { question: "Hur lång tid tar ett genomsnittligt ärende? (minuter)", type: "number" },
    { question: "Hur hanterar ni komplexa tekniska frågor?", type: "text" },
    { question: "Hur eskalerar ni ärenden?", type: "text" },
    { question: "Hur mäter ni kundnöjdhet?", type: "text" },
    { question: "Hur ofta får ni klagomål?", type: "select", options: ["Dagligen", "Varje vecka", "Månadsvis", "Sällan"] },
    { question: "Hur hanterar ni ilskna kunder?", type: "text" },
    { question: "Har ni en FAQ/kunskapsbas?", type: "select", options: ["Ja, omfattande", "Ja, begränsad", "Nej"] },
    { question: "Hur mycket tid går åt till att svara på samma frågor?", type: "number" },
    { question: "Hur onboardar ni nya kundtjänstmedarbetare?", type: "text" },
    { question: "Hur kvalitetssäkrar ni kundkommunikation?", type: "text" },
    { question: "Vilka är era största kundtjänstutmaningar?", type: "text" },
    { question: "Hur hanterar ni flerspråkig support?", type: "text" },
    { question: "Hur följer ni upp kundärenden?", type: "text" },
  ],
};

function AnalysisContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useLanguage();
  
  const dept = searchParams?.get("dept") || "";
  const size = searchParams?.get("size") || "";
  const industry = searchParams?.get("industry") || "";
  
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [currentAnswer, setCurrentAnswer] = useState("");

  const questions = DEPARTMENT_QUESTIONS[dept] || [];
  const question = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  const handleNext = () => {
    setAnswers({...answers, [currentQuestion]: currentAnswer});
    
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setCurrentAnswer("");
    } else {
      // Save and go to results
      sessionStorage.setItem("businessAnalysis", JSON.stringify({
        dept,
        size,
        industry,
        answers,
      }));
      router.push("/business/results");
    }
  };

  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      setCurrentAnswer(answers[currentQuestion - 1] || "");
    } else {
      router.back();
    }
  };

  if (!dept || !questions.length) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Ingen avdelning vald</p>
          <button
            onClick={() => router.push("/business")}
            className="mt-4 btn-primary"
          >
            Tillbaka
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Progress bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-gray-200 z-50">
        <div 
          className="h-full bg-gray-900 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="container mx-auto px-4 py-12 max-w-3xl pt-20">
        <div className="mb-8">
          <p className="text-sm text-gray-500 mb-2">
            Fråga {currentQuestion + 1} av {questions.length}
          </p>
          <div className="flex gap-1">
            {questions.map((_, idx) => (
              <div
                key={idx}
                className={`h-1 flex-1 rounded-full ${
                  idx <= currentQuestion ? "bg-gray-900" : "bg-gray-200"
                }`}
              />
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {question.question}
          </h2>

          {question.type === "text" && (
            <textarea
              value={currentAnswer}
              onChange={(e) => setCurrentAnswer(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent min-h-[120px]"
              placeholder="Beskriv så detaljerat som möjligt..."
              autoFocus
            />
          )}

          {question.type === "number" && (
            <input
              type="number"
              value={currentAnswer}
              onChange={(e) => setCurrentAnswer(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent text-lg"
              placeholder="Ange antal..."
              autoFocus
            />
          )}

          {question.type === "select" && question.options && (
            <div className="space-y-3">
              {question.options.map((option) => (
                <button
                  key={option}
                  onClick={() => setCurrentAnswer(option)}
                  className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                    currentAnswer === option
                      ? "border-gray-900 bg-gray-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          )}

          <div className="flex gap-4 mt-8">
            <button
              onClick={handleBack}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              ← Tillbaka
            </button>
            <button
              onClick={handleNext}
              disabled={!currentAnswer}
              className="flex-1 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {currentQuestion < questions.length - 1 ? "Nästa →" : "Få er AI-strategi →"}
            </button>
          </div>
        </div>

        {/* Encouragement */}
        <div className="mt-8 text-center">
          <p className="text-gray-500 text-sm">
            💡 Ju mer detaljerat ni svarar, desto bättre blir er AI-strategi
          </p>
        </div>
      </div>
    </main>
  );
}

export default function BusinessAnalysisPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-4 border-gray-200 border-t-gray-900 animate-spin" />
      </div>
    }>
      <AnalysisContent />
    </Suspense>
  );
}
