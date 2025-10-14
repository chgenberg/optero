"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export default function BotBuilderLanding() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-5xl mx-auto px-6 py-20">
        
        {/* Hero */}
        <motion.div 
          className="text-center mb-20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-5xl md:text-6xl font-bold text-black mb-6">
            Bygg en bot på 5 minuter
          </h1>
          
          <p className="text-lg text-[#4B5563] mb-12 max-w-2xl mx-auto leading-relaxed">
            Vår AI analyserar din verksamhet och bygger en skräddarsydd chatbot 
            som börjar ge värde direkt.
          </p>
          
          <motion.button
            onClick={() => router.push('/business/bot-builder/identify')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="btn-primary inline-flex items-center gap-2"
          >
            Starta analys
            <ArrowRight className="w-4 h-4" />
          </motion.button>
        </motion.div>

        {/* Process */}
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          {[
            { num: 1, title: "Analysera", desc: "Ladda upp din URL och dokument. Vår AI går igenom allt material." },
            { num: 2, title: "Välj lösning", desc: "Få rekommendationer baserat på din verksamhet. Välj den som passar bäst." },
            { num: 3, title: "Lansera", desc: "Din bot är klar. Installera med en kodrad och börja spara tid direkt." }
          ].map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 + i * 0.1 }}
              className="text-center"
            >
              <div className="w-14 h-14 border-2 border-black rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-xl font-semibold">{step.num}</span>
              </div>
              <h3 className="mb-2">{step.title}</h3>
              <p className="text-sm text-[#4B5563] leading-relaxed">{step.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Results */}
        <div className="card text-center mb-20">
          <h2 className="mb-8">Förväntade resultat</h2>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { value: "60%", label: "Färre supportärenden" },
              { value: "3x", label: "Fler kvalificerade leads" },
              { value: "24/7", label: "Alltid tillgänglig" },
              { value: "5 min", label: "Tid att bygga" }
            ].map((stat, i) => (
              <div key={i}>
                <div className="text-4xl font-bold mb-2">{stat.value}</div>
                <p className="text-xs text-[#4B5563] uppercase tracking-wider">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <p className="text-sm text-[#4B5563] mb-6">
            Ingen kodning krävs. Gratis att testa. Redo på minuter.
          </p>
          <motion.button
            onClick={() => router.push('/business/bot-builder/identify')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="btn-secondary"
          >
            Kom igång
          </motion.button>
        </div>

      </div>
    </div>
  );
}
