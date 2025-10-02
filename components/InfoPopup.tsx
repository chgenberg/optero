"use client";

interface InfoPopupProps {
  onClose: () => void;
}

export default function InfoPopup({ onClose }: InfoPopupProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 relative animate-in fade-in duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 hover:text-gray-800 transition-all"
          aria-label="Stäng"
        >
          ✕
        </button>
        
        <h2 className="text-2xl font-light text-gray-900 mb-4">
          Om Optero AI Assistant
        </h2>
        
        <div className="space-y-4 text-gray-600">
          <p>
            Optero hjälper yrkesverksamma att hitta och implementera AI-verktyg som effektiviserar det dagliga arbetet. Vår avancerade analys ger dig personliga rekommendationer baserat på din unika arbetssituation.
          </p>
          
          <div className="space-y-2">
            <h3 className="font-semibold text-gray-800">Så här fungerar det:</h3>
            <ol className="list-decimal list-inside space-y-1 ml-2">
              <li>Ange ditt yrke och specialisering</li>
              <li>Berätta om din erfarenhetsnivå</li>
              <li>Välj dina största utmaningar</li>
              <li>Markera arbetsuppgifter och hur mycket tid de tar</li>
              <li>Få 5 personligt anpassade AI-verktygsrekommendationer</li>
            </ol>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-xl">
            <p className="text-sm font-medium text-gray-800 mb-2">Vad gör oss unika?</p>
            <ul className="text-sm space-y-1">
              <li>• Personlig AI-assistent som svarar på dina frågor</li>
              <li>• 30-dagars implementeringsplan</li>
              <li>• Feedback-system för kontinuerlig förbättring</li>
              <li>• Tidsbesparing och svårighetsgrad för varje verktyg</li>
            </ul>
          </div>
          
          <p className="text-xs text-gray-500 text-center pt-2">
            Powered by GPT-4 | Utvecklad av Optero
          </p>
        </div>
      </div>
    </div>
  );
}

