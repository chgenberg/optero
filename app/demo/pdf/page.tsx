"use client";

import { useState, useEffect } from "react";

export default function PDFDemoPage() {
  const [loading, setLoading] = useState(false);

  const openPDF = async () => {
    setLoading(true);
    
    // Open PDF in new window
    const pdfWindow = window.open('', '_blank');
    if (pdfWindow) {
      pdfWindow.document.write('<html><body><p style="font-family: sans-serif; text-align: center; padding: 50px;">Genererar PDF-demo...</p></body></html>');
      
      try {
        const response = await fetch("/api/premium/download-pdf", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            context: { 
              profession: "Ekonom", 
              specialization: "Redovisningskonsult" 
            },
            results: {
              // Mock demo data
              demo: true
            },
          }),
        });

        if (response.ok) {
          const html = await response.text();
          pdfWindow.document.write(html);
          pdfWindow.document.close();
        } else {
          pdfWindow.close();
          alert("Kunde inte generera PDF-demo.");
        }
      } catch (error) {
        console.error("PDF demo failed:", error);
        pdfWindow.close();
        alert("Ett fel uppstod.");
      }
    } else {
      alert("Tillåt popup-fönster för att se PDF-demon.");
    }
    
    setLoading(false);
  };

  useEffect(() => {
    // Auto-open PDF on page load
    openPDF();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-2xl mx-auto text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">PDF Demo - Premium Guide</h1>
        
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <p className="text-lg text-gray-700 mb-6">
            Detta är en demo av hur din personliga AI-guide kommer se ut som PDF.
          </p>
          
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <h2 className="font-semibold text-gray-900 mb-2">📄 Vad PDF:en innehåller:</h2>
            <ul className="text-left text-gray-700 space-y-2">
              <li>✓ 28 sidor skräddarsytt innehåll</li>
              <li>✓ Steg-för-steg guider för AI-verktyg</li>
              <li>✓ 4-veckors implementeringsplan</li>
              <li>✓ Färdiga prompts att kopiera</li>
              <li>✓ ROI-beräkningar och tidsbesparingar</li>
            </ul>
          </div>

          {!loading ? (
            <button
              onClick={openPDF}
              className="btn-primary inline-flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Öppna PDF-demo
            </button>
          ) : (
            <div className="inline-flex items-center gap-2 text-gray-600">
              <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
              <span>Genererar PDF...</span>
            </div>
          )}
          
          <p className="text-sm text-gray-500 mt-4">
            PDF:en öppnas i ett nytt fönster. Välj "Spara som PDF" för att ladda ner.
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-900">
          <p className="font-semibold mb-1">💡 Tips för demo</p>
          <p>
            I den riktiga versionen genereras innehållet baserat på dina svar och blir helt anpassat för just ditt yrke och dina utmaningar.
          </p>
        </div>

        <div className="mt-8">
          <a href="/" className="text-gray-600 hover:text-gray-900 underline">
            ← Tillbaka till startsidan
          </a>
        </div>
      </div>
    </div>
  );
}
