"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function DeployBot() {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  
  const [installSnippet, setInstallSnippet] = useState<string>("");

  useEffect(() => {
    const id = sessionStorage.getItem('botBuilder_botId') || '';
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const src = `${origin}/widget.js`;
    const snippet = `<!-- Mendio Bot Widget -->\n<script async src="${src}" data-bot-id="${id}"></script>`;
    setInstallSnippet(snippet);
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(installSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full">
        <div className="minimal-box">
          <h2 className="text-2xl font-light text-gray-900 mb-8">
            Installera på din webbplats
          </h2>

          <div className="space-y-8">
            {/* Step 1 */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center text-sm font-medium">
                  1
                </div>
                <h3 className="font-medium text-gray-900">Kopiera koden</h3>
              </div>
              
              <div className="relative">
                <pre className="bg-gray-50 rounded-xl p-6 overflow-x-auto text-sm font-mono text-gray-700">
{installSnippet}
                </pre>
                <button
                  onClick={handleCopy}
                  className="absolute top-4 right-4 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm hover:bg-gray-50 transition-colors"
                >
                  {copied ? "Kopierad!" : "Kopiera"}
                </button>
              </div>
            </div>

            {/* Step 2 */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center text-sm font-medium">
                  2
                </div>
                <h3 className="font-medium text-gray-900">Klistra in före &lt;/head&gt;</h3>
              </div>
              
              <p className="text-gray-600">
                Öppna din webbplats HTML och klistra in koden precis innan den stängande <code className="bg-gray-100 px-2 py-1 rounded text-sm">&lt;/head&gt;</code> taggen.
              </p>
            </div>

            {/* Step 3 */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center text-sm font-medium">
                  3
                </div>
                <h3 className="font-medium text-gray-900">Klart!</h3>
              </div>
              
              <p className="text-gray-600">
                Din bot kommer automatiskt visas på alla sidor. Besökare kan chatta genom att klicka på bot-ikonen.
              </p>
            </div>

            {/* Platform specific guides */}
            <div className="border-t pt-8">
              <h3 className="font-medium text-gray-900 mb-4">Behöver du hjälp?</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <button className="text-left p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="font-medium mb-1">WordPress</div>
                  <div className="text-gray-600">Steg-för-steg guide</div>
                </button>
                <button className="text-left p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="font-medium mb-1">Wix</div>
                  <div className="text-gray-600">Steg-för-steg guide</div>
                </button>
                <button className="text-left p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="font-medium mb-1">Squarespace</div>
                  <div className="text-gray-600">Steg-för-steg guide</div>
                </button>
                <button className="text-left p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="font-medium mb-1">Annat</div>
                  <div className="text-gray-600">Kontakta support</div>
                </button>
              </div>
            </div>
          </div>

          <div className="flex justify-center mt-10">
            <button
              onClick={() => router.push("/business/bot-builder/solution")}
              className="btn-minimal-outline"
            >
              Tillbaka
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
