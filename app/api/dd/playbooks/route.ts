import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { url, analysis } = await req.json();
    if (!url) return NextResponse.json({ error: 'url required' }, { status: 400 });

    const sharedSpec: any = {
      role: 'company_bot',
      url,
      context: { websiteMainText: analysis?.scrape?.summary?.mainText || analysis?.scrape?.content || '' },
      plan: 'free'
    };

    const created = [] as any[];

    // Knowledge bot
    created.push(await prisma.bot.create({ data: { name: `Knowledge for ${url}`, type: 'knowledge', companyUrl: url, spec: { ...sharedSpec } } }));
    // Lead bot
    created.push(await prisma.bot.create({ data: { name: `Lead for ${url}`, type: 'lead', companyUrl: url, spec: { ...sharedSpec, kpis: analysis?.scoring?.suggestedKPIs?.lead || null } } }));
    // Support bot
    created.push(await prisma.bot.create({ data: { name: `Support for ${url}`, type: 'support', companyUrl: url, spec: { ...sharedSpec, requireApproval: true, kpis: analysis?.scoring?.suggestedKPIs?.support || null } } }));

    return NextResponse.json({ created });
  } catch (e: any) {
    return NextResponse.json({ error: 'dd_playbooks_failed' }, { status: 500 });
  }
}


