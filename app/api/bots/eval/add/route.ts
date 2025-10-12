import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { botId, name, input, expectedMatch } = await req.json();
    if (!botId || !name || !input || !expectedMatch) return NextResponse.json({ error: 'invalid' }, { status: 400 });
    const saved = await prisma.botEval.create({ data: { botId, name, input, expectedMatch } });
    return NextResponse.json({ ok: true, eval: saved });
  } catch (e: any) {
    return NextResponse.json({ error: 'add_failed' }, { status: 500 });
  }
}


