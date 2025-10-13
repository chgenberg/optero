"use client";

import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";

export default function BotBuilderLanding() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-6 py-20">
        
        {/* Hero */}
        <div className="text-center mb-20">
          <h1 className="text-5xl md:text-6xl font-thin text-black mb-6 tracking-tight uppercase">
            BYGG EN BOT PÅ<br />
            5 MINUTER
          </h1>
          
          <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto font-light">
            Vår AI analyserar din verksamhet och bygger en skräddarsydd chatbot 
            som börjar ge värde direkt.
          </p>
          
          <button
            onClick={() => router.push('/business/bot-builder/identify')}
            className="px-16 py-5 bg-black text-white text-sm uppercase tracking-widest hover:bg-gray-900 transition-all inline-flex items-center gap-3"
          >
            Starta analys
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Process */}
        <div className="grid md:grid-cols-3 gap-12 mb-20">
          <div className="text-center">
            <div className="w-16 h-16 border border-black mx-auto mb-6 flex items-center justify-center">
              <span className="text-2xl font-thin">1</span>
            </div>
            <h3 className="text-sm uppercase tracking-widest mb-3">ANALYSERA</h3>
            <p className="text-sm text-gray-600 font-light">
              Ladda upp din URL och dokument. Vår AI går igenom allt material.
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 border border-black mx-auto mb-6 flex items-center justify-center">
              <span className="text-2xl font-thin">2</span>
            </div>
            <h3 className="text-sm uppercase tracking-widest mb-3">VÄLJ LÖSNING</h3>
            <p className="text-sm text-gray-600 font-light">
              Få rekommendationer baserat på din verksamhet. Välj den som passar bäst.
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 border border-black mx-auto mb-6 flex items-center justify-center">
              <span className="text-2xl font-thin">3</span>
            </div>
            <h3 className="text-sm uppercase tracking-widest mb-3">LANSERA</h3>
            <p className="text-sm text-gray-600 font-light">
              Din bot är klar. Installera med en kodrad och börja spara tid direkt.
            </p>
          </div>
        </div>

        {/* Results */}
        <div className="bg-gray-50 p-12 text-center">
          <h2 className="text-2xl font-thin uppercase tracking-wider mb-8">Förväntade resultat</h2>
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="text-4xl font-thin mb-2">60%</div>
              <p className="text-xs uppercase tracking-widest text-gray-600">Färre supportärenden</p>
            </div>
            <div>
              <div className="text-4xl font-thin mb-2">3x</div>
              <p className="text-xs uppercase tracking-widest text-gray-600">Fler kvalificerade leads</p>
            </div>
            <div>
              <div className="text-4xl font-thin mb-2">24/7</div>
              <p className="text-xs uppercase tracking-widest text-gray-600">Alltid tillgänglig</p>
            </div>
            <div>
              <div className="text-4xl font-thin mb-2">5 min</div>
              <p className="text-xs uppercase tracking-widest text-gray-600">Tid att bygga</p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-20">
          <p className="text-sm text-gray-600 mb-6">
            Ingen kodning krävs. Gratis att testa. Redo på minuter.
          </p>
          <button
            onClick={() => router.push('/business/bot-builder/identify')}
            className="px-16 py-5 border border-black text-black text-sm uppercase tracking-widest hover:bg-black hover:text-white transition-all"
          >
            Kom igång
          </button>
        </div>

      </div>
    </div>
  );
}