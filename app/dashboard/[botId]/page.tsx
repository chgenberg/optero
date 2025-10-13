"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { MinimalIcons } from "@/components/MinimalIcons";

interface BotDetailStats {
  bot: {
    id: string;
    name: string;
    type: string;
    createdAt: string;
  };
  stats: {
    totalMessages: number;
    todayMessages: number;
    totalSessions: number;
    activeSessions: number;
    knowledgeChunks: number;
  };
  topQuestions: Array<{ question: string; count: number }>;
  unansweredQuestions: string[];
  recentSessions: Array<{
    id: string;
    messageCount: number;
    lastMessage: string;
    createdAt: string;
    updatedAt: string;
  }>;
}

export default function BotDetailPage() {
  const router = useRouter();
  const params = useParams();
  const botId = params?.botId as string;
  
  const [stats, setStats] = useState<BotDetailStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (botId) {
      loadStats();
    }
  }, [botId]);

  const loadStats = async () => {
    try {
      const res = await fetch(`/api/bots/stats?botId=${botId}`);
      const data = await res.json();
      setStats(data);
    } catch (error) {
      console.error('Failed to load stats:', error);
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

  if (!stats) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Bot hittades inte</p>
          <button onClick={() => router.push('/dashboard')} className="btn-minimal">
            Tillbaka till Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div>
            <button
              onClick={() => router.push('/dashboard')}
              className="text-sm text-gray-600 hover:text-gray-900 mb-4 flex items-center gap-2"
            >
              ← Tillbaka till Dashboard
            </button>
            <h1 className="text-4xl font-light text-gray-900 mb-2">{stats.bot.name}</h1>
            <p className="text-gray-600">
              Skapad {new Date(stats.bot.createdAt).toLocaleDateString('sv-SE')}
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => router.push(`/bots/chat?botId=${botId}`)}
              className="btn-minimal-outline"
            >
              Testa bot
            </button>
            <button
              onClick={() => router.push(`/business/bot-builder/deploy?botId=${botId}`)}
              className="btn-minimal"
            >
              Installera
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="minimal-box text-center">
            <div className="text-3xl font-light text-gray-900 mb-1">
              {stats.stats.totalMessages}
            </div>
            <div className="text-sm text-gray-600">Totalt meddelanden</div>
          </div>
          <div className="minimal-box text-center">
            <div className="text-3xl font-light text-gray-900 mb-1">
              {stats.stats.todayMessages}
            </div>
            <div className="text-sm text-gray-600">Idag</div>
          </div>
          <div className="minimal-box text-center">
            <div className="text-3xl font-light text-gray-900 mb-1">
              {stats.stats.totalSessions}
            </div>
            <div className="text-sm text-gray-600">Sessioner</div>
          </div>
          <div className="minimal-box text-center">
            <div className="text-3xl font-light text-gray-900 mb-1">
              {stats.stats.activeSessions}
            </div>
            <div className="text-sm text-gray-600">Aktiva nu</div>
          </div>
          <div className="minimal-box text-center">
            <div className="text-3xl font-light text-gray-900 mb-1">
              {stats.stats.knowledgeChunks}
            </div>
            <div className="text-sm text-gray-600">KB chunks</div>
          </div>
        </div>

        {/* Two column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top Questions */}
          <div className="minimal-box">
            <h2 className="text-xl font-medium text-gray-900 mb-6">
              Top 10 frågor
            </h2>
            {stats.topQuestions.length === 0 ? (
              <p className="text-gray-600 text-sm">Inga frågor än</p>
            ) : (
              <div className="space-y-3">
                {stats.topQuestions.map((q, i) => (
                  <div key={i} className="flex justify-between items-start p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-900 flex-1">{q.question}</p>
                    <span className="text-sm font-medium text-gray-600 ml-3">
                      {q.count}x
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Unanswered Questions */}
          <div className="minimal-box">
            <h2 className="text-xl font-medium text-gray-900 mb-6">
              Obesvarade frågor
            </h2>
            {stats.unansweredQuestions.length === 0 ? (
              <p className="text-gray-600 text-sm">Inga obesvarade frågor 🎉</p>
            ) : (
              <div className="space-y-3">
                {stats.unansweredQuestions.map((q, i) => (
                  <div key={i} className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-gray-900">{q}</p>
                    <button className="text-xs text-red-600 hover:underline mt-2">
                      Träna bot på denna fråga →
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Sessions */}
        <div className="minimal-box mt-8">
          <h2 className="text-xl font-medium text-gray-900 mb-6">
            Senaste sessioner
          </h2>
          {stats.recentSessions.length === 0 ? (
            <p className="text-gray-600 text-sm">Inga sessioner än</p>
          ) : (
            <div className="space-y-3">
              {stats.recentSessions.map((session) => (
                <div key={session.id} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-sm font-medium text-gray-900">
                      {session.messageCount} meddelanden
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(session.updatedAt).toLocaleString('sv-SE')}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700">
                    {session.lastMessage || 'Ingen meddelande'}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

