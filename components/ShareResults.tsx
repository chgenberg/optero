"use client";

import { useState } from "react";

interface ShareResultsProps {
  profession: string;
  specialization: string;
  recommendations: any[];
  scenarios: any[];
}

export default function ShareResults({ 
  profession, 
  specialization, 
  recommendations, 
  scenarios 
}: ShareResultsProps) {
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareLink, setShareLink] = useState("");
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  const generateShareLink = async () => {
    setLoading(true);
    try {
      // Create a shareable session
      const response = await fetch("/api/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profession,
          specialization,
          recommendations,
          scenarios,
        }),
      });

      const data = await response.json();
      const link = `${window.location.origin}/shared/${data.shareId}`;
      setShareLink(link);
      setShowShareModal(true);
    } catch (error) {
      console.error("Failed to create share link:", error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const shareOnLinkedIn = () => {
    const text = `Jag har precis hittat de bästa AI-verktygen för mitt yrke som ${specialization || profession}! 🚀`;
    const url = encodeURIComponent(shareLink);
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${url}&summary=${encodeURIComponent(text)}`,
      "_blank"
    );
  };

  const shareOnFacebook = () => {
    const url = encodeURIComponent(shareLink);
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      "_blank"
    );
  };

  const shareViaEmail = () => {
    const subject = `AI-verktyg för ${specialization || profession}`;
    const body = `Hej!

Jag har precis hittat de bästa AI-verktygen för ${specialization || profession} och tänkte du kanske är intresserad.

Se resultaten här: ${shareLink}

Det kan spara massor av tid!

Mvh`;
    
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  return (
    <>
      <button
        onClick={generateShareLink}
        disabled={loading}
        className="btn-secondary flex items-center gap-2"
      >
        {loading ? (
          <>
            <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
            <span>Genererar länk...</span>
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m9.632 4.316C18.114 15.062 18 15.518 18 16c0 1.657-1.343 3-3 3s-3-1.343-3-3 1.343-3 3-3c.482 0 .938.114 1.342.316m-9.316-1.342A3 3 0 113 12a3 3 0 013-3c.482 0 .938.114 1.342.316m2.684 9.316a3 3 0 006 0m-6 0C9.886 18.438 9 17.982 9 17.5c0-.482.114-.938.316-1.342" />
            </svg>
            <span>Dela resultat</span>
          </>
        )}
      </button>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowShareModal(false)}>
          <div className="bg-white rounded-2xl p-6 max-w-md w-full animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">Dela dina AI-rekommendationer</h3>
              <button
                onClick={() => setShowShareModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Share link */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Din delningslänk</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={shareLink}
                  readOnly
                  className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
                />
                <button
                  onClick={copyToClipboard}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    copied 
                      ? "bg-green-100 text-green-800" 
                      : "bg-gray-900 text-white hover:bg-gray-800"
                  }`}
                >
                  {copied ? "✓ Kopierad!" : "Kopiera"}
                </button>
              </div>
            </div>

            {/* Social share buttons */}
            <div className="space-y-3">
              <button
                onClick={shareOnLinkedIn}
                className="w-full flex items-center gap-3 px-4 py-3 bg-[#0077B5] text-white rounded-lg hover:bg-[#005885] transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                </svg>
                Dela på LinkedIn
              </button>

              <button
                onClick={shareOnFacebook}
                className="w-full flex items-center gap-3 px-4 py-3 bg-[#1877F2] text-white rounded-lg hover:bg-[#0c5abf] transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                Dela på Facebook
              </button>

              <button
                onClick={shareViaEmail}
                className="w-full flex items-center gap-3 px-4 py-3 bg-gray-100 text-gray-900 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Skicka via e-post
              </button>
            </div>

            <p className="text-xs text-gray-500 text-center mt-6">
              Länken är giltig i 30 dagar och kan delas med vem som helst.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
