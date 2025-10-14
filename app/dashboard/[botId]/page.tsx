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
      totalTokens?: number;
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

interface Analytics {
  wordcloud: Array<{ word: string; count: number }>;
  sentiment: { positive: number; neutral: number; negative: number };
  conversionRate: number;
  conversions: number;
  totalSessions: number;
  heatmap: {
    hourly: number[];
    daily: number[];
  };
}

export default function BotDetailPage() {
  const router = useRouter();
  const params = useParams();
  const botId = params?.botId as string;
  
  const [stats, setStats] = useState<BotDetailStats | null>(null);
  const [tokenStats, setTokenStats] = useState<{today:number; last30d:number; dailyCap:number; todayPct:number} | null>(null);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [reindexing, setReindexing] = useState(false);
  const [showTrainModal, setShowTrainModal] = useState(false);
  const [trainQuestion, setTrainQuestion] = useState("");
  const [trainAnswer, setTrainAnswer] = useState("");
  const [training, setTraining] = useState(false);
  const [publishing, setPublishing] = useState(false);

  useEffect(() => {
    if (botId) {
      loadStats();
      loadAnalytics();
    }
  }, [botId]);

  const loadStats = async () => {
    try {
      const res = await fetch(`/api/bots/stats?botId=${botId}`);
      const data = await res.json();
      setStats(data);
      if (data.tokenStats) setTokenStats(data.tokenStats);
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAnalytics = async () => {
    try {
      const res = await fetch(`/api/bots/analytics?botId=${botId}`);
      const data = await res.json();
      setAnalytics(data);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    }
  };

  const handleReindex = async () => {
    if (!confirm('Detta kommer att uppdatera botens kunskapsbas från webbplatsen. Fortsätt?')) return;
    
    setReindexing(true);
    try {
      const res = await fetch('/api/bots/reindex', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ botId })
      });
      
      const data = await res.json();
      if (data.success) {
        alert(`✅ Uppdaterat! ${data.pagesScraped} sidor scrapade, ${data.embeddingsCreated} embeddings skapade.`);
        loadStats(); // Reload to show updated KB count
      } else {
        alert('❌ Fel vid uppdatering: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Reindex error:', error);
      alert('❌ Något gick fel');
    } finally {
      setReindexing(false);
    }
  };

  const handleTrain = async () => {
    if (!trainQuestion.trim() || !trainAnswer.trim()) {
      alert('Fyll i både fråga och svar');
      return;
    }

    setTraining(true);
    try {
      const res = await fetch('/api/bots/train', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ botId, question: trainQuestion, answer: trainAnswer })
      });
      
      const data = await res.json();
      if (data.success) {
        alert('✅ Träning tillagd! Boten kommer nu svara på denna fråga.');
        setShowTrainModal(false);
        setTrainQuestion('');
        setTrainAnswer('');
        loadStats(); // Reload to show updated KB count
      } else {
        alert('❌ Fel: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Training error:', error);
      alert('❌ Något gick fel');
    } finally {
      setTraining(false);
    }
  };

  const handlePublishToMarketplace = async () => {
    if (!confirm('Publicera denna bot till marketplace? Du får 20% av alla premium-subscriptions från installs.')) return;
    
    setPublishing(true);
    try {
      const res = await fetch('/api/marketplace/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ botId })
      });
      
      const data = await res.json();
      if (data.success) {
        alert('✅ Bot publicerad i marketplace! Se den på /marketplace');
        router.push('/marketplace');
      } else {
        alert('❌ Fel: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Publish error:', error);
      alert('❌ Något gick fel');
    } finally {
      setPublishing(false);
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

  const maxHourly = Math.max(...(analytics?.heatmap.hourly || [1]));
  const dayNames = ['Sön', 'Mån', 'Tis', 'Ons', 'Tor', 'Fre', 'Lör'];

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
          <div className="flex gap-3 flex-wrap">
            <button
              onClick={handlePublishToMarketplace}
              disabled={publishing}
              className="btn-minimal-outline disabled:opacity-50"
            >
              {publishing ? 'Publicerar...' : '🌐 Dela i Marketplace'}
            </button>
            <button
              onClick={handleReindex}
              disabled={reindexing}
              className="btn-minimal-outline disabled:opacity-50"
            >
              {reindexing ? 'Uppdaterar...' : 'Uppdatera KB'}
            </button>
            <button
              onClick={() => setShowTrainModal(true)}
              className="btn-minimal-outline"
            >
              Lägg till Q&A
            </button>
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
              {analytics?.conversionRate.toFixed(1) || 0}%
            </div>
            <div className="text-sm text-gray-600">Konvertering</div>
          </div>
          <div className="minimal-box text-center">
            <div className="text-3xl font-light text-gray-900 mb-1">
              {stats.stats.knowledgeChunks}
            </div>
            <div className="text-sm text-gray-600">KB chunks</div>
          </div>
          <div className="minimal-box text-center col-span-2 md:col-span-1">
            <div className="text-3xl font-light text-gray-900 mb-1">
              {((tokenStats?.today || 0)/1000).toFixed(1)}k
            </div>
            <div className="text-sm text-gray-600">Tokens idag</div>
          </div>
        </div>

        {/* Token usage bar + 30d estimate */}
        {tokenStats && (
          <div className="minimal-box mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-700">Dagens token‑förbrukning</span>
              <span className="text-sm text-gray-700">{tokenStats.todayPct}% av {Math.round(tokenStats.dailyCap/1000)}k</span>
            </div>
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div className={`h-full ${tokenStats.todayPct>=80 ? 'bg-yellow-500' : 'bg-black'}`} style={{ width: `${tokenStats.todayPct}%` }} />
            </div>
            <div className="mt-3 text-sm text-gray-600">
              30 dagar: {(tokenStats.last30d/1000).toFixed(1)}k tokens
            </div>
          </div>
        )}

        {/* Analytics Row */}
        {analytics && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Wordcloud */}
            <div className="minimal-box">
              <h2 className="text-xl font-medium text-gray-900 mb-6">Top Keywords</h2>
              <div className="flex flex-wrap gap-2">
                {analytics.wordcloud.slice(0, 20).map((w, i) => {
                  const size = Math.max(12, Math.min(24, 12 + (w.count / analytics.wordcloud[0].count) * 12));
                  return (
                    <span
                      key={i}
                      className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full"
                      style={{ fontSize: `${size}px` }}
                    >
                      {w.word}
                    </span>
                  );
                })}
              </div>
            </div>

            {/* Sentiment */}
            <div className="minimal-box">
              <h2 className="text-xl font-medium text-gray-900 mb-6">Sentiment</h2>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-green-700">😊 Positiv</span>
                    <span className="font-medium">{analytics.sentiment.positive}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${(analytics.sentiment.positive / analytics.totalSessions) * 100}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-700">😐 Neutral</span>
                    <span className="font-medium">{analytics.sentiment.neutral}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gray-400 h-2 rounded-full"
                      style={{ width: `${(analytics.sentiment.neutral / analytics.totalSessions) * 100}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-red-700">😞 Negativ</span>
                    <span className="font-medium">{analytics.sentiment.negative}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-red-500 h-2 rounded-full"
                      style={{ width: `${(analytics.sentiment.negative / analytics.totalSessions) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Heatmap */}
        {analytics && (
          <div className="minimal-box mb-8">
            <h2 className="text-xl font-medium text-gray-900 mb-6">Aktivitet per timme</h2>
            <div className="flex items-end gap-2 h-32">
              {analytics.heatmap.hourly.map((count, hour) => (
                <div key={hour} className="flex-1 flex flex-col items-center">
                  <div 
                    className="w-full bg-black rounded-t"
                    style={{ 
                      height: `${(count / maxHourly) * 100}%`,
                      minHeight: count > 0 ? '4px' : '0'
                    }}
                  />
                  <span className="text-xs text-gray-500 mt-2">{hour}</span>
                </div>
              ))}
            </div>
            
            <h3 className="text-lg font-medium text-gray-900 mt-8 mb-4">Aktivitet per veckodag</h3>
            <div className="flex gap-3">
              {analytics.heatmap.daily.map((count, day) => (
                <div key={day} className="flex-1 text-center">
                  <div className="text-2xl font-light text-gray-900 mb-1">{count}</div>
                  <div className="text-xs text-gray-600">{dayNames[day]}</div>
                </div>
              ))}
            </div>
          </div>
        )}

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
                    <p className="text-sm text-gray-900 mb-2">{q}</p>
                    <button 
                      onClick={() => {
                        setTrainQuestion(q);
                        setShowTrainModal(true);
                      }}
                      className="text-xs text-red-600 hover:underline"
                    >
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

        {/* Training Modal */}
        {showTrainModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="minimal-box max-w-2xl w-full">
              <h2 className="text-2xl font-light text-gray-900 mb-6">
                Lägg till manuell träning
              </h2>
              
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fråga
                  </label>
                  <input
                    type="text"
                    value={trainQuestion}
                    onChange={(e) => setTrainQuestion(e.target.value)}
                    placeholder="Vad kostar er tjänst?"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Svar
                  </label>
                  <textarea
                    value={trainAnswer}
                    onChange={(e) => setTrainAnswer(e.target.value)}
                    placeholder="Våra priser startar på 499 kr/månad. Kontakta oss för en skräddarsydd offert."
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowTrainModal(false)}
                  className="btn-minimal-outline"
                >
                  Avbryt
                </button>
                <button
                  onClick={handleTrain}
                  disabled={training}
                  className="btn-minimal disabled:opacity-50"
                >
                  {training ? 'Sparar...' : 'Lägg till'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
