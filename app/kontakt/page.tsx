"use client";

import { useState } from "react";

export default function KontaktPage() {
  const [copied, setCopied] = useState<string | null>(null);

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-gray-50 animate-gradient"></div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-gray-900 mb-8 animate-fade-in-up">
            KONTAKTA OSS
          </h1>
          <p className="text-xl sm:text-2xl text-gray-600 font-light animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            Vi finns här för att hjälpa dig
          </p>
        </div>
      </div>

      {/* Contact content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Contact info card */}
          <div className="card p-8 animate-fade-in-up">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Christopher Genberg AB</h2>
            
            <div className="space-y-6">
              {/* Address */}
              <div className="group">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0 group-hover:bg-gray-900 group-hover:text-white transition-all">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 mb-1">Adress</h3>
                    <p className="text-gray-600">
                      Södra Skjutbanevägen 10<br />
                      439 55 Åsa<br />
                      Sverige
                    </p>
                  </div>
                </div>
              </div>

              {/* Phone */}
              <div className="group">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0 group-hover:bg-gray-900 group-hover:text-white transition-all">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 mb-1">Telefon</h3>
                    <button
                      onClick={() => copyToClipboard('+46732305521', 'phone')}
                      className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                    >
                      <span>+46 732 30 55 21</span>
                      {copied === 'phone' ? (
                        <span className="text-green-600 text-sm">✓ Kopierad!</span>
                      ) : (
                        <svg className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Email */}
              <div className="group">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0 group-hover:bg-gray-900 group-hover:text-white transition-all">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 mb-1">E-post</h3>
                    <button
                      onClick={() => copyToClipboard('ch.genberg@gmail.com', 'email')}
                      className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                    >
                      <span>ch.genberg@gmail.com</span>
                      {copied === 'email' ? (
                        <span className="text-green-600 text-sm">✓ Kopierad!</span>
                      ) : (
                        <svg className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick contact options */}
          <div className="space-y-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <div className="card p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Snabba kontaktvägar</h3>
              <div className="space-y-4">
                <a
                  href="mailto:ch.genberg@gmail.com?subject=Fråga om Optero"
                  className="btn-primary w-full text-center flex items-center justify-center gap-3"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Skicka e-post
                </a>
                <a
                  href="tel:+46732305521"
                  className="btn-secondary w-full text-center flex items-center justify-center gap-3"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  Ring oss
                </a>
              </div>
            </div>

            <div className="card p-8 bg-gray-50">
              <h3 className="font-bold text-gray-900 mb-2">Supporttider</h3>
              <p className="text-gray-600 mb-4">
                Vi svarar normalt inom 24 timmar på vardagar.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  Måndag - Fredag: 09:00 - 17:00
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                  Helger: Stängt
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* FAQ section */}
        <div className="mt-16 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Vanliga frågor</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card p-6">
              <h3 className="font-bold text-gray-900 mb-2">Hur snabbt får jag svar?</h3>
              <p className="text-gray-600 text-sm">
                Vi strävar efter att svara inom 24 timmar på vardagar. Vid brådskande ärenden, ring gärna direkt.
              </p>
            </div>
            <div className="card p-6">
              <h3 className="font-bold text-gray-900 mb-2">Kan jag boka ett möte?</h3>
              <p className="text-gray-600 text-sm">
                Absolut! Skicka ett mail med dina önskemål så bokar vi in ett digitalt möte.
              </p>
            </div>
            <div className="card p-6">
              <h3 className="font-bold text-gray-900 mb-2">Har ni teknisk support?</h3>
              <p className="text-gray-600 text-sm">
                Ja, vi hjälper gärna till med tekniska frågor om tjänsten. Beskriv ditt problem i mailet.
              </p>
            </div>
            <div className="card p-6">
              <h3 className="font-bold text-gray-900 mb-2">Kan jag få en demo?</h3>
              <p className="text-gray-600 text-sm">
                Självklart! Kontakta oss så visar vi gärna hur Optero kan hjälpa just ditt företag.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
