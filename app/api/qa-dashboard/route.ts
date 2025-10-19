import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { z } from "zod";

export const maxDuration = 60;

interface QuestionAnalytics {
  question: string;
  count: number;
  bots: string[];
  firstAsked: Date;
  lastAsked: Date;
  answered: boolean;
  avgResponseLength?: number;
  avgResponseTime?: number;
}

interface BotQAStats {
  botId: string;
  botName: string;
  totalQuestions: number;
  uniqueQuestions: number;
  answeredRate: number;
  avgResponseTime: number;
  topQuestions: Array<{ question: string; count: number }>;
  unansweredQuestions: string[];
}

// Internal working shape for aggregating per-bot stats
type BotStatsWorking = {
  botId: string;
  botName: string;
  totalQuestions: number;
  uniqueQuestions: Set<string>;
  answeredCount: number;
  totalResponseTime: number;
  totalResponseLength: number;
  questionCounts: Map<string, number>;
  unansweredQuestions: Set<string>;
};

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");
    const botId = searchParams.get("botId");
    const timeRange = searchParams.get("timeRange") || "7d"; // 24h, 7d, 30d, all
    const limit = parseInt(searchParams.get("limit") || "100");

    // Calculate date filter based on time range
    let dateFilter: Date | undefined;
    const now = new Date();
    switch (timeRange) {
      case "24h":
        dateFilter = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case "7d":
        dateFilter = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "30d":
        dateFilter = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        dateFilter = undefined;
    }

    // Build bot filter
    let botFilter: any = {};
    if (email && email !== "all") {
      // Find user by email first
      const user = await prisma.user.findUnique({
        where: { email },
        select: { id: true },
      });
      if (user) {
        botFilter.userId = user.id;
      } else {
        // No user found with this email, return empty results
        return NextResponse.json({
          summary: {
            totalQuestions: 0,
            uniqueQuestions: 0,
            answeredQuestions: 0,
            unansweredQuestions: 0,
            answerRate: 0,
            avgResponseTime: 0,
            timeRange,
            botsAnalyzed: 0,
          },
          topQuestions: [],
          unansweredQuestions: [],
          recentQuestions: [],
          trendingQuestions: [],
          categories: [],
          botStats: [],
          bots: [],
        });
      }
    }
    if (botId) {
      botFilter.id = botId;
    }

    // Get all relevant bots
    const bots = await prisma.bot.findMany({
      where: botFilter,
      select: {
        id: true,
        name: true,
        userId: true,
      },
    });

    const botIds = bots.map(b => b.id);

    if (botIds.length === 0) {
      return NextResponse.json({
        summary: {
          totalQuestions: 0,
          uniqueQuestions: 0,
          answeredQuestions: 0,
          unansweredQuestions: 0,
          answerRate: 0,
          avgResponseTime: 0,
          timeRange,
          botsAnalyzed: 0,
        },
        topQuestions: [],
        unansweredQuestions: [],
        recentQuestions: [],
        trendingQuestions: [],
        categories: [],
        botStats: [],
        bots: [],
      });
    }

    // Get all sessions with messages
    const sessionWhere: any = {
      botId: { in: botIds },
    };

    if (dateFilter) {
      sessionWhere.createdAt = { gte: dateFilter };
    }

    const sessions = await prisma.botSession.findMany({
      where: sessionWhere,
      select: {
        id: true,
        botId: true,
        messages: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { updatedAt: "desc" },
      take: limit * 10, // Get more sessions to analyze
    });

    // Extract individual messages from sessions
    interface MessageExtracted {
      content: string;
      botId: string;
      sessionId: string;
      createdAt: Date;
      role: string;
    }

    const messages: MessageExtracted[] = [];
    const botResponses: MessageExtracted[] = [];

    sessions.forEach(session => {
      const sessionMessages = Array.isArray(session.messages) ? session.messages : [];
      sessionMessages.forEach((msg: any, idx: number) => {
        const msgTimestamp = msg.timestamp ? new Date(msg.timestamp) : session.createdAt;
        
        // Apply date filter to individual messages
        if (dateFilter && msgTimestamp < dateFilter) {
          return;
        }

        const extracted: MessageExtracted = {
          content: msg.content || "",
          botId: session.botId,
          sessionId: session.id,
          createdAt: msgTimestamp,
          role: msg.role || "user",
        };

        if (msg.role === "user") {
          messages.push(extracted);
        } else if (msg.role === "assistant") {
          botResponses.push(extracted);
        }
      });
    });

    // Build question analytics
    const questionMap = new Map<string, QuestionAnalytics>();
    const botStatsMap = new Map<string, BotStatsWorking>();

    // Initialize bot stats
    bots.forEach(bot => {
      botStatsMap.set(bot.id, {
        botId: bot.id,
        botName: bot.name,
        totalQuestions: 0,
        uniqueQuestions: new Set<string>(),
        answeredCount: 0,
        totalResponseTime: 0,
        totalResponseLength: 0,
        questionCounts: new Map<string, number>(),
        unansweredQuestions: new Set<string>(),
      });
    });

    // Process each question
    messages.forEach(msg => {
      const question = msg.content.trim().toLowerCase();
      const normalizedQuestion = normalizeQuestion(question);

      // Update bot stats
      const botStats = botStatsMap.get(msg.botId);
      if (botStats) {
        botStats.totalQuestions++;
        botStats.uniqueQuestions.add(normalizedQuestion);
        botStats.questionCounts.set(
          normalizedQuestion,
          (botStats.questionCounts.get(normalizedQuestion) || 0) + 1
        );
      }

      // Update question analytics
      if (!questionMap.has(normalizedQuestion)) {
        questionMap.set(normalizedQuestion, {
          question: msg.content, // Use original for display
          count: 0,
          bots: [],
          firstAsked: msg.createdAt,
          lastAsked: msg.createdAt,
          answered: false,
          avgResponseLength: 0,
          avgResponseTime: 0,
        });
      }

      const qa = questionMap.get(normalizedQuestion)!;
      qa.count++;
      if (!qa.bots.includes(msg.botId)) {
        qa.bots.push(msg.botId);
      }
      if (msg.createdAt < qa.firstAsked) qa.firstAsked = msg.createdAt;
      if (msg.createdAt > qa.lastAsked) qa.lastAsked = msg.createdAt;

      // Find corresponding response (next assistant message in same session)
      const response = botResponses.find(
        r => r.sessionId === msg.sessionId && 
             r.createdAt.getTime() >= msg.createdAt.getTime()
      );

      if (response) {
        qa.answered = true;
        const responseTime = response.createdAt.getTime() - msg.createdAt.getTime();
        qa.avgResponseTime = (qa.avgResponseTime || 0) + responseTime / qa.count;
        qa.avgResponseLength = (qa.avgResponseLength || 0) + response.content.length / qa.count;

        if (botStats) {
          botStats.answeredCount++;
          botStats.totalResponseTime += responseTime;
          botStats.totalResponseLength += response.content.length;
        }
      } else {
        if (botStats) {
          botStats.unansweredQuestions.add(msg.content);
        }
      }
    });

    // Convert to arrays and sort
    const topQuestions = Array.from(questionMap.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, limit)
      .map(q => ({
        ...q,
        bots: q.bots.map(id => bots.find(b => b.id === id)?.name || id),
      }));

    const unansweredQuestions = Array.from(questionMap.values())
      .filter(q => !q.answered)
      .sort((a, b) => b.count - a.count)
      .slice(0, 50);

    const recentQuestions = Array.from(questionMap.values())
      .sort((a, b) => b.lastAsked.getTime() - a.lastAsked.getTime())
      .slice(0, 50);

    // Build bot-specific stats
    const botStats: BotQAStats[] = Array.from(botStatsMap.values()).map((stats: BotStatsWorking): BotQAStats => {
      const topQuestions = Array.from(stats.questionCounts.entries())
        .map(([q, count]: [string, number]): { question: string; count: number } => ({ 
          question: String(q), 
          count: Number(count) 
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);
      
      const unansweredQuestions = Array.from(stats.unansweredQuestions.values())
        .map((q: string): string => String(q))
        .slice(0, 20);

      return {
        botId: stats.botId,
        botName: stats.botName,
        totalQuestions: stats.totalQuestions,
        uniqueQuestions: stats.uniqueQuestions.size,
        answeredRate: stats.totalQuestions > 0
          ? (stats.answeredCount / stats.totalQuestions) * 100
          : 0,
        avgResponseTime: stats.answeredCount > 0
          ? stats.totalResponseTime / stats.answeredCount
          : 0,
        topQuestions,
        unansweredQuestions,
      };
    });

    // Calculate overall metrics
    const totalQuestions = messages.length;
    const uniqueQuestions = questionMap.size;
    const answeredQuestions = Array.from(questionMap.values()).filter(q => q.answered).length;
    const answerRate = totalQuestions > 0 ? (answeredQuestions / uniqueQuestions) * 100 : 0;

    // Get trending questions (increasing frequency)
    const trendingQuestions = calculateTrending(questionMap, dateFilter);

    // Get question categories (simple keyword-based)
    const categories = categorizeQuestions(Array.from(questionMap.values()));

    return NextResponse.json({
      summary: {
        totalQuestions,
        uniqueQuestions,
        answeredQuestions,
        unansweredQuestions: uniqueQuestions - answeredQuestions,
        answerRate: Math.round(answerRate * 10) / 10,
        avgResponseTime: calculateAvgResponseTime(questionMap),
        timeRange,
        botsAnalyzed: bots.length,
      },
      topQuestions,
      unansweredQuestions,
      recentQuestions,
      trendingQuestions,
      categories,
      botStats,
      bots: bots.map(b => ({ id: b.id, name: b.name })),
    });

  } catch (error: any) {
    console.error("Q&A Dashboard error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch Q&A data",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

// Helper functions
function normalizeQuestion(question: string): string {
  return question
    .toLowerCase()
    .trim()
    .replace(/[?.!,;]+$/g, "") // Remove trailing punctuation
    .replace(/\s+/g, " "); // Normalize whitespace
}

function calculateAvgResponseTime(questionMap: Map<string, QuestionAnalytics>): number {
  const answered = Array.from(questionMap.values()).filter(q => q.answered && q.avgResponseTime);
  if (answered.length === 0) return 0;
  return answered.reduce((sum, q) => sum + (q.avgResponseTime || 0), 0) / answered.length;
}

function calculateTrending(
  questionMap: Map<string, QuestionAnalytics>,
  dateFilter?: Date
): Array<{ question: string; count: number; trend: string }> {
  const questions = Array.from(questionMap.values());
  const halfwayPoint = dateFilter
    ? new Date((dateFilter.getTime() + Date.now()) / 2)
    : new Date(Date.now() - 3.5 * 24 * 60 * 60 * 1000); // 3.5 days ago

  const trending = questions.map(q => {
    const recentCount = q.lastAsked > halfwayPoint ? q.count / 2 : 0;
    const olderCount = q.count - recentCount;
    const trendScore = olderCount > 0 ? (recentCount / olderCount) - 1 : 0;

    return {
      question: q.question,
      count: q.count,
      trend: trendScore > 0.5 ? "↑↑" : trendScore > 0.2 ? "↑" : trendScore < -0.2 ? "↓" : "→",
      trendScore,
    };
  });

  return trending
    .filter(t => t.trendScore > 0.2) // Only growing questions
    .sort((a, b) => b.trendScore - a.trendScore)
    .slice(0, 20);
}

function categorizeQuestions(questions: QuestionAnalytics[]): Array<{ category: string; count: number; percentage: number }> {
  const categories = {
    pricing: ["price", "cost", "pricing", "expensive", "fee", "payment", "pris", "kosta"],
    product: ["product", "feature", "how does", "what is", "produkt", "funktion"],
    support: ["help", "problem", "issue", "error", "not working", "hjälp", "problem"],
    shipping: ["shipping", "delivery", "when will", "frakt", "leverans"],
    account: ["account", "login", "password", "register", "konto", "inlogg"],
    integration: ["integrate", "api", "connect", "integration"],
    returns: ["return", "refund", "cancel", "retur", "återbäring"],
    other: [],
  };

  const categoryCounts: Record<string, number> = {};
  Object.keys(categories).forEach(cat => categoryCounts[cat] = 0);

  questions.forEach(q => {
    const content = q.question.toLowerCase();
    let categorized = false;

    for (const [category, keywords] of Object.entries(categories)) {
      if (category === "other") continue;
      if (keywords.some(kw => content.includes(kw))) {
        categoryCounts[category] += q.count;
        categorized = true;
        break;
      }
    }

    if (!categorized) {
      categoryCounts.other += q.count;
    }
  });

  const total = Object.values(categoryCounts).reduce((a, b) => a + b, 0);

  return Object.entries(categoryCounts)
    .filter(([_, count]) => count > 0)
    .map(([category, count]) => ({
      category,
      count,
      percentage: Math.round((count / total) * 100),
    }))
    .sort((a, b) => b.count - a.count);
}

