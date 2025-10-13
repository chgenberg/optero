import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const botId = searchParams.get("botId");
    
    if (!botId) {
      return NextResponse.json({ error: "botId required" }, { status: 400 });
    }

    const bot = await prisma.bot.findUnique({
      where: { id: botId },
      include: {
        sessions: {
          orderBy: { createdAt: 'desc' },
          take: 100
        }
      }
    });

    if (!bot) {
      return NextResponse.json({ error: "Bot not found" }, { status: 404 });
    }

    // Word frequency for wordcloud
    const wordFreq: Record<string, number> = {};
    const allText: string[] = [];
    
    bot.sessions.forEach(session => {
      const messages = (session.messages as any[]) || [];
      messages.filter(m => m.role === 'user').forEach(m => {
        allText.push(m.content);
        // Extract words (Swedish stopwords removed)
        const stopwords = ['och', 'att', 'det', 'är', 'jag', 'som', 'på', 'en', 'av', 'för', 'med', 'till', 'har', 'den', 'de', 'i', 'om', 'du', 'vad', 'hur', 'var', 'kan', 'vi', 'ett'];
        const words = m.content.toLowerCase()
          .replace(/[^\wåäö\s]/g, '')
          .split(/\s+/)
          .filter((w: string) => w.length > 3 && !stopwords.includes(w));
        
        words.forEach((word: string) => {
          wordFreq[word] = (wordFreq[word] || 0) + 1;
        });
      });
    });

    const wordcloud = Object.entries(wordFreq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 50)
      .map(([word, count]) => ({ word, count }));

    // Sentiment analysis (batch for efficiency)
    let sentimentData: { positive: number; neutral: number; negative: number } = {
      positive: 0,
      neutral: 0,
      negative: 0
    };

    if (allText.length > 0) {
      try {
        const sampleTexts = allText.slice(0, 20); // Analyze first 20 messages
        const sentimentPrompt = `Analysera sentimenten i följande användarmeddelanden och returnera JSON: {"positive": X, "neutral": Y, "negative": Z} där X+Y+Z = ${sampleTexts.length}

Meddelanden:
${sampleTexts.map((t, i) => `${i+1}. ${t}`).join('\n')}`;

        const sentimentResp = await openai.chat.completions.create({
          model: "gpt-5-mini",
          messages: [{ role: "user", content: sentimentPrompt }],
          max_completion_tokens: 100
        }, { timeout: 10000 });

        const sentimentText = sentimentResp.choices[0]?.message?.content || '{}';
        const jsonMatch = sentimentText.match(/\{[^}]+\}/);
        if (jsonMatch) {
          sentimentData = JSON.parse(jsonMatch[0]);
        }
      } catch (sentErr) {
        console.error('Sentiment analysis error:', sentErr);
      }
    }

    // Conversion rate: sessions with CALL:WEBHOOK or lead captured
    let conversions = 0;
    bot.sessions.forEach(session => {
      const messages = (session.messages as any[]) || [];
      const hasConversion = messages.some(m => 
        m.role === 'assistant' && (
          /CALL:WEBHOOK/i.test(m.content) ||
          /CALL:BOOK/i.test(m.content) ||
          /CALL:TICKET/i.test(m.content)
        )
      );
      if (hasConversion) conversions++;
    });

    const conversionRate = bot.sessions.length > 0 
      ? ((conversions / bot.sessions.length) * 100).toFixed(1)
      : '0';

    // Heatmap: Activity by hour of day
    const hourlyActivity: number[] = new Array(24).fill(0);
    bot.sessions.forEach(session => {
      const hour = new Date(session.createdAt).getHours();
      hourlyActivity[hour]++;
    });

    // Day of week activity
    const dailyActivity: number[] = new Array(7).fill(0);
    bot.sessions.forEach(session => {
      const day = new Date(session.createdAt).getDay();
      dailyActivity[day]++;
    });

    return NextResponse.json({
      wordcloud,
      sentiment: sentimentData,
      conversionRate: parseFloat(conversionRate),
      conversions,
      totalSessions: bot.sessions.length,
      heatmap: {
        hourly: hourlyActivity,
        daily: dailyActivity
      }
    });

  } catch (error: any) {
    console.error('Analytics error:', error);
    return NextResponse.json({ error: "Failed to get analytics" }, { status: 500 });
  }
}

