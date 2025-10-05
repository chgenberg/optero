"use client";

interface InterviewHelpProps {
  question: string;
  isOpen: boolean;
  onClose: () => void;
}

const helpExamples: Record<string, string[]> = {
  "typisk arbetsdag": [
    "Kl 8-9: Läser och svarar på mail, prioriterar dagens uppgifter",
    "Kl 9-11: Arbetar med huvuduppgifter (specificera vad)",
    "Kl 11-12: Möten med team/kunder",
    "Kl 13-15: Dokumentation och rapportskrivning",
    "Kl 15-16: Planering och administration"
  ],
  "tidskrävande": [
    "Dokumentation tar ca 2-3 timmar per dag",
    "Datainmatning i olika system: 1-2 timmar",
    "Möten som kunde varit mail: 5 timmar/vecka",
    "Leta efter information: 45 min/dag",
    "Rapportskrivning: 4-5 timmar/vecka"
  ],
  "verktyg": [
    "Microsoft Office (Word, Excel, Teams)",
    "Branschspecifika system (nämn vilka)",
    "CRM-system för kundhantering",
    "Projekthanteringsverktyg",
    "Interna databaser och intranät"
  ],
  "repetitiva": [
    "Kopierar data mellan system varje dag",
    "Skriver liknande mail 10-15 gånger/dag",
    "Skapar samma typ av rapporter varje vecka",
    "Uppdaterar status i flera system",
    "Sammanställer information från olika källor"
  ],
  "frustration": [
    "Samma information måste matas in i flera system",
    "Svårt att hitta rätt dokument/information",
    "För många möten som stjäl produktiv tid",
    "Manuella processer som borde vara automatiska",
    "Dålig kommunikation mellan avdelningar"
  ],
  "mål": [
    "Spara 1-2 timmar per dag på administration",
    "Fokusera mer på strategiskt arbete",
    "Minska stress genom bättre struktur",
    "Leverera högre kvalitet med mindre ansträngning",
    "Ha mer tid för kompetensutveckling"
  ]
};

export default function InterviewHelp({ question, isOpen, onClose }: InterviewHelpProps) {
  if (!isOpen) return null;

  // Find relevant help based on keywords
  let relevantHelp: string[] = [];
  const lowerQuestion = question.toLowerCase();

  if (lowerQuestion.includes("arbetsdag") || lowerQuestion.includes("typisk dag")) {
    relevantHelp = helpExamples["typisk arbetsdag"];
  } else if (lowerQuestion.includes("tid") || lowerQuestion.includes("timmar")) {
    relevantHelp = helpExamples["tidskrävande"];
  } else if (lowerQuestion.includes("verktyg") || lowerQuestion.includes("system") || lowerQuestion.includes("program")) {
    relevantHelp = helpExamples["verktyg"];
  } else if (lowerQuestion.includes("repetitiv") || lowerQuestion.includes("upprepa") || lowerQuestion.includes("samma")) {
    relevantHelp = helpExamples["repetitiva"];
  } else if (lowerQuestion.includes("irriterande") || lowerQuestion.includes("frustration") || lowerQuestion.includes("problem")) {
    relevantHelp = helpExamples["frustration"];
  } else if (lowerQuestion.includes("mål") || lowerQuestion.includes("uppnå") || lowerQuestion.includes("vill")) {
    relevantHelp = helpExamples["mål"];
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl animate-fade-in-up">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Tips för bra svar
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-3">
          <p className="text-sm text-gray-600">
            Ju mer specifikt du svarar, desto bättre rekommendationer får du!
          </p>

          {relevantHelp.length > 0 && (
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Exempel på bra svar:</p>
              <ul className="space-y-2">
                {relevantHelp.map((example, index) => (
                  <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                    <span className="text-gray-400 mt-0.5">•</span>
                    <span>{example}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="pt-3 border-t border-gray-100">
            <p className="text-xs text-gray-500">
              💡 Tips: Var konkret med siffror, tider och specifika exempel
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
