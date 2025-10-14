"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function Home() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-6 py-24">
        
        {/* Hero */}
        <div className="text-center mb-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 mb-6">
              <div className="w-2 h-2 bg-black rounded-full animate-pulse-dot" />
              <span className="text-xs font-medium text-[#4B5563] uppercase tracking-wider">
                AI-powered chatbots
              </span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold text-black mb-6 leading-tight">
              Build a chatbot that<br />understands your business
            </h1>
            
            <p className="text-lg text-[#4B5563] mb-12 max-w-2xl mx-auto leading-relaxed">
              Trained on your website and documents. Ready to answer questions,
              qualify leads and automate support in minutes.
            </p>
            
            <motion.button
              onClick={() => router.push('/business/bot-builder')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="btn-primary text-sm font-medium"
            >
              Get started free
            </motion.button>
            
            <p className="text-xs text-[#4B5563] mt-4">
              No coding required · Free to try · 5 min setup
            </p>
          </motion.div>
        </div>

        {/* Three steps */}
        <div className="grid md:grid-cols-3 gap-8 mb-24">
            {[
            { num: "01", title: "Analyze", desc: "Add URL and documents. AI scans your business." },
            { num: "02", title: "Pick solution", desc: "Get AI recommendations and choose a bot type." },
            { num: "03", title: "Launch", desc: "Install with one line of code and start saving time." }
          ].map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="text-center"
            >
              <div className="w-12 h-12 border-2 border-black rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-lg font-semibold">{step.num}</span>
              </div>
              <h3 className="mb-2">{step.title}</h3>
              <p className="text-sm text-[#4B5563]">{step.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Results */}
        <div className="card max-w-4xl mx-auto text-center">
          <h2 className="mb-8">Expected results</h2>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { value: "60%", label: "Less support tickets" },
              { value: "3x", label: "More qualified leads" },
              { value: "24/7", label: "Always available" },
              { value: "5 min", label: "Time to build" }
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
