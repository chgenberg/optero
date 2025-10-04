"use client";

import { useState } from "react";

export default function RaderaDataPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/gdpr/delete-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setSuccess(true);
        setEmail("");
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
            Radera mina uppgifter
          </h1>
          
          <p className="text-gray-600 mb-6">
            Enligt GDPR har du rätt att få dina personuppgifter raderade från våra system. 
            Ange din e-postadress nedan så raderar vi all data kopplad till den.
          </p>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <h3 className="font-medium text-yellow-800 mb-2">⚠️ Observera:</h3>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• All din sparade data kommer att raderas permanent</li>
              <li>• Du kommer inte längre ha tillgång till dina tidigare resultat</li>
              <li>• Detta kan inte ångras</li>
              <li>• Om du har Premium kommer din prenumeration att avslutas</li>
            </ul>
          </div>

          {success ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
              <svg className="w-16 h-16 text-green-500 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <h3 className="text-lg font-semibold text-green-800 mb-2">
                Dina uppgifter har raderats
              </h3>
              <p className="text-green-700">
                All data kopplad till din e-postadress har tagits bort från våra system.
              </p>
            </div>
          ) : (
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
                className="w-full bg-red-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Raderar..." : "Radera mina uppgifter"}
              </button>
            </form>
          )}

          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="font-medium text-gray-900 mb-2">Andra GDPR-rättigheter:</h3>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>
                <strong>Rätt till dataportabilitet:</strong>{" "}
                <a href="/gdpr/exportera-data" className="text-blue-600 hover:underline">
                  Exportera dina uppgifter
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
