import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { score, comment, context, recommendationId, recommendationName, rating } = body as any;

    // Slack NPS hook (optional)
    if (typeof score !== 'undefined') {
      const hook = process.env.FEEDBACK_SLACK_WEBHOOK;
      if (hook) {
        await fetch(hook, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: `NPS: ${score}\nKommentar: ${comment || ''}\nContext: ${JSON.stringify(context || {}, null, 2)}` })
        }).catch(()=>{});
      }
    }

    // Generic recommendation rating logging (replace with DB write if needed)
    if (recommendationId || recommendationName || typeof rating !== 'undefined') {
      console.log("Feedback received:", {
        recommendationId,
        recommendationName,
        rating,
        timestamp: new Date().toISOString()
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Feedback error:", error);
    return NextResponse.json({ error: "Could not save feedback" }, { status: 500 });
  }
}
