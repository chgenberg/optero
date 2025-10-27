"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Bot, Mail, Building2, ArrowRight, Lock, Star, Zap, Shield } from "lucide-react";

export default function AgentLandingPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [companyUrl, setCompanyUrl] = useState("");
  const [loading, setLoading] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      {/* Minimalist Navigation */}
      <nav className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold tracking-tight">MENDIO</h1>
          <button
            onClick={() => router.push("/")}
            className="text-sm text-gray-600 hover:text-black transition-colors"
          >
            Back to home
          </button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-20">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <motion.div 
            className="inline-flex items-center justify-center w-32 h-32 mb-6"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <img
              src="/Mascots/Mr.Green.webp"
              alt="Mr. Green AI Agent"
              width="120"
              height="120"
              style={{ objectFit: 'contain' }}
            />
          </motion.div>
          
          <h2 className="text-5xl font-bold tracking-tight mb-4">
            Your AI Assistant
          </h2>
          
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Train an intelligent assistant on your company data. Answer questions instantly, 
            automate workflows, and scale your knowledge.
          </p>
        </motion.div>

        {/* Main Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-50 rounded-2xl p-8 border border-gray-200"
        >
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              if (!email || !companyUrl || loading) return;
              
              setLoading(true);
              // Store credentials and redirect to agent dashboard
              sessionStorage.setItem("agentEmail", email);
              sessionStorage.setItem("agentCompanyUrl", companyUrl);
              router.push("/agent/setup");
            }}
            className="space-y-6"
          >
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Mail className="w-4 h-4" />
                Work Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                required
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Building2 className="w-4 h-4" />
                Company Website
              </label>
              <input
                type="url"
                value={companyUrl}
                onChange={(e) => setCompanyUrl(e.target.value)}
                placeholder="https://company.com"
                required
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
              />
            </div>

            <div className="pt-4">
              <motion.button
                type="submit"
                disabled={loading || !email || !companyUrl}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="w-full bg-black text-white py-4 rounded-lg font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {loading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                  />
                ) : (
                  <>
                    Create Your Assistant
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </motion.button>
            </div>

            <p className="text-xs text-gray-500 text-center pt-4">
              By continuing, you agree to our terms and privacy policy. 
              Your data is encrypted and never shared.
            </p>
          </form>
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="grid md:grid-cols-3 gap-6 mt-16"
        >
          {[
            {
              title: "Instant Setup",
              description: "AI learns from your website and documents in minutes",
              Icon: Zap
            },
            {
              title: "Always Learning",
              description: "Upload new documents anytime to expand knowledge",
              Icon: Star
            },
            {
              title: "Secure & Private",
              description: "Your data stays yours. Enterprise-grade security",
              Icon: Shield
            }
          ].map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + i * 0.1 }}
              className="text-center"
            >
              <feature.Icon className="w-6 h-6 mx-auto mb-3 text-black" />
              <h3 className="font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm text-gray-600">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
