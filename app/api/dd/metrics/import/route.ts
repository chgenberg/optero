import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { url, items } = await req.json();
    if (!url || !Array.isArray(items)) return NextResponse.json({ error: 'invalid' }, { status: 400 });
    const company = await prisma.dDCompany.findUnique({ where: { url } });
    if (!company) return NextResponse.json({ error: 'company_not_found' }, { status: 404 });
    const data = items.map((m: any) => ({
      companyId: company.id,
      category: String(m.category || ''),
      key: String(m.key || ''),
      period: String(m.period || ''),
      value: Number(m.value || 0),
      source: String(m.source || 'file')
    })).filter((x: any) => x.category && x.key && x.period && !isNaN(x.value));
    if (!data.length) return NextResponse.json({ imported: 0 });
    await prisma.dDMetric.createMany({ data, skipDuplicates: false });
    return NextResponse.json({ imported: data.length });
  } catch (e: any) {
    return NextResponse.json({ error: 'dd_metrics_import_failed' }, { status: 500 });
  }
}


