import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();
    if (!url) return NextResponse.json({ error: 'url required' }, { status: 400 });
    const normalizeUrl = (input: string) => {
      let u = (input || '').trim();
      if (!/^https?:\/\//i.test(u)) u = `https://${u}`;
      return u;
    };
    const normUrl = normalizeUrl(url);
    let company = await prisma.dDCompany.findUnique({ where: { url: normUrl } });
    if (!company) {
      company = await prisma.dDCompany.upsert({ where: { url: normUrl }, update: {}, create: { url: normUrl } });
    }

    const metrics = await prisma.dDMetric.findMany({ where: { companyId: company.id } });
    const get = (cat: string, key: string) => {
      const items = metrics.filter(m => m.category === cat && m.key.toLowerCase() === key.toLowerCase());
      // take latest by period sort as string fallback
      return items.length ? items[items.length - 1].value : undefined;
    };

    const arr = get('financials', 'ARR');
    const mql = get('sales', 'MQL');
    const tickets = get('support', 'tickets');
    const aht = get('support', 'AHT');
    const conv = get('web', 'conversion');

    const opportunityScore = Math.min(100, (
      (mql ? Math.max(10, 50 - Math.min(40, mql / 1000)) : 30) +
      (tickets ? Math.min(40, tickets / 100) : 10) +
      (conv ? Math.max(0, 20 - conv) : 10)
    ));
    const riskScore = Math.max(0, 100 - opportunityScore);

    const suggestedKPIs: any = {
      lead: mql ? { targetMQL: Math.round(mql * 1.2), rationale: 'Öka MQL ~20% via kvalificering och snabb uppföljning' } : undefined,
      support: tickets ? { targetDeflectionRate: 0.25, rationale: 'Minska inflöde ~25% via triage/FAQ' } : undefined,
      knowledge: aht ? { targetAHT: Math.round(aht * 0.85), rationale: 'Kortare handläggning ~15% via kunskapsbot' } : undefined
    };

    return NextResponse.json({
      scoring: {
        opportunityScore,
        riskScore,
        rationale: `Heuristik baserad på MQL=${mql ?? '—'}, tickets=${tickets ?? '—'}, conversion=${conv ?? '—'}, AHT=${aht ?? '—'}`,
        suggestedKPIs
      }
    });
  } catch (e: any) {
    return NextResponse.json({ error: 'dd_score_failed' }, { status: 500 });
  }
}


