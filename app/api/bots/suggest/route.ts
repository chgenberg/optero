import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const botId = searchParams.get("botId");
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
        suggestions.push(`Berätta mer om: ${s}`);
      }
      if (suggestions.length >= 4) break;
    }

    // Fallback from bot type
    if (suggestions.length < 3) {
      const bot = await prisma.bot.findUnique({ where: { id: botId } });
      const type = bot?.type || 'knowledge';
      const fallbackMap: Record<string, string[]> = {
        knowledge: [
          'Vad är era öppettider?',
          'Har ni fri frakt?',
          'Hur gör jag en retur?',
          'Var hittar jag priser?'
        ],
        lead: [
          'Kan vi boka en demo?',
          'Vilket paket passar oss?',
          'Vad kostar det?',
          'Hur snabbt kan vi komma igång?'
        ],
        support: [
          'Jag behöver hjälp med ett ärende',
          'Hur kontaktar jag support?',
          'Hur återställer jag mitt konto?',
          'Finns det en guide?'
        ],
        workflow: [
          'Boka en tid',
          'Rekommendera en produkt',
          'Hur avbokar jag?',
          'Hur uppdaterar jag min order?'
        ]
      };
      const fb = fallbackMap[type] || fallbackMap['knowledge'];
      for (const s of fb) {
        if (suggestions.length >= 4) break;
        if (!seen.has(s)) { seen.add(s); suggestions.push(s); }
      }
    }

    return NextResponse.json({ suggestions });
  } catch (err) {
    return NextResponse.json({ suggestions: [] });
  }
}


