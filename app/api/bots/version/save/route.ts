import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const botId = searchParams.get('botId') || '';
    if (!botId) return NextResponse.json({ error: 'botId required' }, { status: 400 });

    const bot = await prisma.bot.findUnique({ where: { id: botId } });
    if (!bot) return NextResponse.json({ error: 'not_found' }, { status: 404 });

    const latest = await prisma.botVersion.findFirst({ where: { botId }, orderBy: { version: 'desc' } });
    const nextVersion = (latest?.version ?? 0) + 1;

    const saved = await prisma.botVersion.create({ data: { botId, version: nextVersion, spec: bot.spec } });
    return NextResponse.json({ ok: true, version: saved });
  } catch (e: any) {
    return NextResponse.json({ error: 'save_failed' }, { status: 500 });
  }
}


