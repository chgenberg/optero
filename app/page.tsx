"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Target, MessageSquare, Zap, TrendingUp, Info, X, Check } from "lucide-react";
import { useState } from "react";

export default function Home() {
  const router = useRouter();
  const [showFeatureInfo, setShowFeatureInfo] = useState<string | null>(null);

  return (
    <main className="min-h-screen bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 py-16 md:py-24 relative">
        
        {/* Hero */}
        <div className="text-center mb-32 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="relative z-10"
          >
            <h1 className="text-5xl md:text-7xl font-bold text-black mb-6 leading-tight">
              AI Bots That Understand<br />Your Business
            </h1>
            
            <p className="text-xl md:text-2xl text-[#4B5563] mb-12 max-w-3xl mx-auto leading-relaxed">
              We analyze your company and build custom bots to streamline work, 
              reduce costs, and free up your team.
            </p>
            
            <div className="relative inline-block">
              {/* Sketch arrows pointing to button */}
              <svg className="absolute -left-24 -top-8 w-20 h-16 text-gray-400 hidden md:block" viewBox="0 0 80 64">
                <path d="M5 30 Q 35 15, 65 25 L 58 20 M 65 25 L 60 32" 
                      stroke="currentColor" strokeWidth="2" fill="none" 
                      strokeLinecap="round" strokeDasharray="2 4"
                      className="animate-draw-arrow" />
              </svg>
              
              <svg className="absolute -right-20 -top-10 w-20 h-20 text-gray-400 hidden md:block" viewBox="0 0 80 80">
                <path d="M75 35 Q 45 20, 15 30 L 22 25 M 15 30 L 20 37" 
                      stroke="currentColor" strokeWidth="2" fill="none" 
                      strokeLinecap="round" strokeDasharray="2 4"
                      className="animate-draw-arrow-delayed" />
              </svg>
              
              <svg className="absolute -left-16 top-16 w-24 h-12 text-gray-400 hidden md:block" viewBox="0 0 96 48">
                <path d="M10 20 Q 40 35, 70 25 L 63 20 M 70 25 L 65 32" 
                      stroke="currentColor" strokeWidth="2" fill="none" 
                      strokeLinecap="round" strokeDasharray="2 4"
                      className="animate-draw-arrow-delayed-2" />
              </svg>

              <motion.button
                onClick={() => router.push('/business/bot-builder/identify')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative px-12 py-5 bg-black text-white text-lg font-medium rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 animate-pulse-subtle"
              >
                Start for free
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse" />
              </motion.button>
            </div>
            
            <p className="text-sm text-[#4B5563] mt-6 font-medium">
              5-minute setup · No code · Tailored to you
            </p>
          </motion.div>
        </div>

        {/* How it works */}
        <div className="mb-32">
          <motion.h2 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-3xl md:text-4xl font-bold text-center mb-16"
          >
            How It Works
          </motion.h2>
          
          <div className="grid md:grid-cols-3 gap-12">
            {[
              { 
                num: "01", 
                title: "We Analyze", 
                desc: "We look at your site, content, and workflows to understand your unique needs." 
              },
              { 
                num: "02", 
                title: "We Build", 
                desc: "Your AI bot is trained on your business – not generic data." 
              },
              { 
                num: "03", 
                title: "You Launch", 
                desc: "Your bot is live in minutes, helping you save time and money." 
              }
            ].map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 + i * 0.1 }}
                className="relative"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-16 h-16 bg-black text-white rounded-full flex items-center justify-center font-bold text-xl">
                    {step.num}
                  </div>
                  <div className="pt-2">
                    <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                    <p className="text-[#4B5563] leading-relaxed">{step.desc}</p>
                  </div>
                </div>
                {i < 2 && (
                  <div className="hidden md:block absolute top-8 left-[50%] w-full">
                    <svg className="w-full h-2" viewBox="0 0 100 8">
                      <path d="M0 4 L 90 4" stroke="#E5E7EB" strokeWidth="2" strokeDasharray="4 4" />
                      <path d="M85 1 L 90 4 L 85 7" stroke="#E5E7EB" strokeWidth="2" fill="none" />
                    </svg>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Why it works */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-gray-50 rounded-3xl p-12 md:p-16 text-center"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-12">Why It Works</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 text-left">
            {[
              {
                id: "custom-trained",
                icon: <Target className="w-5 h-5 text-black" />, 
                title: "Custom-trained",
                desc: "On your content and brand voice",
                fullDesc: {
                  what: "Your bot learns from YOUR specific content - website pages, PDFs, support docs, and brand guidelines. It speaks in your tone and knows your products inside out.",
                  benefits: [
                    "Accurate answers specific to your business",
                    "Consistent brand voice in every interaction",
                    "No generic AI responses",
                    "Updates as your content changes"
                  ],
                  example: "Instead of generic 'How can I help?', your bot says 'Hey! Looking for our signature products or need help with an order?' - matching YOUR brand personality."
                }
              },
              {
                id: "multi-purpose",
                icon: <MessageSquare className="w-5 h-5 text-black" />, 
                title: "Multi-purpose",
                desc: "Answers, support, lead qualification",
                fullDesc: {
                  what: "One bot handles multiple business functions - from answering product questions to qualifying leads and providing support. It adapts based on user intent.",
                  benefits: [
                    "Replace multiple tools with one solution",
                    "Seamless handoff between functions",
                    "Lower costs than specialized tools",
                    "Unified customer experience"
                  ],
                  example: "A visitor asks about pricing → bot presents options → qualifies their needs → books a demo call → all in one smooth conversation."
                }
              },
              {
                id: "always-on",
                icon: <Zap className="w-5 h-5 text-black" />, 
                title: "Always on",
                desc: "Works 24/7 without burnout",
                fullDesc: {
                  what: "Your bot never sleeps, never takes vacation, and maintains peak performance at 3 AM just like at 3 PM. Global customers get instant help anytime.",
                  benefits: [
                    "Capture leads outside business hours",
                    "Support global time zones",
                    "No overtime costs",
                    "Consistent quality every interaction"
                  ],
                  example: "Weekend visitor from Japan gets instant product recommendations and books a Monday call - opportunity captured instead of lost."
                }
              },
              {
                id: "scalable",
                icon: <TrendingUp className="w-5 h-5 text-black" />, 
                title: "Scalable",
                desc: "Grows with your business",
                fullDesc: {
                  what: "Handle 10 or 10,000 conversations simultaneously without adding staff. As you grow, just add more content - the bot handles the volume.",
                  benefits: [
                    "No hiring bottlenecks during growth",
                    "Maintain quality at any volume",
                    "Predictable costs",
                    "Instant scaling for campaigns"
                  ],
                  example: "Black Friday traffic spike? Your bot handles 5,000 simultaneous shoppers while your team focuses on high-value customers."
                }
              }
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.7 + i * 0.05 }}
                className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow relative"
              >
                <button
                  onClick={() => setShowFeatureInfo(feature.id)}
                  className="absolute top-4 right-4 p-1 hover:bg-gray-100 rounded-lg transition-colors"
                  aria-label="More information"
                >
                  <Info className="w-4 h-4 text-gray-400" />
                </button>
                <div className="w-10 h-10 rounded-full border-2 border-gray-200 flex items-center justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="font-bold mb-2">{feature.title}</h3>
                <p className="text-sm text-[#4B5563]">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Human touch CTA */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center mt-24"
        >
          <h3 className="text-2xl md:text-3xl font-bold mb-4">
            Let AI Take Care of the Repetitive Stuff
          </h3>
          <p className="text-lg text-[#4B5563] mb-8 max-w-2xl mx-auto">
            So your team can focus on what truly matters – creativity, strategy, and human connection.
          </p>
          <button
            onClick={() => router.push('/business/bot-builder/identify')}
            className="btn-secondary"
          >
            Get started – it's free
          </button>
        </motion.div>

      </div>

      {/* Feature Info Popup */}
      {showFeatureInfo && (
        <div
          onClick={() => setShowFeatureInfo(null)}
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="max-w-2xl w-full bg-white rounded-2xl shadow-2xl overflow-hidden"
          >
            {(() => {
              const feature = [
                {
                  id: "custom-trained",
                  icon: <Target className="w-5 h-5 text-black" />, 
                  title: "Custom-trained",
                  desc: "On your content and brand voice",
                  fullDesc: {
                    what: "Your bot learns from YOUR specific content - website pages, PDFs, support docs, and brand guidelines. It speaks in your tone and knows your products inside out.",
                    benefits: [
                      "Accurate answers specific to your business",
                      "Consistent brand voice in every interaction",
                      "No generic AI responses",
                      "Updates as your content changes"
                    ],
                    example: "Instead of generic 'How can I help?', your bot says 'Hey! Looking for our signature products or need help with an order?' - matching YOUR brand personality."
                  }
                },
                {
                  id: "multi-purpose",
                  icon: <MessageSquare className="w-5 h-5 text-black" />, 
                  title: "Multi-purpose",
                  desc: "Answers, support, lead qualification",
                  fullDesc: {
                    what: "One bot handles multiple business functions - from answering product questions to qualifying leads and providing support. It adapts based on user intent.",
                    benefits: [
                      "Replace multiple tools with one solution",
                      "Seamless handoff between functions",
                      "Lower costs than specialized tools",
                      "Unified customer experience"
                    ],
                    example: "A visitor asks about pricing → bot presents options → qualifies their needs → books a demo call → all in one smooth conversation."
                  }
                },
                {
                  id: "always-on",
                  icon: <Zap className="w-5 h-5 text-black" />, 
                  title: "Always on",
                  desc: "Works 24/7 without burnout",
                  fullDesc: {
                    what: "Your bot never sleeps, never takes vacation, and maintains peak performance at 3 AM just like at 3 PM. Global customers get instant help anytime.",
                    benefits: [
                      "Capture leads outside business hours",
                      "Support global time zones",
                      "No overtime costs",
                      "Consistent quality every interaction"
                    ],
                    example: "Weekend visitor from Japan gets instant product recommendations and books a Monday call - opportunity captured instead of lost."
                  }
                },
                {
                  id: "scalable",
                  icon: <TrendingUp className="w-5 h-5 text-black" />, 
                  title: "Scalable",
                  desc: "Grows with your business",
                  fullDesc: {
                    what: "Handle 10 or 10,000 conversations simultaneously without adding staff. As you grow, just add more content - the bot handles the volume.",
                    benefits: [
                      "No hiring bottlenecks during growth",
                      "Maintain quality at any volume",
                      "Predictable costs",
                      "Instant scaling for campaigns"
                    ],
                    example: "Black Friday traffic spike? Your bot handles 5,000 simultaneous shoppers while your team focuses on high-value customers."
                  }
                }
              ].find(f => f.id === showFeatureInfo);
              
              if (!feature) return null;
              
              return (
                <>
                  <div className="px-8 py-6 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                          {feature.icon}
                        </div>
                        <div>
                          <h3 className="text-xl font-bold">{feature.title}</h3>
                          <p className="text-sm text-gray-600">{feature.desc}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setShowFeatureInfo(null)}
                        className="p-2 hover:bg-gray-100 transition-colors rounded-lg"
                      >
                        <X className="w-5 h-5 text-gray-500" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="px-8 py-6 space-y-6">
                    <div>
                      <h4 className="text-xs uppercase tracking-wider text-gray-500 mb-2">HOW IT WORKS</h4>
                      <p className="text-gray-700 leading-relaxed">{feature.fullDesc.what}</p>
                    </div>
                    
                    <div>
                      <h4 className="text-xs uppercase tracking-wider text-gray-500 mb-3">KEY BENEFITS</h4>
                      <ul className="space-y-2">
                        {feature.fullDesc.benefits.map((benefit, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-700">{benefit}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="bg-gray-50 rounded-xl p-4">
                      <h4 className="text-xs uppercase tracking-wider text-gray-500 mb-2">REAL EXAMPLE</h4>
                      <p className="text-gray-700 italic">{feature.fullDesc.example}</p>
                    </div>
                  </div>
                </>
              );
            })()}
          </motion.div>
        </div>
      )}

      <style jsx>{`
        @keyframes draw-arrow {
          0% { stroke-dashoffset: 100; opacity: 0; }
          50% { opacity: 1; }
          100% { stroke-dashoffset: 0; opacity: 0.8; }
        }
        
        @keyframes draw-arrow-delayed {
          0%, 20% { stroke-dashoffset: 100; opacity: 0; }
          70% { opacity: 1; }
          100% { stroke-dashoffset: 0; opacity: 0.8; }
        }
        
        @keyframes draw-arrow-delayed-2 {
          0%, 40% { stroke-dashoffset: 100; opacity: 0; }
          90% { opacity: 1; }
          100% { stroke-dashoffset: 0; opacity: 0.8; }
        }
        
        @keyframes pulse-subtle {
          0%, 100% { 
            transform: scale(1); 
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
          }
          50% { 
            transform: scale(1.02); 
            box-shadow: 0 25px 30px -5px rgba(0, 0, 0, 0.15), 0 15px 15px -5px rgba(0, 0, 0, 0.06);
          }
        }
        
        .animate-draw-arrow {
          animation: draw-arrow 3s ease-out infinite;
        }
        
        .animate-draw-arrow-delayed {
          animation: draw-arrow-delayed 3s ease-out infinite;
        }
        
        .animate-draw-arrow-delayed-2 {
          animation: draw-arrow-delayed-2 3s ease-out infinite;
        }
        
        .animate-pulse-subtle {
          animation: pulse-subtle 3s ease-in-out infinite;
        }
      `}</style>
    </main>
  );
}