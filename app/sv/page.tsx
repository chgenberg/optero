"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function HomeSV() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-6 py-24">
        <div className="text-center mb-32">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="inline-flex items-center gap-2 mb-6">
              <div className="w-2 h-2 bg-black rounded-full animate-pulse-dot" />
              <span className="text-xs font-medium text-[#4B5563] uppercase tracking-wider">AI-drivna chatbots</span>
            </div>

            <h1 className="text-5xl md:text-6xl font-bold text-black mb-6 leading-tight">
              Bygg en chatbot som<br />förstår ditt företag
            </h1>

            <p className="text-lg text-[#4B5563] mb-12 max-w-2xl mx-auto leading-relaxed">
              Tränad på din webbplats och dokument. Redo att svara på frågor,
              kvalificera leads och automatisera support på 5 minuter.
            </p>

            <motion.button onClick={() => router.push('/business/bot-builder')} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="btn-primary text-sm font-medium">
              Kom igång gratis
            </motion.button>

            <p className="text-xs text-[#4B5563] mt-4">Ingen kodning krävs · Gratis att testa · 5 minuter setup</p>
          </motion.div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-24">
          {[
            { num: "01", title: "Analysera", desc: "Ladda upp URL och dokument. AI skannar hela din verksamhet." },
            { num: "02", title: "Välj lösning", desc: "Få AI-rekommendationer baserat på dina behov och välj bot-typ." },
            { num: "03", title: "Lansera", desc: "Din bot är klar. Installera med en kodrad och börja spara tid." }
          ].map((step, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: i * 0.1 }} className="text-center">
              <div className="w-12 h-12 border-2 border-black rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-lg font-semibold">{step.num}</span>
              </div>
              <h3 className="mb-2">{step.title}</h3>
              <p className="text-sm text-[#4B5563]">{step.desc}</p>
            </motion.div>
          ))}
        </div>

        <div className="card max-w-4xl mx-auto text-center">
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
      </div>
    </main>
  );
}


