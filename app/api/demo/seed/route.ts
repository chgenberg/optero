import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const url = "https://demo.mendio.ai";
    const name = "Mendio Demo AB";

    const company = await prisma.dDCompany.upsert({ where: { url }, update: { name }, create: { url, name } });

    // Base metrics
    const baseMetrics = [
      { category: 'financials', key: 'ARR', period: '2025', value: 1200000, source: 'assumption' },
      { category: 'sales', key: 'MQL', period: '2025-09', value: 400, source: 'assumption' },
      { category: 'support', key: 'tickets', period: '2025-09', value: 600, source: 'assumption' },
      { category: 'support', key: 'AHT', period: '2025-09', value: 18, source: 'assumption' },
      { category: 'web', key: 'conversion', period: '2025-09', value: 2.1, source: 'assumption' }
    ];
    await prisma.dDMetric.createMany({ data: baseMetrics.map(m => ({ ...m, companyId: company.id })) });

    // Analysis
    const analysis = await prisma.dDAnalysis.create({ data: { companyId: company.id, profile: { companyName: name }, scoring: { opportunityScore: 65, riskScore: 35 } } });

    // Bots
    const sharedSpec: any = { role: 'company_bot', url, context: { websiteMainText: 'Demo content' }, plan: 'free' };
    const bots = [] as any[];
    bots.push(await prisma.bot.create({ data: { name: `Knowledge for ${url}`, type: 'knowledge', companyUrl: url, spec: { ...sharedSpec } } }));
    bots.push(await prisma.bot.create({ data: { name: `Lead for ${url}`, type: 'lead', companyUrl: url, spec: { ...sharedSpec, kpis: { targetMQL: 480 } } } }));
    bots.push(await prisma.bot.create({ data: { name: `Support for ${url}`, type: 'support', companyUrl: url, spec: { ...sharedSpec, requireApproval: true, kpis: { targetDeflectionRate: 0.25 } } } }));

    return NextResponse.json({ url, company, analysisId: analysis.id, bots });
  } catch (e: any) {
    return NextResponse.json({ error: 'seed_failed' }, { status: 500 });
  }
}


