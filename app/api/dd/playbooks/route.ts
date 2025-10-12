import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { url, analysis } = await req.json();
    if (!url) return NextResponse.json({ error: 'url required' }, { status: 400 });
    const normalizeUrl = (input: string) => {
      let u = (input || '').trim();
      if (!/^https?:\/\//i.test(u)) u = `https://${u}`;
      return u;
    };
    const normUrl = normalizeUrl(url);

    const sharedSpec: any = {
      role: 'company_bot',
      url,
      context: { websiteMainText: analysis?.scrape?.summary?.mainText || analysis?.scrape?.content || '' },
      plan: 'free'
    };

    const created = [] as any[];

    // Knowledge bot
    created.push(await prisma.bot.create({ data: { name: `Knowledge for ${normUrl}`, type: 'knowledge', companyUrl: normUrl, spec: { ...sharedSpec } } }));
    // Lead bot
    created.push(await prisma.bot.create({ data: { name: `Lead for ${normUrl}`, type: 'lead', companyUrl: normUrl, spec: { ...sharedSpec, kpis: analysis?.scoring?.suggestedKPIs?.lead || null } } }));
    // Support bot
    created.push(await prisma.bot.create({ data: { name: `Support for ${normUrl}`, type: 'support', companyUrl: normUrl, spec: { ...sharedSpec, requireApproval: true, kpis: analysis?.scoring?.suggestedKPIs?.support || null } } }));

    return NextResponse.json({ created, url: normUrl });
  } catch (e: any) {
    return NextResponse.json({ error: 'dd_playbooks_failed' }, { status: 500 });
  }
}


