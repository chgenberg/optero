"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion } from "framer-motion";
import { 
  ArrowLeft, MessageSquare, Users, Database, TrendingUp, 
  Globe, RefreshCw, Plus, Play, Settings, BarChart3, 
  Calendar, Clock, Zap, Link2, Loader2, Check
} from "lucide-react";

interface BotDetailStats {
  bot: {
    id: string;
    name: string;
    type: string;
    spec?: any;
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
  const [activeTab, setActiveTab] = useState<'overview'|'analytics'|'training'>('overview');

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
    if (!confirm('This will update the bot\'s knowledge base from the website. Continue?')) return;
    
    setReindexing(true);
    try {
      const res = await fetch('/api/bots/reindex', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ botId })
      });
      
      const data = await res.json();
      if (data.success) {
        alert(`✅ Updated! ${data.pagesScraped} pages scraped, ${data.embeddingsCreated} embeddings created.`);
        loadStats();
      } else {
        alert('❌ Error updating: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Reindex error:', error);
      alert('❌ Something went wrong');
    } finally {
      setReindexing(false);
    }
  };

  const handleTrain = async () => {
    if (!trainQuestion.trim() || !trainAnswer.trim()) {
      alert('Please fill in both question and answer');
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
        alert('✅ Training added! The bot will now answer this question.');
        setShowTrainModal(false);
        setTrainQuestion('');
        setTrainAnswer('');
        loadStats();
      } else {
        alert('❌ Error: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Training error:', error);
      alert('❌ Something went wrong');
    } finally {
      setTraining(false);
    }
  };

  const handlePublishToMarketplace = async () => {
    if (!confirm('Publish this bot to marketplace? You\'ll get 20% of all premium subscriptions from installs.')) return;
    
    setPublishing(true);
    try {
      const res = await fetch('/api/marketplace/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ botId })
      });
      
      const data = await res.json();
      if (data.success) {
        alert('✅ Bot published to marketplace!');
        router.push('/marketplace');
      } else {
        alert('❌ Error: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Publish error:', error);
      alert('❌ Something went wrong');
    } finally {
      setPublishing(false);
    }
  };

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

  if (!stats) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Bot not found</p>
          <button onClick={() => router.push('/dashboard')} className="minimal-button">
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const maxHourly = Math.max(...(analytics?.heatmap.hourly || [1]));
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Check if bot is headless (internal use only, no widget)
  const isHeadless = stats?.bot?.spec?.isHeadless || 
    (stats?.bot?.spec?.centraApiBaseUrl || 
     stats?.bot?.spec?.hubspotEnabled || 
     stats?.bot?.spec?.zendeskDomain ||
     stats?.bot?.spec?.shopifyDomain);

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <button
            onClick={() => router.push('/dashboard')}
            className="text-sm text-gray-600 hover:text-black transition-colors mb-6 flex items-center gap-2 uppercase tracking-wider"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>
          
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div>
              <h1 className="text-4xl font-bold uppercase tracking-wider text-black mb-2">
                {stats.bot.name}
              </h1>
              <p className="text-gray-600 uppercase tracking-wider text-sm">
                Created {new Date(stats.bot.createdAt).toLocaleDateString('en-US')}
              </p>
            </div>
            
            <div className="flex flex-wrap gap-3">
              {isHeadless && (
                <motion.button
                  onClick={() => router.push(`/dashboard/${botId}/chat`)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="minimal-button flex items-center gap-2"
                >
                  <MessageSquare className="w-4 h-4" />
                  CHAT WITH BOT
                </motion.button>
              )}
              <motion.button
                onClick={() => router.push(`/integrations?botId=${botId}`)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="minimal-button-outline flex items-center gap-2"
              >
                <Link2 className="w-4 h-4" />
                <span className="hidden sm:inline">INTEGRATIONS</span>
              </motion.button>
              <motion.button
                onClick={() => router.push(`/approvals`)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="minimal-button-outline flex items-center gap-2"
                title="Pending approvals"
              >
                <span>APPROVALS</span>
              </motion.button>
              <motion.button
                onClick={handlePublishToMarketplace}
                disabled={publishing}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="minimal-button-outline flex items-center gap-2 disabled:opacity-50"
              >
                <Globe className="w-4 h-4" />
                {publishing ? 'PUBLISHING...' : 'SHARE'}
              </motion.button>
              <motion.button
                onClick={() => router.push(`/bots/chat?botId=${botId}`)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="minimal-button-outline flex items-center gap-2"
              >
                <Play className="w-4 h-4" />
                TEST
              </motion.button>
              {!isHeadless && (
                <motion.button
                  onClick={() => router.push(`/business/bot-builder/deploy?botId=${botId}`)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="minimal-button"
                >
                  INSTALL BOT
                </motion.button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-12"
        >
          <div className="minimal-card animate-pulse-shadow">
            <div className="flex items-center justify-between mb-2">
              <MessageSquare className="w-5 h-5 text-gray-400" />
              <TrendingUp className="w-4 h-4 text-green-600" />
            </div>
            <div className="text-3xl font-bold text-black mb-1">
              {stats.stats.totalMessages}
            </div>
            <div className="text-xs uppercase tracking-wider text-gray-600">
              Total Messages
            </div>
          </div>

          <div className="minimal-card animate-pulse-shadow">
            <div className="flex items-center justify-between mb-2">
              <Clock className="w-5 h-5 text-gray-400" />
            </div>
            <div className="text-3xl font-bold text-black mb-1">
              {stats.stats.todayMessages}
            </div>
            <div className="text-xs uppercase tracking-wider text-gray-600">
              Today
            </div>
          </div>

          <div className="minimal-card animate-pulse-shadow">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-5 h-5 text-gray-400" />
            </div>
            <div className="text-3xl font-bold text-black mb-1">
              {stats.stats.totalSessions}
            </div>
            <div className="text-xs uppercase tracking-wider text-gray-600">
              Sessions
            </div>
          </div>

          <div className="minimal-card animate-pulse-shadow">
            <div className="flex items-center justify-between mb-2">
              <BarChart3 className="w-5 h-5 text-gray-400" />
            </div>
            <div className="text-3xl font-bold text-black mb-1">
              {analytics?.conversionRate.toFixed(1) || 0}%
            </div>
            <div className="text-xs uppercase tracking-wider text-gray-600">
              Conversion
            </div>
          </div>

          <div className="minimal-card animate-pulse-shadow">
            <div className="flex items-center justify-between mb-2">
              <Database className="w-5 h-5 text-gray-400" />
            </div>
            <div className="text-3xl font-bold text-black mb-1">
              {stats.stats.knowledgeChunks}
            </div>
            <div className="text-xs uppercase tracking-wider text-gray-600">
              KB Chunks
            </div>
          </div>

          <div className="minimal-card animate-pulse-shadow">
            <div className="flex items-center justify-between mb-2">
              <Zap className="w-5 h-5 text-gray-400" />
            </div>
            <div className="text-3xl font-bold text-black mb-1">
              {((tokenStats?.today || 0)/1000).toFixed(1)}k
            </div>
            <div className="text-xs uppercase tracking-wider text-gray-600">
              Tokens Today
            </div>
          </div>
        </motion.div>

        {/* Token Usage Bar */}
        {tokenStats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="minimal-card animate-pulse-shadow mb-12"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-black">
                DAILY TOKEN USAGE
              </h3>
              <span className="text-sm font-bold text-black">
                {tokenStats.todayPct}% OF {Math.round(tokenStats.dailyCap/1000)}K
              </span>
            </div>
            <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${tokenStats.todayPct}%` }}
                transition={{ duration: 1 }}
                className={`h-full ${tokenStats.todayPct >= 80 ? 'bg-yellow-500' : 'bg-black'}`} 
              />
            </div>
            <div className="mt-3 text-sm text-gray-600">
              Last 30 days: {(tokenStats.last30d/1000).toFixed(1)}k tokens
            </div>
          </motion.div>
        )}

        {/* Bot Installation/Usage Section */}
        {isHeadless && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="minimal-card animate-pulse-shadow mb-12"
          >
            <h3 className="text-lg font-bold uppercase tracking-wider text-black mb-4">
              HOW TO USE THIS BOT
            </h3>
            <div className="text-gray-600 space-y-4">
              <p>
                This is an internal bot that connects to your business systems. 
                It doesn't require installation on your website.
              </p>
              {stats.bot.spec?.centraApiBaseUrl && (
                <p>✓ Connected to Centra e-commerce API</p>
              )}
              {stats.bot.spec?.hubspotEnabled && (
                <p>✓ Connected to HubSpot CRM</p>
              )}
              {stats.bot.spec?.zendeskDomain && (
                <p>✓ Connected to Zendesk support</p>
              )}
              {stats.bot.spec?.shopifyDomain && (
                <p>✓ Connected to Shopify store</p>
              )}
              <div className="pt-4 flex flex-col sm:flex-row gap-4">
                <motion.button
                  onClick={() => router.push(`/dashboard/${botId}/chat`)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="minimal-button"
                >
                  START CHATTING →
                </motion.button>
                <motion.button
                  onClick={() => router.push(`/integrations?botId=${botId}`)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="minimal-button-outline"
                >
                  MANAGE INTEGRATIONS
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Tab Navigation */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex justify-center mb-12"
        >
          <div className="inline-flex bg-white rounded-xl shadow-sm p-1">
            {[
              { id: 'overview', label: 'OVERVIEW', icon: BarChart3 },
              { id: 'analytics', label: 'ANALYTICS', icon: TrendingUp },
              { id: 'training', label: 'TRAINING', icon: Database }
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

        {/* Content based on active tab */}
        {activeTab === 'overview' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-8"
          >
            {/* Top Questions */}
            <div className="minimal-card animate-pulse-shadow">
              <h2 className="text-xl font-bold uppercase tracking-wider text-black mb-6">
                TOP QUESTIONS
              </h2>
              {stats.topQuestions.length === 0 ? (
                <p className="text-gray-600">No questions yet</p>
              ) : (
                <div className="space-y-3">
                  {stats.topQuestions.map((q, i) => (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex justify-between items-start p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <p className="text-sm text-gray-900 flex-1">{q.question}</p>
                      <span className="text-sm font-bold text-black ml-3">
                        {q.count}x
                      </span>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Unanswered Questions */}
            <div className="minimal-card animate-pulse-shadow">
              <h2 className="text-xl font-bold uppercase tracking-wider text-black mb-6">
                UNANSWERED QUESTIONS
              </h2>
              {stats.unansweredQuestions.length === 0 ? (
                <div className="text-center py-8">
                  <Check className="w-12 h-12 text-green-500 mx-auto mb-3" />
                  <p className="text-gray-600">No unanswered questions!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {stats.unansweredQuestions.map((q, i) => (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="p-4 bg-red-50 border-2 border-red-200 rounded-lg"
                    >
                      <p className="text-sm text-gray-900 mb-2">{q}</p>
                      <button 
                        onClick={() => {
                          setTrainQuestion(q);
                          setShowTrainModal(true);
                        }}
                        className="text-xs text-red-600 font-bold hover:underline uppercase tracking-wider"
                      >
                        TRAIN BOT ON THIS →
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Sessions - Full Width */}
            <div className="minimal-card animate-pulse-shadow col-span-1 lg:col-span-2">
              <h2 className="text-xl font-bold uppercase tracking-wider text-black mb-6">
                RECENT SESSIONS
              </h2>
              {stats.recentSessions.length === 0 ? (
                <p className="text-gray-600 text-center py-8">No sessions yet</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {stats.recentSessions.map((session, i) => (
                    <motion.div 
                      key={session.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-sm font-bold uppercase tracking-wider text-black">
                          {session.messageCount} MESSAGES
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(session.updatedAt).toLocaleString('en-US')}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 line-clamp-2">
                        {session.lastMessage || 'No message'}
                      </p>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {activeTab === 'analytics' && analytics && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-8"
          >
            {/* Analytics Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Word Cloud */}
              <div className="minimal-card animate-pulse-shadow">
                <h2 className="text-xl font-bold uppercase tracking-wider text-black mb-6">
                  TOP KEYWORDS
                </h2>
                <div className="flex flex-wrap gap-2">
                  {analytics.wordcloud.slice(0, 20).map((w, i) => {
                    const size = Math.max(12, Math.min(24, 12 + (w.count / analytics.wordcloud[0].count) * 12));
                    return (
                      <motion.span
                        key={i}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.02 }}
                        className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full hover:bg-gray-200 transition-colors"
                        style={{ fontSize: `${size}px` }}
                      >
                        {w.word}
                      </motion.span>
                    );
                  })}
                </div>
              </div>

              {/* Sentiment */}
              <div className="minimal-card animate-pulse-shadow">
                <h2 className="text-xl font-bold uppercase tracking-wider text-black mb-6">
                  SENTIMENT ANALYSIS
                </h2>
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="font-bold uppercase tracking-wider">😊 POSITIVE</span>
                      <span className="font-bold">{analytics.sentiment.positive}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${(analytics.sentiment.positive / analytics.totalSessions) * 100}%` }}
                        transition={{ duration: 1 }}
                        className="bg-green-500 h-3 rounded-full"
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="font-bold uppercase tracking-wider">😐 NEUTRAL</span>
                      <span className="font-bold">{analytics.sentiment.neutral}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${(analytics.sentiment.neutral / analytics.totalSessions) * 100}%` }}
                        transition={{ duration: 1, delay: 0.1 }}
                        className="bg-gray-400 h-3 rounded-full"
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="font-bold uppercase tracking-wider">😞 NEGATIVE</span>
                      <span className="font-bold">{analytics.sentiment.negative}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${(analytics.sentiment.negative / analytics.totalSessions) * 100}%` }}
                        transition={{ duration: 1, delay: 0.2 }}
                        className="bg-red-500 h-3 rounded-full"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Activity Heatmap */}
            <div className="minimal-card animate-pulse-shadow">
              <h2 className="text-xl font-bold uppercase tracking-wider text-black mb-6">
                ACTIVITY HEATMAP
              </h2>
              
              <div className="mb-8">
                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-600 mb-4">
                  HOURLY ACTIVITY
                </h3>
                <div className="flex items-end gap-1 h-32">
                  {analytics.heatmap.hourly.map((count, hour) => (
                    <motion.div 
                      key={hour} 
                      className="flex-1 flex flex-col items-center"
                      initial={{ height: 0 }}
                      animate={{ height: 'auto' }}
                      transition={{ delay: hour * 0.02 }}
                    >
                      <div 
                        className="w-full bg-black rounded-t hover:bg-gray-800 transition-colors"
                        style={{ 
                          height: `${(count / maxHourly) * 100}%`,
                          minHeight: count > 0 ? '4px' : '0'
                        }}
                      />
                      <span className="text-xs text-gray-500 mt-2">{hour}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-600 mb-4">
                  WEEKLY ACTIVITY
                </h3>
                <div className="grid grid-cols-7 gap-3">
                  {analytics.heatmap.daily.map((count, day) => (
                    <motion.div 
                      key={day} 
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: day * 0.05 }}
                      className="text-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="text-2xl font-bold text-black mb-1">{count}</div>
                      <div className="text-xs uppercase tracking-wider text-gray-600">{dayNames[day]}</div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'training' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="max-w-4xl mx-auto"
          >
            <div className="minimal-card animate-pulse-shadow">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-bold uppercase tracking-wider text-black">
                  KNOWLEDGE BASE MANAGEMENT
                </h2>
                <motion.button
                  onClick={handleReindex}
                  disabled={reindexing}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="minimal-button-outline flex items-center gap-2 disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${reindexing ? 'animate-spin' : ''}`} />
                  {reindexing ? 'UPDATING...' : 'UPDATE FROM WEBSITE'}
                </motion.button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="text-center p-6 bg-gray-50 rounded-lg">
                  <Database className="w-8 h-8 text-gray-600 mx-auto mb-3" />
                  <div className="text-2xl font-bold text-black">{stats.stats.knowledgeChunks}</div>
                  <div className="text-xs uppercase tracking-wider text-gray-600">Total Chunks</div>
                </div>
                <div className="text-center p-6 bg-gray-50 rounded-lg">
                  <MessageSquare className="w-8 h-8 text-gray-600 mx-auto mb-3" />
                  <div className="text-2xl font-bold text-black">{stats.topQuestions.length}</div>
                  <div className="text-xs uppercase tracking-wider text-gray-600">Unique Questions</div>
                </div>
                <div className="text-center p-6 bg-gray-50 rounded-lg">
                  <Plus className="w-8 h-8 text-gray-600 mx-auto mb-3" />
                  <div className="text-2xl font-bold text-black">{stats.unansweredQuestions.length}</div>
                  <div className="text-xs uppercase tracking-wider text-gray-600">Need Training</div>
                </div>
              </div>

              <div className="text-center">
                <motion.button
                  onClick={() => setShowTrainModal(true)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="minimal-button"
                >
                  ADD MANUAL Q&A
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Training Modal */}
        {showTrainModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="minimal-card max-w-2xl w-full"
            >
              <h2 className="text-2xl font-bold uppercase tracking-wider text-black mb-6">
                ADD MANUAL TRAINING
              </h2>
              
              <div className="space-y-6 mb-8">
                <div>
                  <label className="minimal-label">
                    QUESTION
                  </label>
                  <input
                    type="text"
                    value={trainQuestion}
                    onChange={(e) => setTrainQuestion(e.target.value)}
                    placeholder="What are your prices?"
                    className="minimal-input"
                  />
                </div>
                
                <div>
                  <label className="minimal-label">
                    ANSWER
                  </label>
                  <textarea
                    value={trainAnswer}
                    onChange={(e) => setTrainAnswer(e.target.value)}
                    placeholder="Our prices start at $99/month. Contact us for a custom quote."
                    rows={4}
                    className="minimal-input resize-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowTrainModal(false)}
                  className="minimal-button-outline"
                >
                  CANCEL
                </button>
                <button
                  onClick={handleTrain}
                  disabled={training}
                  className="minimal-button disabled:opacity-50"
                >
                  {training ? 'SAVING...' : 'ADD TRAINING'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}