import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { score, comment, context } = await req.json();
    const hook = process.env.FEEDBACK_SLACK_WEBHOOK;
    if (hook) {
      await fetch(hook, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: `NPS: ${score}\nKommentar: ${comment || ''}\nContext: ${JSON.stringify(context || {}, null, 2)}` }) }).catch(()=>{});
    }
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { recommendationId, recommendationName, rating } = await request.json();

    // Här kan du spara feedback till en databas
    // För nu loggar vi bara
    console.log("Feedback received:", {
      recommendationId,
      recommendationName,
      rating,
      timestamp: new Date().toISOString()
    });

    // I en riktig app skulle du spara detta i en databas
    // await db.feedback.create({ ... })

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Feedback error:", error);
    return NextResponse.json(
      { error: "Could not save feedback" },
      { status: 500 }
    );
  }
}
