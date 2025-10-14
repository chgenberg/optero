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
            ABOUT MENDIO
          </h1>
          <p className="text-xl sm:text-2xl text-gray-600 font-light animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            A journey from worry to opportunity
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
                My name is Christopher Genberg, and I have long followed the conversation about AI — often filled with worry.
              </p>
              
              <p>
                Questions like <span className="font-medium text-gray-900">"Will AI take our jobs?"</span> have become common.
              </p>
              
              <p>
                I don’t believe the solution is fear. We need to use AI as intended — as a tool for people.
              </p>
              
              <p>
                I created <span className="font-bold text-gray-900">MENDIO</span> to show exactly that.
              </p>
              
              <p>
                Describe what you do — and in seconds you get suggestions for how to use AI in your role to save time, reduce stress and make work more enjoyable.
              </p>
              
              <p>
                Three simple prompts you can use right away. No tech, no hassle — just results.
              </p>
              
              <p>
                For some, that means getting more done at work.
              </p>
              
              <p>
                For others, going home earlier with energy left — feeling enough at work and at home.
              </p>
              
              <p>
                MENDIO exists to show AI doesn’t have to replace people — it can free them.
              </p>
              
              <p>
                Together we can build a society where technology gives us more time for what truly matters.
              </p>
              
              <p className="text-lg font-medium text-gray-900 mt-8">
                Welcome.
              </p>
              
              <p className="text-lg">
                I hope MENDIO can be your companion towards a more human and smarter everyday life.
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
              <h3 className="font-bold text-gray-900 mb-2">Save time</h3>
              <p className="text-sm text-gray-600">5–15 hours per week back to what matters most</p>
            </div>
            
            <div className="card p-6 text-center animate-on-scroll opacity-0 translate-y-4 transition-all duration-700" style={{ transitionDelay: '200ms' }}>
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-float" style={{ animationDelay: '0.5s' }}>
                <span className="text-2xl">🎯</span>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Easy to start</h3>
              <p className="text-sm text-gray-600">No technical skills required — just your role</p>
            </div>
            
            <div className="card p-6 text-center animate-on-scroll opacity-0 translate-y-4 transition-all duration-700" style={{ transitionDelay: '300ms' }}>
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-float" style={{ animationDelay: '1s' }}>
                <span className="text-2xl">💡</span>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Practical focus</h3>
              <p className="text-sm text-gray-600">Concrete tools and tips you can use immediately</p>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center py-8 animate-on-scroll opacity-0 translate-y-4 transition-all duration-700">
            <a
              href="/"
              className="btn-primary inline-flex items-center gap-3 text-lg px-8 py-4 transform transition-all hover:scale-105"
            >
              <span>Discover what AI can do for you</span>
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
