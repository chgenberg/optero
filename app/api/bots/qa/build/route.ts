import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import prisma from "@/lib/prisma";
import standardQuestions from "@/data/standard-questions.json";
import { deepScrapeQuick } from "@/lib/deepScrape";

export const maxDuration = 120;

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const botId = searchParams.get('botId') || '';
    const limit = Math.min(Number(searchParams.get('limit') || 250), 250);
    if (!botId) return NextResponse.json({ error: 'botId required' }, { status: 400 });

    const bot = await prisma.bot.findUnique({ where: { id: botId } });
    if (!bot) return NextResponse.json({ error: 'not_found' }, { status: 404 });
    const url = bot.companyUrl || (bot.spec as any)?.url;
    if (!url) return NextResponse.json({ error: 'no_company_url' }, { status: 400 });

    // Quick context for the site (fast scrape)
    const quick = await deepScrapeQuick(url, 10);
    const siteText = quick.pages.map(p => `${p.title}\n${p.text}`).join('\n\n').slice(0, 12000);

    // Flatten 250 questions (customer + internal)
    const allQuestions: Array<{ category: string; question: string }> = [];
    const pushCat = (root: any, rootKey: string) => {
      Object.entries(root).forEach(([cat, arr]) => {
        if (Array.isArray(arr)) {
          arr.forEach(q => allQuestions.push({ category: `${rootKey}.${cat}`, question: String(q) }));
        }
      });
    };
    pushCat((standardQuestions as any).customer || {}, 'customer');
    pushCat((standardQuestions as any).internal || {}, 'internal');

    const existing = await prisma.botQA.findMany({ where: { botId }, select: { question: true } });
    const existingSet = new Set(existing.map(e => e.question.toLowerCase()));

    const toProcess = allQuestions
      .filter((_, i) => i < limit)
      .filter(q => !existingSet.has(q.question.toLowerCase()));

    let created = 0;
    const system = `You answer questions strictly based on the provided website context. If the answer is not present, say "Insufficient context" and ask one specific follow-up question to clarify. Keep answers short (1-3 sentences).`;

    for (const item of toProcess) {
      try {
        const messages: any[] = [
          { role: 'system', content: system },
          { role: 'user', content: `Question: ${item.question}\n\nWebsite context (partial):\n${siteText}` }
        ];
        const resp = await openai.chat.completions.create({
          model: 'gpt-5-mini',
          messages,
          max_completion_tokens: 180,
          temperature: 0.2
        });
        const answer = resp.choices[0]?.message?.content?.trim() || '';
        if (!answer) continue;

        // Confidence heuristic: penalize "insufficient context"
        let confidence = 0.6;
        if (/insufficient context/i.test(answer)) confidence = 0.3;
        if (answer.length > 30 && !/sorry|cannot|don\'t know/i.test(answer)) confidence += 0.2;
        confidence = Math.max(0, Math.min(1, confidence));

        await prisma.botQA.create({
          data: {
            botId,
            question: item.question,
            answer,
            category: item.category,
            confidence,
            verified: false,
            sourceUrl: url,
            sourceType: 'generated'
          }
        });
        created += 1;
      } catch {}
    }

    // Coverage stats
    const totalQuestions = allQuestions.length;
    const qaCount = await prisma.botQA.count({ where: { botId } });
    const highConf = await prisma.botQA.count({ where: { botId, confidence: { gte: 0.7 } } });

    return NextResponse.json({
      ok: true,
      created,
      coverage: {
        answered: qaCount,
        highConfidence: highConf,
        total: totalQuestions,
        percent: Math.round((qaCount / totalQuestions) * 100)
      }
    });
  } catch (e: any) {
    return NextResponse.json({ error: 'qa_build_failed', details: e.message }, { status: 500 });
  }
}


