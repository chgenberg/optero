import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const botId = searchParams.get("botId") || "";
  const origin = process.env.NEXT_PUBLIC_SITE_URL || "https://optero-production.up.railway.app";

  const snippet = `<!-- Mendio Bot Widget -->\n<script async src="${origin}/widget.js" data-bot-id="${botId}"></script>`;
  return NextResponse.json({ snippet });
}


