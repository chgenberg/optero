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
            Build a bot in 5 minutes
          </h1>
          
          <p className="text-lg text-[#4B5563] mb-12 max-w-2xl mx-auto leading-relaxed">
            Our AI analyzes your business and builds a tailored chatbot
            that starts delivering value immediately.
          </p>
          
          <motion.button
            onClick={() => router.push('/business/bot-builder/identify')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="btn-primary inline-flex items-center gap-2"
          >
            Start analysis
            <ArrowRight className="w-4 h-4" />
          </motion.button>
        </motion.div>

        {/* Process */}
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          {[
            { num: 1, title: "Analyze", desc: "Add your URL and documents. Our AI scans everything." },
            { num: 2, title: "Choose solution", desc: "Get recommendations based on your business. Pick what fits best." },
            { num: 3, title: "Launch", desc: "Your bot is ready. Install with one line of code and start saving time." }
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

        {/* CTA */}
        <div className="text-center">
          <p className="text-sm text-[#4B5563] mb-6">
            No coding required. Free to try. Ready in minutes.
          </p>
          <motion.button
            onClick={() => router.push('/business/bot-builder/identify')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="btn-secondary"
          >
            Get started
          </motion.button>
        </div>

      </div>
    </div>
  );
}
