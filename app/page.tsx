"use client";

import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-5xl mx-auto px-6 py-32">
        
        {/* Hero */}
        <div className="text-center mb-32">
          <h1 className="text-6xl md:text-7xl font-thin text-black mb-8 tracking-tight uppercase">
            AI SOM FÖRSTÅR<br />
            DITT FÖRETAG
          </h1>
          
          <p className="text-xl text-gray-600 mb-16 max-w-2xl mx-auto font-light">
            Analysera. Optimera. Automatisera.
          </p>
          
          <button
            onClick={() => router.push('/business/bot-builder')}
            className="px-12 py-5 bg-black text-white rounded-full hover:bg-gray-900 transition-all text-sm uppercase tracking-widest"
          >
            Börja
          </button>
        </div>

        {/* Three columns */}
        <div className="grid md:grid-cols-3 gap-12 text-center">
          <div>
            <div className="text-5xl font-thin mb-4">01</div>
            <h3 className="text-sm uppercase tracking-widest mb-2">ANALYSERA</h3>
            <p className="text-sm text-gray-600 font-light">
              Vi skannar hela din verksamhet
            </p>
          </div>
          
          <div>
            <div className="text-5xl font-thin mb-4">02</div>
            <h3 className="text-sm uppercase tracking-widest mb-2">IDENTIFIERA</h3>
            <p className="text-sm text-gray-600 font-light">
              Hitta flaskhalsar och möjligheter
            </p>
          </div>
          
          <div>
            <div className="text-5xl font-thin mb-4">03</div>
            <h3 className="text-sm uppercase tracking-widest mb-2">AUTOMATISERA</h3>
            <p className="text-sm text-gray-600 font-light">
              Bygg AI som löser problemen
            </p>
          </div>
        </div>

      </div>
    </main>
  );
}