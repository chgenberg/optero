"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function IdentifyProblem() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState("");

  // Normalize common URL inputs: abc.com, www.abc.com, https://www.abc.com
  const normalizeUrlInput = (value: string): string => {
    let v = (value || "").trim();
    if (!v) return v;
    // If starts with www., add https://
    if (/^www\./i.test(v)) v = `https://${v}`;
    // If missing protocol and looks like a domain, add https://
    if (!/^https?:\/\//i.test(v) && /\./.test(v)) v = `https://${v}`;
    // Lowercase hostname only
    try {
      const u = new URL(v);
      const hostLower = u.hostname.toLowerCase();
      return `${u.protocol}//${hostLower}${u.port ? `:${u.port}` : ""}${u.pathname}${u.search}${u.hash}`;
    } catch {
      return v; // If URL constructor fails, keep best-effort
    }
  };

  const handleAnalyze = async () => {
    if (!url.trim() || !email.trim() || !consent) {
      setError("Fyll i alla fält och godkänn integritetspolicyn");
      return;
    }
    
    if (!email.includes('@')) {
      setError("Ange en giltig e-postadress");
      return;
    }

    // Normalize URL for server
    const normalizedUrl = normalizeUrlInput(url);

    setAnalyzing(true);
    setError("");
    
    try {
      // Create/update user
      const userRes = await fetch('/api/users/upsert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      
      if (!userRes.ok) throw new Error('Failed to create user');
      
      const userData = await userRes.json();
      
      // Store user and URL in session
      sessionStorage.setItem("botUserEmail", email);
      sessionStorage.setItem("botUserId", userData.userId);
      sessionStorage.setItem("botWebsiteUrl", normalizedUrl);
      
      // Navigate to problem analysis
      router.push("/business/bot-builder/analyze");
    } catch (error) {
      console.error("Error:", error);
      setError("Ett fel uppstod. Försök igen.");
      setAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="max-w-xl w-full">
        {/* Progress indicator */}
        <div className="flex justify-center mb-12">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-black rounded-full"></div>
            <div className="w-8 h-0.5 bg-gray-300"></div>
            <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
            <div className="w-8 h-0.5 bg-gray-300"></div>
            <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
          </div>
        </div>

        <div className="minimal-box">
          <h2 className="text-2xl font-light text-gray-900 mb-8">
            Låt oss börja med din webbplats
          </h2>
          
          <div className="space-y-6">
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onBlur={() => setUrl((v) => normalizeUrlInput(v))}
              onKeyDown={(e) => { if (e.key === 'Enter') handleAnalyze(); }}
              placeholder="https://dinwebbplats.se"
              className="w-full px-6 py-4 bg-gray-50 rounded-full text-gray-900 placeholder-gray-500 focus:outline-none focus:bg-white focus:ring-2 focus:ring-black transition-all"
            />

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="din@email.se"
              className="w-full px-6 py-4 bg-gray-50 rounded-full text-gray-900 placeholder-gray-500 focus:outline-none focus:bg-white focus:ring-2 focus:ring-black transition-all"
            />
            
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="mt-1 w-5 h-5 rounded border-gray-300 text-black focus:ring-black"
              />
              <span className="text-sm text-gray-700">
                Jag godkänner att ni skapar ett konto, analyserar min webbplats och lagrar data enligt{' '}
                <a 
                  href="/integritetspolicy-bot-builder" 
                  target="_blank"
                  className="text-black underline hover:text-gray-700"
                >
                  integritetspolicyn
                </a>
              </span>
            </label>

            {error && (
              <p className="text-sm text-red-600 text-center">{error}</p>
            )}
            
            <p className="text-sm text-gray-600 text-center">
              Vi analyserar din webbplats djupgående för att förstå ditt företag och identifiera var en chatbot kan ge mest värde
            </p>

            <div className="flex justify-center">
              <button
                onClick={handleAnalyze}
                disabled={!url.trim() || !email.trim() || !consent || analyzing}
                className="btn-minimal disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {analyzing ? "Skapar konto och analyserar..." : "Fortsätt"}
              </button>
            </div>
          </div>
        </div>

        {/* Back link */}
        <div className="text-center mt-8">
          <button
            onClick={() => router.push("/business/bot-builder")}
            className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            ← Tillbaka
          </button>
        </div>
      </div>
    </div>
  );
}
