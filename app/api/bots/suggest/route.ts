import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const botId = searchParams.get("botId");
    const lang = (searchParams.get('lang') || 'en').toLowerCase();
    if (!botId) return NextResponse.json({ suggestions: [] });

    // Try to derive suggestions from knowledge titles
    const knowledge = await prisma.botKnowledge.findMany({
      where: { botId },
      select: { title: true },
      take: 12
    });

    let suggestions: string[] = [];
    const seen = new Set<string>();
    for (const k of knowledge) {
      const t = (k.title || '').trim();
      if (!t) continue;
      // Simple normalization
      const s = t.length > 60 ? t.slice(0, 57) + '…' : t;
      if (!seen.has(s)) {
        seen.add(s);
        if (lang === 'sv') suggestions.push(`Berätta mer om: ${s}`);
        else suggestions.push(`Tell me more about: ${s}`);
      }
      if (suggestions.length >= 4) break;
    }

    // Fallback from bot type
    if (suggestions.length < 3) {
      const bot = await prisma.bot.findUnique({ where: { id: botId } });
      const type = bot?.type || 'knowledge';
      const fallbackMap: Record<string, { en: string[]; sv: string[] }> = {
        knowledge: {
          en: ['What are your opening hours?', 'Do you offer free shipping?', 'How do I make a return?', 'Where can I find pricing?'],
          sv: ['Vad är era öppettider?', 'Har ni fri frakt?', 'Hur gör jag en retur?', 'Var hittar jag priser?']
        },
        lead: {
          en: ['Can we book a demo?', 'Which plan fits us?', 'How much does it cost?', 'How fast can we get started?'],
          sv: ['Kan vi boka en demo?', 'Vilket paket passar oss?', 'Vad kostar det?', 'Hur snabbt kan vi komma igång?']
        },
        support: {
          en: ['I need help with an issue', 'How do I contact support?', 'How do I reset my account?', 'Is there a guide?'],
          sv: ['Jag behöver hjälp med ett ärende', 'Hur kontaktar jag support?', 'Hur återställer jag mitt konto?', 'Finns det en guide?']
        },
        workflow: {
          en: ['Book a time', 'Recommend a product', 'How do I cancel?', 'How do I update my order?'],
          sv: ['Boka en tid', 'Rekommendera en produkt', 'Hur avbokar jag?', 'Hur uppdaterar jag min order?']
        }
      };
      const fb = fallbackMap[type] || fallbackMap['knowledge'];
      for (const s of (fb as any)[lang === 'sv' ? 'sv' : 'en']) {
        if (suggestions.length >= 4) break;
        if (!seen.has(s)) { seen.add(s); suggestions.push(s); }
      }
    }

    return NextResponse.json({ suggestions });
  } catch (err) {
    return NextResponse.json({ suggestions: [] });
  }
}


