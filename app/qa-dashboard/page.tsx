"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  Clock,
  BarChart3,
  Filter,
  Download,
  Search,
  RefreshCw,
  CheckCircle,
  XCircle,
  ArrowUp,
  ArrowDown,
  Minus,
  Bot,
  Calendar,
  Zap,
  Target,
  PieChart,
} from "lucide-react";

interface QASummary {
  totalQuestions: number;
  uniqueQuestions: number;
  answeredQuestions: number;
  unansweredQuestions: number;
  answerRate: number;
  avgResponseTime: number;
  timeRange: string;
  botsAnalyzed: number;
}

interface Question {
  question: string;
  count: number;
  bots: string[];
  firstAsked: string;
  lastAsked: string;
  answered: boolean;
  avgResponseLength?: number;
  avgResponseTime?: number;
}

interface TrendingQuestion {
  question: string;
  count: number;
  trend: string;
  trendScore?: number;
}

interface Category {
  category: string;
  count: number;
  percentage: number;
}

interface BotStats {
  botId: string;
  botName: string;
  totalQuestions: number;
  uniqueQuestions: number;
  answeredRate: number;
  avgResponseTime: number;
  topQuestions: Array<{ question: string; count: number }>;
  unansweredQuestions: string[];
}

interface DashboardData {
  summary: QASummary;
  topQuestions: Question[];
  unansweredQuestions: Question[];
  recentQuestions: Question[];
  trendingQuestions: TrendingQuestion[];
  categories: Category[];
  botStats: BotStats[];
  bots: Array<{ id: string; name: string }>;
}

export default function QADashboard() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [email, setEmail] = useState("");
  
  // Filters
  const [timeRange, setTimeRange] = useState<"24h" | "7d" | "30d" | "all">("7d");
  const [selectedBot, setSelectedBot] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeView, setActiveView] = useState<"overview" | "top" | "unanswered" | "trending" | "bots">("overview");

  useEffect(() => {
    const userEmail = sessionStorage.getItem("botUserEmail");
    if (userEmail) {
      setEmail(userEmail);
    }
    loadData();
  }, [timeRange, selectedBot]);

  const loadData = async (refresh = false) => {
    try {
      if (refresh) setRefreshing(true);
      const userEmail = sessionStorage.getItem("botUserEmail") || "all";
      const res = await fetch(
        `/api/qa-dashboard?email=${userEmail}&timeRange=${timeRange}&botId=${selectedBot !== "all" ? selectedBot : ""}&limit=100`
      );
      const result = await res.json();
      setData(result);
    } catch (error) {
      console.error("Failed to load Q&A data:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const exportData = () => {
    if (!data) return;
    const csv = [
      ["Question", "Count", "Answered", "Bots", "First Asked", "Last Asked"],
      ...data.topQuestions.map(q => [
        q.question,
        q.count,
        q.answered ? "Yes" : "No",
        q.bots.join("; "),
        new Date(q.firstAsked).toLocaleDateString(),
        new Date(q.lastAsked).toLocaleDateString(),
      ]),
    ]
      .map(row => row.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `qa-dashboard-${timeRange}-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  const filteredQuestions = (questions: Question[]) => {
    if (!searchQuery) return questions;
    return questions.filter(q =>
      q.question.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const formatTime = (ms: number) => {
    if (ms < 1000) return `${Math.round(ms)}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}min`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-white border-t-gray-700 rounded-full"
        />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Failed to load Q&A data</p>
          <button onClick={() => loadData()} className="minimal-button mt-4">
            RETRY
          </button>
        </div>
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
          className="mb-8"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
            <div className="mb-4 lg:mb-0">
              <h1 className="text-4xl font-bold uppercase tracking-wider text-black mb-2">
                Q&A ANALYTICS DASHBOARD
              </h1>
              <p className="text-gray-600">
                Comprehensive analysis of all questions across your bots
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <motion.button
                onClick={() => loadData(true)}
                disabled={refreshing}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="minimal-button-outline flex items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
                REFRESH
              </motion.button>
              <motion.button
                onClick={exportData}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="minimal-button flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                EXPORT CSV
              </motion.button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-4 mb-6">
            {/* Time Range Filter */}
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as any)}
                className="minimal-input py-2 px-3 text-sm"
              >
                <option value="24h">Last 24 Hours</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="all">All Time</option>
              </select>
            </div>

            {/* Bot Filter */}
            <div className="flex items-center gap-2">
              <Bot className="w-4 h-4 text-gray-500" />
              <select
                value={selectedBot}
                onChange={(e) => setSelectedBot(e.target.value)}
                className="minimal-input py-2 px-3 text-sm"
              >
                <option value="all">All Bots ({data.bots.length})</option>
                {data.bots.map(bot => (
                  <option key={bot.id} value={bot.id}>
                    {bot.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Search */}
            <div className="flex-1 min-w-[200px] relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search questions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="minimal-input py-2 pl-10 pr-4 text-sm w-full"
              />
            </div>
          </div>
        </motion.div>

        {/* Summary Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
        >
          <div className="minimal-card animate-pulse-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
                  Total Questions
                </p>
                <p className="text-3xl font-bold text-black">
                  {data.summary.totalQuestions.toLocaleString()}
                </p>
              </div>
              <MessageSquare className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {data.summary.uniqueQuestions} unique
            </p>
          </div>

          <div className="minimal-card animate-pulse-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
                  Answer Rate
                </p>
                <p className="text-3xl font-bold text-black">
                  {data.summary.answerRate.toFixed(1)}%
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
            <div className="mt-2 flex items-center text-xs text-gray-500">
              <span className="text-green-600 mr-2">
                ✓ {data.summary.answeredQuestions}
              </span>
              <span className="text-red-600">
                ✗ {data.summary.unansweredQuestions}
              </span>
            </div>
          </div>

          <div className="minimal-card animate-pulse-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
                  Avg Response Time
                </p>
                <p className="text-3xl font-bold text-black">
                  {formatTime(data.summary.avgResponseTime)}
                </p>
              </div>
              <Clock className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Across all answered questions
            </p>
          </div>

          <div className="minimal-card animate-pulse-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
                  Bots Analyzed
                </p>
                <p className="text-3xl font-bold text-black">
                  {data.summary.botsAnalyzed}
                </p>
              </div>
              <Bot className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {timeRange === "24h" ? "Last 24h" : timeRange === "7d" ? "Last 7 days" : timeRange === "30d" ? "Last 30 days" : "All time"}
            </p>
          </div>
        </motion.div>

        {/* Category Breakdown */}
        {data.categories.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="minimal-card animate-pulse-shadow mb-8"
          >
            <div className="flex items-center gap-2 mb-6">
              <PieChart className="w-5 h-5 text-black" />
              <h2 className="text-xl font-bold uppercase tracking-wider text-black">
                Question Categories
              </h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {data.categories.map((cat, idx) => (
                <motion.div
                  key={cat.category}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 + idx * 0.05 }}
                  className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-600">
                      {cat.category}
                    </span>
                    <span className="text-xs font-bold text-black">
                      {cat.percentage}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                    <div
                      className="bg-black h-2 rounded-full transition-all duration-500"
                      style={{ width: `${cat.percentage}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500">
                    {cat.count} questions
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Tab Navigation */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex justify-center mb-8 overflow-x-auto"
        >
          <div className="inline-flex bg-white rounded-xl shadow-sm p-1">
            {[
              { id: "overview", label: "Overview", icon: BarChart3 },
              { id: "top", label: "Top Questions", icon: TrendingUp },
              { id: "unanswered", label: "Unanswered", icon: AlertCircle },
              { id: "trending", label: "Trending", icon: Zap },
              { id: "bots", label: "By Bot", icon: Bot },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveView(tab.id as any)}
                className={`px-4 py-2 rounded-lg uppercase tracking-wider text-xs font-bold transition-all duration-300 whitespace-nowrap ${
                  activeView === tab.id
                    ? "bg-black text-white"
                    : "text-gray-500 hover:text-black"
                }`}
              >
                <tab.icon className="w-4 h-4 inline mr-2" />
                {tab.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Content Views */}
        <AnimatePresence mode="wait">
          {/* Overview */}
          {activeView === "overview" && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Top 10 Questions */}
              <div className="minimal-card animate-pulse-shadow">
                <h3 className="text-lg font-bold uppercase tracking-wider text-black mb-4">
                  Top 10 Questions
                </h3>
                <div className="space-y-3">
                  {data.topQuestions.slice(0, 10).map((q, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="flex items-start gap-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex-shrink-0 w-8 h-8 bg-black text-white rounded-full flex items-center justify-center font-bold text-sm">
                        {idx + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-black mb-1 line-clamp-2">
                          {q.question}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-gray-600">
                          <span className="flex items-center gap-1">
                            <MessageSquare className="w-3 h-3" />
                            {q.count}x
                          </span>
                          {q.answered ? (
                            <span className="flex items-center gap-1 text-green-600">
                              <CheckCircle className="w-3 h-3" />
                              Answered
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-red-600">
                              <XCircle className="w-3 h-3" />
                              Unanswered
                            </span>
                          )}
                          <span className="text-gray-500">
                            {q.bots.slice(0, 2).join(", ")}
                            {q.bots.length > 2 && ` +${q.bots.length - 2}`}
                          </span>
                        </div>
                      </div>
                      {q.avgResponseTime && (
                        <div className="text-right">
                          <p className="text-xs text-gray-500">Avg. Response</p>
                          <p className="text-sm font-bold text-black">
                            {formatTime(q.avgResponseTime)}
                          </p>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Recent Questions */}
              <div className="minimal-card animate-pulse-shadow">
                <h3 className="text-lg font-bold uppercase tracking-wider text-black mb-4">
                  Recent Questions
                </h3>
                <div className="space-y-2">
                  {data.recentQuestions.slice(0, 10).map((q, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: idx * 0.03 }}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex-1 min-w-0 mr-4">
                        <p className="text-sm text-black line-clamp-1">
                          {q.question}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span>{new Date(q.lastAsked).toLocaleString()}</span>
                        {q.answered ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-500" />
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Top Questions */}
          {activeView === "top" && (
            <motion.div
              key="top"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="minimal-card animate-pulse-shadow"
            >
              <h3 className="text-lg font-bold uppercase tracking-wider text-black mb-4">
                All Top Questions ({filteredQuestions(data.topQuestions).length})
              </h3>
              <div className="space-y-3">
                {filteredQuestions(data.topQuestions).map((q, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: Math.min(idx * 0.02, 0.5) }}
                    className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-black to-gray-700 text-white rounded-lg flex items-center justify-center font-bold">
                        #{idx + 1}
                      </div>
                      <div className="flex-1">
                        <p className="text-base font-medium text-black mb-2">
                          {q.question}
                        </p>
                        <div className="flex flex-wrap items-center gap-4 text-xs">
                          <span className="flex items-center gap-1 text-gray-600">
                            <MessageSquare className="w-3 h-3" />
                            Asked {q.count} times
                          </span>
                          {q.answered ? (
                            <>
                              <span className="flex items-center gap-1 text-green-600">
                                <CheckCircle className="w-3 h-3" />
                                Answered
                              </span>
                              {q.avgResponseTime && (
                                <span className="flex items-center gap-1 text-gray-600">
                                  <Clock className="w-3 h-3" />
                                  {formatTime(q.avgResponseTime)} avg
                                </span>
                              )}
                            </>
                          ) : (
                            <span className="flex items-center gap-1 text-red-600">
                              <AlertCircle className="w-3 h-3" />
                              Unanswered
                            </span>
                          )}
                          <span className="text-gray-500">
                            Bots: {q.bots.join(", ")}
                          </span>
                        </div>
                        <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                          <span>First: {new Date(q.firstAsked).toLocaleDateString()}</span>
                          <span>•</span>
                          <span>Last: {new Date(q.lastAsked).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Unanswered Questions */}
          {activeView === "unanswered" && (
            <motion.div
              key="unanswered"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="minimal-card animate-pulse-shadow"
            >
              <div className="flex items-center gap-2 mb-4">
                <AlertCircle className="w-5 h-5 text-red-500" />
                <h3 className="text-lg font-bold uppercase tracking-wider text-black">
                  Unanswered Questions ({data.unansweredQuestions.length})
                </h3>
              </div>
              {data.unansweredQuestions.length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <p className="text-gray-600">
                    Great job! All questions have been answered.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredQuestions(data.unansweredQuestions).map((q, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: Math.min(idx * 0.03, 0.5) }}
                      className="p-4 bg-red-50 border border-red-100 rounded-lg"
                    >
                      <p className="text-sm font-medium text-black mb-2">
                        {q.question}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-gray-600">
                        <span className="flex items-center gap-1">
                          <MessageSquare className="w-3 h-3" />
                          Asked {q.count} times
                        </span>
                        <span>
                          Last asked: {new Date(q.lastAsked).toLocaleDateString()}
                        </span>
                        <span className="text-gray-500">
                          {q.bots.join(", ")}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* Trending Questions */}
          {activeView === "trending" && (
            <motion.div
              key="trending"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="minimal-card animate-pulse-shadow"
            >
              <div className="flex items-center gap-2 mb-4">
                <Zap className="w-5 h-5 text-yellow-500" />
                <h3 className="text-lg font-bold uppercase tracking-wider text-black">
                  Trending Questions ({data.trendingQuestions.length})
                </h3>
              </div>
              {data.trendingQuestions.length === 0 ? (
                <div className="text-center py-12">
                  <TrendingUp className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600">
                    No trending questions in this time range.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {data.trendingQuestions.map((q, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.05 }}
                      className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 text-2xl">
                          {q.trend === "↑↑" ? (
                            <span className="text-red-500">🔥</span>
                          ) : (
                            <span className="text-yellow-500">⚡</span>
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-black mb-2">
                            {q.question}
                          </p>
                          <div className="flex items-center gap-3 text-xs">
                            <span className="flex items-center gap-1 text-gray-600">
                              <MessageSquare className="w-3 h-3" />
                              {q.count} times
                            </span>
                            <span className="flex items-center gap-1 font-bold text-orange-600">
                              {q.trend} Trending {q.trend === "↑↑" ? "Strongly" : "Up"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* Bot-specific Stats */}
          {activeView === "bots" && (
            <motion.div
              key="bots"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {data.botStats.map((bot, idx) => (
                <motion.div
                  key={bot.botId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="minimal-card animate-pulse-shadow"
                >
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <Bot className="w-6 h-6 text-black" />
                      <h3 className="text-xl font-bold uppercase tracking-wider text-black">
                        {bot.botName}
                      </h3>
                    </div>
                    <button
                      onClick={() => router.push(`/dashboard/${bot.botId}`)}
                      className="minimal-button-outline text-sm"
                    >
                      VIEW BOT
                    </button>
                  </div>

                  {/* Bot Stats */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs uppercase tracking-wider text-gray-600 mb-1">
                        Total Questions
                      </p>
                      <p className="text-2xl font-bold text-black">
                        {bot.totalQuestions}
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs uppercase tracking-wider text-gray-600 mb-1">
                        Unique Questions
                      </p>
                      <p className="text-2xl font-bold text-black">
                        {bot.uniqueQuestions}
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs uppercase tracking-wider text-gray-600 mb-1">
                        Answer Rate
                      </p>
                      <p className="text-2xl font-bold text-black">
                        {bot.answeredRate.toFixed(1)}%
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs uppercase tracking-wider text-gray-600 mb-1">
                        Avg Response
                      </p>
                      <p className="text-2xl font-bold text-black">
                        {formatTime(bot.avgResponseTime)}
                      </p>
                    </div>
                  </div>

                  {/* Top Questions for this bot */}
                  <div className="mb-4">
                    <h4 className="text-sm font-bold uppercase tracking-wider text-gray-600 mb-3">
                      Top Questions
                    </h4>
                    <div className="space-y-2">
                      {bot.topQuestions.slice(0, 5).map((q, qIdx) => (
                        <div
                          key={qIdx}
                          className="flex items-center justify-between p-2 bg-gray-50 rounded"
                        >
                          <p className="text-sm text-black flex-1 line-clamp-1">
                            {q.question}
                          </p>
                          <span className="text-xs font-bold text-gray-600 ml-2">
                            {q.count}x
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Unanswered Questions for this bot */}
                  {bot.unansweredQuestions.length > 0 && (
                    <div>
                      <h4 className="text-sm font-bold uppercase tracking-wider text-red-600 mb-3">
                        Unanswered ({bot.unansweredQuestions.length})
                      </h4>
                      <div className="space-y-2">
                        {bot.unansweredQuestions.slice(0, 3).map((q, qIdx) => (
                          <div
                            key={qIdx}
                            className="p-2 bg-red-50 border border-red-100 rounded"
                          >
                            <p className="text-sm text-black line-clamp-2">{q}</p>
                          </div>
                        ))}
                        {bot.unansweredQuestions.length > 3 && (
                          <p className="text-xs text-gray-500 text-center">
                            +{bot.unansweredQuestions.length - 3} more
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

