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
            OM MENDIO
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
            <div className="space-y-6 text-gray-700 leading-relaxed">
              <p>
                Jag heter Christopher Genberg, och jag har länge följt samtalen om AI – ofta fyllda av oro.
              </p>
              
              <p>
                Frågor som <span className="font-medium text-gray-900">"Kommer AI ta våra jobb?"</span> har blivit vanliga.
              </p>
              
              <p>
                Men jag tror inte att lösningen är att vara rädd. Jag tror att vi behöver använda AI som det var tänkt – som ett verktyg för människor.
              </p>
              
              <p>
                Jag skapade <span className="font-bold text-gray-900">MENDIO</span> för att visa just det.
              </p>
              
              <p>
                Här skriver du bara vad du jobbar med – och får på några sekunder förslag på hur du kan använda AI i ditt yrke för att spara tid, minska stress och göra jobbet roligare.
              </p>
              
              <p>
                Tre enkla prompts som du kan använda direkt. Ingen teknik, inget krångel – bara resultat.
              </p>
              
              <p>
                För vissa betyder det att hinna mer på jobbet.
              </p>
              
              <p>
                För andra att hinna hem lite tidigare, ha energi kvar och känna att man räcker till – både på jobbet och hemma.
              </p>
              
              <p>
                MENDIO finns för att visa att AI inte behöver ersätta människor – det kan frigöra dem.
              </p>
              
              <p>
                Tillsammans kan vi bygga ett samhälle där tekniken ger oss mer tid för det som verkligen betyder något.
              </p>
              
              <p className="text-lg font-medium text-gray-900 mt-8">
                Välkommen hit.
              </p>
              
              <p className="text-lg">
                Jag hoppas att MENDIO kan bli din vän på vägen mot en mänskligare och smartare vardag.
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
