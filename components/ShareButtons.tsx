"use client";

import { useState } from "react";

interface ShareButtonsProps {
  profession: string;
  specialization: string;
  timeSaved?: string;
}

export default function ShareButtons({ 
  profession, 
  specialization,
  timeSaved = "8-12 timmar per vecka"
}: ShareButtonsProps) {
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [emails, setEmails] = useState(["", "", ""]);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  // LinkedIn share text
  const linkedInText = encodeURIComponent(
    `🚀 Jag sparar nu ${timeSaved} som ${specialization || profession} tack vare AI!\n\n` +
    `Upptäckte precis Mendio - en tjänst som visar exakt vilka AI-verktyg som passar mitt yrke.\n\n` +
    `Rekommenderar starkt alla ${profession.toLowerCase()}s att testa: https://mendio.io\n\n` +
    `#AI #Produktivitet #${profession}`
  );

  const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent('https://mendio.io')}&title=${encodeURIComponent('AI-verktyg för ' + (specialization || profession))}&summary=${linkedInText}&source=Mendio`;

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);

    // Filter out empty emails
    const validEmails = emails.filter(email => email.trim());

    if (validEmails.length === 0) {
      alert("Ange minst en e-postadress");
      setSending(false);
      return;
    }

    try {
      // TODO: Implement email sending via API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSent(true);
      setTimeout(() => {
        setShowEmailForm(false);
        setSent(false);
        setEmails(["", "", ""]);
      }, 3000);
    } catch (error) {
      alert("Något gick fel. Försök igen.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-4">
        {/* LinkedIn Share */}
        <a
          href={linkedInUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => {
            // Track share event
            if (typeof window !== 'undefined' && (window as any).gtag) {
              (window as any).gtag('event', 'share', {
                method: 'linkedin',
                content_type: 'results',
                profession: profession
              });
            }
          }}
          className="flex items-center justify-between p-4 bg-white rounded-xl hover:shadow-md transition-all group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#0077B5] rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
              </svg>
            </div>
            <div>
              <p className="font-medium text-gray-900">Dela på LinkedIn</p>
              <p className="text-sm text-gray-500">Med färdigskriven text</p>
            </div>
          </div>
          <svg className="w-5 h-5 text-gray-400 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </a>

        {/* Email Share */}
        <button
          onClick={() => setShowEmailForm(!showEmailForm)}
          className="w-full flex items-center justify-between p-4 bg-white rounded-xl hover:shadow-md transition-all group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="text-left">
              <p className="font-medium text-gray-900">Tipsa kollegor via email</p>
              <p className="text-sm text-gray-500">Skicka till upp till 3 personer</p>
            </div>
          </div>
          <svg className={`w-5 h-5 text-gray-400 transition-transform ${showEmailForm ? 'rotate-90' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Email Form */}
        {showEmailForm && (
          <form onSubmit={handleEmailSubmit} className="bg-white rounded-xl p-4 space-y-3 animate-fade-in">
            <p className="text-sm text-gray-600 mb-3">
              Vi skickar en kort inbjudan från dig med information om Mendio
            </p>
            
            {emails.map((email, index) => (
              <input
                key={index}
                type="email"
                value={email}
                onChange={(e) => {
                  const newEmails = [...emails];
                  newEmails[index] = e.target.value;
                  setEmails(newEmails);
                }}
                placeholder={`Kollega ${index + 1} (valfritt)`}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-100"
              />
            ))}

            <button
              type="submit"
              disabled={sending || sent}
              className="w-full bg-gray-900 text-white py-3 px-6 rounded-lg font-medium hover:bg-gray-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {sending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Skickar...</span>
                </>
              ) : sent ? (
                <>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Skickat!</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  <span>Skicka inbjudningar</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>

      {/* Incentive */}
      <div className="mt-6 p-3 bg-yellow-50 rounded-lg">
        <p className="text-sm text-yellow-800">
          💡 <strong>Tips:</strong> För varje kollega som testar får du en månad extra support gratis!
        </p>
      </div>
    </div>
  );
}
