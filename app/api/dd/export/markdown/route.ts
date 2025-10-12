import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const url = searchParams.get('url') || '';
    if (!url) return new NextResponse('url required', { status: 400 });

    const company = await prisma.dDCompany.findUnique({ where: { url } });
    if (!company) return new NextResponse('company not found', { status: 404 });

    const [analysis] = await prisma.dDAnalysis.findMany({ where: { companyId: company.id }, orderBy: { createdAt: 'desc' }, take: 1 });
    const metrics = await prisma.dDMetric.findMany({ where: { companyId: company.id }, orderBy: { category: 'asc' } });

    const profile = (analysis as any)?.profile || {};
    const scoring = (analysis as any)?.scoring || {};

    let md = `# Due Diligence Rapport\n\n`;
    md += `## Företag\n- URL: ${company.url}\n- Namn: ${company.name || ''}\n\n`;
    md += `## Profil\n\n\`\`\`json\n${JSON.stringify(profile, null, 2)}\n\`\`\`\n\n`;
    md += `## Scoring\n- Opportunity: ${scoring.opportunityScore ?? '—'}/100\n- Risk: ${scoring.riskScore ?? '—'}/100\n\n${scoring.rationale || ''}\n\n`;
    md += `## KPI / Metrics\n`;
    const byCat: Record<string, any[]> = {};
    for (const m of metrics) {
      if (!byCat[m.category]) byCat[m.category] = [];
      byCat[m.category].push(m);
    }
    for (const cat of Object.keys(byCat)) {
      md += `\n### ${cat}\n`;
      for (const m of byCat[cat]) {
        md += `- ${m.key} (${m.period}): ${m.value} [${m.source}]\n`;
      }
    }

    // Gap-analys mot benchmarks
    md += `\n## Gap-analys (mot generiska benchmarks)\n`;
    // naive map from metrics for some keys
    const findVal = (key: string) => metrics.filter(m=>m.key.toLowerCase()===key.toLowerCase()).pop()?.value;
    const bm = { conversion: 3.5, AHT: 15, MQL: 500, tickets: 400 };
    const current = { conversion: findVal('conversion'), AHT: findVal('AHT'), MQL: findVal('MQL'), tickets: findVal('tickets') } as any;
    for (const k of Object.keys(bm)) {
      const cur = current[k];
      if (cur === undefined) continue;
      const target = (bm as any)[k];
      const gap = k === 'AHT' ? (cur - target) : (target - cur); // lower AHT is better
      md += `- ${k}: nu=${cur}, mål=${target}, gap=${gap>0?'+':''}${gap.toFixed(2)}\n`;
    }

    return new NextResponse(md, { status: 200, headers: { 'Content-Type': 'text/markdown; charset=utf-8', 'Content-Disposition': 'attachment; filename="dd-report.md"' } });
  } catch (e: any) {
    return new NextResponse('export_failed', { status: 500 });
  }
}


