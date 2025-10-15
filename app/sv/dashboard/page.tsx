"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Bot, BarChart3, MessageSquare, Database, Plus, Settings, TrendingUp, Clock } from "lucide-react";

interface BotStats {
  id: string;
  name: string;
  type: string;
  companyUrl: string | null;
  isActive: boolean;
  createdAt: string;
  stats: {
    messages: number;
    sessions: number;
    knowledgeChunks: number;
  };
}

export default function DashboardPageSV() {
  const router = useRouter();
  const [bots, setBots] = useState<BotStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [activeTab, setActiveTab] = useState<'overview'|'analytics'|'settings'>('overview');

  useEffect(() => {
    const userEmail = sessionStorage.getItem("botUserEmail");
    if (userEmail) {
      setEmail(userEmail);
      loadBots(userEmail);
    } else {
      // No email, load all bots (admin mode) or redirect
      loadBots("");
    }
  }, []);

  const loadBots = async (userEmail: string) => {
    try {
      const res = await fetch(`/api/bots/stats?email=${userEmail || 'all'}`);
      const data = await res.json();
      setBots(data.bots || []);
    } catch (error) {
      console.error('Failed to load bots:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate total stats
  const totalStats = bots.reduce((acc, bot) => ({
    messages: acc.messages + bot.stats.messages,
    sessions: acc.sessions + bot.stats.sessions,
    activeBots: acc.activeBots + (bot.isActive ? 1 : 0)
  }), { messages: 0, sessions: 0, activeBots: 0 });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-gray-300 border-t-black rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="mb-4 sm:mb-0">
              <h1 className="text-4xl font-bold uppercase tracking-wider text-black mb-2">
                KONTROLLPANEL
              </h1>
              <p className="text-gray-600">
                {email ? `Välkommen tillbaka, ${email}` : 'Admin-läge - Alla botar'}
              </p>
            </div>
            <motion.button
              onClick={() => router.push('/sv/business/bot-builder')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="minimal-button flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              <span className="hidden sm:inline">SKAPA NY BOT</span>
              <span className="sm:hidden">NY BOT</span>
            </motion.button>
          </div>
        </motion.div>

        {/* Stats Overview */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12"
        >
          <div className="minimal-card animate-pulse-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold uppercase tracking-wider text-gray-600 mb-2">
                  TOTALT MEDDELANDEN
                </p>
                <p className="text-4xl font-bold text-black">
                  {totalStats.messages.toLocaleString('sv-SE')}
                </p>
              </div>
              <MessageSquare className="w-8 h-8 text-gray-400" />
            </div>
            <div className="mt-4 flex items-center text-sm text-green-600">
              <TrendingUp className="w-4 h-4 mr-1" />
              <span>+23% denna vecka</span>
            </div>
          </div>

          <div className="minimal-card animate-pulse-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold uppercase tracking-wider text-gray-600 mb-2">
                  TOTALT SESSIONER
                </p>
                <p className="text-4xl font-bold text-black">
                  {totalStats.sessions.toLocaleString('sv-SE')}
                </p>
              </div>
              <BarChart3 className="w-8 h-8 text-gray-400" />
            </div>
            <div className="mt-4 flex items-center text-sm text-green-600">
              <TrendingUp className="w-4 h-4 mr-1" />
              <span>+15% denna vecka</span>
            </div>
          </div>

          <div className="minimal-card animate-pulse-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold uppercase tracking-wider text-gray-600 mb-2">
                  AKTIVA BOTAR
                </p>
                <p className="text-4xl font-bold text-black">
                  {totalStats.activeBots}/{bots.length}
                </p>
              </div>
              <Bot className="w-8 h-8 text-gray-400" />
            </div>
            <div className="mt-4 flex items-center text-sm text-gray-600">
              <Clock className="w-4 h-4 mr-1" />
              <span>24/7 tillgänglighet</span>
            </div>
          </div>
        </motion.div>

        {/* Tab Navigation */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex justify-center mb-8"
        >
          <div className="inline-flex bg-white rounded-xl shadow-sm p-1">
            {[
              { id: 'overview', label: 'ÖVERSIKT', icon: Bot },
              { id: 'analytics', label: 'ANALYS', icon: BarChart3 },
              { id: 'settings', label: 'INSTÄLLNINGAR', icon: Settings }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-6 py-3 rounded-lg uppercase tracking-wider text-sm font-bold transition-all duration-300 ${
                  activeTab === tab.id 
                    ? 'bg-black text-white' 
                    : 'text-gray-500 hover:text-black'
                }`}
              >
                <tab.icon className="w-4 h-4 inline mr-2" />
                {tab.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Content */}
        {activeTab === 'overview' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            {bots.length === 0 ? (
              <div className="minimal-card animate-pulse-shadow text-center py-16">
                <Bot className="w-16 h-16 text-gray-300 mx-auto mb-6" />
                <h2 className="text-2xl font-bold uppercase tracking-wider text-black mb-4">
                  INGA BOTAR ÄNNU
                </h2>
                <p className="text-gray-600 mb-8">
                  Skapa din första AI-chatbot för att börja automatisera konversationer
                </p>
                <motion.button
                  onClick={() => router.push('/sv/business/bot-builder')}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="minimal-button"
                >
                  SKAPA DIN FÖRSTA BOT
                </motion.button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {bots.map((bot, i) => (
                  <motion.button
                    key={bot.id}
                    onClick={() => router.push(`/sv/dashboard/${bot.id}`)}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="minimal-card animate-pulse-shadow text-left cursor-pointer group"
                  >
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold uppercase tracking-wider text-black mb-2 truncate">
                          {bot.name}
                        </h3>
                        <p className="text-sm text-gray-600 truncate">
                          {bot.companyUrl || 'Ingen URL konfigurerad'}
                        </p>
                      </div>
                      <div className="relative">
                        <div className={`w-3 h-3 rounded-full ${
                          bot.isActive ? 'bg-green-500' : 'bg-gray-300'
                        }`} />
                        {bot.isActive && (
                          <div className="absolute inset-0 w-3 h-3 rounded-full bg-green-500 animate-ping" />
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-6">
                      <div>
                        <div className="text-2xl font-bold text-black">
                          {bot.stats.messages}
                        </div>
                        <div className="text-xs uppercase tracking-wider text-gray-600">
                          Meddelanden
                        </div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-black">
                          {bot.stats.sessions}
                        </div>
                        <div className="text-xs uppercase tracking-wider text-gray-600">
                          Sessioner
                        </div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-black">
                          {bot.stats.knowledgeChunks}
                        </div>
                        <div className="text-xs uppercase tracking-wider text-gray-600">
                          KB-objekt
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm pt-4 border-t border-gray-200">
                      <span className="text-gray-500">
                        Skapad {new Date(bot.createdAt).toLocaleDateString('sv-SE')}
                      </span>
                      <span className="text-black font-bold uppercase tracking-wider group-hover:translate-x-1 transition-transform">
                        HANTERA →
                      </span>
                    </div>
                  </motion.button>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'analytics' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="minimal-card animate-pulse-shadow"
          >
            <h2 className="text-2xl font-bold uppercase tracking-wider text-black mb-8">
              ANALYSÖVERSIKT
            </h2>
            <div className="text-center py-12">
              <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">
                Detaljerad analys kommer snart. Spåra prestanda, användarnöjdhet och ROI.
              </p>
            </div>
          </motion.div>
        )}

        {activeTab === 'settings' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="minimal-card animate-pulse-shadow"
          >
            <h2 className="text-2xl font-bold uppercase tracking-wider text-black mb-8">
              KONTOINSTÄLLNINGAR
            </h2>
            <div className="space-y-6">
              <div>
                <label className="minimal-label">E-POSTADRESS</label>
                <input
                  type="email"
                  value={email || ''}
                  disabled
                  className="minimal-input bg-gray-50"
                />
              </div>
              <div>
                <label className="minimal-label">API-NYCKEL</label>
                <input
                  type="text"
                  value="sk-••••••••••••••••••••••••"
                  disabled
                  className="minimal-input bg-gray-50"
                />
              </div>
              <div className="pt-4">
                <button className="minimal-button-outline">
                  HANTERA PRENUMERATION
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}