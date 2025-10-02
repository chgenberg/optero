"use client";

import { useState } from "react";

interface PremiumUpgradeProps {
  profession: string;
  specialization: string;
  onUpgrade: () => void;
}

export default function PremiumUpgrade({ profession, specialization, onUpgrade }: PremiumUpgradeProps) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="mt-8 mb-8">
      {/* Premium CTA Card */}
      <div className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl lg:rounded-3xl p-6 lg:p-8 text-white overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-5 rounded-full -ml-24 -mb-24"></div>
        
        <div className="relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white bg-opacity-20 rounded-full text-xs font-medium mb-4">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span>PREMIUM</span>
          </div>

          <h3 className="text-2xl lg:text-3xl font-bold mb-3">
            Få en skräddarsydd AI-strategi
          </h3>
          <p className="text-gray-200 text-sm lg:text-base mb-6">
            Djupgående personlig analys för dig som {specialization.toLowerCase()}
          </p>

          {/* Features Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4 mb-6">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <div>
                <h4 className="font-semibold text-sm lg:text-base">10-minuters djupintervju</h4>
                <p className="text-xs lg:text-sm text-gray-300">AI-driven konversation om din arbetsvardag</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h4 className="font-semibold text-sm lg:text-base">Personlig rapport (PDF)</h4>
                <p className="text-xs lg:text-sm text-gray-300">8-12 sidor med konkret analys</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
              <div>
                <h4 className="font-semibold text-sm lg:text-base">Implementeringsplan</h4>
                <p className="text-xs lg:text-sm text-gray-300">Steg-för-steg guide anpassad för dig</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <div>
                <h4 className="font-semibold text-sm lg:text-base">30 dagars support</h4>
                <p className="text-xs lg:text-sm text-gray-300">AI-assistent med full kontext</p>
              </div>
            </div>
          </div>

          {/* ROI Highlight */}
          <div className="bg-white bg-opacity-10 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs lg:text-sm text-gray-300">Beräknad tidsbesparing</p>
                <p className="text-2xl lg:text-3xl font-bold">5-10h/vecka</p>
              </div>
              <div className="text-right">
                <p className="text-xs lg:text-sm text-gray-300">Värde</p>
                <p className="text-2xl lg:text-3xl font-bold">12 000+ kr/mån</p>
              </div>
            </div>
          </div>

          {/* Price and CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl lg:text-5xl font-bold">299 kr</span>
                <span className="text-gray-400 line-through text-lg">599 kr</span>
              </div>
              <p className="text-xs lg:text-sm text-gray-300 mt-1">Engångspris • Ingen prenumeration</p>
            </div>
            
            <button
              onClick={onUpgrade}
              className="w-full sm:w-auto px-8 py-4 bg-white text-gray-900 rounded-xl font-bold hover:bg-gray-100 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 text-sm lg:text-base"
            >
              Kom igång nu →
            </button>
          </div>

          {/* Show more details */}
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="mt-4 text-sm text-gray-300 hover:text-white transition-colors underline"
          >
            {showDetails ? "Dölj detaljer" : "Vad ingår exakt?"}
          </button>

          {showDetails && (
            <div className="mt-4 pt-4 border-t border-white border-opacity-20 animate-fade-in">
              <h4 className="font-semibold mb-3 text-sm lg:text-base">Din Premium-upplevelse:</h4>
              <ol className="space-y-2 text-xs lg:text-sm text-gray-300">
                <li className="flex gap-2">
                  <span className="font-semibold text-white">1.</span>
                  <span>Betala säkert med kort (Stripe)</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-semibold text-white">2.</span>
                  <span>Genomför en 10-minuters AI-intervju om din arbetsvardag</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-semibold text-white">3.</span>
                  <span>GPT analyserar dina svar och identifierar ineffektiviteter</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-semibold text-white">4.</span>
                  <span>Få din personliga rapport via email (PDF, 8-12 sidor)</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-semibold text-white">5.</span>
                  <span>Implementeringsplan med copy-paste prompts och mallar</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-semibold text-white">6.</span>
                  <span>30 dagars tillgång till support-chatt (sparad kontext)</span>
                </li>
              </ol>

              <div className="mt-4 p-3 bg-white bg-opacity-10 rounded-lg">
                <p className="text-xs text-gray-200">
                  💡 <span className="font-semibold">Tips:</span> Många kunder sparar in kostnaden redan första veckan genom ökad effektivitet.
                </p>
              </div>
            </div>
          )}

          {/* Trust badges */}
          <div className="mt-6 pt-6 border-t border-white border-opacity-20 flex flex-wrap items-center justify-center gap-6 text-xs text-gray-400">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Säker betalning</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
              <span>Rapport inom 24h</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.715-5.349L11 6.477V16h2a1 1 0 110 2H7a1 1 0 110-2h2V6.477L6.237 7.582l1.715 5.349a1 1 0 01-.285 1.05A3.989 3.989 0 015 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.617a1 1 0 01.894-1.788l1.599.799L9 4.323V3a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              <span>Nöjd-kund-garanti</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

