"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MinimalIcons } from "@/components/MinimalIcons";

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

export default function DashboardPage() {
  const router = useRouter();
  const [bots, setBots] = useState<BotStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <MinimalIcons.Loader className="w-8 h-8 text-gray-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-4xl font-light text-gray-900 mb-2">Dashboard</h1>
            <p className="text-gray-600">
              {email ? `Inloggad som: ${email}` : 'Alla botar'}
            </p>
          </div>
          <button
            onClick={() => router.push('/business/bot-builder')}
            className="btn-minimal flex items-center gap-2"
          >
            <MinimalIcons.Bot className="w-5 h-5" />
            Skapa ny bot
          </button>
        </div>

        {bots.length === 0 ? (
          <div className="minimal-box text-center py-16">
            <MinimalIcons.Bot className="w-16 h-16 text-gray-300 mx-auto mb-6" />
            <h2 className="text-2xl font-light text-gray-900 mb-4">Inga botar än</h2>
            <p className="text-gray-600 mb-8">Skapa din första bot för att komma igång</p>
            <button
              onClick={() => router.push('/business/bot-builder')}
              className="btn-minimal"
            >
              Skapa bot
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bots.map(bot => (
              <button
                key={bot.id}
                onClick={() => router.push(`/dashboard/${bot.id}`)}
                className="minimal-box text-left hover:scale-[1.02] transition-transform cursor-pointer"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-900 mb-1 truncate">
                      {bot.name}
                    </h3>
                    <p className="text-sm text-gray-600 truncate">
                      {bot.companyUrl || 'Ingen URL'}
                    </p>
                  </div>
                  <div className={`w-3 h-3 rounded-full ${bot.isActive ? 'bg-green-500' : 'bg-gray-300'}`} />
                </div>

                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div>
                    <div className="text-2xl font-light text-gray-900">
                      {bot.stats.messages}
                    </div>
                    <div className="text-xs text-gray-600">Meddelanden</div>
                  </div>
                  <div>
                    <div className="text-2xl font-light text-gray-900">
                      {bot.stats.sessions}
                    </div>
                    <div className="text-xs text-gray-600">Sessioner</div>
                  </div>
                  <div>
                    <div className="text-2xl font-light text-gray-900">
                      {bot.stats.knowledgeChunks}
                    </div>
                    <div className="text-xs text-gray-600">KB chunks</div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">
                    {new Date(bot.createdAt).toLocaleDateString('sv-SE')}
                  </span>
                  <span className="text-black font-medium">
                    Visa detaljer →
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

