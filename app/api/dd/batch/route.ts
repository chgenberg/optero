import { NextRequest, NextResponse } from "next/server";
import { POST as Analyze } from "@/app/api/dd/analyze/route";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { urls } = await req.json();
    if (!Array.isArray(urls) || urls.length === 0) return NextResponse.json({ error: 'urls required' }, { status: 400 });
    const tasks = urls.slice(0, 10).map((u: string) => Analyze(new Request('http://local', { method: 'POST', body: JSON.stringify({ url: u }) }) as any)
      .then((r: any)=>r.json()).then((d:any)=>({ url: u, scoring: d.scoring || {}, profile: d.profile || {} }))
      .catch(()=>({ url: u, scoring: null, profile: null })));
    const results = await Promise.all(tasks);
    const ranked = results.map(r=>({ ...r, score: r.scoring?.opportunityScore ?? 0 })).sort((a,b)=>b.score-a.score);
    return NextResponse.json({ ranked });
  } catch (e: any) {
    return NextResponse.json({ error: 'batch_failed' }, { status: 500 });
  }
}


