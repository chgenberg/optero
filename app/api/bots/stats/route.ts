import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const botId = searchParams.get("botId");
    const email = searchParams.get("email");
    
    if (!botId && !email) {
      return NextResponse.json({ error: "botId or email required" }, { status: 400 });
    }

    if (botId) {
      // Get stats for specific bot
      const bot = await prisma.bot.findUnique({ 
        where: { id: botId },
        include: {
          usages: {
            where: { kind: 'message' },
            orderBy: { createdAt: 'desc' },
            take: 100
          },
          sessions: {
            orderBy: { createdAt: 'desc' },
            take: 20
          },
          knowledge: {
            select: { id: true, title: true, sourceUrl: true, createdAt: true }
          }
        }
      });

      if (!bot) {
        return NextResponse.json({ error: "Bot not found" }, { status: 404 });
      }

      // Calculate stats
      const totalMessages = bot.usages.length;
      const todayMessages = bot.usages.filter(u => {
        const diff = Date.now() - new Date(u.createdAt).getTime();
        return diff < 24 * 60 * 60 * 1000;
      }).length;

      const totalSessions = bot.sessions.length;
      const activeSessions = bot.sessions.filter(s => {
        const diff = Date.now() - new Date(s.updatedAt).getTime();
        return diff < 60 * 60 * 1000; // active in last hour
      }).length;

      // Top questions (from sessions)
      const questionsMap: Record<string, number> = {};
      bot.sessions.forEach(session => {
        const messages = (session.messages as any[]) || [];
        messages.filter(m => m.role === 'user').forEach(m => {
          const q = m.content.slice(0, 100);
          questionsMap[q] = (questionsMap[q] || 0) + 1;
        });
      });
      const topQuestions = Object.entries(questionsMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([question, count]) => ({ question, count }));

      // Unanswered questions (where bot said "jag vet inte" or similar)
      const unanswered: string[] = [];
      bot.sessions.forEach(session => {
        const messages = (session.messages as any[]) || [];
        for (let i = 0; i < messages.length - 1; i++) {
          if (messages[i].role === 'user' && messages[i+1].role === 'assistant') {
            const reply = messages[i+1].content.toLowerCase();
            if (reply.includes('vet inte') || reply.includes('kan inte') || reply.includes('unclear')) {
              unanswered.push(messages[i].content.slice(0, 150));
            }
          }
        }
      });

      return NextResponse.json({
        bot: {
          id: bot.id,
          name: bot.name,
          type: bot.type,
          createdAt: bot.createdAt
        },
        stats: {
          totalMessages,
          todayMessages,
          totalSessions,
          activeSessions,
          knowledgeChunks: bot.knowledge.length
        },
        topQuestions,
        unansweredQuestions: Array.from(new Set(unanswered)).slice(0, 10),
        recentSessions: bot.sessions.slice(0, 5).map(s => ({
          id: s.id,
          messageCount: ((s.messages as any[]) || []).length,
          lastMessage: ((s.messages as any[]) || []).slice(-1)[0]?.content?.slice(0, 100),
          createdAt: s.createdAt,
          updatedAt: s.updatedAt
        }))
      });
    }

    if (email) {
      // Get all bots for user
      // Note: We don't have direct user->bot relation yet, so we match by companyUrl or spec.email
      // For now, return all bots (admin view) or implement user relation
      const allBots = await prisma.bot.findMany({
        orderBy: { createdAt: 'desc' },
        take: 50,
        include: {
          _count: {
            select: {
              usages: true,
              sessions: true,
              knowledge: true
            }
          }
        }
      });

      return NextResponse.json({
        bots: allBots.map(b => ({
          id: b.id,
          name: b.name,
          type: b.type,
          companyUrl: b.companyUrl,
          isActive: b.isActive,
          createdAt: b.createdAt,
          stats: {
            messages: b._count.usages,
            sessions: b._count.sessions,
            knowledgeChunks: b._count.knowledge
          }
        }))
      });
    }

  } catch (error: any) {
    console.error('Stats error:', error);
    return NextResponse.json({ error: "Failed to get stats" }, { status: 500 });
  }
}

