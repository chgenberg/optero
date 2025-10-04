"use client";

import { useState } from "react";

export default function ExporteraDataPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/gdpr/export-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `mendio-data-${email}-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        const data = await response.json();
        setError(data.error || "Något gick fel. Försök igen.");
      }
    } catch (err) {
      setError("Kunde inte ansluta till servern. Försök igen senare.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Exportera mina uppgifter
          </h1>
          
          <p className="text-gray-600 mb-6">
            Enligt GDPR har du rätt till dataportabilitet. Ange din e-postadress nedan 
            så skickar vi all data vi har om dig i ett maskinläsbart format (JSON).
          </p>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="font-medium text-blue-800 mb-2">ℹ️ Vad ingår:</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Dina sökningar och valda yrken</li>
              <li>• Sparade specialiseringar och uppgifter</li>
              <li>• Feedback du har lämnat</li>
              <li>• Tidsstämplar för dina aktiviteter</li>
            </ul>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                E-postadress
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                placeholder="din@email.se"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gray-900 text-white py-3 px-6 rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Förbereder export...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  <span>Ladda ner mina uppgifter</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="font-medium text-gray-900 mb-2">Andra GDPR-rättigheter:</h3>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>
                <strong>Rätt att bli glömd:</strong>{" "}
                <a href="/gdpr/radera-data" className="text-blue-600 hover:underline">
                  Radera mina uppgifter
                </a>
              </li>
              <li>
                <strong>Frågor om dataskydd:</strong>{" "}
                <a href="/kontakt" className="text-blue-600 hover:underline">
                  Kontakta oss
                </a>
              </li>
              <li>
                <strong>Läs mer:</strong>{" "}
                <a href="/integritetspolicy" className="text-blue-600 hover:underline">
                  Integritetspolicy
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
