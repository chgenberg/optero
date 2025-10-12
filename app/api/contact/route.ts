import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { name, email, company, message, context } = await req.json();
    const payload = { name, email, company, message, context, at: new Date().toISOString() };
    const hook = process.env.CONTACT_SLACK_WEBHOOK;
    if (hook) {
      await fetch(hook, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: `Ny kontaktförfrågan:\n${JSON.stringify(payload, null, 2)}` }) }).catch(() => {});
    }
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}


