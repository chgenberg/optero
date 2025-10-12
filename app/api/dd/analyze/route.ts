import { NextRequest, NextResponse } from "next/server";
import { POST as Scrape } from "@/app/api/business/scrape/route";
import { POST as Profile } from "@/app/api/business/profile/route";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();
    if (!url) return NextResponse.json({ error: 'url required' }, { status: 400 });

    // Reuse existing endpoints
    const scrapeRes = await Scrape(new Request("http://local", { method: 'POST', body: JSON.stringify({ url }) }) as any);
    const scrape = await (scrapeRes as any).json();

    const profileRes = await Profile(new Request("http://local", { method: 'POST', body: JSON.stringify({ url, scrape }) }) as any);
    const profile = await (profileRes as any).json();

    // Simple scoring heuristic
    const textLen = (scrape?.content || '').length;
    const hasContacts = Boolean(scrape?.summary?.contacts && scrape.summary.contacts.length);
    const opportunity = Math.min(100, Math.floor((textLen / 50000) * 50) + (hasContacts ? 30 : 10));
    const risk = 100 - opportunity;
    const scoring = { opportunityScore: opportunity, riskScore: risk, rationale: `Textbas ${textLen} tecken. Kontakter: ${hasContacts ? 'ja' : 'nej'}.` };

    return NextResponse.json({ scrape, profile: profile?.profile || profile, scoring });
  } catch (e: any) {
    return NextResponse.json({ error: 'dd_analyze_failed' }, { status: 500 });
  }
}


