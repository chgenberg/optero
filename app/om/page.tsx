"use client";

import { useEffect, useRef } from "react";

export default function OmPage() {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Animate elements on scroll
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('opacity-100', 'translate-y-0');
            entry.target.classList.remove('opacity-0', 'translate-y-4');
          }
        });
      },
      { threshold: 0.1 }
    );

    const elements = contentRef.current?.querySelectorAll('.animate-on-scroll');
    elements?.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-white" ref={contentRef}>
      {/* Hero section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-gray-50 animate-gradient"></div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-gray-900 mb-8 animate-fade-in-up">
            OM OPTERO
          </h1>
          <p className="text-xl sm:text-2xl text-gray-600 font-light animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            En resa från oro till möjligheter
          </p>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Story section */}
        <div className="prose prose-lg max-w-none">
          <div className="card p-8 sm:p-12 mb-12 animate-on-scroll opacity-0 translate-y-4 transition-all duration-700">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 bg-gray-900 rounded-full flex items-center justify-center flex-shrink-0 animate-pulse-scale">
                <span className="text-white text-xl">👋</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mt-0">Hej, jag heter Christopher</h2>
            </div>
            
            <div className="space-y-6 text-gray-700 leading-relaxed">
              <p>
                Jag heter Christopher Genberg och jag har länge följt diskussionerna om AI – ofta med en ton av oro. 
                Frågor som <span className="font-medium text-gray-900">"Kommer AI ta våra jobb?"</span> har blivit vardag. 
                Men jag tror inte på att leva i rädsla. Jag tror på att se AI som ett redskap. Ett sätt att frigöra tid, 
                skapa möjligheter och låta människor fokusera på det som verkligen betyder något.
              </p>
              
              <p>
                För vissa handlar det om att prestera mer på jobbet. För andra om att komma hem lite tidigare, 
                ha mer energi kvar och kunna spendera mer tid med barnen. AI behöver inte vara något avlägset 
                och hotfullt – det kan vara en naturlig del av vår vardag, som hjälper oss snarare än ersätter oss.
              </p>
              
              <p>
                Det är därför jag skapade <span className="font-bold text-gray-900">Optero</span>. En tjänst som gör det enkelt att upptäcka hur AI kan 
                underlätta just ditt arbete – oavsett yrke eller bakgrund. Här ska du inte behöva vara tekniker 
                för att förstå. Du ska bara kunna se värdet direkt, och känna: 
                <span className="italic">"Det här gör faktiskt mitt liv lättare."</span>
              </p>
              
              <p className="text-lg font-medium text-gray-900">
                Välkommen hit – jag hoppas att Optero kan bli en vän på vägen mot en vardag där vi har mer tid 
                för det som gör livet värt att leva.
              </p>
              
              <p className="text-right mt-8">
                <span className="font-signature text-2xl">/Christopher</span>
              </p>
            </div>
          </div>

          {/* Mission boxes */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="card p-6 text-center animate-on-scroll opacity-0 translate-y-4 transition-all duration-700" style={{ transitionDelay: '100ms' }}>
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-float">
                <span className="text-2xl">⏰</span>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Spara tid</h3>
              <p className="text-sm text-gray-600">5-15 timmar per vecka tillbaka till det som betyder mest</p>
            </div>
            
            <div className="card p-6 text-center animate-on-scroll opacity-0 translate-y-4 transition-all duration-700" style={{ transitionDelay: '200ms' }}>
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-float" style={{ animationDelay: '0.5s' }}>
                <span className="text-2xl">🎯</span>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Enkelt att börja</h3>
              <p className="text-sm text-gray-600">Inga tekniska kunskaper krävs, bara din yrkesroll</p>
            </div>
            
            <div className="card p-6 text-center animate-on-scroll opacity-0 translate-y-4 transition-all duration-700" style={{ transitionDelay: '300ms' }}>
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-float" style={{ animationDelay: '1s' }}>
                <span className="text-2xl">💡</span>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Praktiskt fokus</h3>
              <p className="text-sm text-gray-600">Konkreta verktyg och tips du kan använda direkt</p>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center py-8 animate-on-scroll opacity-0 translate-y-4 transition-all duration-700">
            <a
              href="/"
              className="btn-primary inline-flex items-center gap-3 text-lg px-8 py-4 transform transition-all hover:scale-105"
            >
              <span>Upptäck vad AI kan göra för dig</span>
              <svg className="w-5 h-5 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </a>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes signature {
          from { opacity: 0; transform: translateX(-10px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .font-signature {
          font-family: 'Brush Script MT', cursive;
          animation: signature 1s ease-out;
        }
      `}</style>
    </div>
  );
}
