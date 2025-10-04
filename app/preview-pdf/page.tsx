"use client";

import { useState, useEffect } from "react";

export default function PreviewPDFPage() {
  const [htmlContent, setHtmlContent] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPDFPreview();
  }, []);

  const fetchPDFPreview = async () => {
    try {
      const response = await fetch("/api/premium/generate-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          context: {
            profession: "Ekonom",
            specialization: "Redovisningskonsult"
          },
          results: {} // Mock data
        }),
      });

      if (response.ok) {
        const html = await response.text();
        setHtmlContent(html);
      }
    } catch (error) {
      console.error("Failed to load PDF preview:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-2 h-2 bg-gray-900 rounded-full animate-pulse" />
            <div className="w-2 h-2 bg-gray-900 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
            <div className="w-2 h-2 bg-gray-900 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
          </div>
          <p className="text-gray-600">Laddar PDF-förhandsvisning...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Control bar */}
      <div className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 p-4 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">PDF Preview - Premium Guide</h1>
          <div className="flex gap-4">
            <button 
              onClick={() => window.print()}
              className="btn-secondary text-sm"
            >
              <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Skriv ut
            </button>
            <a href="/" className="btn-primary text-sm">
              Tillbaka
            </a>
          </div>
        </div>
      </div>

      {/* PDF Content */}
      <div className="pt-20 pb-8">
        <div className="max-w-4xl mx-auto bg-white shadow-lg">
          <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
        </div>
      </div>

      {/* Info message */}
      <div className="fixed bottom-4 left-4 right-4 max-w-md mx-auto">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-900">
          <p className="font-semibold mb-1">Detta är en förhandsvisning</p>
          <p>I produktion genereras en riktig PDF med samma innehåll och design som du kan ladda ner.</p>
        </div>
      </div>
    </div>
  );
}
